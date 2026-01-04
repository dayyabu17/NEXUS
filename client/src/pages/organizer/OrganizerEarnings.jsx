import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard } from 'lucide-react';
import OrganizerLayoutDark from '../../layouts/OrganizerLayoutDark';
import OrganizerEarningsSummaryCards from '../../components/OrganizerEarningsSummaryCards';
import OrganizerRevenueTrendChart from '../../components/OrganizerRevenueTrendChart';
import OrganizerPayoutSummary from '../../components/OrganizerPayoutSummary';
import OrganizerTransactionsTable from '../../components/OrganizerTransactionsTable';
import useOrganizerEarnings from '../../hooks/organizer/useOrganizerEarnings';

const MotionSection = motion.section;

const OrganizerEarnings = () => {
  const {
    metrics,
    chartData,
    transactions,
    payoutSummary,
    loading,
    error,
    gradientId,
    formattedNextPayout,
    formattedAverageDelay,
    feeRatePercent,
    currencyFormatter,
    defaultSummaryTip,
  } = useOrganizerEarnings();

  return (
    <OrganizerLayoutDark>
      <MotionSection
        className="pb-16 sm:pb-20"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 sm:pt-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Earnings &amp; Payouts</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-white/60 sm:max-w-xl">
              Monitor revenue performance, track settlement timelines, and keep a pulse on your business health.
            </p>
          </div>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 transition hover:border-slate-300 hover:text-slate-800 dark:border-white/15 dark:bg-white/10 dark:text-white/60 dark:hover:border-white/25 disabled:cursor-not-allowed disabled:opacity-60"
            aria-disabled
            title="Withdrawals can be initiated once payouts are enabled"
          >
            <CreditCard className="h-4 w-4" />
            Withdraw (coming soon)
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-400/40 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        )}

        <OrganizerEarningsSummaryCards
          metrics={metrics}
          loading={loading}
          currencyFormatter={currencyFormatter}
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          <OrganizerRevenueTrendChart
            chartData={chartData}
            loading={loading}
            gradientId={gradientId}
            currencyFormatter={currencyFormatter}
          />

          <OrganizerPayoutSummary
            formattedNextPayout={formattedNextPayout}
            formattedAverageDelay={formattedAverageDelay}
            feeRatePercent={feeRatePercent}
            tip={payoutSummary.tip}
            defaultSummaryTip={defaultSummaryTip}
          />
        </div>

        <OrganizerTransactionsTable
          transactions={transactions}
          loading={loading}
          currencyFormatter={currencyFormatter}
        />
      </MotionSection>
    </OrganizerLayoutDark>
  );
};

export default OrganizerEarnings;
