import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, CheckCircle2, X } from 'lucide-react';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowModal: (title: string, body: string) => void;
  onStatusChange: () => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] overflow-y-auto pointer-events-auto flex items-start justify-center p-4 py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            className="fluost-box p-6 md:p-8 max-w-lg w-full relative z-10 my-auto"
          >
          <div className="fluost-fluid-bg"></div>
          <div className="fluost-sand-corner"></div>

          <div className="relative z-10 space-y-5 text-[var(--text-main)]">
            <div className="flex justify-between items-center border-b border-[var(--ice-border)] pb-3">
              <h3 className="font-black text-lg md:text-xl text-[var(--fluid-2)] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> Status API Terhubung
              </h3>
              <button
                onClick={onClose}
                className="opacity-60 hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[var(--fluid-2)]/10 border border-[var(--fluid-2)]/30 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[var(--fluid-2)] flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> Terhubung via AI Studio
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-extrabold px-2 py-1 rounded-full border border-emerald-500/30">
                  Aktif
                </span>
              </div>
              <p className="text-xs md:text-sm leading-relaxed opacity-90 text-[var(--text-main)]">
                Aplikasi Fluost saat ini terhubung langsung menggunakan <strong>Interactions API</strong> (Infrastruktur Server AI Studio). 
                <br/><br/>
                Anda <strong>tidak perlu lagi memasukkan API Key Gemini secara manual</strong>. Semua fitur cerdas (AI Spark, Visualost, ListenList) sudah dapat digunakan sepenuhnya dan ditangani dengan aman di sisi server.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-[var(--fluid-2)] hover:bg-[var(--fluid-1)] text-white text-xs md:text-sm font-bold flex-1 shadow-lg shadow-[var(--fluid-2)]/30 transition-all active:scale-95"
              >
                Tutup & Lanjutkan
              </button>
            </div>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
