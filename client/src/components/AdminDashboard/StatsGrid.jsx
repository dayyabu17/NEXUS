import React from 'react';

const StatsGrid = ({ stats = [] }) => {
  if (!Array.isArray(stats) || stats.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
      {stats.map(({ name, value }) => (
        <div
          key={name}
          className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-colors duration-300 dark:border-gray-800 dark:bg-slate-900 md:p-6"
        >
          <p className="text-xs text-gray-500 dark:text-gray-400 md:text-sm">{name}</p>
          <p className="mt-2 text-xl font-bold text-nexus-dark dark:text-white md:text-3xl">
            {Number.isFinite(Number(value)) ? Number(value).toLocaleString() : '0'}
          </p>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;
