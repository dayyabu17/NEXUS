import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// --- 1. Lazy Imports (Code Splitting) ---
// This tells Vite: "Don't bundle this code into the main file. Keep it separate."

const SignIn = lazy(() => import('./components/SignIn'));
const SignUp = lazy(() => import('./components/SignUp'));

// Admin Components
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const AdminEventDetails = lazy(() => import('./components/AdminEventDetails'));
const EventDetails = lazy(() => import('./pages/EventDetails'));
const UserManagement = lazy(() => import('./components/UserManagement'));
const EventManagement = lazy(() => import('./components/EventManagement'));
const Settings = lazy(() => import('./components/Settings'));

// Organizer Components
const OrganizerDashboard = lazy(() => import('./components/OrganizerDashboard'));
const OrganizerEvents = lazy(() => import('./components/OrganizerEvents'));
const OrganizerEarnings = lazy(() => import('./components/OrganizerEarnings'));
const OrganizerCreateEvent = lazy(() => import('./components/OrganizerCreateEvent/index.js'));
const OrganizerEventView = lazy(() => import('./components/OrganizerEventView'));
const OrganizerAccount = lazy(() => import('./pages/OrganizerAccount'));
const OrganizerPreferences = lazy(() => import('./components/OrganizerPreferences'));
const OrganizerNotifications = lazy(() => import('./components/OrganizerNotifications'));

// Guest Components
const GuestDashboard = lazy(() => import('./pages/GuestDashboard'));
const GuestMap = lazy(() => import('./components/GuestMap'));
const GuestNotifications = lazy(() => import('./components/GuestNotifications'));
const PaymentCallback = lazy(() => import('./components/PaymentCallback'));
const MyTickets = lazy(() => import('./pages/MyTickets')); // Note: This was in /pages
const GuestProfile = lazy(() => import('./pages/GuestProfile'));
const GuestEvents = lazy(() => import('./pages/GuestEvents')); // Note: This was in /pages

// --- 2. Loading Fallback Component ---
// This shows while the browser fetches the specific page chunk
const LoadingFallback = () => (
  <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
    <div className="flex flex-col items-center gap-4">
      {/* You can replace this with your Nexus Logo or a Spinner */}
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      <p className="font-medium text-slate-600 dark:text-slate-300">Loading Nexus...</p>
    </div>
  </div>
);

function App() {
  return (
    // 3. Wrap Routes in Suspense
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} /> 
        <Route path="/admin/events/:id" element={<AdminEventDetails />} /> 
        <Route path="/admin/users" element={<UserManagement />} /> 
        <Route path="/admin/events" element={<EventManagement />} /> 
        <Route path="/admin/settings" element={<Settings />} />

        {/* Organizer Routes */}
        <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
        <Route path="/organizer/events" element={<OrganizerEvents />} />
        <Route path="/organizer/events/create" element={<OrganizerCreateEvent />} />
        <Route path="/organizer/events/:id" element={<OrganizerEventView />} />
        <Route path="/organizer/earnings" element={<OrganizerEarnings />} />
        <Route path="/organizer/account" element={<OrganizerAccount />} />
        <Route path="/organizer/preferences" element={<OrganizerPreferences />} />
        <Route path="/organizer/settings" element={<OrganizerAccount />} />
        <Route path="/organizer/notifications" element={<OrganizerNotifications />} />

        {/* Guest Routes */}
        <Route path="/guest/dashboard" element={<GuestDashboard />} />
        <Route path="/guest/map" element={<GuestMap />} />
        <Route path="/guest/notifications" element={<GuestNotifications />} />
        <Route path="/guest/tickets" element={<MyTickets />} />
        <Route path="/guest/events" element={<GuestEvents />} />
        <Route path="/guest/profile" element={<GuestProfile />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/payment/callback" element={<PaymentCallback />} />
        <Route path="/dashboard" element={<GuestDashboard />} /> 
        <Route path="/" element={<SignIn />} />
      </Routes>
    </Suspense>
  );
}

export default App;