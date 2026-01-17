import { Suspense, lazy } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';

// --- 1. Lazy Imports (Code Splitting) ---
// This tells Vite: "Don't bundle this code into the main file. Keep it separate."

const SignIn = lazy(() => import('./pages/Auth/SignIn'));
const SignUp = lazy(() => import('./pages/Auth/SignUp'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const OnboardingInterests = lazy(() => import('./pages/OnboardingInterests'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminEventDetails = lazy(() => import('./pages/AdminEventDetails'));
const EventDetails = lazy(() => import('./pages/EventDetails'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const EventManagement = lazy(() => import('./pages/EventManagement'));
const Settings = lazy(() => import('./pages/Settings'));

// Organizer Pages via barrel loader
const loadOrganizerPage = (exportName) =>
  lazy(() =>
    import('./pages/organizer').then((module) => {
      const page = module[exportName];
      if (!page) {
        throw new Error(`Organizer page export "${exportName}" not found.`);
      }
      return { default: page };
    }),
  );

const OrganizerDashboard = loadOrganizerPage('OrganizerDashboardPage');
const OrganizerEvents = loadOrganizerPage('OrganizerEventsPage');
const OrganizerEarnings = loadOrganizerPage('OrganizerEarningsPage');
const OrganizerCreateEvent = loadOrganizerPage('OrganizerCreateEventPage');
const OrganizerEventView = loadOrganizerPage('OrganizerEventDetailsPage');
const OrganizerAccount = loadOrganizerPage('OrganizerAccountPage');
const OrganizerPreferences = loadOrganizerPage('OrganizerPreferencesPage');
const OrganizerNotifications = loadOrganizerPage('OrganizerNotificationsPage');

// Guest Components
const GuestDashboard = lazy(() => import('./pages/GuestDashboard'));
const GuestMap = lazy(() => import('./pages/GuestMap'));
const GuestNotifications = lazy(() => import('./components/GuestNotifications'));
const PaymentCallback = lazy(() => import('./pages/PaymentCallback'));
const MyTickets = lazy(() => import('./pages/MyTickets')); // Note: This was in /pages
const GuestProfile = lazy(() => import('./pages/GuestProfile'));
const GuestEvents = lazy(() => import('./pages/GuestEvents')); // Note: This was in /pages
const GuestInfo = lazy(() => import('./pages/GuestInfo'));

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

const RouteLoadingFallback = ({ label }) => (
  <div className="flex min-h-[60vh] items-center justify-center bg-transparent text-slate-600 dark:text-slate-300">
    <div className="flex flex-col items-center gap-3">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      <p className="text-sm font-medium">{label}</p>
    </div>
  </div>
);

function App() {
  return (
    // 3. Wrap Routes in Suspense
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/landingpage" element={<LandingPage />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/onboarding/interests" element={<OnboardingInterests />} />
        <Route path="/u/:userId" element={<GuestInfo />} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} /> 
        <Route path="/admin/events/:id" element={<AdminEventDetails />} /> 
        <Route path="/admin/users" element={<UserManagement />} /> 
        <Route path="/admin/events" element={<EventManagement />} /> 
        <Route path="/admin/settings" element={<Settings />} />

        {/* Organizer Routes */}
        <Route
          path="/organizer"
          element={
            <Suspense fallback={<RouteLoadingFallback label="Loading organizer workspace..." />}>
              <Outlet />
            </Suspense>
          }
        >
          <Route path="dashboard" element={<OrganizerDashboard />} />
          <Route path="events" element={<OrganizerEvents />} />
          <Route path="events/create" element={<OrganizerCreateEvent />} />
          <Route path="events/:id" element={<OrganizerEventView />} />
          <Route path="earnings" element={<OrganizerEarnings />} />
          <Route path="account" element={<OrganizerAccount />} />
          <Route path="preferences" element={<OrganizerPreferences />} />
          <Route path="settings" element={<OrganizerAccount />} />
          <Route path="notifications" element={<OrganizerNotifications />} />
        </Route>

        {/* Guest Routes */}
        <Route
          path="/guest"
          element={
            <Suspense fallback={<RouteLoadingFallback label="Loading guest experience..." />}>
              <Outlet />
            </Suspense>
          }
        >
          <Route path="dashboard" element={<GuestDashboard />} />
          <Route path="map" element={<GuestMap />} />
          <Route path="notifications" element={<GuestNotifications />} />
          <Route path="tickets" element={<MyTickets />} />
          <Route path="events" element={<GuestEvents />} />
          <Route path="profile" element={<GuestProfile />} />
        </Route>
        <Route path="/guest/info/:userId" element={<GuestInfo />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/payment/callback" element={<PaymentCallback />} />
        <Route path="/dashboard" element={<GuestDashboard />} /> 
        <Route path="/" element={<SignIn />} />
      </Routes>
    </Suspense>
  );
}

export default App;