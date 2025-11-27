import { Routes, Route } from 'react-router-dom';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import AdminDashboard from './components/AdminDashboard';
import AdminEventDetails from './components/AdminEventDetails';
import EventDetails from './components/EventDetails';
import UserManagement from './components/UserManagement';
import EventManagement from './components/EventManagement';
import Settings from './components/Settings';
import OrganizerDashboard from './components/OrganizerDashboard';
import OrganizerEvents from './components/OrganizerEvents';
import OrganizerEarnings from './components/OrganizerEarnings';
import OrganizerCreateEvent from './components/OrganizerCreateEvent';
import OrganizerEventView from './components/OrganizerEventView';
import OrganizerPreferences from './components/OrganizerPreferences';
import OrganizerNotifications from './components/OrganizerNotifications';
import GuestDashboard from './components/GuestDashboard';
import GuestMap from './components/GuestMap';
import PaymentCallback from './components/PaymentCallback';
import MyTickets from './pages/MyTickets';

function App() {
  return (
    <Routes>
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} /> 
      <Route path="/admin/events/:id" element={<AdminEventDetails />} /> 
      <Route path="/admin/users" element={<UserManagement />} /> 
      <Route path="/admin/events" element={<EventManagement />} /> 
      <Route path="/admin/settings" element={<Settings />} />

      <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
      <Route path="/organizer/events" element={<OrganizerEvents />} />
      <Route path="/organizer/events/create" element={<OrganizerCreateEvent />} />
      <Route path="/organizer/events/:id" element={<OrganizerEventView />} />
      <Route path="/organizer/earnings" element={<OrganizerEarnings />} />
      <Route path="/organizer/settings" element={<OrganizerPreferences />} />
      <Route path="/organizer/notifications" element={<OrganizerNotifications />} />

      <Route path="/guest/dashboard" element={<GuestDashboard />} />
      <Route path="/guest/map" element={<GuestMap />} />
      <Route path="/guest/tickets" element={<MyTickets />} />
      <Route path="/events/:id" element={<EventDetails />} />
      <Route path="/payment/callback" element={<PaymentCallback />} />
      <Route path="/dashboard" element={<GuestDashboard />} /> 
      <Route path="/" element={<SignIn />} />
    </Routes>
  );
}

export default App;