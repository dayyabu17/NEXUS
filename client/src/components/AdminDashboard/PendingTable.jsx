import React from 'react';
import { Link } from 'react-router-dom';

const PendingTable = ({ events = [], handleDelete }) => {
  const hasEvents = Array.isArray(events) && events.length > 0;

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg transition-colors duration-300 dark:border-gray-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-nexus-dark dark:text-white">Pending Events for Approval</h2>
      </div>

      {hasEvents ? (
        <>
          <div className="mt-6 space-y-4 md:hidden">
            {events.map((event) => {
              const organizerName = event?.organizer?.organizationName || event?.organizer?.name || 'Unknown';
              const formattedDate = event?.date ? new Date(event.date).toLocaleDateString() : 'TBA';

              return (
                <article
                  key={event?._id || `${organizerName}-${formattedDate}`}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-colors duration-300 dark:border-gray-800 dark:bg-slate-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      {event?.title || 'Untitled Event'}
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 text-xs font-semibold leading-5 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200">
                      Pending
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{organizerName}</p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{formattedDate}</span>
                    <div className="flex items-center gap-4">
                      <Link
                        to={`/admin/events/${event?._id}`}
                        className="font-medium text-nexus-primary transition-colors hover:text-blue-900 dark:hover:text-blue-300"
                      >
                        View Details
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete?.(event?._id)}
                        className="font-medium text-red-600 transition-colors hover:text-red-800 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="hidden md:block">
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:bg-slate-800/50 dark:text-gray-400">
                  <tr>
                    <th className="px-6 py-3">Event Name</th>
                    <th className="px-6 py-3">Organization</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-transparent">
                  {events.map((event) => {
                    const organizerName = event?.organizer?.organizationName || event?.organizer?.name || 'Unknown';
                    const formattedDate = event?.date ? new Date(event.date).toLocaleDateString() : 'TBA';

                    return (
                      <tr
                        key={event?._id || `${organizerName}-${formattedDate}`}
                        className="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{event?.title || 'Untitled Event'}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{organizerName}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{formattedDate}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 text-xs font-semibold leading-5 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200">
                            Pending
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex items-center gap-4">
                            <Link
                              to={`/admin/events/${event?._id}`}
                              className="text-nexus-primary transition-colors hover:text-blue-900 dark:hover:text-blue-300"
                            >
                              View Details
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDelete?.(event?._id)}
                              className="text-red-600 transition-colors hover:text-red-800 dark:hover:text-red-300"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
          No events currently pending approval. All caught up! 🎉
        </p>
      )}
    </div>
  );
};

export default PendingTable;
