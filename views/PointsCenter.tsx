
import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  CalendarCheck, 
  Trophy, 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  Clock, 
  Gift,
  AlertCircle
} from 'lucide-react';

interface PointsCenterProps {
  points: number;
  setPoints: React.Dispatch<React.SetStateAction<number>>;
  membershipDays: number;
  setMembershipDays: React.Dispatch<React.SetStateAction<number>>;
}

const PointsCenter: React.FC<PointsCenterProps> = ({ points, setPoints, membershipDays, setMembershipDays }) => {
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [streak, setStreak] = useState(3); // Mock initial streak

  const tasks = [
    { id: 1, title: '完善个人基础信息', reward: 30, completed: true, type: 'one-time' },
    { id: 2, title: '绑定电子学生证', reward: 50, completed: false, type: 'one-time' },
    { id: 3, title: '查看今日课表', reward: 2, limit: '0/5', completed: false, type: 'daily' },
    { id: 4, title: '上传专业复习资料', reward: 20, completed: false, type: 'action' },
    { id: 5, title: '分享学习方法获赞', reward: 10, completed: false, type: 'action' },
  ];

  const handleCheckIn = () => {
    if (hasCheckedIn) return;
    let bonus = 0;
    const newStreak = streak + 1;
    if (newStreak === 7) bonus = 20;
    if (newStreak === 30) bonus = 100;
    
    setPoints(prev => prev + 5 + bonus);
    setStreak(newStreak);
    setHasCheckedIn(true);
    alert(`签到成功！获得 5 积分${bonus > 0 ? `，连续签到额外奖励 ${bonus} 积分` : ''}`);
  };

  const redeem = (cost: number, days: number) => {
    if (points < cost) {
      alert('积分不足，快去完成任务赚取积分吧！');
      return;
    }
    setPoints(prev => prev - cost);
    setMembershipDays(prev => prev + days);
    alert(`兑换成功！会员时长已延长 ${days} 天。`);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-6 md:p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-indigo-100 text-sm font-medium mb-1 uppercase tracking-wider">我的知识积分</p>
            <div className="flex items-center justify-center md:justify-start space-x-3">
              <Coins className="text-yellow-400" size={32} />
              <h2 className="text-4xl md:text-5xl font-black">{points}</h2>
            </div>
            {membershipDays > 0 && (
              <div className="mt-4 inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
                <Star size={12} className="mr-1.5 text-yellow-300 fill-yellow-300" />
                会员剩余: {membershipDays} 天
              </div>
            )}
          </div>
          
          <button 
            onClick={handleCheckIn}
            disabled={hasCheckedIn}
            className={`px-8 py-4 rounded-2xl font-bold flex items-center space-x-2 transition-all shadow-lg active:scale-95 ${hasCheckedIn ? 'bg-white/20 text-white/60 cursor-not-allowed' : 'bg-yellow-400 text-indigo-900 hover:bg-yellow-300'}`}
          >
            <CalendarCheck size={20} />
            <span>{hasCheckedIn ? '今日已签到' : '立即签到'}</span>
          </button>
        </div>
      </div>

      {/* Streak Info */}
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 flex items-center">
            <Trophy size={18} className="text-orange-500 mr-2" />
            签到进度
          </h3>
          <span className="text-xs text-slate-500">已连续签到 <span className="text-indigo-600 font-bold">{streak}</span> 天</span>
        </div>
        <div className="flex justify-between gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <div key={day} className="flex-1 flex flex-col items-center">
              <div className={`w-full aspect-square max-w-[40px] rounded-lg flex items-center justify-center text-xs font-bold mb-1 transition-colors ${day <= streak ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {day === 7 ? '🎁' : `+5`}
              </div>
              <span className="text-[9px] text-slate-400">{day}天</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task List */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 px-1">赚取积分</h3>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl ${task.completed ? 'bg-green-50 text-green-600' : 'bg-indigo-50 text-indigo-600'}`}>
                    {task.completed ? <CheckCircle2 size={18} /> : <Coins size={18} />}
                  </div>
                  <div>
                    <h4 className={`text-sm font-semibold ${task.completed ? 'text-slate-400' : 'text-slate-700'}`}>{task.title}</h4>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className="text-[10px] text-indigo-600 font-bold">+{task.reward} 积分</span>
                      {task.limit && <span className="text-[10px] text-slate-400">| {task.limit}</span>}
                    </div>
                  </div>
                </div>
                {!task.completed && (
                  <button className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors">
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Redemption Store */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 px-1">积分兑换</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all cursor-pointer" onClick={() => redeem(100, 7)}>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                  <Gift size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">7 天会员体验</h4>
                  <p className="text-xs text-slate-400">解锁 AI 深度辅导与无限下载</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-indigo-600">100</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase">积分</p>
              </div>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl shadow-lg flex items-center justify-between group hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer" onClick={() => redeem(500, 30)}>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center">
                  <Star size={24} className="fill-indigo-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white">30 天尊享会员</h4>
                  <p className="text-xs text-slate-400">全站资源加速，尊贵标识</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-yellow-400">500</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase">积分</p>
              </div>
            </div>

            <div className="bg-indigo-50 p-4 rounded-xl flex items-start space-x-3">
              <AlertCircle size={16} className="text-indigo-600 mt-0.5" />
              <p className="text-[11px] text-indigo-700 leading-relaxed">
                兑换说明：会员权限实时生效，可重复兑换进行叠加。积分不可提现或转让。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointsCenter;
