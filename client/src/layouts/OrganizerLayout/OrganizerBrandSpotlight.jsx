import React from 'react';

const OrganizerBrandSpotlight = ({ show, onClose, organizerQuickLinks }) => (
  show ? (
    <aside className="hidden w-[320px] flex-shrink-0 xl:block">
      <div className="sticky top-[132px] space-y-6">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(5,8,20,0.45)]">
          <h2 className="text-sm font-semibold uppercase tracking-[0.38em] text-white/50">
            Brand Spotlight
          </h2>
          <p className="mt-4 text-sm text-white/70">
            Nexus is the command center for your live experiences. Draft, launch, and scale events with
            full creative control and real-time analytics.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/45 hover:text-white"
          >
            Close spotlight
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="rounded-[32px] border border-white/5 bg-white/[0.04] p-6">
          <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
            Quick actions
          </h3>
          <ul className="mt-4 space-y-3">
            {organizerQuickLinks.map((item) => (
              <li key={item.title}>
                <button
                  type="button"
                  onClick={item.action}
                  className="group flex w-full items-center justify-between rounded-2xl border border-white/5 bg-transparent px-4 py-3 text-left text-sm text-white/80 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
                >
                  <span>{item.title}</span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/20 text-xs text-white/60 transition group-hover:border-white/45 group-hover:text-white">
                    {item.iconLabel}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  ) : null
);

export default OrganizerBrandSpotlight;
