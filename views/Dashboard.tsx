
import React from 'react';
import { 
  CartesianGrid, Tooltip, ResponsiveContainer,
  XAxis, YAxis, AreaChart, Area
} from 'recharts';
import { Clock, BookOpen, Star, AlertCircle } from 'lucide-react';
import { AppTab } from '../types';

const data = [
  { name: '周一', hours: 4 },
  { name: '周二', hours: 6 },
  { name: '周三', hours: 5 },
  { name: '周四', hours: 8 },
  { name: '周五', hours: 7 },
  { name: '周六', hours: 3 },
  { name: '周日', hours: 2 },
];

interface DashboardProps {
  setActiveTab: (tab: AppTab) => void;
  points: number;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, points }) => {
  const stats = [
    { 
      label: '今日学习', 
      val: '5.5h', 
      icon: Clock, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50',
      action: () => setActiveTab(AppTab.STUDY_ANALYSIS)
    },
    { 
      label: '待办任务', 
      val: '4', 
      icon: BookOpen, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50',
      action: () => setActiveTab(AppTab.SCHEDULE)
    },
    { 
      label: '知识积分', 
      val: points.toLocaleString(), 
      icon: Star, 
      color: 'text-yellow-600', 
      bg: 'bg-yellow-50',
      action: () => setActiveTab(AppTab.POINTS)
    },
    { 
      label: '临近考试', 
      val: '1', 
      icon: AlertCircle, 
      color: 'text-red-600', 
      bg: 'bg-red-50',
      action: () => setActiveTab(AppTab.EXAM_PLAN)
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">欢迎回来, 同学! 👋</h2>
        <p className="text-sm text-slate-500">这是您今天的校园活动概览。</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            onClick={stat.action}
            className={`bg-white p-4 md:p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center sm:space-x-4 text-center sm:text-left transition-all ${stat.action ? 'cursor-pointer hover:border-indigo-200 hover:shadow-md active:scale-95' : ''}`}
          >
            <div className={`${stat.bg} ${stat.color} p-2.5 md:p-3 rounded-xl mb-2 sm:mb-0`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] md:text-xs text-slate-500 font-medium">{stat.label}</p>
              <p className="text-lg md:text-xl font-bold text-slate-800">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Study Time Chart */}
        <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 text-sm md:text-base">学习效率分析</h3>
          </div>
          <div className="h-56 md:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="hours" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Calendar/Tasks Summary */}
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 text-center text-sm md:text-base">今日行程</h3>
          <div className="space-y-3">
            {[
              { time: '09:00', title: '高等数学课程', tag: '学术', color: 'bg-indigo-100 text-indigo-700' },
              { time: '14:30', title: '项目小组讨论', tag: '活动', color: 'bg-green-100 text-green-700' },
              { time: '19:00', title: 'Gemini API 研究', tag: '自习', color: 'bg-purple-100 text-purple-700' },
            ].map((item, i) => (
              <div key={i} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setActiveTab(AppTab.SCHEDULE)}>
                <span className="text-[10px] font-semibold text-slate-400 mt-1 whitespace-nowrap">{item.time}</span>
                <div>
                  <h4 className="text-xs md:text-sm font-semibold text-slate-700">{item.title}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block ${item.color}`}>
                    {item.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setActiveTab(AppTab.SCHEDULE)}
            className="w-full mt-6 py-2 text-xs md:text-sm text-indigo-600 font-medium hover:bg-indigo-50 rounded-xl transition-colors"
          >
            查看完整计划表
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
