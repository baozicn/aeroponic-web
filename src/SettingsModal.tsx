import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, RefreshCw, PowerOff } from 'lucide-react';
import { AppConfig } from '../types';
import { cn } from '../lib/utils';
import { useToast } from '../components/ui/Toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cfg: AppConfig;
  saveCfg: (cfg: AppConfig) => void;
  connect: () => void;
  disconnect: () => void;
  connected: boolean;
  deviceIds: string[];
}

export function SettingsModal({ isOpen, onClose, cfg, saveCfg, connect, disconnect, connected, deviceIds }: SettingsModalProps) {
  const { toast } = useToast();
  const [localCfg, setLocalCfg] = useState<AppConfig>(cfg);

  useEffect(() => {
    if (isOpen) {
      setLocalCfg(cfg);
    }
  }, [isOpen, cfg]);

  const handleSave = () => {
    saveCfg(localCfg);
    connect();
    onClose();
    toast('已保存', '配置已保存并尝试连接。', 'success');
  };

  const handleReset = () => {
    const defaultCfg = {
      broker: 'wss://broker.emqx.io:8084/mqtt',
      subTopic: 'home/data',
      pubTopic: 'home/control',
      clientId: 'aero-web-' + Math.random().toString(16).slice(2, 10),
      deviceFilter: ''
    };
    setLocalCfg(defaultCfg);
    saveCfg(defaultCfg);
    connect();
    onClose();
    toast('已恢复默认', '连接参数已恢复默认值。', 'success');
  };

  const handleDisconnect = () => {
    disconnect();
    toast('已断开', 'MQTT 已断开连接', 'warning');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">连接设置</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-white/60 px-1">Broker (WebSocket)</label>
                <input
                  type="text"
                  value={localCfg.broker}
                  onChange={(e) => setLocalCfg((p) => ({ ...p, broker: e.target.value }))}
                  className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  placeholder="wss://broker.emqx.io:8084/mqtt"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-white/60 px-1">ClientId</label>
                <input
                  type="text"
                  value={localCfg.clientId}
                  onChange={(e) => setLocalCfg((p) => ({ ...p, clientId: e.target.value }))}
                  className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  placeholder="aero-web-xxxx"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-white/60 px-1">订阅 Topic</label>
                <input
                  type="text"
                  value={localCfg.subTopic}
                  onChange={(e) => setLocalCfg((p) => ({ ...p, subTopic: e.target.value }))}
                  className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  placeholder="home/data"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-white/60 px-1">发布 Topic</label>
                <input
                  type="text"
                  value={localCfg.pubTopic}
                  onChange={(e) => setLocalCfg((p) => ({ ...p, pubTopic: e.target.value }))}
                  className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  placeholder="home/control"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-slate-500 dark:text-white/60 px-1">设备筛选（可选）</label>
                <select
                  value={localCfg.deviceFilter}
                  onChange={(e) => setLocalCfg((p) => ({ ...p, deviceFilter: e.target.value }))}
                  className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all appearance-none"
                >
                  <option value="">不过滤（显示全部）</option>
                  {deviceIds.map((id) => (
                    <option key={id} value={id}>{id}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 mt-6">
              <span className="text-sm font-medium text-slate-700 dark:text-white/70">当前状态</span>
              <span className={cn("px-3 py-1 rounded-full text-xs font-medium", connected ? "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400")}>
                {connected ? '已连接' : '未连接'}
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex flex-wrap items-center justify-end gap-3">
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <PowerOff className="w-4 h-4" />
              断开
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-slate-200/50 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white text-sm font-medium transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              恢复默认
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-sm font-medium shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              保存并连接
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
