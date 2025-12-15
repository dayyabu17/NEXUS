import React from 'react';
import { Link } from 'react-router-dom';
import { formatFullDate, formatTime, formatTimelineDate, getStatusBadge } from './eventsUtils';

const fallbackImage = 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=640&q=80';

const OrganizerEventsList = ({ groupedEvents }) => (
  <div className="mt-10 space-y-10">
    {groupedEvents.map(({ key, date, items }) => (
      <div key={key} className="space-y-6">
        {items.map((event, index) => {
          const isLast = index === items.length - 1;
          const { label, className } = getStatusBadge(event.status);
          const displayImage = event.imageUrl || fallbackImage;

          return (
            <div key={event.id} className="relative pl-10">
              <span className="absolute left-[11px] top-0 flex h-full flex-col items-center">
                <span className="h-3 w-3 rounded-full bg-white/40" />
                {!isLast && <span className="mt-1 h-full w-px bg-gradient-to-b from-white/30 to-transparent" />}
              </span>

              <div className="mb-2 flex items-center gap-2 text-sm text-white/60">
                <span>{formatTimelineDate(date)}</span>
              </div>

              <Link
                to={`/organizer/events/${event.id}`}
                className="flex flex-col justify-between gap-4 rounded-xl border border-white/5 bg-[rgba(25,27,29,0.78)] p-6 text-left shadow-lg shadow-black/20 transition hover:border-white/20 hover:bg-[rgba(32,34,37,0.78)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:flex-row"
              >
                <div className="flex-1 space-y-3">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white ${className}`}>
                    {label}
                  </span>
                  <h3 className="text-2xl font-medium text-white">{event.title}</h3>
                  <p className="text-sm text-white/70">
                    {formatTime(event.date)} • {formatFullDate(event.date)}
                  </p>
                  <p className="flex items-center gap-2 text-xs text-white/60">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs">🎟️</span>
                    {event.rsvpCount} RSVP&apos;d
                  </p>
                </div>
                <div className="h-36 w-full overflow-hidden rounded-lg sm:w-56">
                  <img
                    src={displayImage}
                    alt={event.title}
                    className="h-full w-full rounded-lg object-cover"
                  />
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    ))}
  </div>
);

export default OrganizerEventsList;
