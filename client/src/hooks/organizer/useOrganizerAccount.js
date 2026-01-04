import { useCallback, useEffect, useState } from 'react';
import api from '../../api/axios';
import { DEFAULT_AVATAR, resolveProfileImage } from '../../utils/profileUtils';

const initialProfileState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const useOrganizerAccount = () => {
  const [profile, setProfile] = useState(initialProfileState);
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

  const updateStoredUser = useCallback((update) => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      const nextUser = { ...parsed, ...update };
      localStorage.setItem('user', JSON.stringify(nextUser));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('nexus-auth:changed', { detail: { user: nextUser } }));
    } catch {
      // Ignore storage sync issues between tabs
    }
  }, []);

  const handleProfileFieldChange = useCallback((event) => {
    const { name, value } = event.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleAvatarSelection = useCallback((event) => {
    const file = event.target.files?.[0];
    setAvatarFile(file || null);

    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  }, []);

  const handleAvatarUpload = useCallback(async () => {
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
  }, [avatarFile, updateStoredUser]);

  const handleProfileSubmit = useCallback(
    async (event) => {
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
        setStatus({ type: 'success', message: 'Account updated successfully.' });
      } catch (error) {
        const message = error?.response?.data?.message || 'Unable to update account.';
        setStatus({ type: 'error', message });
      } finally {
        setSavingProfile(false);
      }
    },
    [profile, updateStoredUser],
  );

  return {
    profile,
    avatarPreview,
    avatarFile,
    status,
    savingProfile,
    uploadingAvatar,
    setStatus,
    handleProfileFieldChange,
    handleAvatarSelection,
    handleAvatarUpload,
    handleProfileSubmit,
  };
};

export default useOrganizerAccount;
