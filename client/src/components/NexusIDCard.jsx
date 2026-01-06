import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion as Motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import QRCode from 'react-qr-code';

const DEFAULT_AVATAR = '/images/default-avatar.jpeg';

const resolveProfileImage = (value) => {
  if (!value) {
    return DEFAULT_AVATAR;
  }

  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  return `http://localhost:5000/public${value}`;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const PRINT_STYLE = `@media print {
  body * {
    visibility: hidden;
  }
  .nexus-id-card-printable, .nexus-id-card-printable * {
    visibility: visible;
  }
  .nexus-id-card-printable {
    position: absolute;
    inset: 0;
    margin: 0 auto;
    box-shadow: none !important;
    transform: none !important;
  }
  .nexus-id-card-actions {
    display: none !important;
  }
}`;

const getBaseUrl = () => {
  const runtimeBase = import.meta.env.VITE_APP_BASE_URL;
  if (runtimeBase) {
    return runtimeBase;
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return '';
};

const NexusIDCard = ({
  avatar,
  displayName,
  regNo,
  userId,
  memberSince,
  userHandle,
  onShare,
}) => {
  const cardRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), {
    stiffness: 180,
    damping: 18,
    mass: 0.6,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), {
    stiffness: 180,
    damping: 18,
    mass: 0.6,
  });

  const shimmerX = useSpring(useTransform(mouseX, [-0.5, 0.5], ['-40%', '140%']), {
    stiffness: 120,
    damping: 20,
    mass: 0.4,
  });
  const shimmerY = useSpring(useTransform(mouseY, [-0.5, 0.5], ['-40%', '140%']), {
    stiffness: 120,
    damping: 20,
    mass: 0.4,
  });

  const [isHovering, setIsHovering] = useState(false);

  const handlePointer = useCallback((event) => {
    if (!cardRef.current) {
      return;
    }

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const nextX = clamp((event.clientX - centerX) / rect.width, -0.5, 0.5);
    const nextY = clamp((event.clientY - centerY) / rect.height, -0.5, 0.5);

    mouseX.set(nextX);
    mouseY.set(nextY);
  }, [mouseX, mouseY]);

  const handleLeave = useCallback(() => {
    setIsHovering(false);
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    const existing = document.querySelector('style[data-nexus-print-card="true"]');
    if (existing) {
      return undefined;
    }

    const styleElement = document.createElement('style');
    styleElement.setAttribute('data-nexus-print-card', 'true');
    styleElement.textContent = PRINT_STYLE;
    document.head.appendChild(styleElement);

    return () => {
      if (styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, []);

  const avatarUrl = useMemo(() => resolveProfileImage(avatar), [avatar]);
  const baseUrl = useMemo(() => getBaseUrl(), []);
  const normalizedBaseUrl = useMemo(() => {
    if (!baseUrl) {
      return '';
    }
    return baseUrl.replace(/\/$/, '');
  }, [baseUrl]);
  const qrValue = useMemo(() => {
    if (!userId) {
      return normalizedBaseUrl || baseUrl;
    }
    const effectiveBase = normalizedBaseUrl || baseUrl;
    if (!effectiveBase) {
      return `/u/${userId}`;
    }
    return `${effectiveBase}/u/${userId}`;
  }, [baseUrl, normalizedBaseUrl, userId]);

  const handlePrint = useCallback(() => {
    if (typeof window === 'undefined' || typeof window.print !== 'function') {
      return;
    }
    window.print();
  }, []);

  return (
    <div className="space-y-4">
      <Motion.div
        ref={cardRef}
        className="nexus-id-card-printable relative aspect-[16/10] w-full rounded-[28px] border border-blue-200/30 bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-[0_35px_90px_rgba(15,40,100,0.55)] backdrop-blur-lg"
        style={{
          rotateX,
          rotateY,
          transformPerspective: 1200,
          transformStyle: 'preserve-3d',
        }}
        onPointerMove={(event) => {
          if (!isHovering) {
            setIsHovering(true);
          }
          handlePointer(event);
        }}
        onPointerLeave={handleLeave}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
          <Motion.div
            className="absolute h-[220%] w-[220%] rounded-full bg-gradient-to-r from-white/20 via-white/10 to-transparent mix-blend-screen"
            style={{
              left: shimmerX,
              top: shimmerY,
              opacity: isHovering ? 0.6 : 0.4,
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),transparent_55%)]" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 160 160%22%3E%3Cpath fill=%22rgba(255,255,255,0.06)%22 d=%22M0 0h20v20H0z%22/%3E%3C/svg%3E')] opacity-20" />
        </div>

        <div className="relative flex h-full flex-col justify-between">
          <header className="flex items-start justify-between">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.38em] text-white/70">Nexus Digital Identity</p>
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 overflow-hidden rounded-2xl border border-white/40 bg-white/10">
                  <img src={avatarUrl} alt="Nexus member" className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">{displayName || 'Guest Explorer'}</p>
                  <p className="text-sm text-white/70">{userHandle || '@guest'}</p>
                </div>
              </div>
            </div>
            <div className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.38em] text-white/75">
              Verified
            </div>
          </header>

          <div className="grid grid-cols-[1.5fr_1fr] gap-4">
            <div className="flex h-full flex-col justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/60">Reg No</p>
                <p className="mt-1 text-sm font-semibold text-white">{regNo || 'Pending'}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/60">Member Since</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {memberSince ? new Date(memberSince).toLocaleDateString('en-GB', {
                    month: 'long',
                    year: 'numeric',
                  }) : 'Unknown'}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-end gap-2">
              <div className="overflow-hidden rounded-xl border border-white/35 bg-white p-1">
                <QRCode
                  value={qrValue}
                  bgColor="transparent"
                  fgColor="#0b1425"
                  size={86}
                  style={{ height: '86px', width: '86px' }}
                />
              </div>
              <p className="text-[10px] uppercase tracking-[0.34em] text-white/70">Scan to Verify</p>
            </div>
          </div>
        </div>
      </Motion.div>

      <div className="nexus-id-card-actions grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onShare}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:border-white/35"
        >
          Share ID
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="w-full rounded-2xl border border-blue-500/60 bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-500"
        >
          Print ID
        </button>
      </div>
    </div>
  );
};

export default NexusIDCard;
