import React from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import EventManagementDark from './EventManagementDark';
import useAdminTheme from '../hooks/useAdminTheme';
import useEventManagementState from '../hooks/useEventManagementState';

const EventManagementLight = ({
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
    <AdminLayout searchTerm={searchTerm}>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transition-colors duration-500 ease-in-out">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-xl font-semibold text-nexus-dark">All Events Management</h2>

                <div className="flex flex-wrap gap-3">
                    <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nexus-primary"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>

                    <select
                        value={categoryFilter}
                        onChange={(event) => setCategoryFilter(event.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nexus-primary"
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
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nexus-primary"
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
                            className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <p className="text-center py-10 text-gray-500">Loading events...</p>
            ) : error ? (
                <p className="text-red-500 text-center py-10">{error}</p>
            ) : filteredEvents.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <p className="mb-2 text-lg">No events found.</p>
                    <p className="text-sm">Try adjusting your filters or search terms.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organizer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredEvents.map((event) => (
                                <tr key={event._id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{event.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">{event.category || 'N/A'}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                        {event.organizer?.organizationName || event.organizer?.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                        {new Date(event.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                event.status === 'approved'
                                                    ? 'bg-green-100 text-green-800'
                                                    : event.status === 'rejected'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}
                                        >
                                            {event.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/admin/events/${event._id}`} className="text-nexus-primary hover:text-blue-900 mr-4">
                                            View Details
                                        </Link>
                                        <button onClick={() => handleDelete(event._id)} className="text-red-600 hover:text-red-900">
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
    </AdminLayout>
);

const EventManagement = ({ searchTerm }) => {
    const { theme } = useAdminTheme();
    const state = useEventManagementState(searchTerm);

    if (theme === 'dark') {
        return <EventManagementDark searchTerm={searchTerm} {...state} />;
    }

    return <EventManagementLight searchTerm={searchTerm} {...state} />;
};

export default EventManagement;