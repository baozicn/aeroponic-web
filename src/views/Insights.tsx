import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Card, CardHeader, CardTitle, CardBody, Badge } from '../components/ui/Card';
import { HistoryPoint, AppState } from '../types';
import { cn, fmt, fmtInt } from '../lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface InsightsProps {
  history: HistoryPoint[];
  state: AppState;
}

export function Insights({ history, state }: InsightsProps) {
  const [series, setSeries] = useState<'temp' | 'hum' | 'lux' | 'ec' | 'ph' | 'wls'>('temp');

  const seriesMeta = {
    temp: { name: '温度', unit: '°C', digits: 1, color: '#f43f5e' },
    hum: { name: '湿度', unit: '%RH', digits: 0, color: '#06b6d4' },
    lux: { name: '光照', unit: 'Lux', digits: 0, color: '#eab308' },
    ec: { name: 'EC', unit: 'mS/cm', digits: 2, color: '#10b981' },
    ph: { name: 'pH', unit: 'pH', digits: 2, color: '#a855f7' },
    wls: { name: '水位(0/1)', unit: '状态', digits: 0, color: '#3b82f6' },
  };

  const chartData = useMemo(() => {
    return history.slice(-50).map(p => ({
      time: p.t,
      value: p[series] === null ? undefined : Number(p[series]),
    }));
  }, [history, series]);

  const stats = useMemo(() => {
    const values = chartData.map(d => d.value).filter((v): v is number => v !== undefined && Number.isFinite(v));
    if (values.length === 0) return { max: null, min: null, avg: null, last: null };
    return {
      max: Math.max(...values),
      min: Math.min(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      last: values[values.length - 1],
    };
  }, [chartData]);

  const meta = seriesMeta[series];
  const f = (x: number | null) => x === null ? '—' : meta.digits === 0 ? fmtInt(x) : fmt(x, meta.digits);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">数据洞察</h3>
          <p className="text-sm text-slate-500 dark:text-white/60">趋势图与关键指标对比。</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10">
          {(Object.keys(seriesMeta) as Array<keyof typeof seriesMeta>).map((s) => (
            <button
              key={s}
              onClick={() => setSeries(s)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                series === s
                  ? 'bg-white dark:bg-slate-700 text-cyan-700 dark:text-cyan-50 shadow-sm dark:shadow-none'
                  : 'text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
              )}
            >
              {seriesMeta[s].name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900 dark:text-white">趋势图</CardTitle>
            <Badge variant="default">
              <strong className="text-slate-900 dark:text-white">{meta.name}</strong>
              <span className="ml-1 text-slate-500 dark:text-white/60">最近数据</span>
            </Badge>
          </CardHeader>
          <CardBody>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} className="dark:stroke-white/5" />
                  <XAxis
                    dataKey="time"
                    tickFormatter={(tick) => format(new Date(tick), 'HH:mm:ss')}
                    stroke="rgba(148,163,184,0.2)"
                    tick={{ fill: 'rgba(148,163,184,0.8)', fontSize: 12 }}
                    tickMargin={10}
                    className="dark:stroke-white/20 dark:[&_text]:fill-white/40"
                  />
                  <YAxis
                    stroke="rgba(148,163,184,0.2)"
                    tick={{ fill: 'rgba(148,163,184,0.8)', fontSize: 12 }}
                    tickMargin={10}
                    className="dark:stroke-white/20 dark:[&_text]:fill-white/40"
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(226,232,240,1)', borderRadius: '12px', color: '#0f172a' }}
                    itemStyle={{ color: meta.color }}
                    labelFormatter={(label) => format(new Date(label), 'HH:mm:ss')}
                    formatter={(value: number) => [`${f(value)} ${meta.unit}`, meta.name]}
                    wrapperClassName="dark:!bg-slate-900/90 dark:!border-white/10 dark:!text-white"
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={meta.color}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: meta.color, stroke: 'rgba(255, 255, 255, 1)', strokeWidth: 2 }}
                    className="dark:[&_circle]:stroke-slate-900"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-slate-900 dark:text-white">统计摘要</CardTitle>
              <Badge variant="default">最近 50 条</Badge>
            </CardHeader>
            <CardBody>
              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 mt-4">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/60 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3 font-medium">指标</th>
                      <th className="px-4 py-3 font-medium">值</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-white/10 text-slate-700 dark:text-white/70">
                    <tr className="hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">最大</td>
                      <td className="px-4 py-3 font-mono">{f(stats.max)} {meta.unit}</td>
                    </tr>
                    <tr className="hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">最小</td>
                      <td className="px-4 py-3 font-mono">{f(stats.min)} {meta.unit}</td>
                    </tr>
                    <tr className="hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">平均</td>
                      <td className="px-4 py-3 font-mono">{f(stats.avg)} {meta.unit}</td>
                    </tr>
                    <tr className="hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">最新</td>
                      <td className="px-4 py-3 font-mono">{f(stats.last)} {meta.unit}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-slate-900 dark:text-white">原始数据</CardTitle>
              <Badge variant="default">JSON</Badge>
            </CardHeader>
            <CardBody>
              <div className="mt-4 p-4 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 overflow-auto max-h-[200px]">
                <pre className="text-xs text-slate-600 dark:text-white/60 font-mono whitespace-pre-wrap break-words">
                  {state.rawText || '{}'}
                </pre>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
