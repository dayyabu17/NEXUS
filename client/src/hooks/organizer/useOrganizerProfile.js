import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { avatarImage, formatDisplayName } from '../../layouts/OrganizerLayout/layoutUtils';
import { resolveProfileImage } from '../../utils/profileUtils';

const useOrganizerProfile = () => {
  const navigate = useNavigate();
  const [organizerProfile, setOrganizerProfile] = useState({
    name: 'Organizer',
    profilePicture: avatarImage,
  });

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/sign-in');
      return;
    }

    try {
      const { data } = await api.get('/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const normalizedName =
        typeof data?.name === 'string' && data.name.trim().length > 0
          ? data.name.trim()
          : 'Organizer';
      const rawAvatar =
        typeof data?.profilePicture === 'string' && data.profilePicture.trim().length > 0
          ? data.profilePicture.trim()
          : '';

      const normalizedAvatar = rawAvatar ? resolveProfileImage(rawAvatar) : avatarImage;

      setOrganizerProfile({
        name: normalizedName,
        profilePicture: normalizedAvatar,
      });

      try {
        const existingRaw = localStorage.getItem('user');
        const existingUser = existingRaw ? JSON.parse(existingRaw) : {};
        const nextUser = {
          ...existingUser,
          name: normalizedName,
          email: data?.email,
          organizationName: data?.organizationName,
          profilePicture: normalizedAvatar,
        };

        if (data?.theme && (data.theme === 'light' || data.theme === 'dark')) {
          nextUser.theme = data.theme;
        }

        localStorage.setItem('user', JSON.stringify(nextUser));
        window.dispatchEvent(new CustomEvent('nexus-auth:changed', { detail: { user: nextUser } }));
      } catch {
        // Ignore storage write failures.
      }
    } catch (error) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new CustomEvent('nexus-auth:changed', { detail: { user: null } }));
        navigate('/sign-in');
      }
    }
  }, [navigate]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new CustomEvent('nexus-auth:changed', { detail: { user: null } }));
    navigate('/sign-in');
  }, [navigate]);

  const handlePreferences = useCallback(() => {
    navigate('/organizer/account');
  }, [navigate]);

  const handleAppPreferences = useCallback(() => {
    navigate('/organizer/preferences');
  }, [navigate]);

  const displayName = useMemo(
    () => formatDisplayName(organizerProfile.name),
    [organizerProfile.name],
  );

  const profileImageSrc = useMemo(() => {
    const source = organizerProfile.profilePicture;
    if (source && typeof source === 'string' && source.trim().length > 0) {
      return source;
    }
    return avatarImage;
  }, [organizerProfile.profilePicture]);

  return {
    organizerProfile,
    displayName,
    profileImageSrc,
    fetchProfile,
    handleLogout,
    handlePreferences,
    handleAppPreferences,
  };
};

export default useOrganizerProfile;
