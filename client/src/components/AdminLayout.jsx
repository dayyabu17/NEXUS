import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import nexusLogo from '../assets/nexus-logo.svg'; 

// --- ICONS ---
import DashboardFilledSvg from '../assets/icons/dashboard_filled.svg'; 
import DashboardOutlinedSvg from '../assets/icons/dashboard_outlined.svg'; 
import EventFilledSvg from '../assets/icons/event_filled.svg'; 
// import EventOutlinedSvg from '../assets/icons/event_outlined.svg';
import UserFilledSvg from '../assets/icons/user_filled.svg'; 
import UserOutlinedSvg from '../assets/icons/user_outlined.svg'; 
import SettingsFilledSvg from '../assets/icons/settings_filled.svg'; 
import SettingsOutlinedSvg from '../assets/icons/settings_outlined.svg'; 
import SearchOutlinedSvg from '../assets/icons/search_outlined.svg'; 
import LogoutOutlinedSvg from '../assets/icons/logout_outlined.svg'; 
import Event2OutlinedSvg from '../assets/icons/event2_outlined.svg';

const getInitialUserName = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user).name : 'Admin';
};

const DEFAULT_AVATAR = '/images/default-avatar.jpeg';

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

const AdminLayout = ({ children, searchTerm, onSearchChange }) => {
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

  // Only show search bar if the parent component passed an onSearchChange function
  const showSearch = typeof onSearchChange === 'function';

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Sidebar - FIXED: Now White background with border */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-10 pl-2">
          {/* Only the Logo Image, Text Removed */}
          <img src={nexusLogo} alt="Nexus Logo" className="h-8" />
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg transition duration-200 
                ${isActive 
                    ? 'bg-blue-50 text-nexus-primary font-semibold' // Active: Light Blue BG, Blue Text
                    : 'text-gray-600 hover:bg-gray-50'}`             // Inactive: Grey Text
              }
            >
              <img src={location.pathname === item.path ? item.iconFilled : item.iconOutlined} alt="" className="w-6 h-6" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition duration-200 mt-8"
        >
          <img src={LogoutOutlinedSvg} alt="Logout" className="w-6 h-6" />
          <span className="font-medium">Logout</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center pb-6 mb-8 border-b border-gray-200">
          <div>
             <h1 className="text-3xl font-bold text-nexus-dark">Hello {userName} 👋</h1>
             <p className="text-gray-500">Nexus Admin Dashboard</p>
          </div>
          <div className="flex items-center space-x-4">
            {showSearch && (
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm || ''}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-nexus-primary"
                    />
                    <img src={SearchOutlinedSvg} alt="Search" className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                </div>
            )}
            <div className="relative w-10 h-10 rounded-full bg-gray-300 overflow-hidden border border-gray-200">
                <img 
                    src={profilePicture} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                    onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR; }}
                />
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
};

export default AdminLayout;