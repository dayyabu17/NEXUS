import React from 'react';
import { formatDateTime } from './eventViewUtils';

const OrganizerEventHeader = ({ event, onBack, tabs, activeTab, onTabChange }) => (
  <header className="space-y-6">
    <div className="space-y-3">
      <button
        type="button"
        onClick={onBack}
        className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 transition hover:border-white/40 hover:text-white"
      >
        Back
      </button>
      <h1 className="text-4xl font-semibold tracking-tight text-white">{event.title}</h1>
      <p className="text-sm text-white/60">{formatDateTime(event.date)}</p>
    </div>

    <nav className="flex gap-8 border-b border-white/10 text-sm font-medium text-white/60">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`relative pb-3 transition-colors ${
              isActive ? 'text-white' : 'hover:text-white'
            }`}
          >
            {tab.label}
            {isActive && (
              <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-white" />
            )}
          </button>
        );
      })}
    </nav>
  </header>
);

export default OrganizerEventHeader;
