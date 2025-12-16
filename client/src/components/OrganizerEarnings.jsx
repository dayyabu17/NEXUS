import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard } from 'lucide-react';
import OrganizerLayoutDark from './OrganizerLayoutDark';
import OrganizerEarningsSummaryCards from './OrganizerEarningsSummaryCards';
import OrganizerRevenueTrendChart from './OrganizerRevenueTrendChart';
import OrganizerPayoutSummary from './OrganizerPayoutSummary';
import OrganizerTransactionsTable from './OrganizerTransactionsTable';
import useOrganizerEarnings from '../hooks/useOrganizerEarnings';

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

        <OrganizerEarningsSummaryCards
          metrics={metrics}
          loading={loading}
          currencyFormatter={currencyFormatter}
        />

        <div className="mt-10 grid gap-6 xl:grid-cols-[2fr_1fr]">
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
