import React from 'react';

const selectClassName =
  'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-nexus-primary focus:outline-none focus:ring-2 focus:ring-nexus-primary dark:border-gray-700 dark:bg-slate-800 dark:text-white';

const EventFilters = ({
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  organizerFilter,
  setOrganizerFilter,
  uniqueCategories = [],
  uniqueOrganizers = [],
  clearFilters,
}) => {
  const showClear = Boolean(statusFilter || categoryFilter || organizerFilter);

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-gray-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-semibold text-nexus-dark dark:text-white">All Events Management</h2>
        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className={selectClassName}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className={selectClassName}
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
            className={selectClassName}
          >
            <option value="">All Organizers</option>
            {uniqueOrganizers.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>

          {showClear && (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/30"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventFilters;
