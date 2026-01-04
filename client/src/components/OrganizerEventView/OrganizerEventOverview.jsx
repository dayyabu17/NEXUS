import React from 'react';
import { formatCurrency, formatDateTime } from './eventViewUtils';

const OrganizerEventOverview = ({ event }) => {
  if (!event) {
    return null;
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-700 shadow-sm transition dark:border-slate-800 dark:bg-[rgba(21,26,36,0.72)] dark:text-white dark:shadow-lg dark:shadow-black/30">
          <span className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-white/50">Event summary</span>
          <h2 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{event.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{event.description}</p>
          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <div className="space-y-1 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition dark:border-transparent dark:bg-slate-700/50">
              <dt className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-white/50">When</dt>
              <dd className="text-base text-slate-900 dark:text-white">{formatDateTime(event.date)}</dd>
            </div>
            <div className="space-y-1 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition dark:border-transparent dark:bg-slate-700/50">
              <dt className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-white/50">Where</dt>
              <dd className="text-base text-slate-900 dark:text-white">{event.location}</dd>
            </div>
            <div className="space-y-1 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition dark:border-transparent dark:bg-slate-700/50">
              <dt className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-white/50">Category</dt>
              <dd className="text-base text-slate-900 dark:text-white">{event.category || 'Not set'}</dd>
            </div>
            <div className="space-y-1 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition dark:border-transparent dark:bg-slate-700/50">
              <dt className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-white/50">Capacity</dt>
              <dd className="text-base text-slate-900 dark:text-white">{event.capacity || 'Unlimited'}</dd>
            </div>
          </dl>
          {event.tags && event.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 transition dark:border-white/10 dark:bg-white/5 dark:text-white/70"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-700 shadow-sm transition dark:border-slate-800 dark:bg-[rgba(21,26,36,0.72)] dark:text-white dark:shadow-lg dark:shadow-black/30">
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-white/50">Status</span>
            <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition dark:border-white/10 dark:bg-white/10 dark:text-white">
              <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" aria-hidden />
              {event.status || 'Pending'}
            </p>
          </div>

          <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 text-slate-700 shadow-sm transition dark:border-slate-800 dark:bg-[rgba(21,26,36,0.72)] dark:text-white dark:shadow-lg dark:shadow-black/30">
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-white/50">Ticketing</span>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {Number(event.registrationFee) > 0
                ? `${formatCurrency(event.registrationFee)} per ticket`
                : 'Free event'}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">RSVPs recorded: {event.rsvpCount || 0}</p>
          </div>

          {event.imageUrl && (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="mx-auto h-[500px] w-[500px] max-w-full rounded-3xl border border-slate-200 object-cover transition dark:border-white/10"
            />
          )}
        </aside>
      </section>
    </div>
  );
};

export default OrganizerEventOverview;
