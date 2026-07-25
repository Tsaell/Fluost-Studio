import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, Upload, Palette, Microscope, AlertTriangle, Plus, X, Sparkles, Image as ImageIcon, Film, MessageSquareCode } from 'lucide-react';
import { ThemeLoader } from './ThemeLoader';
import { fetchVisualAI, VisualMediaInputItem } from '../lib/geminiClient';
import { compressImage, readFileAsBase64 } from '../lib/imageUtils';

interface VisualostProps {
  onShowModal: (title: string, body: string) => void;
  onOpenApiModal?: () => void;
}

interface VisualMediaItem {
  id: string;
  previewUrl: string;
  base64Data: string;
  mimeType: string;
  fileName: string;
  isVideo: boolean;
}

const QUICK_PROMPTS = [
  '🎬 Moody Cinematic Film',
  '🌸 Warm Pastel Vintage',
  '🏎️ Neon Cyberpunk Night',
  '🔍 Bandingkan & Harmoniskan Palet Warna',
];

export const Visualost: React.FC<VisualostProps> = ({ onShowModal, onOpenApiModal }) => {
  const [mediaList, setMediaList] = useState<VisualMediaItem[]>([]);
  const [userPrompt, setUserPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const filesArray = Array.from(e.target.files) as File[];
    const newItems: VisualMediaItem[] = [];

    for (const file of filesArray) {
      // Increased max file size limit to 50MB per file
      if (file.size > 50 * 1024 * 1024) {
        onShowModal('Ukuran File Besar', `File "${file.name}" melebihi batas 50MB.`);
        continue;
      }

      const isVideo = file.type.startsWith('video/');

      try {
        let base64Data = '';
        let previewUrl = '';
        const mime = file.type || (isVideo ? 'video/mp4' : 'image/jpeg');

        if (isVideo) {
          const rawBase64 = await readFileAsBase64(file);
          base64Data = rawBase64.split(',')[1] || rawBase64;
          previewUrl = URL.createObjectURL(file);
        } else {
          // Compress photo for crisp & lightweight payload
          const compressedDataUrl = await compressImage(file, 1200, 1200, 0.8);
          base64Data = compressedDataUrl.split(',')[1];
          previewUrl = compressedDataUrl;
        }

        newItems.push({
          id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          previewUrl,
          base64Data,
          mimeType: mime,
          fileName: file.name,
          isVideo,
        });
      } catch (err) {
        console.error('Error processing file:', err);
        onShowModal('Gagal', `Terjadi kesalahan saat memproses file "${file.name}".`);
      }
    }

    if (newItems.length > 0) {
      setMediaList((prev) => [...prev, ...newItems]);
      setErrorMessage(null);
      onShowModal(
        'Media Ditambahkan',
        `Berhasil menambahkan ${newItems.length} file visual. Total saat ini: ${mediaList.length + newItems.length} media.`
      );
    }

    // Reset input value to allow re-uploading same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeMediaItem = (id: string) => {
    setMediaList((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target && target.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const clearAllMedia = () => {
    mediaList.forEach((item) => {
      if (item.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });
    setMediaList([]);
  };

  const handleAnalyzeMedia = async () => {
    if (mediaList.length === 0) {
      onShowModal('Media Kosong', 'Harap unggah minimal 1 foto/video terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setResultText(null);

    try {
      const inputItems: VisualMediaInputItem[] = mediaList.map((m) => ({
        base64Data: m.base64Data,
        mimeType: m.mimeType,
        fileName: m.fileName,
      }));

      const result = await fetchVisualAI(inputItems, userPrompt);
      setResultText(result);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(String(err?.message || err || 'Terjadi kesalahan saat pembedahan visual.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8">
      {/* Input Panel (5 Cols) */}
      <div className="lg:col-span-5 space-y-5">
        <div className="fluost-box p-4 sm:p-6 md:p-8">
          <div className="fluost-fluid-bg"></div>
          <div className="fluost-sand-corner"></div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2.5">
                <Eye className="w-6 h-6 text-[var(--fluid-2)]" /> Visualost Studio
              </h2>
              {mediaList.length > 0 && (
                <span className="ice-badge bg-[var(--fluid-2)]/20 text-[var(--fluid-2)] font-mono text-xs">
                  {mediaList.length} Media
                </span>
              )}
            </div>

            <p className="text-xs md:text-sm opacity-80 leading-relaxed">
              Unggah satu atau beberapa foto/video referensi sekaligus. Masukkan arahan prompt untuk mendapatkan resep Lightroom & ide CapCut presisi.
            </p>

            {/* Media Grid / Dropzone */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--fluid-2)]">
                <span>Daftar Media Terpasang</span>
                {mediaList.length > 0 && (
                  <button
                    onClick={clearAllMedia}
                    className="text-red-400 hover:underline text-[11px] normal-case"
                  >
                    Hapus Semua
                  </button>
                )}
              </div>

              {mediaList.length === 0 ? (
                <div className="border-2 border-dashed border-[var(--ice-border)] rounded-3xl p-6 text-center cursor-pointer relative bg-black/10 hover:bg-black/20 transition-all overflow-hidden group">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleMediaUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                  />
                  <div className="space-y-3 py-6">
                    <Upload className="w-10 h-10 text-[var(--fluid-2)] mx-auto group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-bold">Pilih Satu / Banyak Foto & Video</p>
                    <p className="text-xs opacity-70">JPG, PNG, MP4, MOV (Maksimal 50MB / File)</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1">
                    {mediaList.map((item, idx) => (
                      <div
                        key={item.id}
                        className="relative aspect-square rounded-2xl overflow-hidden bg-black/60 border border-white/20 group shadow-md"
                      >
                        {item.isVideo ? (
                          <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-slate-900 text-center">
                            <Film className="w-6 h-6 text-sky-400 mb-1" />
                            <span className="text-[9px] font-mono text-white/80 truncate max-w-full">
                              {item.fileName}
                            </span>
                          </div>
                        ) : (
                          <img
                            src={item.previewUrl}
                            alt={item.fileName}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <span className="absolute top-1 left-1 ice-badge text-[9px] py-0.5 px-1.5 bg-black/80 font-mono">
                          #{idx + 1}
                        </span>
                        <button
                          onClick={() => removeMediaItem(item.id)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-red-600/80 text-white opacity-90 hover:opacity-100 hover:scale-110 transition-all"
                          title="Hapus media ini"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add more button */}
                  <div className="relative border border-dashed border-[var(--ice-border)] rounded-2xl p-3 text-center cursor-pointer bg-black/10 hover:bg-black/20 transition-all">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleMediaUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                    />
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-[var(--fluid-2)]">
                      <Plus className="w-4 h-4" /> Tambah Media Visual Lainnya
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Custom Prompt Input */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[var(--fluid-2)] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MessageSquareCode className="w-4 h-4" /> Custom Prompt / Arahan AI
                </span>
                <span className="text-[10px] opacity-60 font-normal normal-case">(Opsional)</span>
              </label>

              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Misal: 'Buatkan preset tone film ala cyberpunk 90-an', 'Bandingkan pencahayaan foto 1 dan foto 2', atau 'Resep tone ala Korea pastel'..."
                className="fluost-input w-full p-3 text-xs md:text-sm h-20 resize-none font-medium"
              />

              {/* Quick Prompt Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {QUICK_PROMPTS.map((qp) => (
                  <button
                    key={qp}
                    type="button"
                    onClick={() => setUserPrompt(qp.replace(/^[^\s]+\s*/, ''))}
                    className="text-[10px] px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/90 transition-all text-left"
                  >
                    {qp}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAnalyzeMedia}
              disabled={isLoading || mediaList.length === 0}
              className="fluost-btn w-full py-4 text-sm flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Microscope className="w-4 h-4 animate-spin" /> Membedah {mediaList.length} Visual...
                </>
              ) : (
                <>
                  <Microscope className="w-4 h-4" /> Mulai Analisis Visual
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Output Panel (7 Cols) */}
      <div className="lg:col-span-7">
        <div className="fluost-box p-4 sm:p-6 md:p-8 h-full min-h-[350px] flex flex-col justify-between">
          <div className="fluost-fluid-bg"></div>
          <div className="fluost-sand-corner"></div>

          <div className="relative z-10 h-full flex flex-col justify-between">
            {isLoading && (
              <div className="text-center py-20 my-auto">
                <ThemeLoader text={`Menganalisis ${mediaList.length} media, palet warna & arahan prompt...`} size="lg" />
              </div>
            )}

            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-3xl text-center my-auto space-y-3">
                <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
                <div>
                  <p className="text-red-400 font-bold text-sm">Analisis Visual Gagal</p>
                  <p className="text-red-300/80 text-xs mt-1">{errorMessage}</p>
                </div>
                {onOpenApiModal && (
                  <button
                    type="button"
                    onClick={onOpenApiModal}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-1.5 mx-auto transition-all active:scale-95"
                  >
                    <span>🔑 Ambil / Masukkan API Key Gemini Gratis</span>
                  </button>
                )}
              </div>
            )}

            {!isLoading && !errorMessage && resultText && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4 h-full flex flex-col"
              >
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <h3 className="font-bold text-sm text-[var(--fluid-2)] flex items-center gap-2">
                    <Palette className="w-4 h-4" /> Hasil Pembedahan Color Grading
                  </h3>
                  <span className="text-xs opacity-70 font-mono">
                    {mediaList.length} Visual Dianalisis
                  </span>
                </div>

                <div className="bg-black/20 p-5 rounded-2xl border border-[var(--ice-border)] overflow-y-auto max-h-[520px] prose prose-invert max-w-none text-xs md:text-sm font-medium leading-relaxed">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: String(resultText || '')
                        .replace(/### (.*?)\n/g, '<h3 class="text-sm font-bold text-[var(--fluid-2)] mt-4 mb-1">$1</h3>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[var(--fluid-1)]">$1</strong>')
                        .replace(/\n/g, '<br />'),
                    }}
                  />
                </div>
              </motion.div>
            )}

            {!isLoading && !errorMessage && !resultText && (
              <div className="text-center py-20 my-auto space-y-4">
                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center border-4 border-dashed border-[var(--fluid-2)] bg-black/10 animate-[spin_12s_linear_infinite]">
                  <Palette className="w-8 h-8 text-[var(--fluid-1)]" />
                </div>
                <h3 className="font-extrabold text-base">Menunggu Input Visual</h3>
                <p className="text-xs font-medium opacity-70 max-w-xs mx-auto">
                  Unggah foto/video dan ketik prompt khusus. Resep Lightroom & ide CapCut akan ditampilkan di sini.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
