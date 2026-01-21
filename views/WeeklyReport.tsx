import React, { useState } from 'react';
import { 
  BarChart3, 
  Sparkles, 
  Brain, 
  Heart, 
  ArrowUp, 
  Loader2, 
  Target,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
// Fix: Use generateComprehensiveReportStream as generateComprehensiveReport is not exported
import { generateComprehensiveReportStream } from '../services/geminiService';

const WeeklyReport: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<any>(null);

  const radarData = [
    { subject: '专注度', A: 85, fullMark: 100 },
    { subject: '身心平衡', A: 65, fullMark: 100 },
    { subject: '社交互动', A: 40, fullMark: 100 },
    { subject: '任务完成率', A: 90, fullMark: 100 },
    { subject: '知识摄取', A: 75, fullMark: 100 },
  ];

  const trendData = [
    { name: 'Mon', study: 4, mood: 3 },
    { name: 'Tue', study: 6, mood: 4 },
    { name: 'Wed', study: 5, mood: 2 },
    { name: 'Thu', study: 8, mood: 4 },
    { name: 'Fri', study: 7, mood: 5 },
    { name: 'Sat', study: 3, mood: 5 },
    { name: 'Sun', study: 2, mood: 4 },
  ];

  // Fix: Consume the async generator stream and aggregate chunks to parse final JSON
  const fetchReport = async () => {
    setIsGenerating(true);
    const mockData = { study: trendData, mood: trendData, points: 1250 };
    let fullJsonStr = '';
    try {
      const stream = generateComprehensiveReportStream(mockData);
      for await (const chunk of stream) {
        fullJsonStr += chunk;
      }
      const res = JSON.parse(fullJsonStr);
      setReport(res);
    } catch (e) {
      console.error(e);
      alert('报告生成失败');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">每周成长周报</h2>
          <p className="text-sm text-slate-500">身心综合分析，见证您本周的进步与成长。</p>
        </div>
        <button 
          onClick={fetchReport}
          disabled={isGenerating}
          className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center space-x-2 disabled:opacity-50"
        >
          {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          <span>生成 AI 综合分析报告</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Radar Charts & Stats */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-800 mb-8 flex items-center">
            <Brain size={18} className="mr-2 text-indigo-600" />
            能力雷达图
          </h3>
          <div className="h-72 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar
                  name="Ability"
                  dataKey="A"
                  stroke="#4f46e5"
                  fill="#4f46e5"
                  fillOpacity={0.1}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="p-4 bg-slate-50 rounded-2xl text-center">
              <p className="text-2xl font-black text-indigo-600">88%</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">效率超越</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl text-center">
              <p className="text-2xl font-black text-emerald-600">+12%</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">较上周增长</p>
            </div>
          </div>
        </div>

        {/* AI Insight Results */}
        <div className="space-y-6">
          {report ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
              <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 p-8 rounded-[2rem] text-white shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-indigo-200 uppercase tracking-widest text-xs">AI 深度洞察</h3>
                  <div className="flex space-x-2">
                    <div className="px-2 py-1 bg-white/10 rounded-lg text-[10px]">身心平衡 {report.healthScore}</div>
                    <div className="px-2 py-1 bg-white/10 rounded-lg text-[10px]">学习强度 {report.studyScore}</div>
                  </div>
                </div>
                <p className="text-sm italic leading-relaxed text-indigo-100">
                  "{report.insight}"
                </p>
                {report.warning && (
                  <div className="mt-6 flex items-start space-x-3 p-4 bg-red-500/20 rounded-2xl border border-red-500/30">
                    <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-200">{report.warning}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
                  <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                    <Lightbulb size={24} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase">下周目标</h4>
                    <p className="text-sm font-bold text-slate-700">{report.nextWeekGoal}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-slate-50 border border-slate-200 border-dashed rounded-[2rem] flex flex-col items-center justify-center p-12 text-center text-slate-400 space-y-4">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <BarChart3 size={32} className="opacity-20" />
              </div>
              <div>
                <p className="text-sm font-medium">尚未生成综合报告</p>
                <p className="text-xs opacity-60">点击上方按钮，聚合本周学习与心理数据。</p>
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h4 className="font-bold text-sm text-slate-800 mb-6">身心平衡趋势</h4>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '10px' }} />
                  <Line type="monotone" dataKey="study" stroke="#4f46e5" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="mood" stroke="#ec4899" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 mt-2">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-[10px] text-slate-400">学习强度</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-pink-500" />
                <span className="text-[10px] text-slate-400">心情状态</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyReport;