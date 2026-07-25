import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, X, CheckCircle2, ShieldCheck, RefreshCw, Sparkles } from 'lucide-react';

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

  useEffect(() => {
    setTempKey(customApiKey);
  }, [customApiKey]);

  if (!isOpen) return null;

  const handleSaveKey = () => {
    const trimmed = tempKey.trim();
    setCustomApiKey(trimmed);
    if (trimmed) {
      localStorage.setItem('fluost_custom_gemini_api_key', trimmed);
      onShowModal('API Key Kustom Disimpan', 'API Key kustom Anda tersimpan di browser. Semua permintaan AI akan memprioritaskan kunci kustom ini.');
    } else {
      localStorage.removeItem('fluost_custom_gemini_api_key');
      onShowModal('Menggunakan Key Permanen', 'API Key kustom telah dihapus. Aplikasi otomatis menggunakan API Key permanen bawaan AI Studio!');
    }
    onClose();
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      if (res.ok && data.status === 'ok') {
        onShowModal(
          'Koneksi Berhasil!',
          `Server API Fluost aktif. Key bawaan AI Studio: ${data.hasApiKey ? 'TERSEDIA (Permanen)' : 'Diatur lewat server'}. Fitur AI siap digunakan!`
        );
      } else {
        onShowModal('Koneksi Gagal', 'Server tidak merespon secara normal.');
      }
    } catch (err: any) {
      onShowModal('Kesalahan Server', `Gagal terhubung ke server API: ${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-start justify-center pt-16 md:pt-20 px-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -20 }}
          className="fluost-box p-6 md:p-8 max-w-lg w-full relative"
        >
          <div className="fluost-fluid-bg"></div>
          <div className="fluost-sand-corner"></div>

          <div className="relative z-10 space-y-5">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-[var(--ice-border)] pb-3">
              <h3 className="font-black text-lg md:text-xl text-[var(--fluid-2)] flex items-center gap-2">
                <Key className="w-5 h-5" /> Status & Configuration API Gemini
              </h3>
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Environment Key Notice Banner */}
            <div className="bg-emerald-500/10 border border-emerald-500/40 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs md:text-sm">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <span>API Key Server Permanen Aktif</span>
              </div>
              <p className="text-xs text-emerald-300/90 leading-relaxed">
                Aplikasi ini berjalan dengan integrasi server-side full-stack (`process.env.GEMINI_API_KEY`). Anda <strong>tidak perlu lagi repot menambah API Key manual</strong> dari luar!
              </p>
            </div>

            {/* Custom Key Section */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-extrabold text-[var(--fluid-2)] uppercase tracking-wider block">
                Override / API Key Kustom (Opsional)
              </label>
              <input
                type="password"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="Paste API Key Gemini jika ingin menggunakan key pribadi (AIzaSy...)"
                className="fluost-input w-full p-3 font-mono text-xs md:text-sm tracking-wider"
              />
              <p className="text-[11px] opacity-70">
                Biarkan kosong jika ingin menggunakan API key permanen bawaan sistem.
              </p>
            </div>

            {/* Test Connection Button */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                className="ice-badge hover:opacity-100 py-3 px-4 flex items-center justify-center gap-2 text-xs font-bold flex-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                <span>{testing ? 'Menguji...' : 'Uji Koneksi Server API'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveKey}
                className="fluost-btn py-3 px-6 text-xs md:text-sm font-bold flex-1"
              >
                Simpan & Terapkan
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
