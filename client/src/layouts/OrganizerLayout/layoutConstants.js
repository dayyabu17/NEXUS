import DashboardActiveIcon from '../../assets/icons/dashboard_active.svg';
import DashboardInactiveIcon from '../../assets/icons/dashboard_notactive.svg';
import EventActiveIcon from '../../assets/icons/event_active.svg';
import EventInactiveIcon from '../../assets/icons/event_notactive.svg';
import EarningActiveIcon from '../../assets/icons/earning_active.svg';
import EarningInactiveIcon from '../../assets/icons/earning_notactive.svg';

export const NAV_ITEMS = [
  {
    label: 'Dashboard',
    iconActive: DashboardActiveIcon,
    iconInactive: DashboardInactiveIcon,
    path: '/organizer/dashboard',
  },
  {
    label: 'Events',
    iconInactive: EventInactiveIcon,
    iconActive: EventActiveIcon,
    path: '/organizer/events',
  },
  {
    label: 'Earnings',
    iconInactive: EarningInactiveIcon,
    iconActive: EarningActiveIcon,
    path: '/organizer/earnings',
  },
];

export const NOTIFICATION_ANIMATION_MS = 280;
