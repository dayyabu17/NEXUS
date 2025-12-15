import { AnimatePresence, motion as Motion } from 'framer-motion';

const BrandInfoPanel = ({ isOpen, panelRef, highlights, onClose, onExplore, onSearch }) => (
  <AnimatePresence>
    {isOpen && (
      <Motion.div
        ref={panelRef}
        initial={{ opacity: 0, y: 28, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 28, scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24, mass: 0.9 }}
        className="fixed inset-x-4 bottom-6 z-[70] w-[calc(100vw-32px)] overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-[#4263eb]/90 via-[#845ef7]/90 to-[#f06595]/90 p-6 text-white shadow-[0_24px_70px_rgba(10,20,60,0.55)] backdrop-blur-xl sm:inset-auto sm:bottom-auto sm:right-6 sm:top-24 sm:w-[min(320px,calc(100vw-32px))]"
        aria-live="polite"
      >
        <div className="pointer-events-none absolute -top-20 right-[-40px] h-48 w-48 rounded-full bg-white/35 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute bottom-[-50px] left-[-60px] h-40 w-40 rounded-full bg-[#3bc9db]/30 blur-3xl" aria-hidden="true" />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.48em] text-white/70">
                Inside Nexus
              </p>
              <h3 className="mt-2 text-xl font-bold leading-tight">Nexus Experience</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/30 bg-white/10 px-2 py-1 text-sm font-semibold text-white/80 transition hover:border-white/60 hover:bg-white/20 hover:text-white"
              aria-label="Close Nexus information"
            >
              ✕
            </button>
          </div>

          <p className="mt-3 text-sm text-white/85">
            Nexus blends live events, ticketing, and campus discovery into a single colorful journey tailored for
            students and organizers.
          </p>

          <div className="mt-5 space-y-3">
            {highlights.map(({ title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-lg transition hover:border-white/25 hover:bg-white/15"
              >
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-1 text-xs text-white/80">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onExplore}
              className="inline-flex items-center justify-center rounded-full bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-[#1f1b2e] transition hover:bg-white"
            >
              Explore Events
            </button>
            <button
              type="button"
              onClick={onSearch}
              className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-white/85 transition hover:border-white/60 hover:text-white"
            >
              Search Campus
            </button>
          </div>
        </div>
      </Motion.div>
    )}
  </AnimatePresence>
);

export default BrandInfoPanel;
