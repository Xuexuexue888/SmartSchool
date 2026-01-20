
import React, { useState } from 'react';
import { BookOpen, Clock, Brain, Target, Sparkles, Loader2, CheckCircle, ChevronLeft } from 'lucide-react';
import { analyzeStudySession } from '../services/geminiService';

const StudyAnalysis: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState('');
  const [details, setDetails] = useState('');
  const [confidence, setConfidence] = useState('3');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!subject || !duration || !details) {
      alert('请填写完整的学习信息');
      return;
    }
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeStudySession(subject, duration, details, confidence);
      setResult(analysis);
    } catch (error) {
      console.error(error);
      alert('分析失败，请稍后再试。');
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
          <p className="text-sm text-slate-500">记录您的学习过程，让 AI 为您优化提效建议。</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">学习科目</label>
              <input 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="例如：高等数学、Python编程..."
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">学习时长 (分钟)</label>
                <input 
                  type="number" 
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="60"
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">掌握程度 (1-5)</label>
                <select 
                  value={confidence}
                  onChange={(e) => setConfidence(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm appearance-none"
                >
                  <option value="1">1 - 完全没懂</option>
                  <option value="2">2 - 略知一二</option>
                  <option value="3">3 - 基本掌握</option>
                  <option value="4">4 - 运用自如</option>
                  <option value="5">5 - 融会贯通</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">学习细节</label>
              <textarea 
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="记录您今天学习的具体知识点、遇到的困难或完成的练习..."
                className="w-full h-32 px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
              />
            </div>
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {isAnalyzing ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
            <span>{isAnalyzing ? '正在生成分析...' : '提交并开始 AI 分析'}</span>
          </button>
        </div>

        {/* Results / Feedback */}
        <div className="space-y-6">
          {result ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
              {/* Efficiency Score Card */}
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[2rem] text-white shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold">本次学习评分</h3>
                  <div className="w-16 h-16 rounded-full border-4 border-white/20 flex items-center justify-center">
                    <span className="text-2xl font-black">{result.efficiencyScore}</span>
                  </div>
                </div>
                <p className="text-indigo-100 text-sm leading-relaxed">
                  {result.summary}
                </p>
              </div>

              {/* Gaps & Recommendations */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center space-x-2 text-orange-500 mb-4">
                    <Target size={18} />
                    <h4 className="font-bold text-sm">潜在薄弱点</h4>
                  </div>
                  <ul className="space-y-2">
                    {result.gaps.map((gap: string, i: number) => (
                      <li key={i} className="flex items-start space-x-2 text-sm text-slate-600">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                  <div className="flex items-center space-x-2 text-green-700 mb-3">
                    <CheckCircle size={18} />
                    <h4 className="font-bold text-sm">AI 提效建议</h4>
                  </div>
                  <p className="text-sm text-green-800 leading-relaxed font-medium">
                    {result.recommendation}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-slate-50 border border-slate-200 border-dashed rounded-[2rem] flex flex-col items-center justify-center p-12 text-center text-slate-400 space-y-4">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <BookOpen size={32} className="opacity-20" />
              </div>
              <div>
                <p className="text-sm font-medium">暂无分析数据</p>
                <p className="text-xs opacity-60">请在左侧填写学习日志后提交分析。</p>
              </div>
            </div>
          )}

          <div className="bg-slate-900 p-6 rounded-[2rem] text-white">
            <h4 className="font-bold text-sm mb-4">学习技巧小卡片</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-white/10 rounded-lg text-yellow-400">
                  <Sparkles size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold">费曼技巧</p>
                  <p className="text-[10px] text-slate-400 leading-relaxed">试着向别人解释你刚才学到的知识，如果你能讲明白，说明你真正掌握了。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyAnalysis;
