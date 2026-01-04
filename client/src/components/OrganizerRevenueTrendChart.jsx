import React from 'react';
import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTheme } from '../context/ThemeContext';

const MotionDiv = motion.div;

const CustomTooltip = ({ active, payload, label, currencyFormatter, isDark }) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div
      className={`rounded-2xl px-4 py-3 text-xs ${
        isDark
          ? 'border border-white/10 bg-[#111a2c]/95 text-white/80 shadow-[0_18px_40px_rgba(5,10,25,0.55)]'
          : 'border border-slate-200 bg-white text-slate-700 shadow-[0_18px_40px_rgba(15,23,42,0.12)]'
      }`}
    >
      <p className={`text-[11px] uppercase tracking-[0.28em] ${isDark ? 'text-white/45' : 'text-slate-400'}`}>
        {label}
      </p>
      <p className={`mt-2 text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
        {currencyFormatter?.format ? currencyFormatter.format(payload[0].value) : payload[0].value}
      </p>
    </div>
  );
};

const OrganizerRevenueTrendChart = ({ chartData = [], loading, gradientId, currencyFormatter }) => {
  const hasData = Array.isArray(chartData) && chartData.length > 0;
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const renderTooltip = (props) => (
    <CustomTooltip {...props} currencyFormatter={currencyFormatter} isDark={isDark} />
  );

  const gridStroke = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)';
  const axisStroke = isDark ? 'rgba(148,163,184,0.45)' : 'rgba(100,116,139,0.55)';
  const tickFill = isDark ? 'rgba(226,232,240,0.78)' : 'rgba(71,85,105,0.85)';
  const cursorStroke = isDark ? 'rgba(99,102,241,0.4)' : 'rgba(99,102,241,0.3)';

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.55, ease: [0.25, 0.8, 0.5, 1] }}
      className="w-full min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-[0_28px_80px_rgba(5,10,30,0.5)] sm:p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-white/45">Revenue Trend</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Last 30 days</h2>
        </div>
        <span className="text-xs text-emerald-600 dark:text-emerald-300">Rolling 30-day window</span>
      </div>
      <div className="mt-6 w-full min-w-0 sm:mt-8">
        {!hasData ? (
          <div className="flex h-64 min-h-[250px] w-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500 dark:border-white/10 dark:bg-transparent dark:text-white/45">
            {loading ? 'Loading trend…' : 'No revenue recorded yet.'}
          </div>
        ) : (
          <div className="h-64 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height={256}>
              <AreaChart data={chartData} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.65} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={gridStroke} vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke={axisStroke}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={12}
                  tick={{ fontSize: 11, fill: tickFill }}
                />
                <YAxis
                  stroke={axisStroke}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: tickFill }}
                  tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                />
                <Tooltip content={renderTooltip} cursor={{ stroke: cursorStroke, strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  strokeWidth={2.8}
                  fill={`url(#${gradientId})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </MotionDiv>
  );
};

export default OrganizerRevenueTrendChart;
