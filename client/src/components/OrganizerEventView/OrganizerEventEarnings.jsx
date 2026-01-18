import React from 'react';
import { formatCurrency } from './eventViewUtils';

const OrganizerEventEarnings = ({ event, checkIns }) => {
  if (!event) {
    return null;
  }

  const ticketPrice = Number(event.registrationFee) || 0;
  const ticketsSold = Number(event.rsvpCount) || 0;
  const revenue = ticketPrice * ticketsSold;
  const checkedInCount = checkIns.length;
  const attendance = ticketsSold === 0 ? '0%' : `${Math.round((checkedInCount / ticketsSold) * 100)}%`;

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-700 shadow-sm transition dark:border-slate-800 dark:bg-[rgba(21,26,36,0.72)] dark:text-white dark:shadow-lg dark:shadow-black/30">
        <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-white/60">
          Revenue snapshot
        </h3>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition dark:border-white/10 dark:bg-white/5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-600 dark:text-white/50">Ticket price</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{formatCurrency(ticketPrice)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition dark:border-white/10 dark:bg-white/5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-600 dark:text-white/50">Tickets sold</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{ticketsSold}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition dark:border-white/10 dark:bg-white/5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-600 dark:text-white/50">Checked in</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{checkedInCount}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-white/60">{attendance} attendance</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition dark:border-white/10 dark:bg-white/5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-600 dark:text-white/50">Gross revenue</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{formatCurrency(revenue)}</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-700 shadow-sm transition dark:border-slate-800 dark:bg-[rgba(21,26,36,0.72)] dark:text-white dark:shadow-lg dark:shadow-black/30">
        <h4 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-white/60">Notes</h4>
        <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-white/60">
          Track check-ins during the event to keep this dashboard in sync. Tie-ins with payment processing can be added later.
        </p>
      </div>
    </section>
  );
};

export default OrganizerEventEarnings;
