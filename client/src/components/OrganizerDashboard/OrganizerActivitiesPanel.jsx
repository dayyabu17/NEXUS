import React from 'react';
import { relativeTimeFromNow } from './dashboardUtils';

const OrganizerActivitiesPanel = ({ activities }) => (
  <aside
    className="h-96 w-full max-w-md rounded-xl border border-white/5 bg-[#191b1d]/90 p-6 shadow-lg shadow-black/20"
  >
    <h2 className="text-2xl font-medium text-white">The Buzz</h2>
    <div className="mt-6 space-y-4">
      {activities.length === 0 ? (
        <p className="text-sm text-white/60">No recent activity yet.</p>
      ) : (
        activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 rounded-lg border border-white/5 bg-black/60 px-4 py-3"
          >
            <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
              🎟️
            </span>
            <div>
              <p className="text-sm font-medium text-white">{activity.title}</p>
              <p className="text-xs text-white/60">{relativeTimeFromNow(activity.createdAt)}</p>
            </div>
          </div>
        ))
      )}
    </div>
  </aside>
);

export default OrganizerActivitiesPanel;
