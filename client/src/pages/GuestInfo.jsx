import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';

const FALLBACK_IMAGE = '/images/default-avatar.jpeg';

const GuestInfo = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      return;
    }

    let isMounted = true;

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get(`/users/public/${userId}`, { skipAuth: true });

        if (!isMounted) {
          return;
        }

        setProfile(response?.data || null);
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        const message = fetchError?.message || 'Unable to load guest information.';
        setError(message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const avatarSrc = useMemo(() => {
    if (!profile?.profileImage) {
      return FALLBACK_IMAGE;
    }

    return profile.profileImage;
  }, [profile]);

  const eventsAttended = profile?.eventsAttended ?? 0;
  const isVip = eventsAttended > 10;
  const formattedMemberSince = useMemo(() => {
    if (!profile?.joinedAt) {
      return '';
    }

    try {
      return new Date(profile.joinedAt).toLocaleDateString('en-GB', {
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  }, [profile?.joinedAt]);
  const firstName = useMemo(() => {
    if (!profile?.name) {
      return 'them';
    }

    return profile.name.split(' ')[0] || profile.name;
  }, [profile]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-12 h-52 w-52 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="absolute right-4 bottom-10 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
      </div>

      <section className="relative z-10 w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">Nexus Digital ID</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-white/60">
            Verified identity snapshot designed for campus check-ins.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 pb-10 shadow-xl shadow-blue-500/10 transition dark:border-slate-800 dark:bg-[rgba(9,13,22,0.92)] dark:shadow-[0_35px_80px_rgba(8,14,35,0.65)]">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-80 mix-blend-screen" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08)_0%,_transparent_55%)]" aria-hidden="true" />

          <div className="relative flex items-start justify-between">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Live
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-600/90 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-blue-500/40">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707a1 1 0 00-1.414-1.414L9 11.172 7.707 9.879a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Verified
            </span>
          </div>

          <div className="relative mt-6 flex flex-col items-center">
            <div className="relative h-28 w-28 overflow-hidden rounded-3xl border border-blue-500/30 bg-slate-100 shadow-lg dark:border-blue-500/40 dark:bg-white/5">
              {loading ? (
                <div className="h-full w-full animate-pulse bg-slate-200 dark:bg-white/10" />
              ) : (
                <img
                  src={avatarSrc}
                  alt={profile?.name ? `${profile.name}'s avatar` : 'Guest avatar'}
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            <div className="mt-5 text-center">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                {loading ? <span className="inline-block h-6 w-32 rounded-full bg-slate-200 dark:bg-white/10" /> : profile?.name || 'Guest User'}
              </h2>
              <div className="mt-3 flex flex-col items-center gap-2">
                <div>
                  {loading ? (
                    <span className="inline-block h-4 w-36 rounded-full bg-slate-200 dark:bg-white/10" />
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-mono text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {profile?.regNo || 'REG — PENDING'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {loading ? (
                    <span className="inline-block h-3 w-24 rounded-full bg-slate-200 dark:bg-white/10" />
                  ) : formattedMemberSince ? `Member since ${formattedMemberSince}` : 'Member since —'}
                </p>
              </div>
            </div>
          </div>

          <div className="relative mt-8 space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-100/80 px-4 py-3 text-sm font-semibold text-slate-600 dark:border-slate-800 dark:bg-white/5 dark:text-white/70">
              <span>Events Attended</span>
              <span className="text-2xl font-semibold text-slate-900 dark:text-white">
                {loading ? (
                  <span className="inline-block h-6 w-10 rounded-full bg-slate-200 dark:bg-white/10" />
                ) : (
                  eventsAttended
                )}
              </span>
            </div>

            {isVip && !loading && (
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-100/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 shadow-sm dark:border-amber-300/30 dark:bg-amber-500/15 dark:text-amber-200">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path d="M10 2a1 1 0 01.894.553l1.618 3.277 3.62.526a1 1 0 01.554 1.705l-2.619 2.554.618 3.604a1 1 0 01-1.451 1.054L10 13.347l-3.234 1.726a1 1 0 01-1.451-1.054l.618-3.604-2.62-2.554a1 1 0 01.553-1.705l3.62-.526L9.106 2.553A1 1 0 0110 2z" />
                </svg>
                Campus VIP
              </div>
            )}
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 text-center">
            <p className="text-sm text-slate-600 dark:text-white/60">
              {loading ? 'Loading invitation...' : `Join ${firstName} on Nexus.`}
            </p>
            <Link
              to="/register"
              className="inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:hover:bg-blue-500/90"
            >
              Create My Account
            </Link>
          </div>
        </div>

        {error && !loading && (
          <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-100/70 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        )}
      </section>
    </div>
  );
};

export default GuestInfo;
