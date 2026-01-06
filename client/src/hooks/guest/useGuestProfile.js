import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { DEFAULT_AVATAR, resolveProfileImage } from '../../utils/profileUtils';
import { summarizeTicketCollection } from '../../utils/ticketTransforms';

const TABS = [
  { id: 'history', label: 'History' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'appearance', label: 'Appearance' },
];

const initialProfile = {
  _id: '',
  name: '',
  email: '',
  regNo: '',
  department: '',
  password: '',
  confirmPassword: '',
};

const initialTicketMetrics = { total: 0, upcoming: 0, past: 0 };

const useGuestProfile = () => {
  const [profile, setProfile] = useState(initialProfile);
  const [memberSince, setMemberSince] = useState(null);
  const [userHandle, setUserHandle] = useState('');
  const [ticketMetrics, setTicketMetrics] = useState(initialTicketMetrics);
  const [tickets, setTickets] = useState([]);
  const [avatarPreview, setAvatarPreview] = useState(DEFAULT_AVATAR);
  const [avatarFile, setAvatarFile] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [shareFeedback, setShareFeedback] = useState('');
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState('history');

  useEffect(() => {
    try {
      const storedRaw = localStorage.getItem('user');
      if (!storedRaw) {
        setUserHandle('@guest');
        return;
      }

      const stored = JSON.parse(storedRaw);
      setProfile((prev) => ({
        ...prev,
        _id: stored?._id || stored?.id || '',
        name: stored?.name || '',
        email: stored?.email || '',
        regNo: stored?.regNo || stored?.studentId || '',
        department: stored?.department || '',
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
          setTicketMetrics(initialTicketMetrics);
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
        const { metrics } = summarizeTicketCollection(nextTickets);

        setTicketMetrics(metrics);
        setTickets(nextTickets);
      } catch (error) {
        console.warn('Unable to load ticket metrics', error);
        if (isMounted) {
          setTicketMetrics(initialTicketMetrics);
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

  const updateStoredUser = useCallback((update) => {
    try {
      const storedRaw = localStorage.getItem('user');
      if (!storedRaw) {
        return;
      }
      const stored = JSON.parse(storedRaw);
      const nextUser = { ...stored, ...update };
      localStorage.setItem('user', JSON.stringify(nextUser));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('nexus-auth:changed', { detail: { user: nextUser } }));
    } catch (error) {
      console.warn('Unable to sync stored user', error);
    }
  }, []);

  const handleFieldChange = useCallback((event) => {
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
    },
    [profile, updateStoredUser]
  );

  const handleShareId = useCallback(() => {
    setShareFeedback('Image saved to device.');
    window.setTimeout(() => {
      setShareFeedback('');
    }, 2400);
  }, []);

  const badgeText = useMemo(() => {
    if (!profile.email) {
      return 'Guest Member';
    }
    return 'Community Explorer';
  }, [profile.email]);

  const enrichedTickets = useMemo(() => summarizeTicketCollection(tickets).summaries, [tickets]);

  const recentTickets = useMemo(() => enrichedTickets.slice(0, 5), [enrichedTickets]);

  return {
    profile,
    memberSince,
    userHandle,
    ticketMetrics,
    tickets,
    avatarPreview,
    avatarFile,
    status,
    shareFeedback,
    loadingMetrics,
    savingProfile,
    uploadingAvatar,
    activeTab,
    tabs: TABS,
    badgeText,
    enrichedTickets,
    recentTickets,
    setActiveTab,
    handleFieldChange,
    handleAvatarSelection,
    handleAvatarUpload,
    handleProfileSubmit,
    handleShareId,
  };
};

export default useGuestProfile;
