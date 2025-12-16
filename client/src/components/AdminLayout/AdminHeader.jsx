import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchOutlinedSvg from '../../assets/icons/search_outlined.svg';

const DEFAULT_AVATAR = '/images/default-avatar.jpeg';

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('Unable to parse stored user', error);
    return null;
  }
};

const resolveProfilePicture = (profilePicture) => {
  if (!profilePicture) {
    return DEFAULT_AVATAR;
  }

  if (profilePicture.startsWith('http')) {
    return profilePicture;
  }

  return `http://localhost:5000/public${profilePicture}`;
};

const AdminHeader = ({ searchTerm, onSearchChange }) => {
  const navigate = useNavigate();
  const [storedUser, setStoredUser] = useState(() => getStoredUser() || {});

  const userName = useMemo(() => storedUser?.name || 'Admin', [storedUser]);

  const profilePicture = useMemo(
    () => resolveProfilePicture(storedUser?.profilePicture),
    [storedUser?.profilePicture]
  );

  useEffect(() => {
    const handleStorageChange = () => {
      setStoredUser(getStoredUser() || {});
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleProfileClick = () => {
    navigate('/admin/settings');
  };

  const showSearch = typeof onSearchChange === 'function';

  return (
    <header className="flex items-center justify-between border-b border-gray-200 pb-6 transition-colors duration-300 dark:border-gray-800">
      <div>
        <h1 className="text-3xl font-bold text-nexus-dark dark:text-white">Hello {userName} 👋</h1>
        <p className="text-gray-500 dark:text-gray-400">Nexus Admin Dashboard</p>
      </div>
      <div className="flex items-center gap-4">
        {showSearch && (
          <div className="relative">
            <input
              type="search"
              placeholder="Search..."
              value={searchTerm || ''}
              onChange={(event) => onSearchChange(event.target.value)}
              className="w-64 rounded-full border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 shadow-sm focus:border-nexus-primary focus:outline-none focus:ring-2 focus:ring-nexus-primary dark:border-gray-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-nexus-primary dark:focus:ring-blue-500/40"
            />
            <img
              src={SearchOutlinedSvg}
              alt="Search"
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            />
          </div>
        )}
        <button
          type="button"
          onClick={handleProfileClick}
          className="relative h-10 w-10 overflow-hidden rounded-full border border-gray-200 bg-gray-300 focus:outline-none focus:ring-2 focus:ring-nexus-primary dark:border-gray-700 dark:bg-slate-800"
        >
          <img
            src={profilePicture}
            alt="Profile"
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = DEFAULT_AVATAR;
            }}
          />
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
