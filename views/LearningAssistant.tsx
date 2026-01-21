import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Mic, FileText, Sparkles, Loader2, BrainCircuit, MicOff, Volume2, CalendarDays } from 'lucide-react';
import { askTutorStream, summarizeNotesStream, generateStudyPlanStream } from '../services/geminiService';
import { ChatMessage } from '../types';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';

// --- Audio Utilities for Live API ---
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const LearningAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: '你好！我是你的 AI 学习助手。你可以问我学术问题，或者开启实时语音交流。', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<'qa' | 'notes' | 'plan'>('qa');
  const [isLive, setIsLive] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<any>(null);
  const audioContextsRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const stopLiveSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextsRef.current) {
      audioContextsRef.current.input.close();
      audioContextsRef.current.output.close();
      audioContextsRef.current = null;
    }
    for (const source of sourcesRef.current) {
      try { source.stop(); } catch(e) {}
    }
    sourcesRef.current.clear();
    setIsLive(false);
  }, []);

  const startLiveSession = async () => {
    if (isLive) {
      stopLiveSession();
      return;
    }

    try {
      setIsLive(true);
      // Fix: Use process.env.API_KEY directly as per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextsRef.current = { input: inputCtx, output: outputCtx };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const ctx = audioContextsRef.current?.output;
              if (ctx) {
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                source.addEventListener('ended', () => sourcesRef.current.delete(source));
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += buffer.duration;
                sourcesRef.current.add(source);
              }
            }

            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last && last.role === 'model' && (Date.now() - last.timestamp.getTime() < 5000)) {
                  return [...prev.slice(0, -1), { ...last, text: last.text + text }];
                }
                return [...prev, { role: 'model', text, timestamp: new Date() }];
              });
            }

            if (message.serverContent?.interrupted) {
              for (const s of sourcesRef.current) {
                 try { s.stop(); } catch(e) {}
              }
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Live session error:', e);
            stopLiveSession();
          },
          onclose: () => {
            setIsLive(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          },
          systemInstruction: '你是一个智慧校园学习助手。你正在与学生进行语音对话。请保持回答简短、专业、鼓励。',
          outputAudioTranscription: {}
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error('Failed to start live session:', err);
      setIsLive(false);
      alert('无法开启实时语音，请确保麦克风权限已开启且 API 密钥有效。');
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    if (!process.env.API_KEY) {
      setMessages(prev => [
        ...prev, 
        { role: 'user', text: input, timestamp: new Date() }, 
        { role: 'model', text: '⚠️ 错误：未检测到 API 密钥。请确保在环境变量中配置了 API_KEY。', timestamp: new Date() }
      ]);
      setInput('');
      return;
    }
    
    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      setMessages(prev => [...prev, { role: 'model', text: '', timestamp: new Date() }]);

      let stream;
      if (activeMode === 'qa') {
        stream = askTutorStream(currentInput);
      } else if (activeMode === 'notes') {
        stream = summarizeNotesStream(currentInput);
      } else {
        stream = generateStudyPlanStream(currentInput, "学生寻求计划建议。");
      }
      
      let fullText = '';
      for await (const chunk of stream) {
        if (chunk) {
          fullText += chunk;
          setMessages(prev => {
            const newMsgs = [...prev];
            const lastMsg = newMsgs[newMsgs.length - 1];
            if (lastMsg && lastMsg.role === 'model') {
              lastMsg.text = fullText;
            }
            return newMsgs;
          });
        }
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: '抱歉，服务目前不可用，请稍后再试。', timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] md:h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* Mode Selectors */}
      <div className="flex items-center justify-between space-x-2 md:space-x-4 overflow-x-auto pb-1">
        <div className="flex space-x-2 shrink-0">
          <button 
            onClick={() => setActiveMode('qa')}
            className={`px-3 md:px-4 py-2 rounded-xl flex items-center justify-center space-x-2 text-xs md:text-sm transition-all ${activeMode === 'qa' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-100'}`}
          >
            <BrainCircuit size={16} />
            <span className="hidden sm:inline">智能答疑</span>
          </button>
          <button 
            onClick={() => setActiveMode('notes')}
            className={`px-3 md:px-4 py-2 rounded-xl flex items-center justify-center space-x-2 text-xs md:text-sm transition-all ${activeMode === 'notes' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-100'}`}
          >
            <FileText size={16} />
            <span className="hidden sm:inline">笔记整理</span>
          </button>
          <button 
            onClick={() => setActiveMode('plan')}
            className={`px-3 md:px-4 py-2 rounded-xl flex items-center justify-center space-x-2 text-xs md:text-sm transition-all ${activeMode === 'plan' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-100'}`}
          >
            <CalendarDays size={16} />
            <span className="hidden sm:inline">计划生成</span>
          </button>
        </div>

        <button
          onClick={startLiveSession}
          className={`px-4 py-2 rounded-xl flex items-center space-x-2 text-xs md:text-sm font-bold transition-all shrink-0 ${isLive ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
        >
          {isLive ? <MicOff size={16} /> : <Volume2 size={16} />}
          <span>{isLive ? '停止' : '开启'}实时</span>
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden relative">
        {isLive && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full flex items-center space-x-3 text-white">
            <div className="flex space-x-1">
              <div className="w-1 h-3 bg-emerald-400 animate-[bounce_1s_infinite]"></div>
              <div className="w-1 h-4 bg-emerald-400 animate-[bounce_1.2s_infinite]"></div>
              <div className="w-1 h-2 bg-emerald-400 animate-[bounce_0.8s_infinite]"></div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Live Listening</span>
          </div>
        )}

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 scroll-smooth">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] md:max-w-[80%] rounded-2xl p-3 md:p-4 ${
                m.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none shadow-md' 
                  : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none shadow-sm'
              }`}>
                <div className="flex items-center space-x-2 mb-1 opacity-60">
                  {m.role === 'model' && <Sparkles size={12} />}
                  <span className="text-[10px] uppercase font-bold tracking-wider">
                    {m.role === 'user' ? 'ME' : 'SMART AI'}
                  </span>
                </div>
                <div className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
                  {m.text || (loading && m.role === 'model' && <span className="italic opacity-50 animate-pulse">正在输入...</span>)}
                </div>
              </div>
            </div>
          ))}
          {loading && messages[messages.length - 1].text === '' && (
            <div className="flex justify-start">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center space-x-3">
                <Loader2 size={16} className="animate-spin text-indigo-600" />
                <span className="text-xs text-slate-500 italic">唤醒 AI 中...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Controls */}
        <div className="p-3 md:p-4 bg-white border-t border-slate-100">
          <div className="flex items-center space-x-2 bg-slate-50 rounded-2xl px-3 py-1 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 transition-all shadow-inner">
            <button 
              onClick={startLiveSession}
              className={`p-2 transition-colors ${isLive ? 'text-red-500' : 'text-slate-400 hover:text-indigo-600'}`}
              title="实时语音对话"
            >
              <Mic size={18} />
            </button>
            <textarea
              rows={1}
              value={input}
              disabled={isLive || loading}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={isLive ? "实时语音模式已开启..." : "输入消息..."}
              className="flex-1 bg-transparent border-none focus:ring-0 text-xs md:text-sm py-2 max-h-24 resize-none"
            />
            <button 
              disabled={loading || !input.trim() || isLive}
              onClick={handleSend}
              className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningAssistant;