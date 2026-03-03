import React from 'react';
import { LayoutDashboard, SlidersHorizontal, Settings2, LineChart, Cpu, Activity, Zap, Droplets, Sun, Moon } from 'lucide-react';
import { cn, fmtInt } from '../lib/utils';
import { AppState } from '../types';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  state: AppState;
  onOpenSettings: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function Sidebar({ currentView, onViewChange, state, onOpenSettings, theme, onToggleTheme }: SidebarProps) {
  const navItems = [
    { id: 'overview', label: '概览', icon: LayoutDashboard },
    { id: 'control', label: '控制', icon: SlidersHorizontal },
    { id: 'automation', label: '自动化', icon: Settings2 },
    { id: 'insights', label: '数据', icon: LineChart },
    { id: 'device', label: '设备', icon: Cpu },
  ];

  let stm32Status = '离线';
  let stm32Color = 'bg-rose-400';
  
  if (state.deviceOnline) {
    stm32Status = '在线';
    stm32Color = 'bg-emerald-400';
  } else if (!state.connected) {
    stm32Status = '未连接';
    stm32Color = 'bg-slate-400';
  }

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen border-r border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-xl p-4 sticky top-0 transition-colors duration-300">
      <div className="flex items-center gap-3 px-2 py-4 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Droplets className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-wide">雾境智培</h1>
          <p className="text-xs text-slate-500 dark:text-white/60 tracking-wider">AEROPONICS OS</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/5 dark:from-cyan-500/20 dark:to-blue-500/10 text-cyan-700 dark:text-cyan-50 border border-cyan-500/20 shadow-inner'
                  : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive ? 'text-cyan-500 dark:text-cyan-400' : 'text-slate-400 dark:text-white/60')} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-slate-200 dark:border-white/10 space-y-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
            <span className="text-xs text-slate-500 dark:text-white/60 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> 云端
            </span>
            <div className="flex items-center gap-1.5">
              <span className={cn("w-2 h-2 rounded-full", state.connected ? "bg-emerald-500 dark:bg-emerald-400" : "bg-rose-500 dark:bg-rose-400")} />
              <span className="text-xs text-slate-700 dark:text-white/80">{state.connected ? '已连接' : '未连接'}</span>
            </div>
          </div>
          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
            <span className="text-xs text-slate-500 dark:text-white/60 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> 设备
            </span>
            <div className="flex items-center gap-1.5">
              <span className={cn("w-2 h-2 rounded-full", stm32Color)} />
              <span className="text-xs text-slate-700 dark:text-white/80">{stm32Status}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onOpenSettings}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-700 dark:text-white transition-colors flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            连接
          </button>
          <button
            onClick={onToggleTheme}
            className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white transition-colors flex items-center justify-center"
            title="切换主题"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
