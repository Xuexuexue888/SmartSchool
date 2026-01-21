import React, { useState } from 'react';
import { BookOpen, Brain, Target, Sparkles, Loader2, CheckCircle } from 'lucide-react';
import { analyzeStudySessionStream } from '../services/geminiService';

const StudyAnalysis: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState('');
  const [details, setDetails] = useState('');
  const [confidence, setConfidence] = useState('3');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [streamedSummary, setStreamedSummary] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!subject || !duration || !details) {
      alert('请填写完整的学习信息');
      return;
    }
    setIsAnalyzing(true);
    setResult(null);
    setStreamedSummary('');
    
    let fullJsonStr = '';
    try {
      const stream = analyzeStudySessionStream(subject, duration, details, confidence);
      for await (const chunk of stream) {
        fullJsonStr += chunk;
        try {
          const partial = JSON.parse(fullJsonStr + '}');
          if (partial.summary) setStreamedSummary(partial.summary);
        } catch (e) {
          // 简单的非 JSON 预览
          setStreamedSummary(fullJsonStr.split('"summary":"')[1]?.split('"')[0] || "正在解析流...");
        }
      }
      const finalResult = JSON.parse(fullJsonStr);
      setResult(finalResult);
      setStreamedSummary(finalResult.summary);
    } catch (error) {
      console.error(error);
      alert('分析失败，请重试。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <header className="flex items-center space-x-4">
        <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
          <Brain className="text-indigo-600" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">学习成效分析</h2>
          <p className="text-sm text-slate-500">流式 AI 实时评估您的学习深度。</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">学习科目</label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="例如：高等数学" className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">时长 (min)</label>
                <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="60" className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">掌握程度</label>
                <select value={confidence} onChange={(e) => setConfidence(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm appearance-none">
                  <option value="3">3 - 基本掌握</option>
                  <option value="5">5 - 融会贯通</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">学习细节</label>
              <textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="记录具体知识点..." className="w-full h-32 px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm resize-none" />
            </div>
          </div>
          <button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50">
            {isAnalyzing ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
            <span>{isAnalyzing ? '流式分析中...' : '开始 AI 评估'}</span>
          </button>
        </div>

        <div className="space-y-6">
          {(streamedSummary || result) ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[2rem] text-white shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold">评估摘要</h3>
                  <div className="w-16 h-16 rounded-full border-4 border-white/20 flex items-center justify-center">
                    <span className="text-2xl font-black">{result?.efficiencyScore || '??'}</span>
                  </div>
                </div>
                <p className="text-indigo-100 text-sm leading-relaxed whitespace-pre-wrap">
                  {streamedSummary}
                  {isAnalyzing && <span className="inline-block w-1.5 h-4 bg-white/40 ml-1 animate-pulse" />}
                </p>
              </div>

              {result && (
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center space-x-2 text-orange-500 mb-4">
                      <Target size={18} />
                      <h4 className="font-bold text-sm">薄弱点</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-600">
                      {result.gaps.map((gap: string, i: number) => <li key={i}>• {gap}</li>)}
                    </ul>
                  </div>
                  <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                    <div className="flex items-center space-x-2 text-green-700 mb-3">
                      <CheckCircle size={18} />
                      <h4 className="font-bold text-sm">改进建议</h4>
                    </div>
                    <p className="text-sm text-green-800 font-medium">{result.recommendation}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full bg-slate-50 border border-slate-200 border-dashed rounded-[2rem] flex flex-col items-center justify-center p-12 text-center text-slate-400 space-y-4">
              <BookOpen size={32} className="opacity-20" />
              <p className="text-sm">提交日志，即刻开启流式分析。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyAnalysis;