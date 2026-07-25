import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Headphones, Radio, Sparkles, Disc, Music, AlertTriangle, Upload, Image as ImageIcon, Video, Youtube, X } from 'lucide-react';
import { ThemeLoader } from './ThemeLoader';
import { fetchMusicAI } from '../lib/geminiClient';

interface ListenListProps {
  onShowModal: (title: string, body: string) => void;
  customApiKey: string;
  onOpenApiModal?: () => void;
}

export const ListenList: React.FC<ListenListProps> = ({ onShowModal, customApiKey, onOpenApiModal }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Custom Media Upload State (For users who prefer uploading photo/video instead of typing)
  const [uploadedMedia, setUploadedMedia] = useState<{ url: string; type: 'image' | 'video'; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      onShowModal('Ukuran File Terlalu Besar', 'Maksimal ukuran media adalah 20MB.');
      return;
    }

    const url = URL.createObjectURL(file);
    const type = file.type.startsWith('video/') ? 'video' : 'image';
    setUploadedMedia({ url, type, name: file.name });
    
    // Auto-fill query suggestion if prompt is empty
    if (!query.trim()) {
      setQuery(`Analisis musik & lirik sesuai nuansa ${type === 'video' ? 'video' : 'foto'} (${file.name})`);
    }
    
    onShowModal('Media Berhasil Dimuat', `Media ${file.name} telah diunggah. Klik 'Deteksi Audio & Lirik' untuk memulai analisis visual AI.`);
  };

  const handleSearchMusic = async () => {
    const finalQuery = query.trim() || (uploadedMedia ? `Sintesis musik & lirik untuk nuansa media ${uploadedMedia.type} ${uploadedMedia.name}` : '');
    
    if (!finalQuery) {
      onShowModal('Info Input', 'Harap ketik deskripsi mood visual atau unggah foto/video.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setResultText(null);

    try {
      const result = await fetchMusicAI(finalQuery, customApiKey);
      setResultText(result);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Gagal memproses deteksi audio.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fluost-box p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      <div className="fluost-fluid-bg"></div>
      <div className="fluost-sand-corner"></div>

      <div className="relative z-10 space-y-5 sm:space-y-8 max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="ice-badge bg-white/10 inline-flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-[var(--fluid-2)] animate-pulse" />
            ListenList Audio AI Engine
          </span>

          <h2 className="text-3xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[var(--fluid-1)] via-[var(--fluid-2)] to-[var(--fluid-3)]">
            ListenList
          </h2>

          <p className="text-xs md:text-base font-medium opacity-80 max-w-2xl mx-auto leading-relaxed">
            Deskripsikan postingan atau unggah foto/video Anda. Fluost akan mencarikan lirik paling relevan, getaran audio (vibes), dan rekomendasi YouTube Music.
          </p>
        </div>

        {/* Input & Media Upload Bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Headphones className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--fluid-2)]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchMusic()}
                placeholder="Ketik mood visual... atau unggah foto/video di samping jika malas mengetik"
                className="fluost-input w-full pl-12 pr-4 py-4 text-sm md:text-base font-bold shadow-lg"
              />
            </div>

            {/* Custom Media Upload Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleMediaUpload}
              accept="image/*,video/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded-2xl bg-[var(--ice-bg)] border border-[var(--ice-border)] hover:border-[#3D5AFE] flex items-center justify-center gap-2 font-bold text-xs sm:text-sm shrink-0 shadow-md transition-all active:scale-95"
              title="Unggah Foto / Video Custom"
            >
              <Upload className="w-4 h-4 text-[#3D5AFE]" />
              <span className="hidden sm:inline">Unggah Media</span>
            </button>

            <button
              onClick={handleSearchMusic}
              disabled={isLoading}
              className="fluost-btn px-6 py-4 text-sm md:text-base flex items-center justify-center gap-2 shrink-0 shadow-xl"
            >
              {isLoading ? (
                <>
                  <Radio className="w-5 h-5 animate-spin" /> Memindai Audio...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" /> Deteksi Audio & Lirik
                </>
              )}
            </button>
          </div>

          {/* Uploaded Custom Media Preview Pill */}
          {uploadedMedia && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--ice-bg)] border border-[var(--ice-border)] text-xs font-bold shadow-sm">
              <div className="flex items-center gap-2.5 truncate">
                {uploadedMedia.type === 'image' ? (
                  <ImageIcon className="w-4 h-4 text-[#3D5AFE] shrink-0" />
                ) : (
                  <Video className="w-4 h-4 text-purple-500 shrink-0" />
                )}
                <span className="truncate">{uploadedMedia.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                  Media Siap Ditinjau
                </span>
              </div>
              <button
                onClick={() => setUploadedMedia(null)}
                className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-all shrink-0 ml-2"
                title="Hapus Media"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Output Container */}
        <div className="mt-8">
          {isLoading && (
            <div className="text-center py-12 border border-white/10 rounded-3xl bg-black/10 backdrop-blur-md">
              <ThemeLoader text="Menganalisis frekuensi audio via Gemini AI..." size="lg" />
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-3xl text-center space-y-3">
              <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
              <div>
                <p className="text-red-400 font-bold text-sm">Gagal Memproses Audio</p>
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
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--card-bg)] p-6 md:p-8 rounded-[2rem] border border-[var(--ice-border)] shadow-xl relative overflow-hidden backdrop-blur-xl space-y-6"
            >
              <div className="fluost-sand-corner"></div>
              
              {/* YouTube Music Direct Listen & Lyrics Shortcuts */}
              <div className="p-4 rounded-2xl bg-red-600/10 border border-red-500/30 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-red-500 font-bold text-xs sm:text-sm">
                  <Youtube className="w-5 h-5 shrink-0" />
                  <span>Dengar Lagu Lengkap & Lirik di YouTube Music</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://music.youtube.com/search?q=${encodeURIComponent(query || 'Lagu populer Instagram')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                  >
                    <Youtube className="w-4 h-4" /> Buka YouTube Music
                  </a>
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent((query || 'Lagu') + ' lirik video')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-[var(--ice-bg)] hover:border-red-500 text-xs font-bold flex items-center gap-1.5 border border-[var(--ice-border)] transition-all"
                  >
                    <Music className="w-3.5 h-3.5 text-red-400" /> Lirik Video
                  </a>
                </div>
              </div>

              <div className="relative z-10 prose prose-invert max-w-none text-xs md:text-sm font-medium leading-relaxed">
                <div className="flex items-center gap-2 text-[var(--fluid-2)] text-lg font-black mb-4 pb-2 border-b border-white/10">
                  <Music className="w-5 h-5" /> Hasil Sintesis Audio
                </div>

                <div 
                  className="whitespace-pre-wrap space-y-2"
                  dangerouslySetInnerHTML={{
                    __html: resultText
                      .replace(/### (.*?)\n/g, '<h3 class="text-base font-bold text-[var(--fluid-2)] mt-4 mb-2">$1</h3>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[var(--fluid-1)] font-bold">$1</strong>')
                  }}
                />
              </div>
            </motion.div>
          )}

          {!isLoading && !resultText && !errorMessage && (
            <div className="text-center py-16 border-2 border-dashed border-[var(--ice-border)] rounded-3xl bg-black/5">
              <Disc className="w-16 h-16 text-[var(--fluid-2)] opacity-40 mx-auto mb-3 animate-spin" style={{ animationDuration: '20s' }} />
              <p className="font-bold text-sm tracking-wide">Pencari Audio Siap Dijalankan</p>
              <p className="text-xs opacity-70 mt-1">Masukkan deskripsi di atas untuk menemukan musik terbaik untuk Instagram Anda.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
