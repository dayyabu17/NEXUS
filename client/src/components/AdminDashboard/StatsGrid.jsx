import React from 'react';

const StatsGrid = ({ stats = [] }) => {
  if (!Array.isArray(stats) || stats.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map(({ name, value }) => (
        <div
          key={name}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-gray-800 dark:bg-slate-900"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">{name}</p>
          <p className="mt-2 text-3xl font-bold text-nexus-dark dark:text-white">
            {Number.isFinite(Number(value)) ? Number(value).toLocaleString() : '0'}
          </p>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;
