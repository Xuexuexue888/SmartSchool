
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import LearningAssistant from './views/LearningAssistant';
import TimeManagement from './views/TimeManagement';
import MentalHealth from './views/MentalHealth';
import ResourceSharing from './views/ResourceSharing';
import { AppTab } from './types';
import { Bell, Search, Settings, User } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.DASHBOARD: return <Dashboard />;
      case AppTab.LEARNING: return <LearningAssistant />;
      case AppTab.SCHEDULE: return <TimeManagement />;
      case AppTab.HEALTH: return <MentalHealth />;
      case AppTab.RESOURCES: return <ResourceSharing />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-24 md:pb-8">
        <header className="flex items-center justify-between mb-6 sticky top-0 bg-slate-50/90 backdrop-blur-md z-30 py-3">
          <div className="flex items-center space-x-3 md:hidden">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
          </div>

          <div className="hidden sm:relative sm:flex flex-1 max-w-xs md:max-w-md mx-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="搜索资源..." 
              className="w-full bg-white border border-slate-100 rounded-xl py-2 pl-10 pr-4 shadow-sm focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
            />
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <button className="p-2 text-slate-500 hover:bg-white rounded-xl transition-colors relative sm:hidden">
               <Search size={20} />
            </button>
            <button className="p-2 text-slate-500 hover:bg-white rounded-xl transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-50"></span>
            </button>
            <div className="h-6 w-px bg-slate-200 mx-1 hidden md:block"></div>
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-none">张同学</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white border-2 border-white shadow-sm ring-1 ring-slate-100">
                <User size={18} />
              </div>
            </div>
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
