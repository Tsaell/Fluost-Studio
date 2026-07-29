import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, CheckCircle2, Zap, Copy, ExternalLink, Bell } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  title: string;
  body: string;
  autoDismiss?: boolean;
  copyText?: string;
  externalUrl?: string;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  title,
  body,
  autoDismiss = true,
  copyText,
  externalUrl,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  // Auto dismiss notification after 4 seconds (like real iOS Dynamic Island)
  useEffect(() => {
    if (isOpen && autoDismiss) {
      const timer = setTimeout(() => {
        onClose();
      }, 4200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoDismiss, onClose]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!copyText) return;
    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed top-3 left-0 right-0 z-[350] flex justify-center px-3 pointer-events-none">
          {/* iOS Dynamic Island Pill Container - Non-Blocking Floating HUD */}
          <motion.div
            initial={{
              y: -40,
              scale: 0.7,
              opacity: 0,
              width: '180px',
            }}
            animate={{
              y: 0,
              scale: 1,
              opacity: 1,
              width: 'auto',
            }}
            exit={{
              y: -30,
              scale: 0.75,
              opacity: 0,
            }}
            transition={{
              type: 'spring',
              stiffness: 420,
              damping: 28,
              mass: 0.7,
            }}
            className="pointer-events-auto max-w-[92vw] sm:max-w-[480px] rounded-[26px] bg-slate-950/90 text-white border border-slate-700/80 shadow-[0_12px_40px_rgba(0,0,0,0.6),0_0_20px_rgba(61,90,254,0.35)] p-3.5 sm:p-4 relative overflow-hidden backdrop-blur-2xl group transition-all"
          >
            {/* Subtle Glowing Pulse Dot */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent opacity-80" />

            <div className="flex items-start gap-3 relative z-10">
              {/* Dynamic Island Animated Pulse Icon */}
              <div className="relative shrink-0 mt-0.5">
                <motion.div
                  animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-[#3D5AFE]"
                />
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3D5AFE] to-[#00E5FF] flex items-center justify-center text-white shadow-[0_0_12px_#00E5FF] relative z-10">
                  <Zap className="w-4 h-4 fill-current text-white animate-pulse" />
                </div>
              </div>

              {/* Text & Actions */}
              <div className="flex-1 min-w-0 pr-2 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-[#00E5FF] bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
                      Dynamic Island
                    </span>
                    <h4 className="font-extrabold text-xs sm:text-sm text-white truncate leading-tight">
                      {title}
                    </h4>
                  </div>
                </div>

                <p className="text-xs text-slate-200 font-medium leading-snug line-clamp-2">
                  {body}
                </p>

                {/* Optional Quick Action Chips */}
                {(copyText || externalUrl) && (
                  <div className="flex flex-wrap items-center gap-2 pt-1.5">
                    {copyText && (
                      <button
                        onClick={handleCopy}
                        className="px-2.5 py-1 rounded-xl bg-indigo-900/60 hover:bg-indigo-800/80 border border-indigo-400/40 text-[11px] font-bold text-cyan-300 flex items-center gap-1 transition-all active:scale-95"
                      >
                        <Copy className="w-3 h-3" />
                        {copied ? 'Tersalin!' : `Salin ${copyText}`}
                      </button>
                    )}
                    {externalUrl && (
                      <a
                        href={externalUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-2.5 py-1 rounded-xl bg-amber-900/50 hover:bg-amber-800/70 border border-amber-400/40 text-[11px] font-bold text-amber-300 flex items-center gap-1 transition-all active:scale-95"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Buka Console
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Dismiss Button */}
              <button
                onClick={onClose}
                className="p-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all active:scale-90 shrink-0"
                aria-label="Tutup Notifikasi"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

