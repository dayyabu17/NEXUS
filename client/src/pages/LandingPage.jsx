import React from 'react';
import PublicLayout from '../layouts/PublicLayout';
import HeroSection from '../components/landing/HeroSection';
import TrustBadgeStrip from '../components/landing/TrustBadgeStrip';
import ProcessSteps from '../components/landing/ProcessSteps';
import FeatureShowcase from '../components/landing/FeatureShowcase';
import EventGallery from '../components/landing/EventGallery';

const LandingPage = () => (
  <PublicLayout>
    <>
      <HeroSection />
      <div className="mx-auto flex max-w-7xl flex-col gap-24 px-6 pb-24">
        <TrustBadgeStrip />
        <ProcessSteps />
        <section id="features" className="scroll-mt-24">
          <FeatureShowcase />
        </section>
        <EventGallery />
      </div>
    </>
  </PublicLayout>
);

export default LandingPage;