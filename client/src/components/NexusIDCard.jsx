import React, { useCallback, useMemo, useRef, useState } from 'react';
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

const NexusIDCard = ({
  avatar,
  displayName,
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

  const avatarUrl = useMemo(() => resolveProfileImage(avatar), [avatar]);

  return (
    <div className="space-y-4">
      <Motion.div
        ref={cardRef}
        className="relative aspect-[16/10] w-full rounded-[28px] border border-white/12 bg-[rgba(12,18,32,0.85)] p-6 shadow-[0_35px_90px_rgba(4,10,25,0.7)] backdrop-blur-lg"
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
            className="absolute h-[220%] w-[220%] rounded-full bg-gradient-to-r from-blue-500/30 via-cyan-400/25 to-fuchsia-500/25 mix-blend-screen"
            style={{
              left: shimmerX,
              top: shimmerY,
              opacity: isHovering ? 0.8 : 0.45,
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(90,130,255,0.18),transparent_55%)]" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.035%22/%3E%3C/svg%3E')] opacity-60" />
        </div>

        <div className="relative flex h-full flex-col justify-between text-white">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.38em] text-white/70">Nexus Member</p>
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 overflow-hidden rounded-2xl border border-white/20 bg-white/10">
                  <img src={avatarUrl} alt="Nexus member" className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">{displayName || 'Guest Explorer'}</p>
                  <p className="text-sm text-white/65">{userHandle || '@guest'}</p>
                </div>
              </div>
            </div>
            <div className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.38em] text-white/60">
              Active
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.38em] text-white/45">Member since</p>
              <p className="text-sm font-semibold text-white">
                {memberSince ? new Date(memberSince).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                }) : 'Unknown'}
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="overflow-hidden rounded-xl border border-white/15 bg-white p-1">
                <QRCode
                  value={`nexus:${userHandle || displayName || 'guest'}`}
                  bgColor="transparent"
                  fgColor="#0b1425"
                  size={80}
                  style={{ height: '80px', width: '80px' }}
                />
              </div>
              <p className="text-[10px] uppercase tracking-[0.34em] text-white/50">Access Key</p>
            </div>
          </div>
        </div>
      </Motion.div>

      <button
        type="button"
        onClick={onShare}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:border-white/35"
      >
        Share ID
      </button>
    </div>
  );
};

export default NexusIDCard;
