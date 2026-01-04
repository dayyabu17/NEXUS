import React from 'react';
import { relativeTimeFromNow } from './dashboardUtils';

const OrganizerActivitiesPanel = ({ activities }) => (
  <aside className="h-96 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:shadow-black/20">
    <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">The Buzz</h2>
    <div className="mt-6 space-y-4">
      {activities.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No recent activity yet.</p>
      ) : (
        activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/40"
          >
            <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-white">
              🎟️
            </span>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">{activity.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{relativeTimeFromNow(activity.createdAt)}</p>
            </div>
          </div>
        ))
      )}
    </div>
  </aside>
);

export default OrganizerActivitiesPanel;
