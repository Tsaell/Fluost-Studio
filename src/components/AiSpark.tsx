import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Wand2, Dna, AlertTriangle, Copy, Check, Upload, Image, Film, X, FileCheck } from 'lucide-react';
import { ThemeLoader } from './ThemeLoader';

interface AiSparkProps {
  onShowModal: (title: string, body: string) => void;
  customApiKey: string;
}

interface AttachedMedia {
  file: File;
  previewUrl: string;
  base64Data: string;
  mimeType: string;
  fileName: string;
  isVideo: boolean;
}

export const AiSpark: React.FC<AiSparkProps> = ({ onShowModal, customApiKey }) => {
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('Klasik & Elegan');
  const [media, setMedia] = useState<AttachedMedia | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (file.size > 25 * 1024 * 1024) {
      onShowModal('Ukuran File Besar', 'Maksimal ukuran file foto/video adalah 25MB.');
      return;
    }

    const isVideo = file.type.startsWith('video/');
    const reader = new FileReader();

    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      if (!dataUrl) return;
      const base64Data = dataUrl.split(',')[1];

      setMedia({
        file,
        previewUrl: URL.createObjectURL(file),
        base64Data,
        mimeType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
        fileName: file.name,
        isVideo,
      });

      onShowModal('Media Terpasang', `File ${isVideo ? 'video' : 'foto'} "${file.name}" berhasil diunggah.`);
    };

    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    if (media?.previewUrl) {
      URL.revokeObjectURL(media.previewUrl);
    }
    setMedia(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerateAIContent = async () => {
    if (!topic.trim() && !media) {
      onShowModal('Info Input', 'Harap masukkan tema visual atau lampirkan file foto/video.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setResultText(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (customApiKey) {
        headers['x-custom-api-key'] = customApiKey;
      }

      const bodyPayload: any = {
        topic: topic.trim(),
        style,
      };

      if (media) {
        bodyPayload.base64Data = media.base64Data;
        bodyPayload.mimeType = media.mimeType;
        bodyPayload.fileName = media.fileName;
      }

      const res = await fetch('/api/gemini/ai-studio', {
        method: 'POST',
        headers,
        body: JSON.stringify(bodyPayload),
      });

      const contentType = res.headers.get('content-type');
      let data: any = {};
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(
          `Server memberikan tanggapan berupa web/HTML bukan JSON (${res.status}). Pastikan backend server Express berjalan dan terhubung.`
        );
      }

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mensintesis konten.');
      }

      setResultText(data.result);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Gagal memproses AI Studio.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (resultText) {
      navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onShowModal('Berhasil Disalin', 'Teks caption dan hashtag telah disalin ke clipboard.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8">
      {/* Form Panel (5 cols) */}
      <div className="lg:col-span-5 space-y-5">
        <div className="fluost-box p-4 sm:p-6 md:p-8">
          <div className="fluost-fluid-bg"></div>
          <div className="fluost-sand-corner"></div>

          <div className="relative z-10 space-y-5">
            <h2 className="text-2xl font-bold flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-[var(--fluid-2)]" /> Fluost AI Spark
            </h2>
            <p className="text-xs md:text-sm opacity-80 leading-relaxed">
              Hasilkan racikan caption, hashtag terarah, dan hook story Instagram instan dari teks maupun lampiran foto & video custom Anda.
            </p>

            {/* Custom Photo / Video Attachment Box */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-extrabold text-[var(--fluid-2)] uppercase tracking-wider flex items-center justify-between">
                <span>Lampiran Foto / Video Custom</span>
                <span className="text-[10px] opacity-70 font-mono font-normal">Opsional</span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="ai-spark-media-input"
              />

              {!media ? (
                <label
                  htmlFor="ai-spark-media-input"
                  className="border-2 border-dashed border-[var(--ice-border)] hover:border-[#3D5AFE] rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all bg-black/10 hover:bg-black/20 text-center gap-2 group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#3D5AFE]/10 group-hover:bg-[#3D5AFE]/20 flex items-center justify-center text-[#38BDF8] transition-all">
                    <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--text-main)]">
                      Klik atau Drag Foto / Video Custom
                    </p>
                    <p className="text-[10px] opacity-60 mt-0.5">
                      Mendukung PNG, JPG, MP4, MOV (Maks. 25MB)
                    </p>
                  </div>
                </label>
              ) : (
                <div className="relative rounded-2xl border border-[var(--ice-border)] bg-black/30 overflow-hidden p-3 flex items-center gap-3">
                  {/* Media Preview Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-900 shrink-0 relative flex items-center justify-center border border-white/10">
                    {media.isVideo ? (
                      <video src={media.previewUrl} className="w-full h-full object-cover" />
                    ) : (
                      <img src={media.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute top-1 left-1 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-sky-300 flex items-center gap-1">
                      {media.isVideo ? <Film className="w-2.5 h-2.5" /> : <Image className="w-2.5 h-2.5" />}
                      {media.isVideo ? 'VIDEO' : 'FOTO'}
                    </div>
                  </div>

                  {/* File Meta info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate text-[var(--text-main)]">
                      {media.fileName}
                    </p>
                    <p className="text-[10px] text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
                      <FileCheck className="w-3 h-3" /> Siap dianalisis Gemini AI
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={removeMedia}
                    className="p-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-all shrink-0"
                    title="Hapus media"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-1">
              <label className="text-xs font-extrabold text-[var(--fluid-2)] uppercase tracking-wider">
                Tema / Catatan Tambahan
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={3}
                placeholder={
                  media
                    ? 'Tambah konteks (Opsional): misal "Promo Diskon Akhir Pekan 50%"...'
                    : 'Contoh: Foto arsitektur eropa klasik dengan pencahayaan hangat sore hari...'
                }
                className="fluost-input w-full p-4 font-medium text-xs md:text-sm leading-relaxed"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold text-[var(--fluid-2)] uppercase tracking-wider">
                Gaya Bahasa / Tone
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="fluost-input w-full p-3 font-bold text-xs md:text-sm"
              >
                <option value="Klasik & Elegan">Klasik & Elegan (Puitis, Terstruktur)</option>
                <option value="Modern Minimalist">Modern Minimalist (Singkat, Padat)</option>
                <option value="Storytelling Edukatif">Storytelling & Edukatif (Inspiratif)</option>
                <option value="Casual & Friendly">Casual & Friendly (Sangat Nyantai)</option>
                <option value="Hard Sell Promosi">Hard Sell Promosi (Persuasif & Call to Action)</option>
              </select>
            </div>

            <button
              onClick={handleGenerateAIContent}
              disabled={isLoading}
              className="fluost-btn w-full py-4 text-sm mt-4 flex items-center justify-center gap-2 shadow-xl"
            >
              {isLoading ? (
                <>
                  <Wand2 className="w-4 h-4 animate-spin" /> Mensintesis Visual & Teks...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" /> Sintesis Caption & Hashtag
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Result Panel (7 cols) */}
      <div className="lg:col-span-7">
        <div className="fluost-box p-4 sm:p-6 md:p-8 h-full min-h-[320px] flex flex-col justify-between">
          <div className="fluost-fluid-bg"></div>
          <div className="fluost-sand-corner"></div>

          <div className="relative z-10 h-full flex flex-col justify-between">
            {isLoading && (
              <div className="text-center py-20 my-auto">
                <ThemeLoader text={media ? `Menganalisis file ${media.isVideo ? 'video' : 'foto'} & mensintesis caption...` : "Membuat racikan caption & strategi hashtag..."} size="lg" />
              </div>
            )}

            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-3xl text-center my-auto">
                <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-2" />
                <p className="text-red-400 font-bold text-sm">Gagal Mensintesis Teks</p>
                <p className="text-red-300/80 text-xs mt-1">{errorMessage}</p>
              </div>
            )}

            {!isLoading && !errorMessage && resultText && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4 h-full flex flex-col justify-between"
              >
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <h3 className="font-bold text-sm text-[var(--fluid-2)] flex items-center gap-2">
                    <Dna className="w-4 h-4" /> Rancangan Caption Terbentuk
                  </h3>
                  <button
                    onClick={copyToClipboard}
                    className="ice-badge hover:opacity-100 flex items-center gap-1.5 py-1.5 px-3"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
                  </button>
                </div>

                <div className="bg-black/20 p-5 rounded-2xl border border-[var(--ice-border)] overflow-y-auto max-h-[500px] prose prose-invert max-w-none text-xs md:text-sm font-medium leading-relaxed">
                  <div 
                    dangerouslySetInnerHTML={{
                      __html: resultText
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
                <div className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center border border-[var(--ice-border)] bg-[var(--fluid-1)]/20 backdrop-blur-md shadow-2xl">
                  <Dna className="w-8 h-8 text-[var(--fluid-2)]" />
                </div>
                <h3 className="font-extrabold text-base">Kekuatan Sintesis Siap</h3>
                <p className="text-xs font-medium opacity-70 max-w-xs mx-auto">
                  Panel ini akan menampilkan racikan caption estetik dan arahan hashtag cerdas berdasarkan konteks teks atau media yang Anda lampirkan.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
