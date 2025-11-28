import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GuestNavbar from './GuestNavbar';
import NexusIDCard from './NexusIDCard';
import AchievementBadges from './AchievementBadges';
import api from '../api/axios';

const DEFAULT_AVATAR = '/images/default-avatar.jpeg';
const MotionSection = motion.section;

const resolveProfileImage = (value) => {
  if (!value) {
    return DEFAULT_AVATAR;
  }

  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  return `http://localhost:5000/public${value}`;
};

const GuestProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [memberSince, setMemberSince] = useState(null);
  const [userHandle, setUserHandle] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(DEFAULT_AVATAR);
  const [avatarFile, setAvatarFile] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [shareFeedback, setShareFeedback] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [ticketMetrics, setTicketMetrics] = useState({ total: 0, upcoming: 0, past: 0 });
  const [tickets, setTickets] = useState([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [activeTab, setActiveTab] = useState('history');

  useEffect(() => {
    try {
      const storedRaw = localStorage.getItem('user');
      if (!storedRaw) {
        return;
      }

      const stored = JSON.parse(storedRaw);
      setProfile((prev) => ({
        ...prev,
        name: stored?.name || '',
        email: stored?.email || '',
      }));
      setAvatarPreview(resolveProfileImage(stored?.profilePicture));
      setMemberSince(stored?.createdAt || null);
      if (stored?.username) {
        setUserHandle(`@${stored.username}`);
      } else if (stored?.email) {
        setUserHandle(`@${stored.email.split('@')[0]}`);
      } else if (stored?.name) {
        setUserHandle(`@${stored.name.replace(/\s+/g, '').toLowerCase()}`);
      } else {
        setUserHandle('@guest');
      }
    } catch (error) {
      console.warn('Unable to parse stored user', error);
      setAvatarPreview(DEFAULT_AVATAR);
      setUserHandle('@guest');
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchTicketMetrics = async () => {
      setLoadingMetrics(true);

      if (typeof window === 'undefined') {
        setLoadingMetrics(false);
        return;
      }

      const token = window.localStorage.getItem('token');
      if (!token) {
        if (isMounted) {
          setTicketMetrics({ total: 0, upcoming: 0, past: 0 });
          setTickets([]);
          setLoadingMetrics(false);
        }
        return;
      }

      try {
        const response = await api.get('/tickets/my-tickets', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!isMounted) {
          return;
        }

        const nextTickets = Array.isArray(response.data?.tickets) ? response.data.tickets : [];
        const now = Date.now();
        let upcoming = 0;
        let past = 0;

        nextTickets.forEach((ticket) => {
          const eventDate = ticket?.event?.date ? new Date(ticket.event.date).getTime() : NaN;
          if (!Number.isFinite(eventDate)) {
            past += 1;
            return;
          }
          if (eventDate >= now) {
            upcoming += 1;
          } else {
            past += 1;
          }
        });

        setTicketMetrics({ total: nextTickets.length, upcoming, past: Math.max(past, 0) });
        setTickets(nextTickets);
      } catch (error) {
        console.warn('Unable to load ticket metrics', error);
        if (isMounted) {
          setTicketMetrics({ total: 0, upcoming: 0, past: 0 });
          setTickets([]);
        }
      } finally {
        if (isMounted) {
          setLoadingMetrics(false);
        }
      }
    };

    fetchTicketMetrics();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateStoredUser = (update) => {
    try {
      const storedRaw = localStorage.getItem('user');
      if (!storedRaw) {
        return;
      }
      const stored = JSON.parse(storedRaw);
      const nextUser = { ...stored, ...update };
      localStorage.setItem('user', JSON.stringify(nextUser));
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.warn('Unable to sync stored user', error);
    }
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarSelection = (event) => {
    const file = event.target.files?.[0];
    setAvatarFile(file || null);
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      setStatus({ type: 'error', message: 'Choose an image first.' });
      return;
    }

    setUploadingAvatar(true);
    setStatus({ type: '', message: '' });

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please sign in again.');
      }

      const formData = new FormData();
      formData.append('profilePicture', avatarFile);

      const response = await api.put('/auth/profile/picture', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const nextProfilePicture = response?.data?.profilePicture;
      if (nextProfilePicture) {
        updateStoredUser({ profilePicture: nextProfilePicture });
        setAvatarPreview(resolveProfileImage(nextProfilePicture));
        setAvatarFile(null);
      }

      setStatus({
        type: 'success',
        message: response?.data?.message || 'Profile photo updated successfully.',
      });
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Could not upload avatar.';
      setStatus({ type: 'error', message });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    if (profile.password && profile.password !== profile.confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    setSavingProfile(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please sign in again.');
      }

      const payload = {
        name: profile.name,
        email: profile.email,
      };

      if (profile.password) {
        payload.password = profile.password;
      }

      const response = await api.put('/auth/profile', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      updateStoredUser(response.data);
      setProfile((prev) => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }));
      setStatus({ type: 'success', message: 'Profile updated successfully.' });
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Unable to update profile.';
      setStatus({ type: 'error', message });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleShareId = () => {
    setShareFeedback('Image saved to device.');
    window.setTimeout(() => {
      setShareFeedback('');
    }, 2400);
  };

  const badgeText = useMemo(() => {
    if (!profile.email) {
      return 'Guest Member';
    }
    return 'Community Explorer';
  }, [profile.email]);

  const enrichedTickets = useMemo(() => {
    if (!tickets.length) {
      return [];
    }
    const now = Date.now();
    return tickets
      .map((ticket) => {
        const event = ticket?.event || {};
        const eventDate = event?.date ? new Date(event.date) : null;
        const timestamp = eventDate && !Number.isNaN(eventDate.valueOf()) ? eventDate.getTime() : 0;
        const isUpcoming = timestamp && timestamp >= now;
        return {
          id: ticket?._id || ticket?.id || Math.random().toString(36),
          title: event?.title || 'Unnamed Experience',
          location: event?.location || 'Location TBA',
          date: eventDate,
          isUpcoming,
        };
      })
      .sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));
  }, [tickets]);

  const recentTickets = enrichedTickets.slice(0, 5);

  const historyContent = (
    <div className="space-y-10">
      <section className="rounded-3xl border border-white/10 bg-[#0d1423]/65 p-6 shadow-[0_24px_70px_rgba(5,10,25,0.45)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/55">Ticket metrics</p>
            <h3 className="text-xl font-semibold text-white">Your campus footprint</h3>
          </div>
          {loadingMetrics && <span className="text-xs text-white/45">Syncing…</span>}
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
              className="rounded-2xl border border-white/10 bg-[#101a2c]/80 px-4 py-5"
            >
              <p className="text-[11px] uppercase tracking-[0.32em] text-white/45">{label}</p>
              <p className="mt-3 text-2xl font-semibold text-white">{loadingMetrics ? '—' : value}</p>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => navigate('/guest/tickets')}
          className="mt-6 inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-white/75 transition hover:border-white/30"
        >
          View my tickets
        </button>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0d1423]/65 p-6 shadow-[0_24px_70px_rgba(5,10,25,0.45)]">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/55">History</p>
          <h3 className="text-xl font-semibold text-white">Recent check-ins</h3>
          <p className="text-xs text-white/45">A snapshot of the latest events tied to your Nexus ID.</p>
        </div>
        {loadingMetrics ? (
          <div className="mt-6 space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`history-skeleton-${index}`}
                className="h-16 animate-pulse rounded-2xl border border-white/10 bg-[#121c2a]/70"
              />
            ))}
          </div>
        ) : recentTickets.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-[#10192d]/70 px-6 py-10 text-center text-sm text-white/50">
            No events yet. Grab a ticket to unlock your journey log.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {recentTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#10192d]/80 px-4 py-4"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">{ticket.title}</p>
                  <p className="text-xs text-white/45">{ticket.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                    {ticket.date ? ticket.date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }) : 'Date tba'}
                  </p>
                  <span className={`text-xs font-semibold ${ticket.isUpcoming ? 'text-emerald-300' : 'text-white/55'}`}>
                    {ticket.isUpcoming ? 'Upcoming' : 'Completed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0d1423]/65 p-8 shadow-[0_24px_70px_rgba(5,10,25,0.45)]">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/55">Account</p>
          <h3 className="text-xl font-semibold text-white">Profile settings</h3>
          <p className="text-xs text-white/45">Tune your identity details and keep your credentials fresh.</p>
        </div>

        <form onSubmit={handleProfileSubmit} className="mt-8 space-y-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-[0.25em] text-white/50" htmlFor="name">
                Display name
              </label>
              <input
                id="name"
                name="name"
                value={profile.name}
                onChange={handleFieldChange}
                className="rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-white/35 focus:outline-none"
                placeholder="Add your name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-[0.25em] text-white/50" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={profile.email}
                onChange={handleFieldChange}
                className="rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-white/35 focus:outline-none"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.25em] text-white/55">Security</h4>
              <p className="mt-2 text-xs text-white/45">Update your password to keep your account secure.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-[0.25em] text-white/50" htmlFor="password">
                  New password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={profile.password}
                  onChange={handleFieldChange}
                  className="rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-white/35 focus:outline-none"
                  placeholder="Leave blank to keep current"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-[0.25em] text-white/50" htmlFor="confirmPassword">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={profile.confirmPassword}
                  onChange={handleFieldChange}
                  className="rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-white/35 focus:outline-none"
                  placeholder="Repeat new password"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-xs text-white/50">
            <p>Tip: Use a mix of letters, numbers, and symbols for stronger security.</p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="rounded-2xl border border-white/15 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingProfile ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <GuestNavbar />

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-24">
        <MotionSection
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="space-y-12"
        >
          <header className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
              Profile
            </div>
            <h1 className="text-4xl font-semibold text-white">Your guest identity</h1>
            <p className="text-sm text-white/55">
              Step into a futuristic dossier that evolves with every Nexus experience you attend.
            </p>
          </header>

          {status.message && (
            <div
              className={`rounded-2xl border px-4 py-4 text-sm ${
                status.type === 'error'
                  ? 'border-red-500/40 bg-red-500/10 text-red-200'
                  : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
              }`}
            >
              {status.message}
            </div>
          )}

          <div className="grid gap-10 lg:grid-cols-[380px_1fr]">
            <div className="space-y-6 lg:sticky lg:top-28">
              <NexusIDCard
                avatar={avatarPreview}
                displayName={profile.name}
                memberSince={memberSince}
                userHandle={userHandle}
                onShare={handleShareId}
              />

              {shareFeedback && (
                <div className="rounded-2xl border border-white/15 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                  {shareFeedback}
                </div>
              )}

              <section className="rounded-3xl border border-white/12 bg-[#0d1423]/75 p-7 shadow-[0_24px_70px_rgba(5,10,25,0.48)]">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="relative h-28 w-28 overflow-hidden rounded-3xl border border-white/10 bg-[#10192f]">
                    <img src={avatarPreview} alt="Profile avatar" className="h-full w-full object-cover" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-white">{profile.name || 'Guest Explorer'}</p>
                    <p className="text-sm text-white/60">{profile.email || 'Add your email to personalize'}</p>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
                      {badgeText}
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-4 text-sm">
                  <label
                    htmlFor="avatar-upload"
                    className="block cursor-pointer rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-center text-white/80 transition hover:border-white/30 hover:text-white"
                  >
                    Choose new photo
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarSelection}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAvatarUpload}
                    disabled={!avatarFile || uploadingAvatar}
                    className="w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {uploadingAvatar ? 'Uploading…' : 'Update photo'}
                  </button>
                  <p className="text-xs text-white/45">Use a square image at least 400px wide for best results.</p>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 p-2 text-xs font-semibold uppercase tracking-[0.26em] text-white/60">
                {['history', 'achievements'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 rounded-full px-5 py-2 transition ${
                      activeTab === tab
                        ? 'bg-white text-black shadow-[0_10px_40px_rgba(255,255,255,0.25)]'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {tab === 'history' ? 'History' : 'Achievements'}
                  </button>
                ))}
              </div>

              {activeTab === 'history' ? (
                historyContent
              ) : (
                <div className="rounded-3xl border border-white/10 bg-[#0d1423]/65 p-8 shadow-[0_24px_70px_rgba(5,10,25,0.45)]">
                  <AchievementBadges stats={ticketMetrics} loading={loadingMetrics} />
                </div>
              )}
            </div>
          </div>
        </MotionSection>
      </main>
    </div>
  );
};

export default GuestProfile;
