import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import nexusLogo from '../assets/nexus-logo.svg';

// --- ICONS ---
import DashboardFilledSvg from '../assets/icons/dashboard_filled.svg';
import DashboardOutlinedSvg from '../assets/icons/dashboard_outlined.svg';
import EventFilledSvg from '../assets/icons/event_filled.svg';
import UserFilledSvg from '../assets/icons/user_filled.svg';
import UserOutlinedSvg from '../assets/icons/user_outlined.svg';
import SettingsFilledSvg from '../assets/icons/settings_filled.svg';
import SettingsOutlinedSvg from '../assets/icons/settings_outlined.svg';
import SearchOutlinedSvg from '../assets/icons/search_outlined.svg';
import LogoutOutlinedSvg from '../assets/icons/logout_outlined.svg';
import Event2OutlinedSvg from '../assets/icons/event_outlined2.svg';

const DEFAULT_AVATAR = '/images/default-avatar.jpeg';

const getInitialUserName = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user).name : 'Admin';
};

const getInitialProfilePicture = () => {
  const user = localStorage.getItem('user');
  if (user) {
    const parsedUser = JSON.parse(user);
    if (parsedUser.profilePicture && !parsedUser.profilePicture.startsWith('http')) {
      return `http://localhost:5000/public${parsedUser.profilePicture}`;
    }
    return parsedUser.profilePicture || DEFAULT_AVATAR;
  }
  return DEFAULT_AVATAR;
};

const AdminLayiutDark = ({ children, searchTerm, onSearchChange }) => {
  const [userName, setUserName] = useState(getInitialUserName);
  const [profilePicture, setProfilePicture] = useState(getInitialProfilePicture);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleStorageChange = () => {
      setUserName(getInitialUserName());
      setProfilePicture(getInitialProfilePicture());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/sign-in');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', iconOutlined: DashboardOutlinedSvg, iconFilled: DashboardFilledSvg },
    { name: 'Users', path: '/admin/users', iconOutlined: UserOutlinedSvg, iconFilled: UserFilledSvg },
    { name: 'Events', path: '/admin/events', iconOutlined: Event2OutlinedSvg, iconFilled: EventFilledSvg },
    { name: 'Settings', path: '/admin/settings', iconOutlined: SettingsOutlinedSvg, iconFilled: SettingsFilledSvg },
  ];

  const showSearch = typeof onSearchChange === 'function';

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100 font-sans transition-colors duration-500 ease-in-out">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col p-6 shadow-lg transition-colors duration-500 ease-in-out">
        <div className="flex items-center gap-3 mb-10 pl-2">
          <img src={nexusLogo} alt="Nexus Logo" className="h-8" />
        </div>

        <nav className="flex-1 space-y-2 transition-colors duration-500 ease-in-out">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg transition duration-200 ${
                  isActive
                    ? 'bg-nexus-primary/10 text-white font-semibold'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <img
                src={location.pathname === item.path ? item.iconFilled : item.iconOutlined}
                alt=""
                className="w-6 h-6"
              />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:bg-red-900/30 hover:text-red-400 transition duration-200 mt-8"
        >
          <img src={LogoutOutlinedSvg} alt="Logout" className="w-6 h-6" />
          <span className="font-medium">Logout</span>
        </button>
      </aside>

      <main className="flex-1 p-8 transition-colors duration-500 ease-in-out">
        <header className="flex justify-between items-center pb-6 mb-8 border-b border-gray-800 transition-colors duration-500 ease-in-out">
          <div>
            <h1 className="text-3xl font-bold text-white">Hello {userName} 👋</h1>
            <p className="text-gray-400">Nexus Admin Dashboard</p>
          </div>
          <div className="flex items-center space-x-4">
            {showSearch && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm || ''}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-nexus-primary text-gray-100 placeholder:text-gray-500"
                />
                <img
                  src={SearchOutlinedSvg}
                  alt="Search"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 opacity-70"
                />
              </div>
            )}
            <button
              type="button"
              onClick={() => navigate('/admin/settings')}
              className="relative w-10 h-10 rounded-full bg-gray-800 overflow-hidden border border-gray-700 focus:outline-none focus:ring-2 focus:ring-nexus-primary"
            >
              <img
                src={profilePicture}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = DEFAULT_AVATAR;
                }}
              />
            </button>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
};

export default AdminLayiutDark;
