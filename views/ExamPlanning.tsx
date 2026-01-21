import React, { useState } from 'react';
import { Calendar, Book, Brain, AlertTriangle, Plus, Trash2, Sparkles, Loader2, ListChecks, CalendarRange } from 'lucide-react';
// Fix: Use generateExamRevisionPlanStream as generateExamRevisionPlan is not exported
import { generateExamRevisionPlanStream } from '../services/geminiService';
import { Exam } from '../types';

const ExamPlanning: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([
    { id: '1', subject: '物理期中考试', date: '2024-05-20', difficulty: 'Hard' }
  ]);
  const [newSubject, setNewSubject] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<any>(null);

  const addExam = () => {
    if (!newSubject || !newDate) return;
    const exam: Exam = {
      id: Math.random().toString(36).substr(2, 9),
      subject: newSubject,
      date: newDate,
      difficulty: newDifficulty
    };
    setExams([...exams, exam].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setNewSubject('');
    setNewDate('');
  };

  const removeExam = (id: string) => {
    setExams(exams.filter(e => e.id !== id));
  };

  // Fix: Consume the async generator stream and aggregate chunks to parse final JSON
  const generatePlan = async () => {
    if (exams.length === 0) return;
    setIsGenerating(true);
    let fullJsonStr = '';
    try {
      const stream = generateExamRevisionPlanStream(exams);
      for await (const chunk of stream) {
        fullJsonStr += chunk;
      }
      const generatedPlan = JSON.parse(fullJsonStr);
      setPlan(generatedPlan);
    } catch (error) {
      console.error(error);
      alert('生成计划失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <header className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-red-50 rounded-2xl border border-red-100 shadow-sm">
            <AlertTriangle className="text-red-600" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">考试提醒与复习计划</h2>
            <p className="text-sm text-slate-500">导入考试科目，AI 智能安排您的复习黄金时间。</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Exam Import Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-widest flex items-center">
              <Plus size={16} className="mr-2" />
              添加考试科目
            </h3>
            
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="考试科目名称" 
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-red-500"
              />
              <input 
                type="date" 
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-red-500"
              />
              <select 
                value={newDifficulty}
                onChange={(e) => setNewDifficulty(e.target.value as any)}
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-red-500 appearance-none"
              >
                <option value="Easy">简单 (轻度复习)</option>
                <option value="Medium">中等 (标准复习)</option>
                <option value="Hard">困难 (深度复习)</option>
              </select>
              <button 
                onClick={addExam}
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95"
              >
                确认添加
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">已导入科目 ({exams.length})</span>
            </div>
            <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
              {exams.map((exam) => (
                <div key={exam.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${exam.difficulty === 'Hard' ? 'bg-red-500' : exam.difficulty === 'Medium' ? 'bg-orange-400' : 'bg-green-400'}`} />
                    <div>
                      <p className="text-sm font-bold text-slate-700">{exam.subject}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{exam.date}</p>
                    </div>
                  </div>
                  <button onClick={() => removeExam(exam.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {exams.length === 0 && (
                <div className="p-12 text-center text-slate-400 text-xs italic">
                  尚未添加任何考试科目
                </div>
              )}
            </div>
            {exams.length > 0 && (
              <div className="p-4">
                <button 
                  onClick={generatePlan}
                  disabled={isGenerating}
                  className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                  <span>{isGenerating ? '正在规划复习路径...' : '生成 AI 复习计划'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* AI Plan Display Section */}
        <div className="lg:col-span-2 space-y-6">
          {plan ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="bg-gradient-to-br from-red-600 to-orange-600 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
                <h3 className="text-xl font-bold mb-3 flex items-center">
                  <Brain className="mr-2" size={24} />
                  AI 复习策略综述
                </h3>
                <p className="text-red-50 text-sm leading-relaxed opacity-90">
                  {plan.overview}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 flex items-center px-1">
                  <CalendarRange className="mr-2 text-red-500" size={18} />
                  复习时间轴
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {plan.schedule.map((item: any, i: number) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-red-100 transition-all">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex flex-col items-center justify-center font-bold">
                          <span className="text-[10px] leading-none uppercase">Day</span>
                          <span className="text-lg leading-none">{i + 1}</span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs font-black text-red-600 uppercase tracking-tighter bg-red-50 px-2 py-0.5 rounded-full">{item.subject}</span>
                            <span className="text-[10px] text-slate-400 font-bold">{item.duration}</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-800">{item.focus}</h4>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-slate-400">
                        <ListChecks size={14} />
                        <span className="text-[10px] font-bold">待完成</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-slate-50 border border-slate-200 border-dashed rounded-[2rem] flex flex-col items-center justify-center p-12 text-center text-slate-400 space-y-6">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm">
                <Calendar size={40} className="opacity-20" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 mb-2">准备好迎接挑战了吗？</h4>
                <p className="text-sm max-w-xs mx-auto">导入您的考试安排，点击按钮，AI 将为您生成最优的复习时间表。</p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-white rounded-full text-[10px] border border-slate-200 font-bold">按时间排序</span>
                <span className="px-3 py-1 bg-white rounded-full text-[10px] border border-slate-200 font-bold">按难度加权</span>
                <span className="px-3 py-1 bg-white rounded-full text-[10px] border border-slate-200 font-bold">智能纠偏</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamPlanning;