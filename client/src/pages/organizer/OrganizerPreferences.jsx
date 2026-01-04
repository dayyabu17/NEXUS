import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import OrganizerLayoutDark from '../../layouts/OrganizerLayoutDark';
import api from '../../api/axios';
import {
  ACCENT_OPTIONS,
  ACCENT_STORAGE_KEY,
  resolveAccentPalette,
  DEFAULT_ACCENT,
  DEFAULT_BRAND_COLOR,
} from '../../constants/accentTheme';
import { hexToRgba } from '../../utils/color';

const MotionSection = motion.section;
const BRAND_COLOR_STORAGE_KEY = 'organizer:preferences:brand-color';
const AVATAR_RING_STORAGE_KEY = 'organizer:preferences:avatar-ring-enabled';
const hexPattern = /^#([0-9A-Fa-f]{6})$/;

const readStoredAccent = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_ACCENT;
  }
  const stored = window.localStorage.getItem(ACCENT_STORAGE_KEY);
  const isValid = ACCENT_OPTIONS.some((option) => option.id === stored);
  return isValid ? stored : DEFAULT_ACCENT;
};

const readStoredBrandColor = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_BRAND_COLOR;
  }
  const stored = window.localStorage.getItem(BRAND_COLOR_STORAGE_KEY);
  return stored && hexPattern.test(stored) ? stored : DEFAULT_BRAND_COLOR;
};

const readStoredAvatarRing = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.localStorage.getItem(AVATAR_RING_STORAGE_KEY) === 'true';
};

const syncStoredUser = (update) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const raw = window.localStorage.getItem('user');
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw);
    const nextUser = { ...parsed, ...update };
    window.localStorage.setItem('user', JSON.stringify(nextUser));
    window.dispatchEvent(new CustomEvent('nexus-auth:changed', { detail: { user: nextUser } }));
  } catch (error) {
    console.warn('Unable to sync stored user preferences', error);
  }
};

const broadcastAccentChange = (accent) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(ACCENT_STORAGE_KEY, accent);
    window.dispatchEvent(new CustomEvent('organizer:accent-color', { detail: accent }));
  } catch (error) {
    console.warn('Unable to broadcast accent change', error);
  }
};

