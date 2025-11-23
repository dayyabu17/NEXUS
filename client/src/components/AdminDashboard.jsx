import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import api from '../api/axios'; // Our configured Axios instance
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    totalUsers: 0,
    totalOrganizers: 0,
    totalEvents: 0,
  });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to fetch all dashboard data
    const fetchAdminData = async () => {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/sign-in');
        return;
      }
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`, // Include the JWT for protection
        },
      };

      try {
        // --- 1. Fetch Stats ---
        const statsResponse = await api.get('/admin/stats', config);
        setStats(statsResponse.data);

        // --- 2. Fetch Pending Events List ---
        const eventsResponse = await api.get('/admin/events/pending', config);
        setEvents(eventsResponse.data);

      } catch (err) {
        console.error("Failed to fetch admin data:", err);
        // If the error is 401 (Unauthorized) or 403 (Forbidden), redirect to login
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/sign-in');
        }
        setError('Error loading dashboard data. Check server connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [navigate]);
  
  // Array to map stats object to component design (we use the actual state data now)
  const statsDisplay = [
    { name: 'Pending Approvals', value: stats.pendingApprovals },
    { name: 'Total Users', value: stats.totalUsers },
    { name: 'Total Organizers', value: stats.totalOrganizers },
    { name: 'Total Events', value: stats.totalEvents },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-10">Loading Admin Data...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-base">
          {error}
        </div>
      )}
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsDisplay.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-500 text-sm">{stat.name}</p>
            <p className="text-3xl font-bold text-nexus-dark mt-1">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Events Table */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-nexus-dark mb-4">Pending Events for Approval</h2>
        
        {events.length === 0 ? (
            <p className="text-gray-500 py-6 text-center">No events currently pending approval. All caught up! 🎉</p>
        ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.map((event) => (
                    <tr key={event._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.organizer.organizationName || event.organizer.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {/* We will implement the actual approval action next */}
                       <Link to={`/admin/events/${event._id}`} className="text-nexus-primary hover:text-blue-900 font-medium">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;