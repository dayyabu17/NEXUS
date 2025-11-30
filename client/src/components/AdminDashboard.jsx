import React from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import AdminDashboardDark from './AdminDashboardDark';
import useAdminTheme from '../hooks/useAdminTheme';
import useAdminDashboardData from '../hooks/useAdminDashboardData';

const AdminDashboardLight = ({ statsDisplay, events, loading, error }) => {
  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-10 transition-colors duration-500 ease-in-out">Loading Admin Data...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-base transition-colors duration-500 ease-in-out">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 transition-colors duration-500 ease-in-out">
        {statsDisplay.map((stat) => (
          <div
            key={stat.name}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transition-colors duration-500 ease-in-out"
          >
            <p className="text-gray-500 text-sm">{stat.name}</p>
            <p className="text-3xl font-bold text-nexus-dark mt-1">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transition-colors duration-500 ease-in-out">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.organizer.organizationName || event.organizer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(event.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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

const AdminDashboard = () => {
  const { theme } = useAdminTheme();
  const data = useAdminDashboardData();

  if (theme === 'dark') {
    return <AdminDashboardDark {...data} />;
  }

  return <AdminDashboardLight {...data} />;
};

export default AdminDashboard;