import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GuestLayout from '../layouts/GuestLayout';
import NexusIDCard from '../components/NexusIDCard';
import AchievementBadges from '../components/AchievementBadges';
import ThemeSelector from '../components/ThemeSelector';
import GuestAvatarSection from '../components/GuestProfile/GuestAvatarSection';
import GuestHistoryTab from '../components/GuestProfile/GuestHistoryTab';
import GuestProfileForm from '../components/GuestProfile/GuestProfileForm';
import useGuestProfile from '../hooks/guest/useGuestProfile';

const MotionSection = motion.section;

const GuestProfile = () => {
  const navigate = useNavigate();
  const {
    profile,
    memberSince,
    userHandle,
    ticketMetrics,
    avatarPreview,
    avatarFile,
    status,
    shareFeedback,
    loadingMetrics,
    savingProfile,
    uploadingAvatar,
    activeTab,
    tabs,
    badgeText,
    recentTickets,
    setActiveTab,
    handleFieldChange,
    handleAvatarSelection,
    handleAvatarUpload,
    handleProfileSubmit,
    handleShareId,
  } = useGuestProfile();

  return (
    <GuestLayout mainClassName="mx-auto max-w-6xl px-6 pb-20 pt-24">
      <MotionSection
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="space-y-12"
        >
          <header className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 shadow-sm dark:border-slate-800 dark:bg-white/5 dark:text-white/60">
              Profile
            </div>
            <h1 className="text-4xl font-semibold text-slate-900 dark:text-white">Your guest identity</h1>
            <p className="text-sm text-slate-600 dark:text-white/55">
              Step into a futuristic dossier that evolves with every Nexus experience you attend.
            </p>
          </header>

          {status.message && (
            <div
              className={`rounded-2xl border px-4 py-4 text-sm ${
                status.type === 'error'
                  ? 'border-red-500/40 bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-200'
                  : 'border-emerald-400/30 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-100'
              }`}
            >
              {status.message}
            </div>
          )}

          <div className="grid gap-10 lg:grid-cols-[380px_1fr]">
            <GuestAvatarSection
              renderNexusIdCard={(cardProps) => <NexusIDCard {...cardProps} />}
              avatarPreview={avatarPreview}
              profile={profile}
              memberSince={memberSince}
              userHandle={userHandle}
              badgeText={badgeText}
              shareFeedback={shareFeedback}
              onShare={handleShareId}
              onAvatarSelection={handleAvatarSelection}
              onAvatarUpload={handleAvatarUpload}
              avatarFile={avatarFile}
              uploadingAvatar={uploadingAvatar}
            />

            <div className="space-y-6">
              <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white p-2 text-xs font-semibold uppercase tracking-[0.26em] text-slate-600 shadow-sm dark:border-slate-800 dark:bg-white/5 dark:text-white/60">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 rounded-full px-5 py-2 transition ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-[0_10px_30px_rgba(37,99,235,0.35)]'
                        : 'text-slate-500 hover:text-slate-700 dark:text-white/60 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === 'history' && (
                <GuestHistoryTab
                  ticketMetrics={ticketMetrics}
                  loadingMetrics={loadingMetrics}
                  recentTickets={recentTickets}
                  onViewTickets={() => navigate('/guest/tickets')}
                />
              )}

              {activeTab === 'achievements' && (
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-[#0d1423]/65 dark:shadow-[0_24px_70px_rgba(5,10,25,0.45)]">
                  <AchievementBadges stats={ticketMetrics} loading={loadingMetrics} />
                </div>
              )}

              {activeTab === 'appearance' && <ThemeSelector />}

              <GuestProfileForm
                profile={profile}
                savingProfile={savingProfile}
                onSubmit={handleProfileSubmit}
                onFieldChange={handleFieldChange}
              />
            </div>
          </div>
      </MotionSection>
    </GuestLayout>
  );
};

export default GuestProfile;
