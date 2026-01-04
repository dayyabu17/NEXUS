import React from 'react';
import { formatEventDate, getStatusConfig } from './dashboardUtils';

const OrganizerUpcomingEvents = ({ events }) => (
  <div className="flex-1">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Upcoming Events</h2>
      {events.length > 0 && (
        <button
          type="button"
          className="flex items-center gap-2 text-xs font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          View All
          <span aria-hidden className="text-lg">›</span>
        </button>
      )}
    </div>

    <div className="mt-6 space-y-6">
      {events.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">You have no upcoming events yet.</p>
      ) : (
        events.map((event, index) => {
          const { timelineLabel, timeLabel, fullDateLabel } = formatEventDate(event.date);
          const { label, badgeClass } = getStatusConfig(event.status);
          const isLast = index === events.length - 1;
          const imageSrc = event.imageUrl || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=640&q=80';

          return (
            <div
              key={event.id}
              className="relative pl-10"
            >
              <span className="absolute left-[11px] top-0 flex h-full flex-col items-center">
                <span className="h-3 w-3 rounded-full bg-slate-300 dark:bg-white/30" />
                {!isLast && (
                  <span className="mt-1 h-full w-px bg-slate-200 dark:bg-white/20" />
                )}
              </span>

              <div className="mb-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span>{timelineLabel}</span>
              </div>

              <article className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:shadow-black/20 sm:flex-row">
                <div className="flex-1 space-y-3">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white ${badgeClass}`}>
                    {label}
                  </span>
                  <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">{event.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {timeLabel} • {fullDateLabel}
                  </p>
                  <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-white">🎟️</span>
                    {event.rsvpCount} RSVP&apos;d
                  </p>
                </div>
                <div className="h-36 w-full overflow-hidden rounded-lg sm:w-56">
                  <img
                    src={imageSrc}
                    alt={event.title}
                    className="h-full w-full rounded-lg object-cover"
                  />
                </div>
              </article>
            </div>
          );
        })
      )}
    </div>
  </div>
);

export default OrganizerUpcomingEvents;
