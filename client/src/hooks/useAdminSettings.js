import { useEffect, useRef, useState } from 'react';
import api from '../api/axios';

const DEFAULT_AVATAR = '/images/default-avatar.jpeg';
const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_SERVER_URL)
  ? import.meta.env.VITE_SERVER_URL
  : 'http://localhost:5000';
const PUBLIC_BASE = `${API_BASE_URL.replace(/\/$/, '')}/public`;
const DEFAULT_AVATAR_URL = `${PUBLIC_BASE}${DEFAULT_AVATAR}`;
const THEME_STORAGE_KEY = 'adminTheme';

const resolveProfilePicture = (value) => {
  if (!value || typeof value !== 'string') {
    return DEFAULT_AVATAR_URL;
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === 'null') {
    return DEFAULT_AVATAR_URL;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `${PUBLIC_BASE}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
};

const useAdminSettings = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [profilePicture, setProfilePicture] = useState(DEFAULT_AVATAR_URL);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [picLoading, setPicLoading] = useState(false);
  const previewUrlRef = useRef(null);

  useEffect(() => {
    const hydrateFromStorage = () => {
      try {
        const storedRaw = localStorage.getItem('user');
        if (!storedRaw) {
          return;
        }

        const stored = JSON.parse(storedRaw);
        setFormData((prev) => ({
          ...prev,
          name: stored?.name || '',
          email: stored?.email || '',
        }));
        setProfilePicture(resolveProfilePicture(stored?.profilePicture));
      } catch {
        setProfilePicture(DEFAULT_AVATAR_URL);
      }
    };

    hydrateFromStorage();

    let isMounted = true;

    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      try {
        const { data } = await api.get('/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!isMounted) {
          return;
        }

        setFormData((prev) => ({
          ...prev,
          name: data?.name || '',
          email: data?.email || '',
        }));
        setProfilePicture(resolveProfilePicture(data?.profilePicture));

        try {
          const localUserRaw = localStorage.getItem('user');
          const localUser = localUserRaw ? JSON.parse(localUserRaw) : {};
          localStorage.setItem(
            'user',
            JSON.stringify({
              ...localUser,
              ...data,
            }),
          );
        } catch {
          // Ignore storage errors.
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setMessage({
          type: 'error',
          content: error?.response?.data?.message || 'Unable to load profile details.',
        });
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
    if (file) {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
      const previewUrl = URL.createObjectURL(file);
      previewUrlRef.current = previewUrl;
      setProfilePicture(previewUrl);
    }
  };

  const handleProfileUpdate = async (event) => {
    event.preventDefault();
    setMessage({ type: '', content: '' });

    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', content: 'Passwords do not match.' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const updatePayload = {
        name: formData.name,
        email: formData.email,
      };

      if (formData.password) {
        updatePayload.password = formData.password;
      }

      const response = await api.put('/auth/profile', updatePayload, config);

      try {
        const currentUserRaw = localStorage.getItem('user');
        const currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : {};
        const updatedUser = { ...currentUser, ...response.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch {
        // Ignore storage errors.
      }

      window.dispatchEvent(new Event('storage'));

      setMessage({ type: 'success', content: 'Profile updated successfully!' });
      setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (error) {
      setMessage({ type: 'error', content: error?.response?.data?.message || 'Update failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePictureUpload = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', content: 'Please select a file first.' });
      return;
    }

    setPicLoading(true);
    setMessage({ type: '', content: '' });

    const formDataToUpload = new FormData();
    formDataToUpload.append('profilePicture', selectedFile);

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      const response = await api.put('/auth/profile/picture', formDataToUpload, config);

      try {
        const currentUserRaw = localStorage.getItem('user');
        const currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : {};
        const updatedUser = { ...currentUser, profilePicture: response.data.profilePicture };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch {
        // Ignore storage errors.
      }

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }

      setProfilePicture(resolveProfilePicture(response.data.profilePicture));
      setSelectedFile(null);

      window.dispatchEvent(new Event('storage'));

      setMessage({ type: 'success', content: response.data.message || 'Profile picture updated!' });
    } catch (error) {
      setMessage({ type: 'error', content: error?.response?.data?.message || 'Picture upload failed.' });
    } finally {
      setPicLoading(false);
    }
  };

  return {
    formData,
    profilePicture,
    selectedFile,
    message,
    loading,
    picLoading,
    handleChange,
    handleFileChange,
    handleProfileUpdate,
    handlePictureUpload,
    setMessage,
    defaultAvatarUrl: DEFAULT_AVATAR_URL,
  };
};

export {
  useAdminSettings as default,
  THEME_STORAGE_KEY,
  DEFAULT_AVATAR_URL,
  resolveProfilePicture,
};
