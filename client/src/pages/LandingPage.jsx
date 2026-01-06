import React, { useCallback, useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import PublicLayout from '../layouts/PublicLayout';
import HeroSection from '../components/landing/HeroSection';
import TrustBadgeStrip from '../components/landing/TrustBadgeStrip';
import ProcessSteps from '../components/landing/ProcessSteps';
import FeatureShowcase from '../components/landing/FeatureShowcase';
import EventGallery from '../components/landing/EventGallery';

const LandingPage = () => {
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 400);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const goToTop = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <PublicLayout>
      <>
        <div className="bg-white text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
          <HeroSection />
          <div className="mx-auto flex max-w-7xl flex-col gap-24 px-6 pb-24">
            <TrustBadgeStrip />
            <ProcessSteps />
            <section id="features" className="scroll-mt-24">
              <FeatureShowcase />
            </section>
            <EventGallery />
          </div>
        </div>
        <button
          type="button"
          onClick={goToTop}
          aria-label="Back to top"
          className={`fixed bottom-8 right-8 z-50 transform rounded-full bg-nexus-primary p-3 text-white shadow-lg transition-all duration-300 hover:bg-blue-600 ${
            showTopBtn ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-10'
          }`}
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      </>
    </PublicLayout>
  );
};

export default LandingPage;