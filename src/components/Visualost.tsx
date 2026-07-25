import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, Upload, Palette, Microscope, AlertTriangle } from 'lucide-react';
import { ThemeLoader } from './ThemeLoader';
import { fetchVisualAI } from '../lib/geminiClient';
import { compressImage } from '../lib/imageUtils';

interface VisualostProps {
  onShowModal: (title: string, body: string) => void;
  customApiKey: string;
  onOpenApiModal?: () => void;
}

export const Visualost: React.FC<VisualostProps> = ({ onShowModal, customApiKey, onOpenApiModal }) => {
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 20 * 1024 * 1024) {
        onShowModal('Ukuran File', 'Ukuran foto maksimal 20MB.');
        return;
      }

      try {
        const compressedDataUrl = await compressImage(file, 800, 800, 0.7);
        setMediaPreview(compressedDataUrl);
        setBase64Data(compressedDataUrl.split(',')[1]);
        setMimeType('image/jpeg'); // compressed image is jpeg
        setResultText(null);
        setErrorMessage(null);
      } catch (error) {
        console.error('Error compressing image:', error);
        onShowModal('Gagal', 'Terjadi kesalahan saat memproses gambar.');
      }
    }
  };

  const handleAnalyzeMedia = async () => {
    if (!base64Data || !mimeType) {
      onShowModal('Media Kosong', 'Harap unggah mahakarya visual (Foto) terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setResultText(null);

    try {
      const result = await fetchVisualAI(base64Data, mimeType, customApiKey);
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
      {/* Upload Left Panel */}
      <div className="lg:col-span-5 space-y-5">
        <div className="fluost-box p-4 sm:p-6 md:p-8">
          <div className="fluost-fluid-bg"></div>
          <div className="fluost-sand-corner"></div>

          <div className="relative z-10 space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2.5">
              <Eye className="w-6 h-6 text-[var(--fluid-2)]" /> Visualost Analyzer
            </h2>
            <p className="text-xs md:text-sm opacity-80 leading-relaxed">
              Unggah foto karya Anda. AI akan membedah palet warna dan memberikan resep Lightroom serta ide efek CapCut.
            </p>

            {/* Dropzone / Preview */}
            <div className="border-2 border-dashed border-[var(--ice-border)] rounded-3xl p-6 text-center cursor-pointer relative bg-black/10 hover:bg-black/20 transition-all overflow-hidden">
              <input
                type="file"
                accept="image/*"
                onChange={handleMediaUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
              />

              {!mediaPreview ? (
                <div className="space-y-3 py-6">
                  <Upload className="w-10 h-10 text-[var(--fluid-2)] mx-auto animate-bounce" />
                  <p className="text-sm font-bold">Pilih Mahakarya Visual (Foto)</p>
                  <p className="text-xs opacity-70">Format JPG / PNG (Max 8MB)</p>
                </div>
              ) : (
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black/80 flex items-center justify-center">
                  <img src={mediaPreview} alt="Preview" className="max-h-full max-w-full object-contain" />
                  <div className="absolute bottom-2 right-2 ice-badge text-[10px] bg-black/70">
                    Ganti Foto
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleAnalyzeMedia}
              disabled={isLoading || !mediaPreview}
              className="fluost-btn w-full py-4 text-sm flex items-center justify-center gap-2 shadow-xl"
            >
              {isLoading ? (
                <>
                  <Microscope className="w-4 h-4 animate-spin" /> Membedah Visual...
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

      {/* Output Right Panel */}
      <div className="lg:col-span-7">
        <div className="fluost-box p-4 sm:p-6 md:p-8 h-full min-h-[300px] flex flex-col justify-between">
          <div className="fluost-fluid-bg"></div>
          <div className="fluost-sand-corner"></div>

          <div className="relative z-10 h-full flex flex-col justify-between">
            {isLoading && (
              <div className="text-center py-20 my-auto">
                <ThemeLoader text="Menganalisis komposisi, suhu warna & kontras..." size="lg" />
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
                </div>

                <div className="bg-black/20 p-5 rounded-2xl border border-[var(--ice-border)] overflow-y-auto max-h-[500px] prose prose-invert max-w-none text-xs md:text-sm font-medium leading-relaxed">
                  <div 
                    dangerouslySetInnerHTML={{
                      __html: String(resultText || '')
                        .replace(/### (.*?)\n/g, '<h3 class="text-sm font-bold text-[var(--fluid-2)] mt-4 mb-1">$1</h3>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[var(--fluid-1)]">$1</strong>')
                        .replace(/\n/g, '<br />')
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
                  Resep color grading Lightroom dan panduan CapCut akan ditampilkan di sini.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
