import React from 'react';
import { Link } from 'react-router-dom';

const badgeVariants = {
  approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
};

const getBadgeClassName = (status = 'pending') => badgeVariants[status] || badgeVariants.pending;

const EventTable = ({ events = [], loading, error, handleDelete }) => {
  if (loading) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-600 shadow-sm transition-colors duration-300 dark:border-gray-800 dark:bg-slate-900 dark:text-gray-300">
        Loading events…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center text-sm text-red-700 transition-colors duration-300 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-200">
        {error}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-600 shadow-sm transition-colors duration-300 dark:border-gray-800 dark:bg-slate-900 dark:text-gray-300">
        <p className="mb-2 text-lg font-semibold text-nexus-dark dark:text-white">No events found.</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white shadow-sm transition-colors duration-300 dark:border-gray-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-slate-800/50">
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Organizer</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-transparent">
            {events.map((event) => {
              const organizerName = event?.organizer?.organizationName || event?.organizer?.name || 'Unknown';
              const eventDate = event?.date ? new Date(event.date).toLocaleDateString() : 'TBA';
              const badgeClassName = getBadgeClassName(event?.status);

              return (
                <tr key={event?._id} className="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{event?.title || 'Untitled Event'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-slate-800 dark:text-gray-200">
                      {event?.category || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{organizerName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{eventDate}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2 text-xs font-semibold leading-5 ${badgeClassName}`}>
                      {event?.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <Link
                      to={`/admin/events/${event?._id}`}
                      className="text-nexus-primary transition-colors hover:text-blue-900 dark:hover:text-blue-300"
                    >
                      View Details
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete?.(event?._id)}
                      className="ml-4 text-red-600 transition-colors hover:text-red-800 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventTable;
