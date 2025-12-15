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

  return (
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
  );
};

export default OrganizerEarningsSummaryCards;
