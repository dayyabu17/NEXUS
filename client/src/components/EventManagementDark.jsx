import React from 'react';
import { Link } from 'react-router-dom';
import AdminLayiutDark from './AdminLayiutDark';

const EventManagementDark = ({
  searchTerm,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  organizerFilter,
  setOrganizerFilter,
  uniqueCategories,
  uniqueOrganizers,
  clearFilters,
  loading,
  error,
  filteredEvents,
  handleDelete,
}) => (
  <AdminLayiutDark searchTerm={searchTerm}>
    <div className="bg-gray-900/70 backdrop-blur-sm p-6 rounded-lg border border-gray-800 shadow shadow-black/30 transition-colors duration-500 ease-in-out">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-white">All Events Management</h2>

        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="px-3 py-2 border border-gray-700 bg-gray-900 text-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nexus-primary transition-colors duration-500 ease-in-out"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="px-3 py-2 border border-gray-700 bg-gray-900 text-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nexus-primary transition-colors duration-500 ease-in-out"
          >
            <option value="">All Categories</option>
            {uniqueCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={organizerFilter}
            onChange={(event) => setOrganizerFilter(event.target.value)}
            className="px-3 py-2 border border-gray-700 bg-gray-900 text-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nexus-primary transition-colors duration-500 ease-in-out"
          >
            <option value="">All Organizers</option>
            {uniqueOrganizers.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>

          {(statusFilter || categoryFilter || organizerFilter) && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-red-300 hover:bg-red-900/40 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-center py-10 text-gray-400">Loading events...</p>
      ) : error ? (
        <p className="text-red-300 text-center py-10">{error}</p>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <p className="mb-2 text-lg">No events found.</p>
          <p className="text-sm">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-900/80">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Organizer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-gray-950/40 divide-y divide-gray-800">
              {filteredEvents.map((event) => (
                <tr key={event._id} className="hover:bg-gray-900/60 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-100">{event.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    <span className="bg-gray-800/70 px-2 py-1 rounded text-xs text-gray-200">
                      {event.category || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                    {event.organizer?.organizationName || event.organizer?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                    {new Date(event.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        event.status === 'approved'
                          ? 'bg-emerald-900/40 text-emerald-300'
                          : event.status === 'rejected'
                          ? 'bg-red-900/40 text-red-300'
                          : 'bg-yellow-900/40 text-yellow-300'
                      }`}
                    >
                      {event.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/admin/events/${event._id}`}
                      className="text-nexus-primary hover:text-white mr-4 transition-colors duration-200"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="text-red-300 hover:text-red-100 transition-colors duration-200"
                    >
                      Delete
                    </button>
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

export default EventManagementDark;