const OrganizerPreferences = () => {
  const [accentColor, setAccentColor] = useState(readStoredAccent);
  const [brandColor, setBrandColor] = useState(readStoredBrandColor);
  const [avatarRing, setAvatarRing] = useState(readStoredAvatarRing);
  const [brandColorError, setBrandColorError] = useState('');
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [preferencesStatus, setPreferencesStatus] = useState({ type: '', message: '' });

  const activeAccentOption = useMemo(
    () => ACCENT_OPTIONS.find((option) => option.id === accentColor) ?? ACCENT_OPTIONS[0],
    [accentColor],
  );
  const activeAccentPalette = useMemo(() => resolveAccentPalette(accentColor), [accentColor]);
  const registerPreviewStyle = useMemo(
    () => ({
      backgroundColor: activeAccentPalette[600],
      color: '#ffffff',
      boxShadow: `0 16px 40px ${hexToRgba(activeAccentPalette[600], 0.32)}`,
    }),
    [activeAccentPalette],
  );

  useEffect(() => {
    let isMounted = true;

    const loadPreferences = async () => {
      if (typeof window === 'undefined') {
        setLoadingPreferences(false);
        return;
      }

      const token = window.localStorage.getItem('token');
      if (!token) {
        setLoadingPreferences(false);
        return;
      }

      try {
        const response = await api.get('/organizer/preferences', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!isMounted) {
          return;
        }

        const { accentPreference, brandColor: savedBrandColor, avatarRingEnabled } = response.data || {};
        const normalizedAccent = ACCENT_OPTIONS.some((option) => option.id === accentPreference)
          ? accentPreference
          : DEFAULT_ACCENT;
        const normalizedBrand = savedBrandColor && hexPattern.test(savedBrandColor)
          ? savedBrandColor.toUpperCase()
          : DEFAULT_BRAND_COLOR;
        const normalizedAvatarRing = Boolean(avatarRingEnabled);

        setAccentColor(normalizedAccent);
        setBrandColor(normalizedBrand);
        setAvatarRing(normalizedAvatarRing);

        broadcastAccentChange(normalizedAccent);
        window.localStorage.setItem(BRAND_COLOR_STORAGE_KEY, normalizedBrand);
        window.localStorage.setItem(AVATAR_RING_STORAGE_KEY, String(normalizedAvatarRing));

        syncStoredUser({
          accentPreference: normalizedAccent,
          brandColor: normalizedBrand,
          avatarRingEnabled: normalizedAvatarRing,
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }
        const message = error?.response?.data?.message || 'Unable to load your preferences.';
        setPreferencesStatus({ type: 'error', message });
      } finally {
        if (isMounted) {
          setLoadingPreferences(false);
        }
      }
    };

    loadPreferences();

    return () => {
      isMounted = false;
    };
  }, []);

  const persistPreferences = async (payload) => {
    if (typeof window === 'undefined') {
      return false;
    }

    const token = window.localStorage.getItem('token');
    if (!token) {
      setPreferencesStatus({
        type: 'error',
        message: 'Please sign in again to save your preferences.',
      });
      return false;
    }

    setIsSaving(true);
    setPreferencesStatus({ type: '', message: '' });

    try {
      await api.put('/organizer/preferences', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return true;
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to update preferences.';
      setPreferencesStatus({ type: 'error', message });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleAccentSelect = async (value) => {
    if (loadingPreferences || accentColor === value) {
      return;
    }

    const previousAccent = accentColor;
    setAccentColor(value);
    broadcastAccentChange(value);
    syncStoredUser({ accentPreference: value });

    const persisted = await persistPreferences({ accentPreference: value });
    if (!persisted) {
      setAccentColor(previousAccent);
      broadcastAccentChange(previousAccent);
      syncStoredUser({ accentPreference: previousAccent });
    }
  };

  const handleBrandColorInput = async (value) => {
    const previousColor = brandColor;
    setBrandColor(value);

    if (!value) {
      setBrandColorError('Enter a hex color like #2563EB.');
      return;
    }

    if (!hexPattern.test(value)) {
      setBrandColorError('Hex codes should include a leading # and six characters.');
      return;
    }

    if (loadingPreferences) {
      setBrandColorError('');
      setBrandColor(value.toUpperCase());
      return;
    }

    const normalized = value.toUpperCase();
    if (normalized === previousColor) {
      setBrandColorError('');
      setBrandColor(normalized);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(BRAND_COLOR_STORAGE_KEY, normalized);
      }
      syncStoredUser({ brandColor: normalized });
      return;
    }

    setBrandColorError('');
    setBrandColor(normalized);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(BRAND_COLOR_STORAGE_KEY, normalized);
    }
    syncStoredUser({ brandColor: normalized });

    const persisted = await persistPreferences({ brandColor: normalized });
    if (!persisted) {
      setBrandColor(previousColor);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(BRAND_COLOR_STORAGE_KEY, previousColor);
      }
      syncStoredUser({ brandColor: previousColor });
    }
  };

  const handleBrandColorPicker = (event) => {
    handleBrandColorInput(event.target.value);
  };

  const handleAvatarRingToggle = async () => {
    if (loadingPreferences) {
      return;
    }

    const next = !avatarRing;
    const previous = avatarRing;

    setAvatarRing(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(AVATAR_RING_STORAGE_KEY, String(next));
    }
    syncStoredUser({ avatarRingEnabled: next });

    const persisted = await persistPreferences({ avatarRingEnabled: next });
    if (!persisted) {
      setAvatarRing(previous);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(AVATAR_RING_STORAGE_KEY, String(previous));
      }
      syncStoredUser({ avatarRingEnabled: previous });
    }
  };

  const accentButtonDisabled = loadingPreferences || isSaving;

  return (
    <OrganizerLayoutDark>
      <MotionSection
        className="pb-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <header className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-semibold text-slate-900 dark:text-white">App Preferences</h1>
            <p className="text-sm text-slate-500 dark:text-white/60">
              Tune the appearance of your organizer surfaces and update public-facing branding.
            </p>
          </div>
          {(loadingPreferences || isSaving) && (
            <span className="text-xs font-medium text-slate-500 dark:text-white/60">
              {loadingPreferences ? 'Loading preferences…' : 'Saving…'}
            </span>
          )}
        </header>

        {preferencesStatus.message && (
          <div
            className={`mb-8 rounded-2xl border px-4 py-4 text-sm ${
              preferencesStatus.type === 'error'
                ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-100'
            }`}
          >
            {preferencesStatus.message}
          </div>
        )}

        <section className="mb-12 rounded-3xl border border-slate-200 bg-white p-8 text-slate-700 shadow-sm transition dark:border-white/10 dark:bg-[rgba(14,18,27,0.92)] dark:text-white dark:shadow-[0_24px_90px_rgba(5,8,18,0.55)]">
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-white/45">App Appearance</span>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Accent palette</h2>
              <span className="text-xs text-slate-500 dark:text-white/55">Selected: {activeAccentOption.label}</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-white/60">
              These accents will power highlights, buttons, and focus rings throughout the organizer experience.
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {ACCENT_OPTIONS.map((option) => {
              const isActive = option.id === accentColor;
              const palette = resolveAccentPalette(option.id);
              const swatch = palette[600];
              const cardShadowStyle = isActive
                ? { boxShadow: `0 18px 60px ${hexToRgba(swatch, 0.35)}` }
                : undefined;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleAccentSelect(option.id)}
                  disabled={accentButtonDisabled}
                  className={`group flex flex-col gap-4 rounded-3xl border p-5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                    isActive
                      ? 'border-slate-900/20 bg-slate-900/[0.04] shadow-sm dark:border-white/40 dark:bg-white/10'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/25 dark:hover:bg-white/[0.06]'
                  }`}
                  style={cardShadowStyle}
                >
                  <span
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-white transition"
                    style={{
                      backgroundColor: swatch,
                      boxShadow: isActive
                        ? `0 0 0 4px ${hexToRgba('#ffffff', 0.35)}`
                        : `0 0 0 2px ${hexToRgba('#ffffff', 0.18)}`,
                    }}
                  >
                    {option.label.charAt(0)}
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{option.label}</p>
                    <p className="text-xs text-slate-500 dark:text-white/60">{option.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Public preview</p>
                <p className="text-xs text-slate-500 dark:text-white/60">
                  This color will appear on your public event pages (e.g., the ‘Register’ button).
                </p>
              </div>
              <button
                type="button"
                className="rounded-full px-6 py-2 text-sm font-semibold text-white shadow-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:focus-visible:ring-white/40"
                style={registerPreviewStyle}
                aria-label="Register button preview"
              >
                Register
              </button>
            </div>
          </div>

          <p className="mt-6 text-xs text-slate-500 dark:text-white/40">
            We store your selection locally so you can keep iterating before rolling it out to attendees.
          </p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-700 shadow-sm transition dark:border-white/10 dark:bg-[rgba(14,18,27,0.92)] dark:text-white dark:shadow-[0_24px_90px_rgba(5,8,18,0.55)]">
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-white/45">Profile Identity</span>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Public brand color</h2>
            <p className="text-sm text-slate-500 dark:text-white/60">
              This shade powers key touchpoints on your guest-facing experiences like the register button and badges.
            </p>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
              <label className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-white/50" htmlFor="brand-color">
                Hex value
              </label>
              <input
                id="brand-color"
                value={brandColor}
                onChange={(event) => handleBrandColorInput(event.target.value)}
                disabled={loadingPreferences}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-black/40 dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/35 dark:focus:ring-0"
                placeholder="#2563EB"
              />
              <input
                type="color"
                value={brandColor}
                onChange={handleBrandColorPicker}
                disabled={loadingPreferences}
                className="h-12 w-full cursor-pointer rounded-2xl border border-slate-300 bg-white p-0 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-transparent"
                aria-label="Pick brand color"
              />
              {brandColorError ? (
                <p className="text-xs text-rose-600 dark:text-rose-300">{brandColorError}</p>
              ) : (
                <p className="text-xs text-slate-500 dark:text-white/40">Saved locally—apply it to your themes when you are ready.</p>
              )}
            </div>

            <div className="space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.02] dark:shadow-none">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Avatar ring</p>
                  <p className="text-xs text-slate-500 dark:text-white/60">
                    Highlight your profile image with a verified glow across public listings.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAvatarRingToggle}
                  disabled={loadingPreferences || isSaving}
                  className={`relative flex h-8 w-16 items-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    avatarRing ? 'bg-emerald-500/70 shadow-inner dark:bg-emerald-500/60' : 'bg-slate-200 dark:bg-white/20'
                  }`}
                  aria-pressed={avatarRing}
                >
                  <span
                    className={`absolute left-1 top-1 inline-flex h-6 w-6 transform items-center justify-center rounded-full text-[10px] font-semibold transition ${
                      avatarRing
                        ? 'translate-x-8 bg-white text-slate-900'
                        : 'translate-x-0 bg-white text-slate-600 dark:bg-slate-900 dark:text-white'
                    }`}
                  >
                    {avatarRing ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600 shadow-sm dark:border-white/10 dark:bg-black/40 dark:text-white/50 dark:shadow-none">
                <p>
                  Once enabled, guests will see a subtle animated border around your avatar, reinforcing trust and
                  authenticity on your event pages.
                </p>
              </div>
            </div>
          </div>
        </section>
      </MotionSection>
    </OrganizerLayoutDark>
  );
};

export default OrganizerPreferences;
