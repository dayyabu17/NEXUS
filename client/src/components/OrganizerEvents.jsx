import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import OrganizerLayoutDark from './OrganizerLayoutDark';
import api from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';

const MotionSection = motion.section;

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

const FilterIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <path
      d="M4 6h16M7 12h10M10 18h4"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const formatTimelineDate = (date) =>
  date.toLocaleDateString(undefined, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });

const formatFullDate = (date) =>
  date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const formatTime = (date) =>
  date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

const getStatusBadge = (status) => {
  const normalized = (status || '').toLowerCase();

  switch (normalized) {
    case 'approved':
      return { label: 'Approved', className: 'bg-[#7ba743]' };
    case 'rejected':
      return { label: 'Rejected', className: 'bg-[#802020]' };
    default:
      return { label: 'Pending', className: 'bg-[#5a3f00]' };
  }
};

/**
 * OrganizerEvents component.
 * Displays a list of all events managed by the organizer.
 * Features include:
 * - Filtering events by status (Pending, Approved, Rejected).
 * - Grouping events by date.
 * - Displaying event details in a card format.
 *
 * @component
 * @returns {JSX.Element} The rendered OrganizerEvents component.
 */
const OrganizerEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterMenuRef = useRef(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/sign-in');
        return;
      }

      try {
        const response = await api.get('/organizer/events', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEvents(response.data);
      } catch (err) {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/sign-in');
          return;
        }
        setError(err.response?.data?.message || 'Unable to load events.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    };

    if (showFilterMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterMenu]);

  const filteredEvents = useMemo(() => {
    if (statusFilter === 'all') {
      return events;
    }
    return events.filter(
      (event) => (event.status || '').toLowerCase() === statusFilter,
    );
  }, [events, statusFilter]);

  const groupedEvents = useMemo(() => {
    const groups = new Map();

    filteredEvents.forEach((event) => {
      const date = new Date(event.date);
      const key = date.toISOString().split('T')[0];
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push({ ...event, date });
    });

    return Array.from(groups.entries())
      .map(([key, items]) => {
        const sortedItems = items.sort((a, b) => a.date - b.date);
        return {
          key,
          date: sortedItems[0]?.date || new Date(key),
          items: sortedItems,
        };
      })
      .sort((a, b) => a.date - b.date);
  }, [filteredEvents]);

  const activeFilterLabel = statusOptions.find((option) => option.value === statusFilter)?.label;

  return (
    <OrganizerLayoutDark>
      <MotionSection
        className="pb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        <div className="flex flex-col items-start justify-between gap-6 pt-6 sm:flex-row sm:items-center">
          <h1 className="text-4xl font-semibold tracking-tight text-white">Events</h1>

          <div className="relative z-30" ref={filterMenuRef}>
            <button
              type="button"
              onClick={() => setShowFilterMenu((prev) => !prev)}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
            >
              <FilterIcon className="h-5 w-5" />
              <span>{activeFilterLabel}</span>
            </button>

            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-40 overflow-hidden rounded-lg border border-white/10 bg-[#0A0F16] text-sm shadow-lg shadow-black/40 z-40">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setStatusFilter(option.value);
                      setShowFilterMenu(false);
                    }}
                    className={`flex w-full items-center justify-between px-4 py-2 text-left transition-colors hover:bg-white/10 ${
                      statusFilter === option.value ? 'text-white' : 'text-white/70'
                    }`}
                  >
                    {option.label}
                    {statusFilter === option.value && <span aria-hidden>•</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-400 bg-red-50/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-12 text-center text-white/60">Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="mt-12 rounded-xl border border-white/10 bg-black/40 px-6 py-12 text-center text-white/70">
            No events match the selected filter.
          </div>
        ) : (
          <div className="mt-10 space-y-10">
            {groupedEvents.map(({ key, date, items }) => (
              <div key={key} className="space-y-6">
                {items.map((event, index) => {
                  const isLast = index === items.length - 1;
                  const { label, className } = getStatusBadge(event.status);
                  const fallbackImage = 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=640&q=80';
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
        )}
      </MotionSection>
    </OrganizerLayoutDark>
  );
};

export default OrganizerEvents;
