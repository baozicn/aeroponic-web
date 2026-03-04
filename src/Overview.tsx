import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Thermometer, Droplets, Sun, Activity, TestTube, Waves, Signal, Clock, Fan, Flame, CloudRain, Lightbulb } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody, Badge } from '../components/ui/Card';
import { AppState, AppPreferences } from '../types';
import { fmt, fmtInt, cn } from '../lib/utils';

interface OverviewProps {
  state: AppState;
  pref: AppPreferences;
  filter: string;
}

export function Overview({ state, pref, filter }: OverviewProps) {
  const [mode, setMode] = useState<'live' | 'today' | 'health'>('live');

  const kpis = [
    {
      id: 'temp',
      label: '温度',
      icon: Thermometer,
      value: fmt(state.temp, 1),
      unit: '°C',
      target: `${pref.targets.temp}°C / ${pref.targets.hum}%`,
      targetLabel: '目标',
      badge: state.temp === null ? '--' : state.temp < 18 ? '偏冷' : state.temp > 32 ? '偏热' : '舒适',
      badgeVariant: state.temp === null ? 'default' : state.temp < 18 || state.temp > 32 ? 'warn' : 'ok',
      keywords: '温度 温 temp',
    },
    {
      id: 'hum',
      label: '湿度',
      icon: Droplets,
      value: fmtInt(state.hum),
      unit: '%RH',
      target: '40–85%',
      targetLabel: '舒适区',
      badge: state.hum === null ? '--' : state.hum < 40 ? '偏干' : state.hum > 85 ? '偏湿' : '适宜',
      badgeVariant: state.hum === null ? 'default' : state.hum < 40 || state.hum > 85 ? 'warn' : 'ok',
      keywords: '湿度 湿 hum',
    },
    {
      id: 'lux',
      label: '光照',
      icon: Sun,
      value: fmtInt(state.lux),
      unit: 'Lux',
      target: state.lightPWM === null ? '—' : state.lightPWM === 0 ? '关闭' : state.lightPWM < 40 ? '柔光' : '增强',
      targetLabel: '光照模式',
      badge: state.lux === null ? '--' : state.lux < 800 ? '较暗' : state.lux > 50000 ? '很亮' : '正常',
      badgeVariant: state.lux === null ? 'default' : state.lux < 800 || state.lux > 50000 ? 'warn' : 'ok',
      keywords: '光照 lux 光 light',
    },
    {
      id: 'ec',
      label: 'EC',
      icon: Activity,
      value: fmt(state.ec, 2),
      unit: 'mS/cm',
      target: `EC ${pref.ranges.ecMin.toFixed(1)}–${pref.ranges.ecMax.toFixed(1)}`,
      targetLabel: '建议范围',
      badge: state.ec === null ? '--' : state.ec < pref.ranges.ecMin ? '偏低' : state.ec > pref.ranges.ecMax ? '偏高' : '正常',
      badgeVariant: state.ec === null ? 'default' : state.ec < pref.ranges.ecMin || state.ec > pref.ranges.ecMax ? 'warn' : 'ok',
      keywords: 'ec 电导',
    },
    {
      id: 'ph',
      label: 'pH',
      icon: TestTube,
      value: fmt(state.ph, 2),
      unit: 'pH',
      target: `pH ${pref.ranges.phMin.toFixed(1)}–${pref.ranges.phMax.toFixed(1)}`,
      targetLabel: '建议范围',
      badge: state.ph === null ? '--' : state.ph < pref.ranges.phMin ? '偏低' : state.ph > pref.ranges.phMax ? '偏高' : '正常',
      badgeVariant: state.ph === null ? 'default' : state.ph < pref.ranges.phMin || state.ph > pref.ranges.phMax ? 'warn' : 'ok',
      keywords: 'ph 酸碱',
    },
    {
      id: 'wls',
      label: '水位(0/1)',
      icon: Waves,
      value: state.waterLevelState === null ? '—' : fmtInt(state.waterLevelState),
      unit: '状态',
      target: state.waterLevel === null ? '—' : fmtInt(state.waterLevel),
      targetLabel: '水位档位',
      badge: state.waterLevelState === null ? '--' : state.waterLevelState === 1 ? '有水' : '缺水',
      badgeVariant: state.waterLevelState === null ? 'default' : state.waterLevelState === 1 ? 'ok' : 'bad',
      keywords: '水位 0 1 water level',
    },
    {
      id: 'rssi',
      label: '液位RSSI',
      icon: Signal,
      value: fmtInt(state.lvRssi),
      unit: '强度',
      target: state.lastUpdateTs ? new Date(state.lastUpdateTs).toLocaleTimeString() : '—',
      targetLabel: '更新时间',
      badge: state.lvRssi === null ? '--' : state.lvRssi > 7000 ? '强' : state.lvRssi > 3000 ? '中' : '弱',
      badgeVariant: state.lvRssi === null ? 'default' : state.lvRssi > 3000 ? 'ok' : 'warn',
      keywords: '液位 rssi 信号',
    },
    {
      id: 'runtime',
      label: '运行时间',
      icon: Clock,
      value: state.runtime === null ? '—' : fmt(state.runtime, 0),
      unit: '小时',
      target: state.leak === true ? '注意' : '正常',
      targetLabel: '设备状态',
      badge: state.runtime === null ? '--' : '运行中',
      badgeVariant: state.runtime === null ? 'default' : 'ok',
      keywords: '运行 时间 runtime',
    },
  ];

  const filteredKpis = kpis.filter(k => !filter || k.keywords.toLowerCase().includes(filter.toLowerCase()));

  const systemStatus = [
    { id: 'mist', label: '雾化', icon: CloudRain, value: state.mist === null ? '—' : state.mist ? '开启' : '关闭', desc: state.mistOnSec !== null && state.mistOffSec !== null ? `循环 ${fmtInt(state.mistOnSec)}s / ${fmtInt(state.mistOffSec)}s` : '按设备策略运行' },
    { id: 'fan', label: '风扇', icon: Fan, value: state.fanSpeed !== null ? `${fmtInt(state.fanSpeed)}%` : state.fan === null ? '—' : state.fan ? '开启' : '关闭', desc: '用于通风与散热' },
    { id: 'heater', label: '加热', icon: Flame, value: state.heater === null ? '—' : state.heater ? '开启' : '关闭', desc: '用于升温与保温' },
    { id: 'light', label: '补光', icon: Lightbulb, value: state.lightPWM === null ? '—' : `${fmtInt(state.lightPWM)}%`, desc: '用于植物照明' },
  ];

  const showSystem = !filter || '系统 状态 雾化 风扇 加热 补光'.includes(filter.toLowerCase());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">关键指标</h3>
          <p className="text-sm text-slate-500 dark:text-white/60">数据更新会自动同步到页面。</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10">
          {(['live', 'today', 'health'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                mode === m
                  ? 'bg-white dark:bg-slate-700 text-cyan-700 dark:text-cyan-50 shadow-sm dark:shadow-none'
                  : 'text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
              )}
            >
              {m === 'live' ? '实时' : m === 'today' ? '今日趋势' : '健康概览'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filteredKpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.id}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-slate-400 dark:text-white/60" />
                  <CardTitle>{kpi.label}</CardTitle>
                </div>
                <Badge variant={kpi.badgeVariant as any}>{kpi.badge}</Badge>
              </CardHeader>
              <CardBody>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">{kpi.value}</span>
                  <span className="text-sm font-medium text-slate-500 dark:text-white/60">{kpi.unit}</span>
                </div>
                <div className="flex items-center justify-between mt-4 text-xs">
                  <span className="text-slate-400 dark:text-white/60">{kpi.targetLabel}</span>
                  <span className="text-slate-700 dark:text-white/70 font-medium">{kpi.target}</span>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {showSystem && (
        <Card>
          <CardHeader className="pb-4">
            <div>
              <CardTitle className="text-lg text-slate-900 dark:text-white">运行状态</CardTitle>
              <p className="text-sm text-slate-500 dark:text-white/60 mt-1">快速概览</p>
            </div>
            <Badge variant={state.crcErr && state.crcErr > 0 ? 'bad' : 'default'}>
              <strong className="text-slate-900 dark:text-white">通信</strong>
              <span className="ml-1">
                {(state.rxOk !== null || state.crcErr !== null) ? `${fmtInt(state.rxOk)} / ${fmtInt(state.crcErr)}` : '—'}
              </span>
            </Badge>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {systemStatus.map((sys) => {
                const Icon = sys.icon;
                return (
                  <div key={sys.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center shadow-sm dark:shadow-none">
                        <Icon className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-900 dark:text-white">{sys.label}</h4>
                        <p className="text-xs text-slate-500 dark:text-white/60 mt-0.5">{sys.desc}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-slate-200/50 dark:bg-white/10 text-xs font-mono text-slate-700 dark:text-white/80">
                      {sys.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}
    </motion.div>
  );
}
