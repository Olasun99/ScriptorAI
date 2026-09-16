import { LayoutDashboard, History, Settings, HelpCircle, User, Search, Moon, Sun, Trash2 } from 'lucide-react';
import { HistoryItem } from '../types';
import { useState } from 'react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onClearHistory: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Sidebar({ activeView, setActiveView, history, onSelectHistory, onClearHistory, isDarkMode, toggleDarkMode }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'history', icon: History, label: 'History' },
  ];

  const bottomItems = [
    { icon: Settings, label: 'Settings' },
    { icon: HelpCircle, label: 'Help' },
    { icon: User, label: 'Account' },
  ];

  const filteredHistory = history.filter(item => {
    const q = searchQuery.toLowerCase();
    return item.improvedText.toLowerCase().includes(q) ||
           item.originalText.toLowerCase().includes(q) ||
           item.mode.toLowerCase().includes(q) ||
           new Date(item.timestamp).toLocaleDateString().includes(q);
  });

  return (
    <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col h-screen sticky top-0 shrink-0 transition-colors">
      <div className="p-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2 transition-colors">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">S</div>
          ScriptorAI
        </h1>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 transition-colors">Write Smarter. Publish Faster.</p>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} strokeWidth={1.5} />
              {item.label}
            </button>
          );
        })}

        {activeView === 'history' && (
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
            
            {history.length > 0 && (
              <button 
                onClick={onClearHistory}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mb-2"
              >
                <Trash2 className="w-3 h-3" />
                Clear All History
              </button>
            )}
            
            <div className="space-y-2 mt-2 pb-4">
              {filteredHistory.length === 0 ? (
                <p className="text-xs text-center text-slate-400 dark:text-slate-500 py-4">No history found</p>
              ) : (
                filteredHistory.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => {
                      onSelectHistory(item);
                      setActiveView('dashboard');
                    }}
                    className="p-3 bg-white dark:bg-slate-800 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer border border-slate-200 dark:border-slate-600 shadow-sm transition-colors text-left relative group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{item.mode}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(item.improvedText);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-100 dark:hover:bg-slate-600 rounded text-blue-600 dark:text-blue-400 transition-opacity"
                          title="Copy refined text"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                        </button>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">{new Date(item.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.originalText}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-slate-700 space-y-1 bg-white dark:bg-slate-800 transition-colors">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            {isDarkMode ? <Moon className="w-5 h-5" strokeWidth={1.5} /> : <Sun className="w-5 h-5" strokeWidth={1.5} />}
            {isDarkMode ? 'Dark Mode' : 'Light Mode'}
          </div>
          <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isDarkMode ? 'bg-blue-600' : 'bg-slate-300'}`}>
            <div className={`w-3 h-3 rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </button>
        {bottomItems.map((item) => (
          <button
            key={item.label}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <item.icon className="w-5 h-5 text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  );
}
