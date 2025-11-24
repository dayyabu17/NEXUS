import { Routes, Route } from 'react-router-dom';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import AdminDashboard from './components/AdminDashboard';
import EventDetails from './components/EventDetails'; 
import UserManagement from './components/UserManagement';
import EventManagement from './components/EventManagement';
import Settings from './components/Settings';

/**
 * Main Application Component.
 * Defines the routing structure of the application using `react-router-dom`.
 *
 * @component
 * @returns {JSX.Element} The rendered application component with routes.
 */
function App() {
  return (
    <Routes>
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} /> 
      <Route path="/admin/events/:id" element={<EventDetails />} /> 
      <Route path="/admin/users" element={<UserManagement />} /> 
      <Route path="/admin/events" element={<EventManagement />} /> 
      <Route path="/admin/settings" element={<Settings />} />

      <Route path="/dashboard" element={<div>User Dashboard Placeholder</div>} /> 
      <Route path="/" element={<SignIn />} />
    </Routes>
  );
}

export default App;
