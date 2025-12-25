import DashboardFilledSvg from '../assets/icons/dashboard_filled.svg';
import DashboardOutlinedSvg from '../assets/icons/dashboard_outlined.svg';
import EventFilledSvg from '../assets/icons/event_filled.svg';
import EventOutlined2Svg from '../assets/icons/event_outlined2.svg';
import UserFilledSvg from '../assets/icons/user_filled.svg';
import UserOutlinedSvg from '../assets/icons/user_outlined.svg';
import SettingsFilledSvg from '../assets/icons/settings_filled.svg';
import SettingsOutlinedSvg from '../assets/icons/settings_outlined.svg';
import DashboardActiveIcon from '../assets/icons/dashboard_active.svg';
import DashboardInactiveIcon from '../assets/icons/dashboard_notactive.svg';
import EventActiveIcon from '../assets/icons/event_active.svg';
import EventInactiveIcon from '../assets/icons/event_notactive.svg';
import EarningActiveIcon from '../assets/icons/earning_active.svg';
import EarningInactiveIcon from '../assets/icons/earning_notactive.svg';

export const ADMIN_NAV_ITEMS = [
  { name: 'Dashboard', path: '/admin/dashboard', iconOutlined: DashboardOutlinedSvg, iconFilled: DashboardFilledSvg },
  { name: 'Users', path: '/admin/users', iconOutlined: UserOutlinedSvg, iconFilled: UserFilledSvg },
  { name: 'Events', path: '/admin/events', iconOutlined: EventOutlined2Svg, iconFilled: EventFilledSvg },
  { name: 'Settings', path: '/admin/settings', iconOutlined: SettingsOutlinedSvg, iconFilled: SettingsFilledSvg },
];

export const ORGANIZER_NAV_ITEMS = [
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
