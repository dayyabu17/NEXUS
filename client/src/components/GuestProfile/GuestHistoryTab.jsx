import React from 'react';

const GuestHistoryTab = ({
  ticketMetrics,
  loadingMetrics,
  recentTickets,
  onViewTickets,
}) => (
  <div className="space-y-10">
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-[#0d1423]/65 dark:shadow-[0_24px_70px_rgba(5,10,25,0.45)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-white/55">Ticket metrics</p>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Your campus footprint</h3>
        </div>
        {loadingMetrics && <span className="text-xs text-slate-500 dark:text-white/45">Syncing…</span>}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[{
          label: 'Total tickets',
          value: ticketMetrics.total,
        }, {
          label: 'Upcoming events',
          value: ticketMetrics.upcoming,
        }, {
          label: 'Past events',
          value: ticketMetrics.past,
        }].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 dark:border-slate-800 dark:bg-[#101a2c]/80"
          >
            <p className="text-[11px] uppercase tracking-[0.32em] text-slate-500 dark:text-white/45">{label}</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{loadingMetrics ? '—' : value}</p>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onViewTickets}
        className="mt-6 inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-white/10 dark:text-white/75 dark:hover:border-slate-600"
      >
        View my tickets
      </button>
    </section>

    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-[#0d1423]/65 dark:shadow-[0_24px_70px_rgba(5,10,25,0.45)]">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-white/55">History</p>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Recent check-ins</h3>
        <p className="text-xs text-slate-500 dark:text-white/45">A snapshot of the latest events tied to your Nexus ID.</p>
      </div>
      {loadingMetrics ? (
        <div className="mt-6 space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`history-skeleton-${index}`}
              className="h-16 animate-pulse rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-[#121c2a]/70"
            />
          ))}
        </div>
      ) : recentTickets.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-600 dark:border-slate-800 dark:bg-[#10192d]/70 dark:text-white/50">
          No events yet. Grab a ticket to unlock your journey log.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {recentTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-[#10192d]/80"
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{ticket.title}</p>
                <p className="text-xs text-slate-600 dark:text-white/45">{ticket.location}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-white/45">
                  {ticket.date ? ticket.date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  }) : 'Date tba'}
                </p>
                <span className={`text-xs font-semibold ${ticket.isUpcoming ? 'text-emerald-500 dark:text-emerald-300' : 'text-slate-600 dark:text-white/55'}`}>
                  {ticket.isUpcoming ? 'Upcoming' : 'Completed'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  </div>
);

export default GuestHistoryTab;
