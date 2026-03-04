import React from 'react';
import { motion } from 'motion/react';
import { Card, CardHeader, CardTitle, CardBody, Badge } from '../components/ui/Card';
import { AppState } from '../types';
import { useToast } from '../components/ui/Toast';
import { Settings, Trash2, Info, Activity, Cpu, Clock, Wifi } from 'lucide-react';

interface DeviceProps {
  state: AppState;
  onOpenSettings: () => void;
  onClearCache: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function Device({ state, onOpenSettings, onClearCache, theme, onToggleTheme }: DeviceProps) {
  const { toast } = useToast();

  const handleClearCache = () => {
    onClearCache();
    toast('已清空', '本地历史已清空。', 'success');
  };

  let stm32Status = '离线';
  let stm32Badge = 'bad';
  
  if (state.deviceOnline) {
    stm32Status = '在线';
    stm32Badge = 'ok';
  } else if (!state.connected) {
    stm32Status = '未连接';
    stm32Badge = 'neutral';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">设备与连接</h3>
          <p className="text-sm text-slate-500 dark:text-white/60">查看连接状态与基础参数。</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-slate-900 dark:text-white">状态概览</CardTitle>
            <Badge variant={stm32Badge as any}>{stm32Status}</Badge>
          </CardHeader>
          <CardBody className="space-y-6">
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 mt-4">
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-slate-200 dark:divide-white/10 text-slate-700 dark:text-white/70">
                  <tr className="hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-cyan-500 dark:text-cyan-400" /> 云端连接
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={state.connected ? 'ok' : 'bad'}>
                        {state.connected ? '已连接' : '未连接'}
                      </Badge>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-blue-500 dark:text-blue-400" /> deviceId
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700 dark:text-white/90">
                      {state.deviceId || '—'}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <Info className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> Web 版本
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700 dark:text-white/90">
                      v2026.03.02.0
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-amber-500 dark:text-amber-400" /> STM32
                    </td>
                    <td className="px-4 py-3">
                      {stm32Status}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-500 dark:text-purple-400" /> 上次更新
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700 dark:text-white/90">
                      {state.lastUpdateTs ? new Date(state.lastUpdateTs).toLocaleString() : '—'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-slate-900 dark:text-white">快速设置</CardTitle>
            <Badge variant="default">本地保存</Badge>
          </CardHeader>
          <CardBody className="space-y-4 mt-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/20 dark:to-blue-500/20 flex items-center justify-center border border-cyan-500/20 dark:border-cyan-500/30">
                  <Settings className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-900 dark:text-white">连接设置</h4>
                  <p className="text-xs text-slate-500 dark:text-white/60 mt-0.5">Broker / Topic / ClientId</p>
                </div>
              </div>
              <button
                onClick={onOpenSettings}
                className="px-4 py-2 rounded-xl bg-slate-200/50 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-white text-sm font-medium transition-colors"
              >
                打开
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500/10 to-orange-500/10 dark:from-rose-500/20 dark:to-orange-500/20 flex items-center justify-center border border-rose-500/20 dark:border-rose-500/30">
                  <Trash2 className="w-5 h-5 text-rose-500 dark:text-rose-400" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-900 dark:text-white">清空本地缓存</h4>
                  <p className="text-xs text-slate-500 dark:text-white/60 mt-0.5">清除已保存的配置与历史</p>
                </div>
              </div>
              <button
                onClick={handleClearCache}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-medium transition-colors"
              >
                清空
              </button>
            </div>
          </CardBody>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900 dark:text-white">使用说明</CardTitle>
            <Badge variant="default">快速上手</Badge>
          </CardHeader>
          <CardBody>
            <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-sm text-slate-600 dark:text-white/60 leading-relaxed">
              本控制台即开即用，可直接打开使用。默认连接到公开 MQTT Broker，你也可以在“连接设置”中切换到自己的服务器。
              <br /><br />
              如果设备已上报数据，关键指标会自动展示；如果尚未上报，页面会显示占位符并保持界面完整。
            </div>
          </CardBody>
        </Card>
      </div>
    </motion.div>
  );
}
