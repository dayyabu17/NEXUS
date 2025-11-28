import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GuestNavbar from './GuestNavbar';
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
  const [avatarPreview, setAvatarPreview] = useState(DEFAULT_AVATAR);
  const [avatarFile, setAvatarFile] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [ticketMetrics, setTicketMetrics] = useState({ total: 0, upcoming: 0, past: 0 });
  const [loadingMetrics, setLoadingMetrics] = useState(true);

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
    } catch (error) {
      console.warn('Unable to parse stored user', error);
      setAvatarPreview(DEFAULT_AVATAR);
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

        const tickets = Array.isArray(response.data?.tickets) ? response.data.tickets : [];
        const now = Date.now();
        let upcoming = 0;
        let past = 0;

        tickets.forEach((ticket) => {
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

        setTicketMetrics({ total: tickets.length, upcoming, past: Math.max(past, 0) });
      } catch (error) {
        console.warn('Unable to load ticket metrics', error);
        if (isMounted) {
          setTicketMetrics({ total: 0, upcoming: 0, past: 0 });
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

  const badgeText = useMemo(() => {
    if (!profile.email) {
      return 'Guest Member';
    }
    return 'Community Explorer';
  }, [profile.email]);

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
              Keep your details up to date and manage how you show up across Nexus experiences.
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

          <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
            <div className="space-y-6">
              <section className="rounded-3xl border border-white/10 bg-[#0d1423]/85 p-8 shadow-[0_24px_80px_rgba(5,10,25,0.55)]">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="relative h-28 w-28 overflow-hidden rounded-3xl border border-white/10 bg-[#10192f]">
                    <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-white">{profile.name || 'Guest Explorer'}</p>
                    <p className="text-sm text-white/55">{profile.email || 'Add your email to personalize'}</p>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
                      {badgeText}
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <label htmlFor="avatar-upload" className="block cursor-pointer rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-center text-sm text-white/80 transition hover:border-white/30 hover:text-white">
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

              <section className="rounded-3xl border border-white/10 bg-[#0d1423]/85 p-6 shadow-[0_24px_80px_rgba(5,10,25,0.55)]">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-white/55">Ticket activity</h2>
                    <p className="mt-1 text-xs text-white/45">Track the events you are part of.</p>
                  </div>
                  {loadingMetrics && (
                    <span className="text-xs text-white/40">Loading…</span>
                  )}
                </div>
                <div className="mt-6 grid gap-4">
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
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#111a2c]/85 px-4 py-3"
                    >
                      <span className="text-xs uppercase tracking-[0.2em] text-white/45">{label}</span>
                      <span className="text-lg font-semibold text-white">{loadingMetrics ? '—' : value}</span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/guest/tickets')}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/25"
                >
                  View my tickets
                </button>
              </section>
            </div>

            <form
              onSubmit={handleProfileSubmit}
              className="space-y-8 rounded-3xl border border-white/10 bg-[#0d1423]/85 p-8 shadow-[0_24px_80px_rgba(5,10,25,0.55)]"
            >
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
                  <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-white/55">Security</h2>
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
          </div>
        </MotionSection>
      </main>
    </div>
  );
};

export default GuestProfile;
