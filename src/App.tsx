import React, { useState, useEffect } from 'react';
import { useMqtt } from './hooks/useMqtt';
import { Sidebar } from './components/SideBar';
import { Topbar, BottomNav } from './components/Topbar';
import { Overview } from './views/Overview';
import { Control } from './views/Control';
import { Automation } from './views/Automation';
import { Insights } from './views/Insights';
import { Device } from './views/Device';
import { SettingsModal } from './components/SettingsModal';
import { ToastProvider, useToast } from './components/ui/Toast';
import { AppPreferences } from './types';

function AppContent() {
  const { cfg, saveCfg, state, alerts, history, connect, disconnect, publish, setHistory } = useMqtt();
  const [currentView, setCurrentView] = useState('overview');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const { toast } = useToast();

  const [pref, setPref] = useState<AppPreferences>(() => {
    try {
      const p = JSON.parse(localStorage.getItem('aero_web_pref') || 'null');
      return p || {
        theme: 'light',
        ranges: { ecMin: 0.8, ecMax: 2.0, phMin: 5.8, phMax: 6.5 },
        targets: { temp: 26, hum: 65 },
        schedule: { lightStart: '08:00', lightEnd: '20:00', mistOn: 3, mistOff: 180 },
        history: [],
      };
    } catch (e) {
      return {
        theme: 'light',
        ranges: { ecMin: 0.8, ecMax: 2.0, phMin: 5.8, phMax: 6.5 },
        targets: { temp: 26, hum: 65 },
        schedule: { lightStart: '08:00', lightEnd: '20:00', mistOn: 3, mistOff: 180 },
        history: [],
      };
    }
  });

  useEffect(() => {
    if (pref.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [pref.theme]);

  const savePref = (key: keyof AppPreferences, value: any) => {
    setPref((p) => {
      const next = { ...p, [key]: value };
      localStorage.setItem('aero_web_pref', JSON.stringify(next));
      return next;
    });
  };

  const handleExport = () => {
    const rows = [['time', 'temp', 'hum', 'lux', 'ec', 'ph', 'waterLevelState']];
    for (const p of history.slice(-300)) {
      rows.push([
        new Date(p.t).toISOString(),
        p.temp ?? '',
        p.hum ?? '',
        p.lux ?? '',
        p.ec ?? '',
        p.ph ?? '',
        p.wls ?? ''
      ].map(String));
    }
    const csv = rows.map(r => r.map(v => v.replaceAll('"', '""')).map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `aero_export_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
    toast('导出完成', '已导出 CSV 文件。', 'success');
  };

  const handleClearCache = () => {
    localStorage.removeItem('aero_web_history');
    setHistory([]);
  };

  // Extract unique device IDs from history for the filter dropdown
  const deviceIds: string[] = [];
  if (state.deviceId) {
    deviceIds.push(state.deviceId);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-50 font-sans selection:bg-cyan-500/30 transition-colors duration-300">
      {/* Minimal Clean Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      <div className="relative z-10 flex h-screen overflow-hidden">
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          state={state}
          onOpenSettings={() => setIsSettingsOpen(true)}
          theme={pref.theme}
          onToggleTheme={() => savePref('theme', pref.theme === 'dark' ? 'light' : 'dark')}
        />

        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          <Topbar
            onRefresh={() => toast('已刷新', '界面已刷新。', 'info')}
            onExport={handleExport}
            filter={filter}
            setFilter={setFilter}
            currentView={currentView}
          />

          <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 scroll-smooth">
            <div className="max-w-7xl mx-auto">
              {currentView === 'overview' && <Overview state={state} pref={pref} filter={filter} />}
              {currentView === 'control' && <Control state={state} publish={publish} alerts={alerts} />}
              {currentView === 'automation' && <Automation pref={pref} savePref={savePref} publish={publish} state={state} />}
              {currentView === 'insights' && <Insights history={history} state={state} />}
              {currentView === 'device' && <Device state={state} onOpenSettings={() => setIsSettingsOpen(true)} onClearCache={handleClearCache} theme={pref.theme} onToggleTheme={() => savePref('theme', pref.theme === 'dark' ? 'light' : 'dark')} />}
            </div>
          </main>
        </div>

        <BottomNav currentView={currentView} onViewChange={setCurrentView} />
      </div>

      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          cfg={cfg}
          saveCfg={saveCfg}
          connect={connect}
          disconnect={disconnect}
          connected={state.connected}
          deviceIds={deviceIds}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

