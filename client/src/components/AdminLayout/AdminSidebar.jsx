import React, { useCallback } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import nexusLogo from '../../assets/nexus-logo.svg';
import DashboardFilledSvg from '../../assets/icons/dashboard_filled.svg';
import DashboardOutlinedSvg from '../../assets/icons/dashboard_outlined.svg';
import EventFilledSvg from '../../assets/icons/event_filled.svg';
import EventOutlined2Svg from '../../assets/icons/event_outlined2.svg';
import UserFilledSvg from '../../assets/icons/user_filled.svg';
import UserOutlinedSvg from '../../assets/icons/user_outlined.svg';
import SettingsFilledSvg from '../../assets/icons/settings_filled.svg';
import SettingsOutlinedSvg from '../../assets/icons/settings_outlined.svg';
import LogoutOutlinedSvg from '../../assets/icons/logout_outlined.svg';

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard', iconOutlined: DashboardOutlinedSvg, iconFilled: DashboardFilledSvg },
  { name: 'Users', path: '/admin/users', iconOutlined: UserOutlinedSvg, iconFilled: UserFilledSvg },
  { name: 'Events', path: '/admin/events', iconOutlined: EventOutlined2Svg, iconFilled: EventFilledSvg },
  { name: 'Settings', path: '/admin/settings', iconOutlined: SettingsOutlinedSvg, iconFilled: SettingsFilledSvg },
];

const AdminSidebar = ({ isOpen = false, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/sign-in');
    onClose?.();
  }, [navigate, onClose]);

  const handleNavClick = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const sidebarClasses = `fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col border-r border-gray-200 bg-white p-6 shadow-lg transition-transform duration-300 dark:border-gray-800 dark:bg-slate-900 md:relative md:z-auto md:translate-x-0 md:shadow-sm md:transition-none ${
    isOpen ? 'translate-x-0' : '-translate-x-full'
  }`;

  return (
    <aside className={sidebarClasses} aria-label="Admin navigation sidebar">
      <div className="mb-8 flex items-center justify-between gap-3 pl-1 pr-1 md:pl-2 md:pr-0">
        <img src={nexusLogo} alt="Nexus Logo" className="h-8" />
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-slate-900 dark:text-gray-300 dark:hover:bg-slate-800 md:hidden"
          aria-label="Close sidebar"
        >
          <span className="text-xl">×</span>
        </button>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={handleNavClick}
              className={`flex items-center gap-3 rounded-lg p-3 text-sm font-medium transition duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-slate-800'
              }`}
            >
              <img src={isActive ? item.iconFilled : item.iconOutlined} alt="" className="h-6 w-6" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-8 flex items-center gap-3 rounded-lg p-3 text-sm font-medium text-gray-600 transition duration-200 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
      >
        <img src={LogoutOutlinedSvg} alt="Logout" className="h-6 w-6" />
        <span>Logout</span>
      </button>
    </aside>
  );
};

export default AdminSidebar;
