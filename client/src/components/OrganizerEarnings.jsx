import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import {
  CreditCard,
  Ticket,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import api from '../api/axios';
import OrganizerLayoutDark from './OrganizerLayoutDark';

const MotionSection = motion.section;
const MotionDiv = motion.div;

const currencyFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

const defaultSummaryTip = 'Tip: Connect your dedicated payout account in settings to shorten settlement times.';

const StatusBadge = ({ status }) => {
  const isSettled = status === 'Settled';
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
        isSettled
          ? 'border border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
          : 'border border-amber-400/40 bg-amber-500/15 text-amber-200'
      }`}
    >
      {status}
    </span>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
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

const OrganizerEarnings = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    netIncome: 0,
    pendingPayout: 0,
    totalTickets: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [payoutSummary, setPayoutSummary] = useState({
    nextPayoutDate: null,
    averageSettlementDelayDays: null,
    feeRate: 0.08,
    tip: defaultSummaryTip,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const gradientId = useMemo(
    () => `earningsGradient-${Math.random().toString(36).slice(2, 8)}`,
    [],
  );

  useEffect(() => {
    const fetchEarnings = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/sign-in');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const { data } = await api.get('/organizer/earnings', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const metricsPayload = data?.metrics || {};
        const trendPayload = Array.isArray(data?.revenueTrend) ? data.revenueTrend : [];
        const transactionsPayload = Array.isArray(data?.transactions) ? data.transactions : [];
        const summaryPayload = data?.payoutSummary || {};

        setMetrics({
          totalRevenue: Number(metricsPayload.totalRevenue) || 0,
          netIncome: Number(metricsPayload.netIncome) || 0,
          pendingPayout: Number(metricsPayload.pendingPayout) || 0,
          totalTickets: Number(metricsPayload.totalTickets) || 0,
        });

        setChartData(
          trendPayload.map((point) => {
            const baseLabel = point.label;
            let label = typeof baseLabel === 'string' ? baseLabel : '';

            if (!label && point.date) {
              const parsed = new Date(point.date);
              if (!Number.isNaN(parsed.getTime())) {
                label = parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }
            }

            if (!label) {
              label = '';
            }

            return {
              label,
              revenue: Number(point.revenue) || 0,
            };
          }),
        );

        setTransactions(
          transactionsPayload.map((transaction) => ({
            id: transaction.id,
            event: transaction.event,
            buyer: transaction.buyer,
            amount: Number(transaction.amount) || 0,
            date: transaction.date,
            status: transaction.status || 'Processing',
          })),
        );

        setPayoutSummary((previous) => ({
          ...previous,
          ...summaryPayload,
          feeRate:
            summaryPayload.feeRate !== undefined && summaryPayload.feeRate !== null
              ? summaryPayload.feeRate
              : previous.feeRate,
          tip: summaryPayload.tip || previous.tip || defaultSummaryTip,
        }));
      } catch (err) {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/sign-in');
          return;
        }
        setError(err.response?.data?.message || 'Unable to load earnings data.');
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, [navigate]);

  const cards = [
    {
      title: 'Total Revenue',
      value: metrics.totalRevenue,
      icon: TrendingUp,
      accent: 'text-emerald-300',
      subtext: 'Confirmed ticket revenue',
    },
    {
      title: 'Net Income',
      value: metrics.netIncome,
      icon: Wallet,
      accent: 'text-sky-300',
      subtext: 'After Nexus fees',
    },
    {
      title: 'Pending Payout',
      value: metrics.pendingPayout,
      icon: CreditCard,
      accent: 'text-amber-300',
      subtext: 'Awaiting settlement window',
    },
    {
      title: 'Total Tickets',
      value: metrics.totalTickets,
      icon: Ticket,
      accent: 'text-fuchsia-300',
      subtext: 'Confirmed tickets',
      formatter: (val) => `${val}`,
    },
  ];

  const formatValue = (card, val) => {
    if (typeof card.formatter === 'function') {
      return card.formatter(val);
    }
    return currencyFormatter.format(val);
  };

  const formattedNextPayout = payoutSummary.nextPayoutDate
    ? (() => {
      const parsed = new Date(payoutSummary.nextPayoutDate);
      if (Number.isNaN(parsed.getTime())) {
        return 'TBD';
      }
      return parsed.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    })()
    : 'TBD';

  const formattedAverageDelay = payoutSummary.averageSettlementDelayDays !== null
    && payoutSummary.averageSettlementDelayDays !== undefined
    ? `${payoutSummary.averageSettlementDelayDays} day${payoutSummary.averageSettlementDelayDays === 1 ? '' : 's'}`
    : '—';

  const feeRatePercent = payoutSummary.feeRate !== null && payoutSummary.feeRate !== undefined
    ? `${Math.round(Number(payoutSummary.feeRate) * 100)}%`
    : '—';

  return (
    <OrganizerLayoutDark>
      <MotionSection
        className="pb-20"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-white">Earnings &amp; Payouts</h1>
            <p className="mt-2 max-w-xl text-sm text-white/60">
              Monitor revenue performance, track settlement timelines, and keep a pulse on your business health.
            </p>
          </div>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2 text-sm font-semibold text-white/60 transition hover:border-white/25 disabled:cursor-not-allowed disabled:opacity-60"
            aria-disabled
            title="Withdrawals can be initiated once payouts are enabled"
          >
            <CreditCard className="h-4 w-4" />
            Withdraw (coming soon)
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <MotionDiv
                key={card.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="rounded-3xl border border-slate-700/70 bg-slate-950/65 p-6 shadow-[0_20px_60px_rgba(4,8,20,0.45)]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/45">{card.title}</p>
                    <p className="mt-4 text-2xl font-semibold text-white">
                      {loading ? '—' : formatValue(card, card.value)}
                    </p>
                    <p className="mt-2 text-xs text-white/40">{card.subtext}</p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 ${card.accent}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </MotionDiv>
            );
          })}
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[2fr_1fr]">
          <MotionDiv
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55, ease: [0.25, 0.8, 0.5, 1] }}
            className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-[0_28px_80px_rgba(5,10,30,0.5)]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/45">Revenue Trend</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Last 30 days</h2>
              </div>
              <span className="text-xs text-emerald-300">Rolling 30-day window</span>
            </div>
            <div className="mt-8 h-[320px] w-full">
              {chartData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-white/45">
                  {loading ? 'Loading trend…' : 'No revenue recorded yet.'}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
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
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(99,102,241,0.4)', strokeWidth: 1 }} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8b5cf6"
                      strokeWidth={2.8}
                      fill={`url(#${gradientId})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55, ease: [0.25, 0.8, 0.5, 1] }}
            className="flex h-full flex-col rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-[0_28px_80px_rgba(5,10,30,0.5)]"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/45">Payout summary</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Settlement timeline</h2>
            </div>
            <div className="mt-6 space-y-5 text-sm text-white/60">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                Next scheduled payout <span className="text-white">{formattedNextPayout}</span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                Average settlement delay <span className="text-white">{formattedAverageDelay}</span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                Nexus fee rate <span className="text-white">{feeRatePercent}</span>
              </div>
              <p className="text-xs text-white/40">{payoutSummary.tip || defaultSummaryTip}</p>
            </div>
          </MotionDiv>
        </div>

        <MotionDiv
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: [0.25, 0.8, 0.5, 1] }}
          className="mt-12 rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-[0_30px_90px_rgba(5,10,35,0.55)]"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/45">Recent transactions</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Latest ticket settlements</h2>
            </div>
            <button
              type="button"
              className="text-xs font-semibold uppercase tracking-[0.28em] text-white/0 transition hover:text-white/80"
            >
              Export CSV
            </button>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full table-auto text-sm text-white/70">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.35em] text-white/40">
                  <th className="py-3 pr-6">Event</th>
                  <th className="py-3 pr-6">Buyer</th>
                  <th className="py-3 pr-6">Amount</th>
                  <th className="py-3 pr-6">Date</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-sm text-white/40">
                      Loading transactions…
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-sm text-white/40">
                      No transactions yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => {
                    const parsedDate = transaction.date ? new Date(transaction.date) : null;
                    const displayDate = parsedDate && !Number.isNaN(parsedDate.getTime())
                      ? parsedDate.toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })
                      : '—';

                    return (
                      <tr
                        key={transaction.id}
                        className="border-t border-white/5 hover:bg-white/5"
                      >
                        <td className="py-4 pr-6 text-white">{transaction.event || '—'}</td>
                        <td className="py-4 pr-6">{transaction.buyer || '—'}</td>
                        <td className="py-4 pr-6 text-white">{currencyFormatter.format(transaction.amount)}</td>
                        <td className="py-4 pr-6">{displayDate}</td>
                        <td className="py-4"><StatusBadge status={transaction.status} /></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </MotionDiv>
      </MotionSection>
    </OrganizerLayoutDark>
  );
};

export default OrganizerEarnings;
