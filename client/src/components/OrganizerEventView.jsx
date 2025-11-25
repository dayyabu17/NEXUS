import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import OrganizerLayoutDark from './OrganizerLayoutDark';
import api from '../api/axios';

const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Date to be confirmed';
  }

  const dateLabel = date.toLocaleDateString(undefined, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const timeLabel = date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  return `${dateLabel} · ${timeLabel}`;
};

const formatCurrency = (value) => {
  const amount = Number(value) || 0;
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const createGuestRecord = (name, email) => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  name,
  email,
  status: 'Registered',
  addedAt: new Date().toISOString(),
});

const OrganizerEventView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [guestForm, setGuestForm] = useState({ name: '', email: '' });
  const [guestList, setGuestList] = useState([]);
  const [checkIns, setCheckIns] = useState([]);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/sign-in');
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/organizer/events/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvent(response.data);
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/sign-in');
        } else {
          setError(err?.response?.data?.message || 'Unable to load event right now.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, navigate]);

  const tabs = useMemo(() => {
    const base = [
      { id: 'overview', label: 'Overview' },
      { id: 'guests', label: 'Guests' },
      { id: 'check-ins', label: 'Check-ins' },
    ];

    if (event && Number(event.registrationFee) > 0) {
      base.push({ id: 'earnings', label: 'Earnings' });
    }

    return base;
  }, [event]);

  useEffect(() => {
    if (tabs.length > 0 && !tabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  const handleGuestInputChange = (field) => (evt) => {
    const { value } = evt.target;
    setGuestForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddGuest = (evt) => {
    evt.preventDefault();
    const name = guestForm.name.trim();
    const email = guestForm.email.trim();

    if (!name || !email) {
      return;
    }

    setGuestList((prev) => [...prev, createGuestRecord(name, email)]);
    setGuestForm({ name: '', email: '' });
  };

  const handleCheckIn = (guestId) => {
    setGuestList((prevGuests) => {
      let checkedGuest;
      const updatedGuests = prevGuests.map((guest) => {
        if (guest.id === guestId) {
          checkedGuest = { ...guest, status: 'Checked-in' };
          return checkedGuest;
        }
        return guest;
      });

      if (checkedGuest) {
        setCheckIns((prevCheckIns) => {
          if (prevCheckIns.some((entry) => entry.id === guestId)) {
            return prevCheckIns;
          }
          return [
            ...prevCheckIns,
            { ...checkedGuest, checkedInAt: new Date().toISOString() },
          ];
        });
      }

      return updatedGuests;
    });
  };

  const handleUndoCheckIn = (guestId) => {
    setGuestList((prevGuests) =>
      prevGuests.map((guest) =>
        guest.id === guestId ? { ...guest, status: 'Registered' } : guest,
      ),
    );
    setCheckIns((prevCheckIns) => prevCheckIns.filter((guest) => guest.id !== guestId));
  };

  const renderOverview = () => {
    if (!event) {
      return null;
    }

    return (
      <div className="space-y-8">
        <section className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-[rgba(21,26,36,0.72)] p-8 shadow-lg shadow-black/30">
            <span className="text-xs uppercase tracking-[0.3em] text-white/50">Event summary</span>
            <h2 className="mt-4 text-3xl font-semibold text-white">{event.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">{event.description}</p>
            <dl className="mt-6 grid gap-4 text-sm text-white/70 sm:grid-cols-2">
              <div className="space-y-1 rounded-2xl border border-white/10 bg-white/5 p-4">
                <dt className="text-xs uppercase tracking-[0.2em] text-white/50">When</dt>
                <dd className="text-base text-white">{formatDateTime(event.date)}</dd>
              </div>
              <div className="space-y-1 rounded-2xl border border-white/10 bg-white/5 p-4">
                <dt className="text-xs uppercase tracking-[0.2em] text-white/50">Where</dt>
                <dd className="text-base text-white">{event.location}</dd>
              </div>
              <div className="space-y-1 rounded-2xl border border-white/10 bg-white/5 p-4">
                <dt className="text-xs uppercase tracking-[0.2em] text-white/50">Category</dt>
                <dd className="text-base text-white">{event.category || 'Not set'}</dd>
              </div>
              <div className="space-y-1 rounded-2xl border border-white/10 bg-white/5 p-4">
                <dt className="text-xs uppercase tracking-[0.2em] text-white/50">Capacity</dt>
                <dd className="text-base text-white">{event.capacity || 'Unlimited'}</dd>
              </div>
            </dl>
            {event.tags && event.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[rgba(21,26,36,0.72)] p-6 shadow-lg shadow-black/30">
              <span className="text-xs uppercase tracking-[0.3em] text-white/50">Status</span>
              <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm font-medium text-white">
                <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
                {event.status || 'Pending'}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[rgba(21,26,36,0.72)] p-6 shadow-lg shadow-black/30 space-y-3">
              <span className="text-xs uppercase tracking-[0.3em] text-white/50">Ticketing</span>
              <p className="text-lg font-semibold text-white">
                {Number(event.registrationFee) > 0
                  ? `${formatCurrency(event.registrationFee)} per ticket`
                  : 'Free event'}
              </p>
              <p className="text-sm text-white/60">RSVPs recorded: {event.rsvpCount || 0}</p>
            </div>

            {event.imageUrl && (
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full rounded-3xl border border-white/10 object-cover"
              />
            )}
          </aside>
        </section>
      </div>
    );
  };

  const renderGuests = () => (
    <div className="space-y-8">
      <form
        onSubmit={handleAddGuest}
        className="grid gap-4 rounded-3xl border border-white/10 bg-[rgba(21,26,36,0.72)] p-6 shadow-lg shadow-black/30 sm:grid-cols-[1.2fr_1.2fr_auto]"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="guest-name" className="text-xs uppercase tracking-[0.25em] text-white/50">
            Full name
          </label>
          <input
            id="guest-name"
            value={guestForm.name}
            onChange={handleGuestInputChange('name')}
            placeholder="Add guest name"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="guest-email" className="text-xs uppercase tracking-[0.25em] text-white/50">
            Email address
          </label>
          <input
            id="guest-email"
            type="email"
            value={guestForm.email}
            onChange={handleGuestInputChange('email')}
            placeholder="guest@email.com"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none"
            required
          />
        </div>
        <button
          type="submit"
          className="self-end rounded-2xl border border-white/10 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/80"
        >
          Add guest
        </button>
      </form>

      <section className="rounded-3xl border border-white/10 bg-[rgba(21,26,36,0.72)] p-6 shadow-lg shadow-black/30">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-white/60">
            Guest list
          </h3>
          <span className="text-xs text-white/50">{guestList.length} total</span>
        </div>

        {guestList.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-6 text-sm text-white/60">
            No guests added yet. Use the form above to build your list.
          </p>
        ) : (
          <ul className="mt-6 space-y-3">
            {guestList.map((guest) => (
              <li
                key={guest.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-white">{guest.name}</p>
                  <p className="text-xs text-white/60">{guest.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs ${
                      guest.status === 'Checked-in'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-white/10 text-white/70'
                    }`}
                  >
                    {guest.status}
                  </span>
                  {guest.status === 'Checked-in' ? (
                    <button
                      type="button"
                      onClick={() => handleUndoCheckIn(guest.id)}
                      className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 transition hover:border-white/40 hover:text-white"
                    >
                      Undo
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleCheckIn(guest.id)}
                      className="rounded-full border border-emerald-400/40 px-4 py-2 text-xs text-emerald-200 transition hover:border-emerald-300 hover:text-emerald-100"
                    >
                      Mark checked in
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );

  const renderCheckIns = () => (
    <section className="rounded-3xl border border-white/10 bg-[rgba(21,26,36,0.72)] p-6 shadow-lg shadow-black/30">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-white/60">
          Check-in list
        </h3>
        <span className="text-xs text-white/50">{checkIns.length} checked in</span>
      </div>

      {checkIns.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-6 text-sm text-white/60">
          Nobody has been checked in yet. Check in a guest from the guest list to populate this view.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {checkIns.map((guest) => (
            <li
              key={guest.id}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-white">{guest.name}</p>
                <p className="text-xs text-white/60">{guest.email}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/60">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" aria-hidden />
                  Checked in
                </span>
                <span>
                  {formatDateTime(guest.checkedInAt)}
                </span>
                <button
                  type="button"
                  onClick={() => handleUndoCheckIn(guest.id)}
                  className="rounded-full border border-white/15 px-4 py-2 text-white/70 transition hover:border-white/35 hover:text-white"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );

  const renderEarnings = () => {
    if (!event) {
      return null;
    }

    const ticketPrice = Number(event.registrationFee) || 0;
    const ticketsSold = Number(event.rsvpCount) || 0;
    const revenue = ticketPrice * ticketsSold;
    const checkedInCount = checkIns.length;

    return (
      <section className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-[rgba(21,26,36,0.72)] p-6 shadow-lg shadow-black/30">
          <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-white/60">
            Revenue snapshot
          </h3>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-white/50">Ticket price</p>
              <p className="mt-3 text-2xl font-semibold text-white">{formatCurrency(ticketPrice)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-white/50">Tickets sold</p>
              <p className="mt-3 text-2xl font-semibold text-white">{ticketsSold}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-white/50">Checked in</p>
              <p className="mt-3 text-2xl font-semibold text-white">{checkedInCount}</p>
              <p className="mt-1 text-xs text-white/60">
                {ticketsSold === 0 ? '0%' : `${Math.round((checkedInCount / ticketsSold) * 100)}%`} attendance
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-white/50">Gross revenue</p>
              <p className="mt-3 text-2xl font-semibold text-white">{formatCurrency(revenue)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[rgba(21,26,36,0.72)] p-6 shadow-lg shadow-black/30">
          <h4 className="text-sm font-semibold uppercase tracking-[0.25em] text-white/60">
            Notes
          </h4>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            Track check-ins during the event to keep this dashboard in sync. Tie-ins with payment processing can be added later.
          </p>
        </div>
      </section>
    );
  };

  return (
    <OrganizerLayoutDark>
      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-[rgba(21,26,36,0.72)] p-8 text-center text-white/70">
          Loading event details...
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-200">
          {error}
        </div>
      ) : !event ? (
        <div className="rounded-3xl border border-white/10 bg-[rgba(21,26,36,0.72)] p-8 text-center text-white/70">
          Event not found.
        </div>
      ) : (
        <div className="space-y-12">
          <header className="space-y-6">
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 transition hover:border-white/40 hover:text-white"
              >
                Back
              </button>
              <h1 className="text-4xl font-semibold tracking-tight text-white">{event.title}</h1>
              <p className="text-sm text-white/60">{formatDateTime(event.date)}</p>
            </div>

            <nav className="flex gap-8 border-b border-white/10 text-sm font-medium text-white/60">
              {tabs.map((tab) => {
                const isActive = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative pb-3 transition-colors ${
                      isActive ? 'text-white' : 'hover:text-white'
                    }`}
                  >
                    {tab.label}
                    {isActive && (
                      <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-white" />
                    )}
                  </button>
                );
              })}
            </nav>
          </header>

          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'guests' && renderGuests()}
          {activeTab === 'check-ins' && renderCheckIns()}
          {activeTab === 'earnings' && renderEarnings()}
        </div>
      )}
    </OrganizerLayoutDark>
  );
};

export default OrganizerEventView;
