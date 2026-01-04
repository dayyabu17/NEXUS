import React from 'react';

const FilterIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <path
      d="M4 6h16M7 12h10M10 18h4"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const OrganizerEventsHeader = ({
  activeFilterLabel,
  showFilterMenu,
  onToggleFilterMenu,
  statusOptions,
  statusFilter,
  onSelectFilter,
  filterMenuRef,
}) => (
  <div className="flex flex-col items-start justify-between gap-6 pt-6 sm:flex-row sm:items-center">
    <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">Events</h1>

    <div className="relative z-30" ref={filterMenuRef}>
      <button
        type="button"
        onClick={onToggleFilterMenu}
        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-nexus-primary/40 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:border-white/20 dark:hover:bg-white/15 dark:focus-visible:ring-white/40"
      >
        <FilterIcon className="h-5 w-5" />
        <span>{activeFilterLabel}</span>
      </button>

      {showFilterMenu && (
        <div className="absolute right-0 z-40 mt-2 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white text-sm shadow-lg shadow-slate-900/10 dark:border-white/10 dark:bg-[#0A0F16] dark:shadow-black/40">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelectFilter(option.value)}
              className={`flex w-full items-center justify-between px-4 py-2 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/10 ${
                statusFilter === option.value
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-white/70'
              }`}
            >
              {option.label}
              {statusFilter === option.value && <span aria-hidden>•</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  </div>
);

export default OrganizerEventsHeader;
