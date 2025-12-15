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
    <h1 className="text-4xl font-semibold tracking-tight text-white">Events</h1>

    <div className="relative z-30" ref={filterMenuRef}>
      <button
        type="button"
        onClick={onToggleFilterMenu}
        className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
      >
        <FilterIcon className="h-5 w-5" />
        <span>{activeFilterLabel}</span>
      </button>

      {showFilterMenu && (
        <div className="absolute right-0 mt-2 w-40 overflow-hidden rounded-lg border border-white/10 bg-[#0A0F16] text-sm shadow-lg shadow-black/40 z-40">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelectFilter(option.value)}
              className={`flex w-full items-center justify-between px-4 py-2 text-left transition-colors hover:bg-white/10 ${
                statusFilter === option.value ? 'text-white' : 'text-white/70'
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
