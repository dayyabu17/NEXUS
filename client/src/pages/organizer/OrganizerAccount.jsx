import React from 'react';
import { motion } from 'framer-motion';
import OrganizerLayoutDark from '../../layouts/OrganizerLayoutDark';
import AvatarSection from '../../components/OrganizerAccount/AvatarSection';
import PayoutSettings from '../../components/OrganizerAccount/PayoutSettings';
import ProfileForm from '../../components/OrganizerAccount/ProfileForm';
import useOrganizerAccount from '../../hooks/organizer/useOrganizerAccount';

const MotionSection = motion.section;

const OrganizerAccountPage = () => {
  const {
    profile,
    avatarPreview,
    avatarFile,
    status,
    savingProfile,
    uploadingAvatar,
    handleProfileFieldChange,
    handleAvatarSelection,
    handleAvatarUpload,
    handleProfileSubmit,
  } = useOrganizerAccount();

  return (
    <OrganizerLayoutDark>
      <MotionSection
        className="pb-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <header className="mb-10 flex flex-col gap-3">
          <h1 className="text-4xl font-semibold text-white">Account</h1>
          <p className="text-sm text-white/60">
            Manage your profile details, security, and avatar.
          </p>
        </header>

        {status.message && (
          <div
            className={`mb-8 rounded-2xl border px-4 py-4 text-sm ${
              status.type === 'error'
                ? 'border-red-500/40 bg-red-500/10 text-red-200'
                : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
            }`}
          >
            {status.message}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
          <AvatarSection
            avatarPreview={avatarPreview}
            avatarFile={avatarFile}
            uploadingAvatar={uploadingAvatar}
            onAvatarSelection={handleAvatarSelection}
            onAvatarUpload={handleAvatarUpload}
          />
          <ProfileForm
            profile={profile}
            savingProfile={savingProfile}
            onSubmit={handleProfileSubmit}
            onFieldChange={handleProfileFieldChange}
          />
        </div>

        <div className="mt-12">
          <PayoutSettings />
        </div>
      </MotionSection>
    </OrganizerLayoutDark>
  );
};

export default OrganizerAccountPage;
