import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, X, CheckCircle2, ShieldCheck, RefreshCw, ExternalLink, Sparkles, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customApiKey: string;
  setCustomApiKey: (key: string) => void;
  onShowModal: (title: string, body: string) => void;
  hasEnvApiKey: boolean;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  customApiKey,
  setCustomApiKey,
  onShowModal,
  hasEnvApiKey,
}) => {
  const [tempKey, setTempKey] = useState(customApiKey);
  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  useEffect(() => {
    setTempKey(customApiKey);
    setTestStatus({ type: null, message: '' });
  }, [customApiKey, isOpen]);

  if (!isOpen) return null;

  const handleSaveKey = () => {
    const trimmed = tempKey.trim();
    setCustomApiKey(trimmed);
    if (trimmed) {
      localStorage.setItem('fluost_custom_gemini_api_key', trimmed);
      onShowModal(
        'API Key Gemini Disimpan!',
        'API Key kustom Anda telah tersimpan dengan aman di browser lokal. Semua fitur AI (Deteksi Musik, Copywriting, Analisis Visual) kini aktif sepenuhnya.'
      );
    } else {
      localStorage.removeItem('fluost_custom_gemini_api_key');
      onShowModal(
        'Menggunakan Default Server',
        'API Key kustom dihapus. Aplikasi akan mencoba menggunakan API Key default dari server backend.'
      );
    }
    onClose();
  };

  const handleTestKey = async () => {
    const trimmed = tempKey.trim();
    setTesting(true);
    setTestStatus({ type: null, message: '' });

    try {
      if (trimmed) {
        // Test directly using Gemini API SDK client-side
        const ai = new GoogleGenAI({ apiKey: trimmed });
        let resText = '';
        try {
          const res = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Tanggapi dengan satu kata: OK',
          });
          resText = res.text || '';
        } catch {
          const res = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: 'Tanggapi dengan satu kata: OK',
          });
          resText = res.text || '';
        }

        if (resText) {
          setTestStatus({
            type: 'success',
            message: 'API Key valid! Koneksi ke Google Gemini AI berhasil 100%.',
          });
        } else {
          throw new Error('Tidak ada respon dari Gemini AI.');
        }
      } else {
        // Test backend server health
        const res = await fetch('/api/health');
        const data = await res.json();
        if (res.ok && data.status === 'ok') {
          setTestStatus({
            type: 'success',
            message: `Server API Fluost aktif. Status Key Server: ${data.hasApiKey ? 'Tersedia' : 'Belum Dikonfigurasi'}.`,
          });
        } else {
          throw new Error('Server backend tidak merespon secara normal.');
        }
      }
    } catch (err: any) {
      setTestStatus({
        type: 'error',
        message: err.message || 'Gagal memverifikasi API Key. Pastikan API Key benar dan koneksi internet stabil.',
      });
    } finally {
      setTesting(false);
    }
  };

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
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-[var(--ice-border)] pb-3">
              <h3 className="font-black text-lg md:text-xl text-[#3D5AFE] flex items-center gap-2">
                <Key className="w-5 h-5" /> Pengaturan API Key Gemini AI
              </h3>
              <button
                onClick={onClose}
                className="opacity-60 hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Guide Banner */}
            <div className="bg-[#3D5AFE]/10 border border-[#3D5AFE]/30 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs md:text-sm text-[#3D5AFE] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Mengapa AI Butuh API Key?
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Gratis 100%
                </span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                Ketika dipasang di platform web (seperti Vercel atau domain publik), fitur AI membutuhkan <strong>API Key Gemini</strong> pribadi Anda agar tidak tergantung server backend dan dapat langsung mengakses model <strong>Gemini 2.5 Flash</strong> secara gratis tanpa batasan.
              </p>
            </div>

            {/* Step 1: Get Free Key Button */}
            <div className="p-3.5 rounded-2xl bg-[var(--ice-bg)] border border-[var(--ice-border)] space-y-2">
              <p className="text-xs font-bold text-[#3D5AFE]">Langkah 1: Ambil API Key Gratis di Google AI Studio</p>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
              >
                <Key className="w-4 h-4" />
                <span>Dapatkan API Key Gratis di Google AI Studio</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <p className="text-[10px] opacity-70 text-center">
                (Login dengan akun Google Anda, klik "Create API key", lalu salin kode kuncinya)
              </p>
            </div>

            {/* Step 2: Input Custom Key */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-extrabold text-[#3D5AFE] uppercase tracking-wider block">
                Langkah 2: Tempel (Paste) API Key Gemini di Sini
              </label>
              <input
                type="password"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="AIzaSy..."
                className="fluost-input w-full p-3 font-mono text-xs md:text-sm tracking-wider rounded-xl border border-[var(--ice-border)] bg-[var(--card-bg)] text-[var(--text-main)]"
              />
            </div>

            {/* Test Status Feedback Box */}
            {testStatus.message && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                  testStatus.type === 'success'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                    : 'bg-red-500/15 border-red-500/40 text-red-400'
                }`}
              >
                {testStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                )}
                <span className="leading-tight">{testStatus.message}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleTestKey}
                disabled={testing}
                className="px-4 py-3 rounded-xl bg-[var(--ice-bg)] hover:border-[#3D5AFE] border border-[var(--ice-border)] text-xs font-bold flex items-center justify-center gap-2 text-[#3D5AFE] transition-all flex-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                <span>{testing ? 'Menguji Key...' : 'Uji Validitas Key'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveKey}
                className="px-6 py-3 rounded-xl bg-[#3D5AFE] hover:bg-[#2563EB] text-white text-xs md:text-sm font-bold flex-1 shadow-lg shadow-[#3D5AFE]/30 transition-all active:scale-95"
              >
                Simpan & Aktifkan AI
              </button>
            </div>

          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};

