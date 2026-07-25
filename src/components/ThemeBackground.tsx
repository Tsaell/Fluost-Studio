import React from 'react';
import { motion } from 'motion/react';
import { ThemeMode } from '../types';

interface ThemeBackgroundProps {
  currentTheme: ThemeMode;
}

export const ThemeBackground: React.FC<ThemeBackgroundProps> = ({ currentTheme }) => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none hardware-accelerated">
      {/* Universal Soft Fluid Gradient (GPU Accelerated) */}
      <div className="fluost-fluid-bg" />

      {/* SKY THEME: Continuous Ultra-Cloudy Floating Canvas */}
      {currentTheme === 'sky' && (
        <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-[#38BDF8] via-[#7DD3FC] to-[#BAE6FD]">
          {/* Soft White-Blue Atmospheric Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.7),transparent_70%)]" />

          {/* Cloud Layer 1: Puffy Top Clouds (Left -> Right) */}
          <motion.div
            animate={{ x: ['-30%', '110%'] }}
            transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
            className="absolute top-6 left-0 opacity-80 flex gap-20 transform-gpu will-change-transform"
          >
            <div className="w-80 h-28 bg-white/90 rounded-full" />
            <div className="w-[28rem] h-36 bg-sky-50/80 rounded-full" />
            <div className="w-72 h-24 bg-white/85 rounded-full" />
          </motion.div>

          {/* Cloud Layer 2: Big Mid Clouds (Right -> Left) */}
          <motion.div
            animate={{ x: ['110%', '-40%'] }}
            transition={{ duration: 48, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/3 right-0 opacity-70 flex gap-28 transform-gpu will-change-transform"
          >
            <div className="w-[34rem] h-44 bg-white/85 rounded-full" />
            <div className="w-96 h-32 bg-sky-100/90 rounded-full" />
            <div className="w-[30rem] h-40 bg-white/80 rounded-full" />
          </motion.div>

          {/* Cloud Layer 3: Lower Drifting Cumulus (Left -> Right) */}
          <motion.div
            animate={{ x: ['-40%', '110%'] }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-12 left-0 opacity-60 flex gap-24 transform-gpu will-change-transform"
          >
            <div className="w-[36rem] h-48 bg-white/95 rounded-full" />
            <div className="w-[28rem] h-36 bg-sky-50/90 rounded-full" />
          </motion.div>

          {/* Floating Puffy Cloud Vector Silhouettes */}
          <motion.div
            animate={{ y: [-8, 8, -8], x: [0, 15, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 left-1/4 opacity-40 text-white"
          >
            <svg className="w-48 h-32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
            </svg>
          </motion.div>

          {/* Soft Golden Sunbeam Highlight */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[30rem] h-[30rem] rounded-full bg-amber-100/30 blur-3xl pointer-events-none" />
        </div>
      )}

      {/* ATOM THEME: Orbiting Electrons & Energy Beams */}
      {currentTheme === 'atom' && (
        <div className="absolute inset-0 overflow-hidden">
          {/* Cosmic Center Elliptical Orbital Ring 1 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] border border-red-500/15 rounded-[100%] rotate-12">
            <motion.div
              animate={{ offsetDistance: ['0%', '100%'] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_15px_#EF4444]"
              style={{
                offsetPath: 'rect(0% 100% 100% 0% round 100%)',
              }}
            />
          </div>

          {/* Cosmic Center Elliptical Orbital Ring 2 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] border border-blue-500/15 rounded-[100%] -rotate-25">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="w-full h-full relative"
            >
              <div className="absolute -top-2 left-1/2 w-4 h-4 rounded-full bg-blue-400 shadow-[0_0_15px_#3B82F6]" />
            </motion.div>
          </div>

          {/* Floating Electron Particles */}
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              animate={{
                x: [0, (i % 2 === 0 ? 1 : -1) * 120, 0],
                y: [0, (i % 3 === 0 ? -1 : 1) * 150, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [0.8, 1.3, 0.8],
              }}
              transition={{
                duration: 6 + i * 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className={`absolute w-3 h-3 rounded-full blur-[1px] ${
                i % 2 === 0
                  ? 'bg-red-500 shadow-[0_0_12px_#EF4444]'
                  : 'bg-blue-400 shadow-[0_0_12px_#3B82F6]'
              }`}
              style={{
                top: `${20 + i * 15}%`,
                left: `${15 + i * 16}%`,
              }}
            />
          ))}
        </div>
      )}

      {/* RENAISSANCE THEME: Floating Gold Dust & Royal Shimmer */}
      {currentTheme === 'renaissance' && (
        <div className="absolute inset-0 overflow-hidden">
          {/* Golden Ambient Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-amber-950/20" />
          
          {/* Floating Gold Sparkle Dust */}
          {[1, 2, 3, 4, 6].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -120],
                x: [0, (i % 2 === 0 ? 25 : -25)],
                opacity: [0, 0.7, 0],
              }}
              transition={{
                duration: 5 + i * 1.5,
                repeat: Infinity,
                delay: i * 0.8,
                ease: 'easeInOut',
              }}
              className="absolute w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_10px_#D4AF37]"
              style={{
                bottom: '10%',
                left: `${10 + i * 18}%`,
              }}
            />
          ))}
        </div>
      )}

      {/* ISLAMIC THEME: Pulsing 8-Point Star Geometric Aura */}
      {currentTheme === 'islamic' && (
        <div className="absolute inset-0 flex items-center justify-center opacity-15">
          {/* Geometric Mandala Star Pulse */}
          <motion.div
            animate={{ rotate: 360, scale: [0.95, 1.05, 0.95] }}
            transition={{ rotate: { duration: 90, repeat: Infinity, ease: 'linear' }, scale: { duration: 8, repeat: Infinity, ease: 'easeInOut' } }}
            className="w-[600px] h-[600px] rounded-full border-2 border-emerald-400 flex items-center justify-center relative"
          >
            <div className="absolute w-[500px] h-[500px] border border-amber-400 rotate-45" />
            <div className="absolute w-[500px] h-[500px] border border-amber-400 rotate-0" />
            <div className="absolute w-[350px] h-[350px] rounded-full border border-teal-300" />
          </motion.div>
        </div>
      )}

      {/* DEFAULT / DARK / LIGHT NEURAL GRID OVERLAY */}
      {(currentTheme === 'default' || currentTheme === 'dark' || currentTheme === 'light') && (
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#3D5AFE_1px,transparent_1px)] [background-size:24px_24px]" />
      )}
    </div>
  );
};
