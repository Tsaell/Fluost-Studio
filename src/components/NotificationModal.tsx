import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, CheckCircle2, Zap, Copy, ExternalLink } from 'lucide-react';

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

  // Auto dismiss notification after 8 seconds if autoDismiss is true
  useEffect(() => {
    if (isOpen && autoDismiss) {
      const timer = setTimeout(() => {
        onClose();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoDismiss, onClose]);

  const handleCopy = () => {
    if (!copyText) return;
    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed top-2 left-0 right-0 z-[200] flex justify-center px-3 pointer-events-none">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto z-0"
          />

          {/* Dynamic "FluostNote" Morphing Modal */}
          <motion.div
            initial={{
              y: -50,
              scale: 0.9,
              opacity: 0,
            }}
            animate={{
              y: 10,
              scale: 1,
              opacity: 1,
            }}
            exit={{
              y: -20,
              scale: 0.9,
              opacity: 0,
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25,
              mass: 0.8,
            }}
            className="w-full max-w-[480px] rounded-[28px] pointer-events-auto bg-[var(--card-bg)] text-[var(--text-main)] border border-[var(--ice-border)] shadow-[0_20px_50px_rgba(0,0,0,0.25),0_0_30px_rgba(61,90,254,0.3)] p-5 md:p-6 relative z-10 overflow-hidden backdrop-blur-2xl"
          >
            {/* Ambient Liquid Flow inside FluostNote */}
            <div className="fluost-fluid-bg opacity-30" />
            <div className="fluost-sand-corner" />

            <div className="relative z-10 space-y-3">
              {/* FluostNote Header */}
              <div className="flex items-center justify-between border-b border-[var(--ice-border)] pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                      className="absolute w-7 h-7 rounded-full bg-[#3D5AFE]"
                    />
                    <div className="w-7 h-7 rounded-full bg-[#3D5AFE] flex items-center justify-center text-white shadow-[0_0_12px_#3D5AFE] relative z-10">
                      <Zap className="w-4 h-4 fill-current" />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#3D5AFE] block">
                      FluostNote
                    </span>
                    <h3 className="font-bold text-sm md:text-base leading-tight flex items-center gap-1.5">
                      {title}
                    </h3>
                  </div>
                </div>

                {/* Animated Wave Indicator & Close Button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 transition-all active:scale-95"
                    aria-label="Tutup Notifikasi"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notification Message */}
              <p className="text-xs md:text-sm font-medium leading-relaxed opacity-90 whitespace-pre-line">
                {body}
              </p>

              {/* Optional Actions (e.g. Copy Domain & Firebase Console Link) */}
              {(copyText || externalUrl) && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {copyText && (
                    <button
                      onClick={handleCopy}
                      className="px-3 py-1.5 rounded-xl bg-[var(--ice-bg)] hover:border-[#3D5AFE] border border-[var(--ice-border)] text-xs font-bold text-[#3D5AFE] flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copied ? 'Domain Tersalin!' : `Salin Domain (${copyText})`}
                    </button>
                  )}
                  {externalUrl && (
                    <a
                      href={externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-xs font-bold text-orange-500 flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Firebase Console
                    </a>
                  )}
                </div>
              )}

              {/* Bottom Bar */}
              <div className="pt-2 flex items-center justify-between border-t border-white/5">
                <span className="text-[10px] font-mono opacity-60">
                  Fluost OS • Live System
                </span>
                <button
                  onClick={onClose}
                  className="bg-[#3D5AFE] hover:bg-[#2A41C9] text-white px-5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(61,90,254,0.4)] active:scale-95 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Selesai
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
