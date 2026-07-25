import React from 'react';
import { motion } from 'motion/react';
import { ThemeMode } from '../types';

interface ThemeLoaderProps {
  theme?: ThemeMode;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const ThemeLoader: React.FC<ThemeLoaderProps> = ({
  theme = 'default',
  size = 'md',
  text,
}) => {
  // Determine scale based on size prop
  const scale = size === 'sm' ? 'scale-75' : size === 'lg' ? 'scale-125' : 'scale-100';

  // Read theme attribute from document if theme prop is default
  const activeTheme =
    theme !== 'default'
      ? theme
      : (document.documentElement.getAttribute('data-theme') as ThemeMode) || 'default';

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div className={`relative flex items-center justify-center ${scale}`}>
        {/* SKY THEME: Floating Puffy Cloud with Air Particles */}
        {activeTheme === 'sky' && (
          <div className="relative w-20 h-16 flex items-center justify-center">
            {/* Soft Ambient Cloud Aura */}
            <motion.div
              animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 bg-sky-300/40 rounded-full blur-xl"
            />
            {/* Puffy Cloud Vector */}
            <motion.svg
              animate={{ y: [-4, 4, -4], rotate: [-1, 1, -1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-16 h-12 text-sky-100 drop-shadow-[0_4px_12px_rgba(56,189,248,0.5)] relative z-10"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
            </motion.svg>
            {/* Floating Air/Mist Particles */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  x: [0, (i - 1) * 20],
                  y: [10, -20],
                  opacity: [0, 0.8, 0],
                  scale: [0.5, 1.2, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.6,
                  ease: 'easeOut',
                }}
                className="absolute bottom-1 w-2 h-2 rounded-full bg-white/80 blur-[1px]"
              />
            ))}
          </div>
        )}

        {/* ATOM THEME: Spinning Atomic Ring Orbital with Electrons */}
        {activeTheme === 'atom' && (
          <div className="relative w-20 h-20 flex items-center justify-center">
            {/* Glowing Core Nucleus */}
            <motion.div
              animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-5 h-5 rounded-full bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 shadow-[0_0_20px_rgba(239,68,68,0.8)] z-10"
            />
            {/* Orbital Ring 1 (Red/Blue) */}
            <motion.div
              animate={{ rotateX: [70, 70], rotateY: [0, 360], rotateZ: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute w-16 h-16 rounded-full border-2 border-red-500/60 shadow-[0_0_10px_rgba(239,68,68,0.4)] flex items-center justify-start"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-[0_0_8px_#EF4444]" />
            </motion.div>
            {/* Orbital Ring 2 (Blue/Cyan) */}
            <motion.div
              animate={{ rotateX: [70, 70], rotateY: [60, 420], rotateZ: [60, 420] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
              className="absolute w-16 h-16 rounded-full border-2 border-blue-500/60 shadow-[0_0_10px_rgba(59,130,246,0.4)] flex items-center justify-start"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_8px_#3B82F6]" />
            </motion.div>
            {/* Orbital Ring 3 (Purple/Violet) */}
            <motion.div
              animate={{ rotateX: [70, 70], rotateY: [120, 480], rotateZ: [120, 480] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute w-16 h-16 rounded-full border-2 border-purple-500/60 shadow-[0_0_10px_rgba(139,92,246,0.4)] flex items-center justify-start"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-purple-300 shadow-[0_0_8px_#8B5CF6]" />
            </motion.div>
          </div>
        )}

        {/* RENAISSANCE THEME: Vintage Golden Hourglass / Compass Shimmer */}
        {activeTheme === 'renaissance' && (
          <div className="relative w-20 h-20 flex items-center justify-center">
            {/* Outer Shimmer Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute w-16 h-16 rounded-full border border-amber-500/50 border-dashed"
            />
            {/* Rotating Golden Diamond */}
            <motion.div
              animate={{ rotate: [0, 180, 360], scale: [0.9, 1.05, 0.9] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-10 h-10 border-2 border-amber-400 bg-amber-950/40 rotate-45 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)]"
            >
              <motion.div
                animate={{ scale: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-3 h-3 bg-red-700 rounded-full border border-amber-300"
              />
            </motion.div>
          </div>
        )}

        {/* ISLAMIC THEME: Rotating Rub el Hizb 8-Point Star */}
        {activeTheme === 'islamic' && (
          <div className="relative w-20 h-20 flex items-center justify-center">
            {/* Pulsing Emerald Halo */}
            <motion.div
              animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute w-16 h-16 rounded-full bg-emerald-500/30 blur-lg"
            />
            {/* 8-Point Star Layer 1 */}
            <motion.div
              animate={{ rotate: [0, 90] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              className="absolute w-12 h-12 bg-emerald-900/80 border-2 border-amber-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
            />
            {/* 8-Point Star Layer 2 (Rotated 45deg) */}
            <motion.div
              animate={{ rotate: [45, 135] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              className="absolute w-12 h-12 bg-emerald-900/80 border-2 border-amber-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
            />
            {/* Center Gem */}
            <div className="w-4 h-4 rounded-full bg-amber-400 border border-emerald-300 z-10 shadow-[0_0_10px_#FFD700]" />
          </div>
        )}

        {/* LIGHT THEME: Glass Crystal Sparkle Spinner */}
        {activeTheme === 'light' && (
          <div className="relative w-16 h-16 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 rounded-full border-4 border-sky-200 border-t-sky-500 border-r-indigo-500 shadow-md"
            />
            <motion.div
              animate={{ scale: [0.7, 1.2, 0.7] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute w-3 h-3 rounded-full bg-sky-500 blur-[1px]"
            />
          </div>
        )}

        {/* DEFAULT / DARK / OTHER THEMES: Futuristic Cyber Neural Matrix Spinner */}
        {(!['sky', 'atom', 'renaissance', 'islamic', 'light'].includes(activeTheme)) && (
          <div className="relative w-16 h-16 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 rounded-2xl border-2 border-[var(--fluid-1)]/40 border-t-[var(--fluid-1)] border-r-[var(--fluid-2)] shadow-[0_0_15px_var(--accent-glow)]"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              className="absolute w-7 h-7 rounded-lg border-2 border-[var(--fluid-2)]/50 border-b-[var(--fluid-3)]"
            />
            <div className="w-2 h-2 rounded-full bg-[var(--fluid-1)] shadow-[0_0_8px_var(--fluid-1)]" />
          </div>
        )}
      </div>

      {text && (
        <motion.p
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-xs font-mono font-semibold tracking-wider text-center text-[var(--text-main)] opacity-80"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};
