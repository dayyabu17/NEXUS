import React from 'react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;

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

const OrganizerTransactionsTable = ({ transactions, loading, currencyFormatter }) => (
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
);

export default OrganizerTransactionsTable;
