import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardHeader, CardTitle, CardBody, Badge } from '../components/ui/Card';
import { Switch, Slider } from '../components/ui/Controls';
import { AppState, AlertEvent } from '../types';
import { useToast } from '../components/ui/Toast';
import { Fan, Flame, CloudRain, Lightbulb, Play, AlertTriangle } from 'lucide-react';

interface ControlProps {
  state: AppState;
  publish: (obj: any) => boolean;
  alerts: AlertEvent[];
}

export function Control({ state, publish, alerts }: ControlProps) {
  const { toast } = useToast();
  const [localState, setLocalState] = useState({
    fan: state.fan ?? false,
    heater: state.heater ?? false,
    mist: state.mist ?? false,
    light: state.light ?? false,
    lightPWM: state.lightPWM ?? 0,
    mistDuty: 0,
  });

  const handleToggle = (key: keyof typeof localState) => (checked: boolean) => {
    setLocalState(prev => ({ ...prev, [key]: checked }));
  };

  const handleSlider = (key: keyof typeof localState) => (value: number) => {
    setLocalState(prev => ({ ...prev, [key]: value }));
  };

  const handleAllOff = () => {
    setLocalState({
      fan: false,
      heater: false,
      mist: false,
      light: false,
      lightPWM: 0,
      mistDuty: 0,
    });
    toast('已设置', '已切换为全部关闭（尚未发送）。', 'warning');
  };

  const handleApply = () => {
    if (!state.deviceOnline) {
      toast('操作失败', '设备当前离线，无法接收控制指令。', 'warn');
      return;
    }
    const payload = {
      fan: localState.fan ? 1 : 0,
      heater: localState.heater ? 1 : 0,
      mist: localState.mist ? 1 : 0,
      light: localState.light ? 1 : 0,
      lightPWM: localState.lightPWM,
      mistDuty: localState.mistDuty,
    };
    if (publish(payload)) {
      toast('已发送', '控制指令已发送到设备。', 'success');
    } else {
      toast('发送失败', '云端未连接', 'bad');
    }
  };

  const handleProfile = (profile: string) => {
    if (!state.deviceOnline) {
      toast('操作失败', '设备当前离线，无法接收控制指令。', 'warn');
      return;
    }
    if (publish({ profile })) {
      toast('已发送', `已发送场景：${profile}`, 'success');
    } else {
      toast('发送失败', '云端未连接', 'bad');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">设备控制</h3>
          <p className="text-sm text-slate-500 dark:text-white/60">开关与滑条会发送控制指令到设备。</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900 dark:text-white">手动控制</CardTitle>
            <Badge variant="default">
              <strong className="text-slate-900 dark:text-white">提示</strong>
              <span className="ml-1 text-slate-500 dark:text-white/60">部分功能取决于设备固件版本</span>
            </Badge>
          </CardHeader>
          <CardBody className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'fan', label: '风扇开关', desc: '提升空气流通与散热', icon: Fan },
                { id: 'heater', label: '加热开关', desc: '稳定环境温度', icon: Flame },
                { id: 'mist', label: '雾化开关', desc: '开启/停止雾化循环', icon: CloudRain },
                { id: 'light', label: '补光开关', desc: '植物照明模式切换', icon: Lightbulb },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center shadow-sm dark:shadow-none">
                      <item.icon className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</h4>
                      <p className="text-xs text-slate-500 dark:text-white/60 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <Switch
                    checked={localState[item.id as keyof typeof localState] as boolean}
                    onChange={handleToggle(item.id as keyof typeof localState)}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white">补光强度</h4>
                    <p className="text-xs text-slate-500 dark:text-white/60 mt-0.5">0–100%（用于 PWM/亮度控制）</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-200/50 dark:bg-white/10 text-xs font-mono text-slate-700 dark:text-white/80">
                    {localState.lightPWM}%
                  </span>
                </div>
                <Slider
                  value={localState.lightPWM}
                  onChange={handleSlider('lightPWM')}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white">雾化占空比</h4>
                    <p className="text-xs text-slate-500 dark:text-white/60 mt-0.5">0–100%（用于强度/频率策略）</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-200/50 dark:bg-white/10 text-xs font-mono text-slate-700 dark:text-white/80">
                    {localState.mistDuty}%
                  </span>
                </div>
                <Slider
                  value={localState.mistDuty}
                  onChange={handleSlider('mistDuty')}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
              <button
                onClick={handleAllOff}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white text-sm font-medium transition-colors"
              >
                一键关闭
              </button>
              <button
                onClick={handleApply}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-sm font-medium shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                发送控制
              </button>
            </div>
          </CardBody>
        </Card>

        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-slate-900 dark:text-white">场景一键应用</CardTitle>
              <Badge variant="default">快速预设</Badge>
            </CardHeader>
            <CardBody className="space-y-4">
              {[
                { id: 'seedling', label: '育苗', desc: '温和环境 · 更高湿度 · 柔光' },
                { id: 'veg', label: '生长期', desc: '稳定温湿 · 较强补光 · 循环雾化' },
                { id: 'showcase', label: '展示模式', desc: '数据大屏 · 强化视觉呈现' },
              ].map((profile) => (
                <div key={profile.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white">{profile.label}</h4>
                    <p className="text-xs text-slate-500 dark:text-white/60 mt-0.5">{profile.desc}</p>
                  </div>
                  <button
                    onClick={() => handleProfile(profile.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-200/50 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-white text-xs font-medium transition-colors"
                  >
                    应用
                  </button>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                告警与提醒
              </CardTitle>
              <Badge variant="default">自动刷新</Badge>
            </CardHeader>
            <CardBody>
              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/60 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3 font-medium">时间</th>
                      <th className="px-4 py-3 font-medium">事件</th>
                      <th className="px-4 py-3 font-medium">级别</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-white/10 text-slate-700 dark:text-white/70">
                    {alerts.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-6 text-center text-slate-400 dark:text-white/60">
                          暂无事件
                        </td>
                      </tr>
                    ) : (
                      alerts.map((alert) => (
                        <tr key={alert.id} className="hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 text-xs whitespace-nowrap">
                            {new Date(alert.time).toLocaleTimeString()}
                          </td>
                          <td className="px-4 py-3">{alert.event}</td>
                          <td className="px-4 py-3">
                            <Badge variant={alert.level as any}>
                              {alert.level === 'bad' ? '紧急' : alert.level === 'warn' ? '提醒' : '信息'}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
