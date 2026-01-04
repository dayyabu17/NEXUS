import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;
const MOBILE_QUERY = '(max-width: 767px)';

const STATUS_VARIANTS = {
  settled: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-500/15 dark:text-emerald-200',
  paid: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-500/15 dark:text-emerald-200',
  pending: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/40 dark:bg-amber-500/15 dark:text-amber-200',
  processing: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-400/40 dark:bg-sky-500/15 dark:text-sky-200',
  refunded: 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-400/40 dark:bg-indigo-500/15 dark:text-indigo-200',
  failed: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/40 dark:bg-rose-500/15 dark:text-rose-200',
};

const StatusBadge = ({ status }) => {
  const normalized = (status || '').toLowerCase();
  const variantClassName = STATUS_VARIANTS[normalized] || STATUS_VARIANTS.pending;
  const displayStatus = status || 'Pending';

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] transition ${variantClassName}`}
    >
      {displayStatus}
    </span>
  );
};

const OrganizerTransactionsTable = ({ transactions, loading, currencyFormatter }) => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia(MOBILE_QUERY).matches;
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const handleChange = (event) => {
      setIsMobile((previous) => {
        if (previous === event.matches) {
          return previous;
        }
        setCurrentPage((page) => (page === 1 ? page : 1));
        return event.matches;
      });
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  const perPage = isMobile ? 3 : 6;
  const totalPages = Math.max(1, Math.ceil(transactions.length / perPage));
  const displayPage = Math.min(currentPage, totalPages);

  const paginatedTransactions = useMemo(() => {
    if (!transactions.length) {
      return [];
    }
    const startIndex = (displayPage - 1) * perPage;
    return transactions.slice(startIndex, startIndex + perPage);
  }, [transactions, displayPage, perPage]);

  const shouldShowPagination = !loading && totalPages > 1 && transactions.length > 0;

  const renderPagination = (variant) => {
    if (!shouldShowPagination) {
      return null;
    }

    const containerClasses =
      variant === 'mobile'
        ? 'mt-4 flex justify-center gap-2 md:hidden'
        : 'mt-6 hidden justify-end gap-2 md:flex';

    const baseButtonClasses =
      'min-w-[56px] rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500';

    return (
      <div className={containerClasses} aria-label="Transaction pagination">
        {Array.from({ length: totalPages }, (_, index) => {
          const pageNumber = index + 1;
          const isActive = pageNumber === displayPage;
          const label = pageNumber === 1 ? `Page ${pageNumber}` : `${pageNumber}`;

          return (
            <button
              type="button"
              key={`transactions-page-${pageNumber}`}
              onClick={() => setCurrentPage(pageNumber)}
              className={`${baseButtonClasses} ${
                isActive
                  ? 'border-slate-900 bg-slate-900 text-white dark:border-white/60 dark:bg-white/15 dark:text-white'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800 dark:border-white/15 dark:bg-transparent dark:text-white/60 dark:hover:border-white/30 dark:hover:text-white'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {label}
            </button>
          );
        })}
      </div>
    );
  };

  const renderRows = () => {
    if (loading) {
      return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white/45">
          Loading transactions…
        </div>
      );
    }

    if (!transactions.length) {
      return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white/45">
          No transactions yet.
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        {paginatedTransactions.map((transaction) => {
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
            <div
              key={`mobile-transaction-${transaction.id}`}
              className="rounded-3xl border border-slate-200 bg-white px-4 py-5 text-sm text-slate-600 shadow-sm dark:border-white/10 dark:bg-slate-950/50 dark:text-white/70"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400 dark:text-white/45">Event</p>
                  <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">{transaction.event || '—'}</p>
                </div>
                <StatusBadge status={transaction.status} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-slate-500 dark:text-white/60">
                <div>
                  <p className="uppercase tracking-[0.2em] text-slate-400 dark:text-white/40">Buyer</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-white/70">{transaction.buyer || '—'}</p>
                </div>
                <div>
                  <p className="uppercase tracking-[0.2em] text-slate-400 dark:text-white/40">Amount</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                    {currencyFormatter.format(transaction.amount)}
                  </p>
                </div>
                <div>
                  <p className="uppercase tracking-[0.2em] text-slate-400 dark:text-white/40">Date</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-white/70">{displayDate}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTable = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={5} className="py-10 text-center text-sm text-slate-500 dark:text-white/45">
            Loading transactions…
          </td>
        </tr>
      );
    }

    if (!transactions.length) {
      return (
        <tr>
          <td colSpan={5} className="py-10 text-center text-sm text-slate-500 dark:text-white/45">
            No transactions yet.
          </td>
        </tr>
      );
    }

    return paginatedTransactions.map((transaction) => {
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
          className="border-t border-slate-100 text-slate-600 transition hover:bg-slate-50 dark:border-white/5 dark:text-white/70 dark:hover:bg-white/5"
        >
          <td className="py-4 pr-6 font-medium text-slate-900 dark:text-white">{transaction.event || '—'}</td>
          <td className="py-4 pr-6">{transaction.buyer || '—'}</td>
          <td className="py-4 pr-6 font-semibold text-slate-900 dark:text-white">{currencyFormatter.format(transaction.amount)}</td>
          <td className="py-4 pr-6">{displayDate}</td>
          <td className="py-4"><StatusBadge status={transaction.status} /></td>
        </tr>
      );
    });
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, ease: [0.25, 0.8, 0.5, 1] }}
      className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-[0_30px_90px_rgba(5,10,35,0.55)] sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-white/45">Recent transactions</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Latest ticket settlements</h2>
        </div>
        <button
          type="button"
          className="hidden text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 transition hover:text-slate-800 dark:text-white/50 dark:hover:text-white/80 md:inline-flex"
        >
          Export CSV
        </button>
      </div>

      <div className="mt-6 md:hidden">
        {renderRows()}
        {renderPagination('mobile')}
      </div>

      <div className="mt-6 hidden overflow-x-auto md:block">
        <table className="min-w-full table-auto text-sm text-slate-600 dark:text-white/70">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-white/45">
              <th className="py-3 pr-6">Event</th>
              <th className="py-3 pr-6">Buyer</th>
              <th className="py-3 pr-6">Amount</th>
              <th className="py-3 pr-6">Date</th>
              <th className="py-3">Status</th>
            </tr>
          </thead>
          <tbody>{renderTable()}</tbody>
        </table>
      </div>

      {renderPagination('desktop')}
    </MotionDiv>
  );
};

export default OrganizerTransactionsTable;
