import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardHeader, CardTitle, CardBody, Badge } from '../components/ui/Card';
import { Slider } from '../components/ui/Controls';
import { AppPreferences, AppState } from '../types';
import { useToast } from '../components/ui/Toast';
import { Thermometer, Droplets, Activity, TestTube, Clock, RefreshCw } from 'lucide-react';

interface AutomationProps {
  pref: AppPreferences;
  savePref: (key: keyof AppPreferences, value: any) => void;
  publish: (obj: any) => boolean;
  state: AppState;
}

export function Automation({ pref, savePref, publish, state }: AutomationProps) {
  const { toast } = useToast();
  const [targets, setTargets] = useState(pref.targets);
  const [ranges, setRanges] = useState(pref.ranges);
  const [schedule, setSchedule] = useState(pref.schedule);

  const handleSaveTargets = () => {
    if (!state.deviceOnline) {
      toast('操作失败', '设备当前离线，无法同步设置。', 'warn');
      return;
    }
    savePref('targets', targets);
    if (publish({ setpoints: targets })) {
      toast('已保存', '目标参数已保存并发送。', 'success');
    } else {
      toast('发送失败', '云端未连接', 'bad');
    }
  };

  const handleSaveRanges = () => {
    if (!state.deviceOnline) {
      toast('操作失败', '设备当前离线，无法同步设置。', 'warn');
      return;
    }
    savePref('ranges', ranges);
    if (publish({ ranges })) {
      toast('已保存', '范围参数已保存并发送。', 'success');
    } else {
      toast('发送失败', '云端未连接', 'bad');
    }
  };

  const handleSaveSchedule = () => {
    if (!state.deviceOnline) {
      toast('操作失败', '设备当前离线，无法同步设置。', 'warn');
      return;
    }
    savePref('schedule', schedule);
    if (publish({ schedule })) {
      toast('已保存', '计划已保存并发送。', 'success');
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
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">自动化策略</h3>
          <p className="text-sm text-slate-500 dark:text-white/60">用于设置目标、定时与联动规则。</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-slate-900 dark:text-white">目标温湿度</CardTitle>
            <Badge variant="default">建议：按作物调整</Badge>
          </CardHeader>
          <CardBody className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500/10 to-orange-500/10 dark:from-rose-500/20 dark:to-orange-500/20 flex items-center justify-center border border-rose-500/20 dark:border-rose-500/30">
                    <Thermometer className="w-5 h-5 text-rose-500 dark:text-rose-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white">目标温度</h4>
                    <p className="text-xs text-slate-500 dark:text-white/60 mt-0.5">设备将尝试接近此目标</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-200/50 dark:bg-white/10 text-xs font-mono text-slate-700 dark:text-white/80">
                  {targets.temp}°C
                </span>
              </div>
              <Slider
                value={targets.temp}
                onChange={(v) => setTargets((p) => ({ ...p, temp: v }))}
                min={10}
                max={40}
                step={0.5}
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/20 dark:to-blue-500/20 flex items-center justify-center border border-cyan-500/20 dark:border-cyan-500/30">
                    <Droplets className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white">目标湿度</h4>
                    <p className="text-xs text-slate-500 dark:text-white/60 mt-0.5">建议范围会随场景变化</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-200/50 dark:bg-white/10 text-xs font-mono text-slate-700 dark:text-white/80">
                  {targets.hum}%
                </span>
              </div>
              <Slider
                value={targets.hum}
                onChange={(v) => setTargets((p) => ({ ...p, hum: v }))}
                min={30}
                max={95}
                step={1}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
              <button
                onClick={() => setTargets({ temp: 26, hum: 65 })}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white text-sm font-medium transition-colors"
              >
                重置
              </button>
              <button
                onClick={handleSaveTargets}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-sm font-medium shadow-lg shadow-cyan-500/25 transition-all"
              >
                保存目标
              </button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-slate-900 dark:text-white">营养液建议范围</CardTitle>
            <Badge variant="default">用于提醒与可视化</Badge>
          </CardHeader>
          <CardBody className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 flex items-center justify-center border border-emerald-500/20 dark:border-emerald-500/30">
                    <Activity className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white">EC 建议范围</h4>
                    <p className="text-xs text-slate-500 dark:text-white/60 mt-0.5">超出范围时会提示</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-200/50 dark:bg-white/10 text-xs font-mono text-slate-700 dark:text-white/80">
                  {ranges.ecMin.toFixed(1)} - {ranges.ecMax.toFixed(1)}
                </span>
              </div>
              <div className="space-y-3">
                <Slider
                  value={ranges.ecMin}
                  onChange={(v) => setRanges((p) => ({ ...p, ecMin: Math.min(v, p.ecMax) }))}
                  min={0}
                  max={5}
                  step={0.1}
                />
                <Slider
                  value={ranges.ecMax}
                  onChange={(v) => setRanges((p) => ({ ...p, ecMax: Math.max(v, p.ecMin) }))}
                  min={0}
                  max={5}
                  step={0.1}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 flex items-center justify-center border border-purple-500/20 dark:border-purple-500/30">
                    <TestTube className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white">pH 建议范围</h4>
                    <p className="text-xs text-slate-500 dark:text-white/60 mt-0.5">适度偏离可提示调节</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-200/50 dark:bg-white/10 text-xs font-mono text-slate-700 dark:text-white/80">
                  {ranges.phMin.toFixed(1)} - {ranges.phMax.toFixed(1)}
                </span>
              </div>
              <div className="space-y-3">
                <Slider
                  value={ranges.phMin}
                  onChange={(v) => setRanges((p) => ({ ...p, phMin: Math.min(v, p.phMax) }))}
                  min={4}
                  max={9}
                  step={0.1}
                />
                <Slider
                  value={ranges.phMax}
                  onChange={(v) => setRanges((p) => ({ ...p, phMax: Math.max(v, p.phMin) }))}
                  min={4}
                  max={9}
                  step={0.1}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
              <button
                onClick={() => setRanges({ ecMin: 0.8, ecMax: 2.0, phMin: 5.8, phMax: 6.5 })}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white text-sm font-medium transition-colors"
              >
                重置
              </button>
              <button
                onClick={handleSaveRanges}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-sm font-medium shadow-lg shadow-cyan-500/25 transition-all"
              >
                保存范围
              </button>
            </div>
          </CardBody>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900 dark:text-white">定时与计划</CardTitle>
            <Badge variant="default">24小时制</Badge>
          </CardHeader>
          <CardBody className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/10 to-yellow-500/10 dark:from-amber-500/20 dark:to-yellow-500/20 flex items-center justify-center border border-amber-500/20 dark:border-amber-500/30">
                    <Clock className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white">补光时间窗</h4>
                    <p className="text-xs text-slate-500 dark:text-white/60 mt-0.5">在指定时间段开启补光</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1.5 rounded-lg bg-slate-200/50 dark:bg-white/10 text-xs font-medium text-slate-600 dark:text-white/70">开始</span>
                  <input
                    type="time"
                    value={schedule.lightStart}
                    onChange={(e) => setSchedule((p) => ({ ...p, lightStart: e.target.value }))}
                    className="flex-1 bg-transparent border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                  <span className="px-3 py-1.5 rounded-lg bg-slate-200/50 dark:bg-white/10 text-xs font-medium text-slate-600 dark:text-white/70">结束</span>
                  <input
                    type="time"
                    value={schedule.lightEnd}
                    onChange={(e) => setSchedule((p) => ({ ...p, lightEnd: e.target.value }))}
                    className="flex-1 bg-transparent border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 flex items-center justify-center border border-blue-500/20 dark:border-blue-500/30">
                    <RefreshCw className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white">雾化循环</h4>
                    <p className="text-xs text-slate-500 dark:text-white/60 mt-0.5">按周期运行（开/关）</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={schedule.mistOn}
                    onChange={(e) => setSchedule((p) => ({ ...p, mistOn: Number(e.target.value) }))}
                    className="w-20 bg-transparent border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-center"
                  />
                  <span className="px-3 py-1.5 rounded-lg bg-slate-200/50 dark:bg-white/10 text-xs font-medium text-slate-600 dark:text-white/70">秒开</span>
                  <input
                    type="number"
                    value={schedule.mistOff}
                    onChange={(e) => setSchedule((p) => ({ ...p, mistOff: Number(e.target.value) }))}
                    className="w-24 bg-transparent border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-center"
                  />
                  <span className="px-3 py-1.5 rounded-lg bg-slate-200/50 dark:bg-white/10 text-xs font-medium text-slate-600 dark:text-white/70">秒关</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
              <button
                onClick={() => setSchedule({ lightStart: '08:00', lightEnd: '20:00', mistOn: 3, mistOff: 180 })}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white text-sm font-medium transition-colors"
              >
                重置
              </button>
              <button
                onClick={handleSaveSchedule}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-sm font-medium shadow-lg shadow-cyan-500/25 transition-all"
              >
                保存计划
              </button>
            </div>
          </CardBody>
        </Card>
      </div>
    </motion.div>
  );
}
