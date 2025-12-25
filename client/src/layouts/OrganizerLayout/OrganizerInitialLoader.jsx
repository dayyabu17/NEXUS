import React from 'react';
import nexusIcon from '../../assets/icons/nexus-icon.svg';

const OrganizerInitialLoader = ({ show }) => (
  show ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020305]">
      <div className="flex flex-col items-center gap-4">
        <img src={nexusIcon} alt="Nexus" className="h-12 w-12 animate-pulse" />
        <p className="text-xs uppercase tracking-[0.4em] text-white/50">Preparing dashboard</p>
      </div>
    </div>
  ) : null
);

export default OrganizerInitialLoader;
