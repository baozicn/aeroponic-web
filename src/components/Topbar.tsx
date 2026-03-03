import React from 'react';
import { Search, RefreshCw, Download, LayoutDashboard, SlidersHorizontal, Settings2, LineChart, Cpu } from 'lucide-react';
import { cn } from '../lib/utils';
import { AppState } from '../types';

interface TopbarProps {
  onRefresh: () => void;
  onExport: () => void;
  filter: string;
  setFilter: (f: string) => void;
  currentView: string;
}

const viewTitles: Record<string, { title: string; subtitle: string }> = {
  overview: { title: '概览', subtitle: '实时监测与系统状态' },
  control: { title: '智能控制', subtitle: '远程操作与设备管理' },
  automation: { title: '自动化', subtitle: '定时任务与智能规则' },
  insights: { title: '数据洞察', subtitle: '历史趋势与分析报表' },
  device: { title: '设备管理', subtitle: '连接状态与系统设置' },
};

export function Topbar({ onRefresh, onExport, filter, setFilter, currentView }: TopbarProps) {
  const { title, subtitle } = viewTitles[currentView] || viewTitles.overview;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/40 dark:bg-black/20 border-b border-slate-200/60 dark:border-white/10 px-4 py-3 md:px-6 md:py-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between transition-colors duration-300">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
        <p className="text-xs md:text-sm text-slate-500 dark:text-white/60 mt-1">{subtitle}</p>
      </div>

      <div className="flex w-full md:w-auto items-center gap-3">
        <div className="relative flex-1 md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/60" />
          <input
            type="text"
            placeholder="搜索指标 / 功能"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-sm dark:shadow-none"
          />
        </div>
        <button
          onClick={onRefresh}
          className="p-2.5 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm dark:shadow-none"
          title="刷新"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button
          onClick={onExport}
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/20 dark:to-blue-500/20 hover:from-cyan-500/20 hover:to-blue-500/20 dark:hover:from-cyan-500/30 dark:hover:to-blue-500/30 border border-cyan-500/20 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-50 text-sm font-medium transition-all shadow-sm dark:shadow-none"
        >
          <Download className="w-4 h-4" />
          导出CSV
        </button>
      </div>
    </header>
  );
}

interface BottomNavProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function BottomNav({ currentView, onViewChange }: BottomNavProps) {
  const navItems = [
    { id: 'overview', label: '概览', icon: LayoutDashboard },
    { id: 'control', label: '控制', icon: SlidersHorizontal },
    { id: 'automation', label: '自动化', icon: Settings2 },
    { id: 'insights', label: '数据', icon: LineChart },
    { id: 'device', label: '设备', icon: Cpu },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-slate-200/60 dark:border-white/10 pb-safe transition-colors duration-300">
      <div className="flex items-center justify-around p-2">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                'flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all',
                isActive ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10' : 'text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white/80'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
