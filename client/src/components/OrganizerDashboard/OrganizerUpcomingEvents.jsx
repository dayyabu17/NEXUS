import React from 'react';
import { formatEventDate, getStatusConfig } from './dashboardUtils';

const OrganizerUpcomingEvents = ({ events }) => (
  <div className="flex-1">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-medium text-white">Upcoming Events</h2>
      {events.length > 0 && (
        <button
          type="button"
          className="flex items-center gap-2 text-xs font-medium text-white/80 transition-colors hover:text-white"
        >
          View All
          <span aria-hidden className="text-lg">›</span>
        </button>
      )}
    </div>

    <div className="mt-6 space-y-6">
      {events.length === 0 ? (
        <p className="text-sm text-white/50">You have no upcoming events yet.</p>
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
                <span className="h-3 w-3 rounded-full bg-white/30" />
                {!isLast && <span className="mt-1 h-full w-px bg-gradient-to-b from-white/30 to-transparent" />}
              </span>

              <div className="mb-2 flex items-center gap-2 text-sm text-white/60">
                <span>{timelineLabel}</span>
              </div>

              <article className="flex flex-col justify-between gap-4 rounded-xl border border-white/5 bg-[rgba(25,27,29,0.78)] p-6 shadow-lg shadow-black/20 sm:flex-row">
                <div className="flex-1 space-y-3">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white ${badgeClass}`}>
                    {label}
                  </span>
                  <h3 className="text-2xl font-medium text-white">{event.title}</h3>
                  <p className="text-sm text-white/70">
                    {timeLabel} • {fullDateLabel}
                  </p>
                  <p className="flex items-center gap-2 text-xs text-white/60">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs">🎟️</span>
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
