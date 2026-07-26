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

      {/* SKY THEME: Continuous Ultra-Cloudy Floating Canvas & Sunbeams */}
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

          {/* Floating Birds Silhouette */}
          <motion.div
            animate={{ x: ['-10%', '110%'], y: [-10, 10, -10] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/5 left-0 opacity-50 text-sky-900"
          >
            <svg className="w-16 h-8" viewBox="0 0 50 25" fill="currentColor">
              <path d="M0 12 Q 12 0 25 12 Q 38 0 50 12 Q 38 4 25 15 Q 12 4 0 12 Z" />
            </svg>
          </motion.div>

          {/* Soft Golden Sunbeam Highlight */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[30rem] h-[30rem] rounded-full bg-amber-100/30 blur-3xl pointer-events-none" />
        </div>
      )}

      {/* ATOM THEME: Orbiting Electrons & Particle Energy Beams */}
      {currentTheme === 'atom' && (
        <div className="absolute inset-0 overflow-hidden">
          {/* Cosmic Center Elliptical Orbital Ring 1 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] border border-red-500/20 rounded-[100%] rotate-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="w-full h-full relative"
            >
              <div className="absolute -top-2 left-1/2 w-4 h-4 rounded-full bg-red-500 shadow-[0_0_18px_#EF4444]" />
            </motion.div>
          </div>

          {/* Cosmic Center Elliptical Orbital Ring 2 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] border border-blue-500/20 rounded-[100%] -rotate-25">
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="w-full h-full relative"
            >
              <div className="absolute -top-2 left-1/2 w-4 h-4 rounded-full bg-blue-400 shadow-[0_0_18px_#3B82F6]" />
            </motion.div>
          </div>

          {/* Floating Quantum Particle Grid */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <motion.div
              key={i}
              animate={{
                x: [0, (i % 2 === 0 ? 1 : -1) * 140, 0],
                y: [0, (i % 3 === 0 ? -1 : 1) * 160, 0],
                opacity: [0.3, 0.85, 0.3],
                scale: [0.8, 1.4, 0.8],
              }}
              transition={{
                duration: 5 + i * 1.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className={`absolute w-3.5 h-3.5 rounded-full blur-[1px] ${
                i % 2 === 0
                  ? 'bg-red-500 shadow-[0_0_15px_#EF4444]'
                  : 'bg-blue-400 shadow-[0_0_15px_#3B82F6]'
              }`}
              style={{
                top: `${15 + i * 14}%`,
                left: `${12 + i * 15}%`,
              }}
            />
          ))}
        </div>
      )}

      {/* RENAISSANCE THEME: Royal Gold Dust & Renaissance Vignette */}
      {currentTheme === 'renaissance' && (
        <div className="absolute inset-0 overflow-hidden">
          {/* Golden Ambient Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-amber-950/30" />
          
          {/* Floating Gold Sparkle Dust */}
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -140],
                x: [0, (i % 2 === 0 ? 30 : -30)],
                opacity: [0, 0.85, 0],
                scale: [0.5, 1.2, 0.5],
              }}
              transition={{
                duration: 4.5 + i * 1.2,
                repeat: Infinity,
                delay: i * 0.6,
                ease: 'easeInOut',
              }}
              className="absolute w-2.5 h-2.5 rounded-full bg-amber-300 shadow-[0_0_12px_#D4AF37]"
              style={{
                bottom: '8%',
                left: `${8 + i * 14}%`,
              }}
            />
          ))}
        </div>
      )}

      {/* ISLAMIC THEME: Pulsing 8-Point Star Geometric Mandala Aura */}
      {currentTheme === 'islamic' && (
        <div className="absolute inset-0 flex items-center justify-center opacity-20 overflow-hidden">
          {/* Geometric Mandala Star Pulse */}
          <motion.div
            animate={{ rotate: 360, scale: [0.95, 1.05, 0.95] }}
            transition={{ rotate: { duration: 90, repeat: Infinity, ease: 'linear' }, scale: { duration: 8, repeat: Infinity, ease: 'easeInOut' } }}
            className="w-[650px] h-[650px] rounded-full border-2 border-emerald-400 flex items-center justify-center relative"
          >
            <div className="absolute w-[520px] h-[520px] border-2 border-amber-400 rotate-45" />
            <div className="absolute w-[520px] h-[520px] border-2 border-amber-400 rotate-0" />
            <div className="absolute w-[380px] h-[380px] rounded-full border border-teal-300" />
            <div className="absolute w-[260px] h-[260px] border border-emerald-300 rotate-22.5" />
          </motion.div>
        </div>
      )}

      {/* CYBERPUNK THEME: Glitch Scanlines, Neon Grid & Falling Digital Matrix Stream */}
      {currentTheme === 'cyberpunk' && (
        <div className="absolute inset-0 overflow-hidden bg-[#0D0221]">
          {/* Scanlines Effect */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(15,244,198,0.03)_1px,transparent_1px)] [background-size:100%_4px]" />

          {/* Cyber Neon Matrix Grid Lines */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,0,85,0.05)_1px,transparent_1px),linear-gradient(0deg,rgba(15,244,198,0.05)_1px,transparent_1px)] [background-size:40px_40px]" />

          {/* Falling Digital Data Streams */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <motion.div
              key={i}
              animate={{ y: ['-20%', '120%'], opacity: [0, 0.9, 0] }}
              transition={{ duration: 3 + i * 0.8, repeat: Infinity, ease: 'linear', delay: i * 0.5 }}
              className="absolute w-[2px] h-32 bg-gradient-to-b from-transparent via-[#0FF4C6] to-[#FF0055] shadow-[0_0_10px_#0FF4C6]"
              style={{ left: `${10 + i * 16}%` }}
            />
          ))}
        </div>
      )}

      {/* NATURE THEME: Floating Leaves & Dappled Forest Sunbeams */}
      {currentTheme === 'nature' && (
        <div className="absolute inset-0 overflow-hidden bg-[#F1F8E9]">
          {/* Dappled Sunbeam Light */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-200/25 rounded-full blur-3xl" />

          {/* Floating Leaf Particles */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: ['-10%', '110%'],
                x: [0, (i % 2 === 0 ? 40 : -40), 0],
                rotate: [0, 360],
                opacity: [0, 0.7, 0],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                delay: i * 1.2,
                ease: 'easeInOut',
              }}
              className="absolute text-emerald-600/40"
              style={{ left: `${5 + i * 16}%` }}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 8C8 10 59 16.17 3.82 21.34L2.41 19.93C7.58 14.76 13.83 11.83 17 8M12.5 15.5C10.5 15.5 8.5 14.5 7 13C8.5 11.5 10.5 10.5 12.5 10.5C14.5 10.5 16.5 11.5 18 13C16.5 14.5 14.5 15.5 12.5 15.5Z" />
              </svg>
            </motion.div>
          ))}
        </div>
      )}

      {/* MONOCHROME THEME: Studio Crosshair Alignment Marks & Film Viewfinder Frame */}
      {currentTheme === 'monochrome' && (
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-6 left-6 font-mono text-[10px] font-black tracking-widest text-black uppercase">
            [FLUOST STUDIO • VIEWFINDER 100%]
          </div>
          <div className="absolute top-6 right-6 font-mono text-[10px] font-black tracking-widest text-black uppercase">
            REC • 60FPS
          </div>
          <div className="absolute bottom-6 left-6 font-mono text-[10px] font-black tracking-widest text-black uppercase">
            RAW • 4K
          </div>
          <div className="absolute bottom-6 right-6 font-mono text-[10px] font-black tracking-widest text-black uppercase">
            [ISO 100 • 1/250]
          </div>
          {/* Center Crosshair Target */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center">
            <div className="w-full h-[1px] bg-black" />
            <div className="h-full w-[1px] bg-black absolute" />
          </div>
        </div>
      )}

      {/* SUNSET THEME: Glowing Horizon Sun Arc & Floating Warm Embers */}
      {currentTheme === 'sunset' && (
        <div className="absolute inset-0 overflow-hidden bg-[#FFEBEE]">
          {/* Horizon Sun Arc Glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-t from-orange-500/30 via-rose-500/20 to-transparent rounded-t-full blur-2xl" />

          {/* Floating Sunset Embers */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -180],
                x: [0, (i % 2 === 0 ? 35 : -35)],
                opacity: [0, 0.8, 0],
                scale: [0.6, 1.3, 0.6],
              }}
              transition={{
                duration: 5 + i * 1.5,
                repeat: Infinity,
                delay: i * 0.7,
                ease: 'easeInOut',
              }}
              className="absolute w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_12px_#F59E0B]"
              style={{
                bottom: '15%',
                left: `${10 + i * 14}%`,
              }}
            />
          ))}
        </div>
      )}

      {/* DARK THEME: Deep Space Starry Constellations */}
      {currentTheme === 'dark' && (
        <div className="absolute inset-0 overflow-hidden">
          {/* Twinkling Stars */}
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2 + (i % 3), repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
              className="absolute w-1.5 h-1.5 bg-indigo-300 rounded-full shadow-[0_0_8px_#818CF8]"
              style={{
                top: `${10 + i * 11}%`,
                left: `${8 + i * 11}%`,
              }}
            />
          ))}
        </div>
      )}

      {/* CLASSIC WHITE THEME: Studio Modernist Pristine Porcelain & Silver Prism Rays */}
      {currentTheme === 'light' && (
        <div className="absolute inset-0 overflow-hidden bg-[#FAFBFD]">
          {/* Soft Silver & Indigo Prism Glows */}
          <div className="absolute -top-10 right-1/4 w-[650px] h-[650px] bg-gradient-to-br from-indigo-200/35 via-sky-100/25 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-10 left-1/3 w-[550px] h-[550px] bg-gradient-to-tr from-blue-100/35 via-slate-200/25 to-transparent rounded-full blur-3xl" />

          {/* Minimalist Studio Grid */}
          <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#020617_1px,transparent_1px)] [background-size:20px_20px]" />

          {/* Floating Silver Prism Beams */}
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: ['-20%', '120%'],
                x: [0, i % 2 === 0 ? 25 : -25, 0],
                opacity: [0, 0.7, 0]
              }}
              transition={{
                duration: 9 + i * 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 1.8
              }}
              className="absolute w-[2px] h-44 bg-gradient-to-b from-transparent via-indigo-400/30 to-transparent shadow-[0_0_8px_rgba(99,102,241,0.2)]"
              style={{ left: `${18 + i * 20}%` }}
            />
          ))}

          {/* Studio Viewfinder Corner Marks */}
          <div className="absolute top-6 left-6 font-mono text-[9px] font-black tracking-widest text-slate-400 uppercase opacity-60">
            [STUDIO CLASSIC WHITE • HIGH-PRECISION]
          </div>
          <div className="absolute bottom-6 right-6 font-mono text-[9px] font-black tracking-widest text-slate-400 uppercase opacity-60">
            PURE MODERNISM • 60FPS
          </div>
        </div>
      )}

      {/* BLUEEN THEME v3.0: Electric Cobalt & Luminous Cyan Aurora */}
      {(currentTheme === 'default' || currentTheme === 'blueen') && (
        <div className="absolute inset-0 overflow-hidden bg-[#050A1A]">
          {/* Deep Cobalt & Cyan Electric Aurora Glowing Orbs */}
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              x: [-20, 30, -20],
              y: [-10, 20, -10],
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-20 -left-20 w-[650px] h-[650px] bg-gradient-to-br from-[#3D5AFE]/40 via-[#00E5FF]/25 to-transparent rounded-full blur-3xl transform-gpu"
          />

          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              x: [30, -20, 30],
              y: [20, -15, 20],
              opacity: [0.35, 0.65, 0.35]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-20 -right-20 w-[700px] h-[700px] bg-gradient-to-tl from-[#7C3AED]/35 via-[#00E5FF]/20 to-transparent rounded-full blur-3xl transform-gpu"
          />

          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-r from-[#00E5FF]/20 via-[#3D5AFE]/30 to-transparent rounded-full blur-3xl transform-gpu"
          />

          {/* Cybernetic Holographic Matrix Grid */}
          <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(to_right,#00E5FF_1px,transparent_1px),linear-gradient(to_bottom,#00E5FF_1px,transparent_1px)] [background-size:36px_36px]" />

          {/* Laser Photon Energy Beams */}
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              animate={{
                x: ['-20%', '120%'],
                y: ['0%', '100%'],
                opacity: [0, 0.8, 0]
              }}
              transition={{
                duration: 7 + i * 2,
                repeat: Infinity,
                ease: 'linear',
                delay: i * 1.5
              }}
              className="absolute w-48 h-[2px] bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent shadow-[0_0_12px_#00E5FF]"
              style={{
                top: `${12 + i * 18}%`,
                left: `${(i * 20) % 80}%`,
                transform: 'rotate(-25deg)'
              }}
            />
          ))}

          {/* Floating Cyber Photon Nodes */}
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={`node-${i}`}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.9, 0.3],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 5 + i * 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 1.2
              }}
              className="absolute w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_12px_#00E5FF]"
              style={{
                top: `${20 + i * 22}%`,
                left: `${15 + i * 22}%`
              }}
            />
          ))}

          {/* Studio HUD Corner Labels */}
          <div className="absolute top-6 left-6 font-mono text-[9px] font-black tracking-widest text-[#00E5FF] uppercase opacity-75 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-ping" />
            [BLUEEN v3.0 • ELECTRIC COBALT AURORA]
          </div>
          <div className="absolute bottom-6 right-6 font-mono text-[9px] font-black tracking-widest text-[#00E5FF] uppercase opacity-75">
            PHOTON CYBER FLOW • FLUOST STUDIO
          </div>
        </div>
      )}
    </div>
  );
};

