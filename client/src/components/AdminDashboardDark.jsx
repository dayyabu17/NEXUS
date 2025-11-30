import React from 'react';
import { Link } from 'react-router-dom';
import AdminLayiutDark from './AdminLayiutDark';

const AdminDashboardDark = ({ statsDisplay, events, loading, error }) => {
  if (loading) {
    return (
      <AdminLayiutDark>
        <div className="text-center py-10 text-gray-300 transition-colors duration-500 ease-in-out">
          Loading Admin Data...
        </div>
      </AdminLayiutDark>
    );
  }

  return (
    <AdminLayiutDark>
      {error && (
        <div className="bg-red-900/40 border border-red-700/60 text-red-200 px-4 py-3 rounded mb-6 text-base transition-colors duration-500 ease-in-out">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 transition-colors duration-500 ease-in-out">
        {statsDisplay.map((stat) => (
          <div
            key={stat.name}
            className="bg-gray-900/70 backdrop-blur-sm p-6 rounded-lg border border-gray-800 shadow shadow-black/30 transition-colors duration-500 ease-in-out"
          >
            <p className="text-gray-400 text-sm">{stat.name}</p>
            <p className="text-3xl font-bold text-white mt-1">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900/70 backdrop-blur-sm p-6 rounded-lg border border-gray-800 shadow shadow-black/30 transition-colors duration-500 ease-in-out">
        <h2 className="text-xl font-semibold text-white mb-4">Pending Events for Approval</h2>

        {events.length === 0 ? (
          <p className="text-gray-400 py-6 text-center">No events currently pending approval. All caught up! 🎉</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-900/80">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Event Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-gray-950/40 divide-y divide-gray-800">
                {events.map((event) => (
                  <tr key={event._id} className="hover:bg-gray-900/60 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{event.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {event.organizer.organizationName || event.organizer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(event.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-900/40 text-yellow-300">
                        Pending
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/admin/events/${event._id}`}
                        className="text-nexus-primary hover:text-white font-medium transition-colors duration-200"
                      >
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
    </AdminLayiutDark>
  );
};

export default AdminDashboardDark;
