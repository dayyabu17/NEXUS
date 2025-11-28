import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import OrganizerLayoutDark from './OrganizerLayoutDark';
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

/**
 * OrganizerPreferences component.
 * Allows organizers to manage their profile settings, including display name,
 * email, password, and profile picture.
 *
 * @component
 * @returns {JSX.Element} The rendered OrganizerPreferences component.
 */
const OrganizerPreferences = () => {
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

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      return;
    }

    try {
      const parsed = JSON.parse(storedUser);
      setProfile((prev) => ({
        ...prev,
        name: parsed?.name || '',
        email: parsed?.email || '',
      }));
      setAvatarPreview(resolveProfileImage(parsed?.profilePicture));
    } catch {
      setAvatarPreview(DEFAULT_AVATAR);
    }
  }, []);

  const updateStoredUser = (update) => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      const nextUser = { ...parsed, ...update };
      localStorage.setItem('user', JSON.stringify(nextUser));
      window.dispatchEvent(new Event('storage'));
    } catch {
      // ignore storage sync issues
    }
  };

  const handleProfileFieldChange = (event) => {
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
      setStatus({ type: 'error', message: 'Select an image first.' });
      return;
    }

    setUploadingAvatar(true);
    setStatus({ type: '', message: '' });

    try {
      const token = localStorage.getItem('token');
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
      }
      setAvatarFile(null);
      setStatus({ type: 'success', message: response?.data?.message || 'Avatar updated successfully.' });
    } catch (error) {
      const message = error?.response?.data?.message || 'Could not upload avatar.';
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
      const message = error?.response?.data?.message || 'Unable to update profile.';
      setStatus({ type: 'error', message });
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <OrganizerLayoutDark>
      <MotionSection
        className="pb-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <header className="mb-10 flex flex-col gap-3">
          <h1 className="text-4xl font-semibold text-white">Preferences</h1>
          <p className="text-sm text-white/60">
            Update how you appear across Nexus and keep your account details secure.
          </p>
        </header>

        {status.message && (
          <div
            className={`mb-8 rounded-2xl border px-4 py-4 text-sm ${
              status.type === 'error'
                ? 'border-red-500/40 bg-red-500/10 text-red-200'
                : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
            }`}
          >
            {status.message}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
          <div className="rounded-3xl border border-white/10 bg-[rgba(14,17,25,0.88)] p-8 shadow-[0_24px_90px_rgba(5,8,18,0.55)]">
            <span className="text-xs uppercase tracking-[0.3em] text-white/50">Profile image</span>
            <div className="mt-6 flex flex-col items-center gap-6">
              <div className="relative h-36 w-36 overflow-hidden rounded-3xl border border-white/10 bg-black/60">
                <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
              </div>
              <div className="flex w-full flex-col gap-4">
                <label
                  htmlFor="avatar-upload"
                  className="flex cursor-pointer items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:border-white/35 hover:text-white"
                >
                  Choose new avatar
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
                  className="rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploadingAvatar ? 'Uploading…' : 'Update avatar'}
                </button>
                <p className="text-xs text-white/45">
                  Use a square image at least 400px wide to keep things crisp.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleProfileSubmit}
            className="rounded-3xl border border-white/10 bg-[rgba(14,17,25,0.88)] p-8 shadow-[0_24px_90px_rgba(5,8,18,0.55)] space-y-8"
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
                  onChange={handleProfileFieldChange}
                  className="rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/35 focus:outline-none"
                  placeholder="Enter your name"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-[0.25em] text-white/50" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleProfileFieldChange}
                  className="rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/35 focus:outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-white/50">Security</h2>
                <p className="mt-2 text-xs text-white/45">
                  Update your password regularly to keep your account safe.
                </p>
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
                    onChange={handleProfileFieldChange}
                    className="rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/35 focus:outline-none"
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
                    onChange={handleProfileFieldChange}
                    className="rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/35 focus:outline-none"
                    placeholder="Repeat new password"
                  />
                </div>
              </div>
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
    </OrganizerLayoutDark>
  );
};

export default OrganizerPreferences;
