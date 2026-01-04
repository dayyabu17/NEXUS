import React from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Ticket,
  TrendingUp,
  Wallet,
} from 'lucide-react';

const MotionDiv = motion.div;

const OrganizerEarningsSummaryCards = ({ metrics, loading, currencyFormatter }) => {
  const fallbackMetrics = {
    totalRevenue: 0,
    netIncome: 0,
    pendingPayout: 0,
    totalTickets: 0,
  };

  const resolvedMetrics = {
    ...fallbackMetrics,
    ...(metrics || {}),
  };

  const cards = [
    {
      title: 'Total Revenue',
      value: resolvedMetrics.totalRevenue,
      icon: TrendingUp,
      accent: 'text-emerald-600 dark:text-emerald-300',
      subtext: 'Confirmed ticket revenue',
    },
    {
      title: 'Net Income',
      value: resolvedMetrics.netIncome,
      icon: Wallet,
      accent: 'text-sky-600 dark:text-sky-300',
      subtext: 'After Nexus fees',
    },
    {
      title: 'Pending Payout',
      value: resolvedMetrics.pendingPayout,
      icon: CreditCard,
      accent: 'text-amber-600 dark:text-amber-300',
      subtext: 'Awaiting settlement window',
    },
    {
      title: 'Total Tickets',
      value: resolvedMetrics.totalTickets,
      icon: Ticket,
      accent: 'text-fuchsia-600 dark:text-fuchsia-300',
      subtext: 'Confirmed tickets',
      formatter: (val) => `${val}`,
    },
  ];

  const formatValue = (card, val) => {
    if (typeof card.formatter === 'function') {
      return card.formatter(val);
    }

    if (!currencyFormatter || typeof currencyFormatter.format !== 'function') {
      return val;
    }

    return currencyFormatter.format(val);
  };

  return (
    <div className="mt-8 grid grid-cols-2 gap-4 md:mt-10 md:gap-5 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <MotionDiv
            key={card.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-700/70 dark:bg-slate-950/65 dark:shadow-[0_20px_60px_rgba(4,8,20,0.45)]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-white/45">{card.title}</p>
                <p className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">
                  {loading ? '—' : formatValue(card, card.value)}
                </p>
                <p className="mt-2 text-xs text-slate-500 dark:text-white/40">{card.subtext}</p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 opacity-0 transition dark:border-slate-600/60 dark:bg-slate-700/50 md:opacity-100 ${card.accent}`}
                aria-hidden
              >
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </MotionDiv>
        );
      })}
    </div>
  );
};

export default OrganizerEarningsSummaryCards;
