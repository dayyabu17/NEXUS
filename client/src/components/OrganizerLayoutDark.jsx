import React, { useEffect, useState } from 'react';
import nexusIcon from '../assets/icons/nexus-icon.svg';
import DashboardActiveIcon from '../assets/icons/dashboard_active.svg';
import EventInactiveIcon from '../assets/icons/event_notactive.svg';
import EarningInactiveIcon from '../assets/icons/earning_notactive.svg';
import searchIcon from '../assets/icons/search.svg';
import bellIcon from '../assets/icons/Bell.svg';

const avatarImage = '/images/default-avatar.jpeg';

const formatTime = (date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const isPM = hours >= 12;
  const displayHour = hours % 12 || 12;

  const offsetMinutesTotal = -date.getTimezoneOffset();
  const offsetSign = offsetMinutesTotal >= 0 ? '+' : '-';
  const offsetHours = Math.floor(Math.abs(offsetMinutesTotal) / 60);
  const offsetMinutes = Math.abs(offsetMinutesTotal) % 60;
  const offsetSuffix = offsetMinutes === 0
    ? `${offsetHours}`
    : `${offsetHours}:${offsetMinutes.toString().padStart(2, '0')}`;

  return `${displayHour}:${minutes}${isPM ? 'PM' : 'AM'} GMT${offsetSign}${offsetSuffix}`;
};

const OrganizerLayoutDark = ({ children, activeNav = 'Dashboard' }) => {
  const [currentTime, setCurrentTime] = useState(() => formatTime(new Date()));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(formatTime(new Date()));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const navItems = [
    {
      label: 'Dashboard',
      key: 'Dashboard',
      iconActive: DashboardActiveIcon,
      iconInactive: DashboardActiveIcon,
    },
    {
      label: 'Events',
      key: 'Events',
      iconInactive: EventInactiveIcon,
    },
    {
      label: 'Earnings',
      key: 'Earnings',
      iconInactive: EarningInactiveIcon,
    },
  ];

  return (
    <div
      className="min-h-screen w-full bg-gradient-to-b from-[#0A121E] via-[#050912] to-[#020305] text-white"
      data-name="Organizer_Layout_Dark"
      data-node-id="138:24"
    >
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0A0F16]/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1455px] items-center justify-between px-10 py-6" data-node-id="173:25">
          <div className="flex flex-1 items-center gap-16" data-node-id="158:95">
          <img src={nexusIcon} alt="Nexus" className="h-8 w-8" data-node-id="143:48" />

          <nav className="flex items-center gap-6" data-node-id="156:81">
            {navItems.map(({ label, key, iconActive, iconInactive }) => {
              const isActive = key === activeNav;
              const iconSrc = isActive ? iconActive ?? iconInactive : iconInactive ?? iconActive;
              return (
                <button
                  key={label}
                  type="button"
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    isActive ? 'text-white' : 'text-[#7d7d7d] hover:text-white'
                  }`}
                  data-node-id={label === 'Dashboard' ? '156:69' : label === 'Events' ? '156:74' : '156:80'}
                >
                  {iconSrc && (
                    <img
                      src={iconSrc}
                      alt={`${label} icon`}
                      className="h-6 w-6"
                      data-node-id={label === 'Dashboard' ? '156:65' : label === 'Events' ? '156:57' : '156:67'}
                    />
                  )}
                  <span>{label}</span>
                  {isActive && <span className="sr-only">(current)</span>}
                </button>
              );
            })}
          </nav>
        </div>

          <div className="flex items-center gap-4 text-sm" data-node-id="158:93">
          <span className="text-[#acacac]" data-node-id="156:85">
            {currentTime}
          </span>
          <a
            href="#"
            className="font-medium text-white transition-colors hover:text-[#a2cbff]"
            data-node-id="156:84"
          >
            Create Event
          </a>
          <img src={searchIcon} alt="Search" className="h-6 w-6 opacity-70" data-node-id="156:82" />
          <img src={bellIcon} alt="Notifications" className="h-5 w-5 opacity-70" data-node-id="158:89" />
          <div className="h-10 w-10 overflow-hidden rounded-full border border-white/20" data-node-id="156:88">
            <img src={avatarImage} alt="Profile" className="h-full w-full object-cover" />
          </div>
        </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1455px] px-10 pb-16 pt-28">
        {children}
      </main>
    </div>
  );
};

export default OrganizerLayoutDark;
