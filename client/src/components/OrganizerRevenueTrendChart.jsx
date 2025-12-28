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

const MotionDiv = motion.div;

const CustomTooltip = ({ active, payload, label, currencyFormatter }) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111a2c]/95 px-4 py-3 text-xs text-white/80 shadow-[0_18px_40px_rgba(5,10,25,0.55)]">
      <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">
        {currencyFormatter.format(payload[0].value)}
      </p>
    </div>
  );
};

const OrganizerRevenueTrendChart = ({ chartData = [], loading, gradientId, currencyFormatter }) => {
  const hasData = Array.isArray(chartData) && chartData.length > 0;

  const renderTooltip = (props) => (
    <CustomTooltip {...props} currencyFormatter={currencyFormatter} />
  );

  return (
  <MotionDiv
    initial={{ opacity: 0, y: 18 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.4 }}
    transition={{ duration: 0.55, ease: [0.25, 0.8, 0.5, 1] }}
    className="w-full min-w-0 rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-[0_28px_80px_rgba(5,10,30,0.5)] sm:p-6"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/45">Revenue Trend</p>
        <h2 className="mt-2 text-xl font-semibold text-white">Last 30 days</h2>
      </div>
      <span className="text-xs text-emerald-300">Rolling 30-day window</span>
    </div>
    <div className="mt-6 w-full min-w-0 sm:mt-8">
      {!hasData ? (
        <div className="flex h-64 min-h-[250px] w-full items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-white/45">
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
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="rgba(255,255,255,0.35)"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.35)"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => `${Math.round(value / 1000)}k`}
            />
            <Tooltip content={renderTooltip} cursor={{ stroke: 'rgba(99,102,241,0.4)', strokeWidth: 1 }} />
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
