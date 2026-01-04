import React from 'react';
import { formatDateTime } from './eventViewUtils';

const OrganizerEventHeader = ({ event, onBack, tabs, activeTab, onTabChange }) => (
  <header className="space-y-6">
    <div className="space-y-3">
      <button
        type="button"
        onClick={onBack}
        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-500 transition hover:border-nexus-primary hover:text-nexus-primary dark:border-white/15 dark:bg-transparent dark:text-slate-400 dark:hover:border-white/40 dark:hover:text-white"
      >
        Back
      </button>
      <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">{event.title}</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">{formatDateTime(event.date)}</p>
    </div>

    <nav className="flex gap-8 border-b border-slate-200 text-sm font-medium text-slate-500 dark:border-slate-800 dark:text-white/60">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`relative pb-3 transition-colors ${
              isActive
                ? 'text-nexus-primary dark:text-white'
                : 'text-slate-500 hover:text-nexus-primary dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            {tab.label}
            {isActive && (
              <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-nexus-primary dark:bg-white" />
            )}
          </button>
        );
      })}
    </nav>
  </header>
);

export default OrganizerEventHeader;
