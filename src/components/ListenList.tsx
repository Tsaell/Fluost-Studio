import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Headphones, Radio, Sparkles, Disc, Music, AlertTriangle, Upload, Image as ImageIcon, Video, Youtube, X, Play, Pause, ExternalLink, Copy } from 'lucide-react';
import { ThemeLoader } from './ThemeLoader';
import { fetchMusicAI, MusicSongItem } from '../lib/geminiClient';

interface ListenListProps {
  onShowModal: (title: string, body: string) => void;
  onOpenApiModal?: () => void;
}

export const ListenList: React.FC<ListenListProps> = ({ onShowModal, onOpenApiModal }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [songList, setSongList] = useState<MusicSongItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Audio Preview State
  const [playingTrackId, setPlayingTrackId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Custom Media Upload State (For users who prefer uploading photo/video instead of typing)
  const [uploadedMedia, setUploadedMedia] = useState<{ url: string; type: 'image' | 'video'; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio and Object URL cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (uploadedMedia?.url && uploadedMedia.url.startsWith('blob:')) {
        URL.revokeObjectURL(uploadedMedia.url);
      }
    };
  }, [uploadedMedia]);

  const toggleAudioPreview = (trackId: number, previewUrl?: string) => {
    if (!previewUrl) return;

    if (playingTrackId === trackId) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingTrackId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const newAudio = new Audio(previewUrl);
      audioRef.current = newAudio;
      newAudio.play().catch(err => console.warn('Audio play blocked:', err));
      newAudio.onended = () => setPlayingTrackId(null);
      setPlayingTrackId(trackId);
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      onShowModal('Ukuran File Terlalu Besar', 'Maksimal ukuran media adalah 50MB.');
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
    setSongList([]);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPlayingTrackId(null);

    try {
      const res = await fetchMusicAI(finalQuery);
      setResultText(res.resultText);
      setSongList(res.songs || []);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(String(err?.message || err || 'Gagal memproses deteksi audio.'));
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
            ListenList Audio AI & Unlimited Song Catalog
          </span>

          <h2 className="text-3xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[var(--fluid-1)] via-[var(--fluid-2)] to-[var(--fluid-3)]">
            ListenList
          </h2>

          <p className="text-xs md:text-base font-medium opacity-80 max-w-2xl mx-auto leading-relaxed">
            Ketik nama lagu, penyanyi, genre, mood, atau unggah foto/video. Fluost menghubungkan katalog musik global YouTube Music & iTunes dengan lirik resmi otentik.
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
                placeholder="Misal: Sheila On 7, Mahalini, Taylor Swift, lagu galau hujan, mood sunset, dll..."
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
                  <Radio className="w-5 h-5 animate-spin" /> Memindai Katalog...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" /> Cari Musik & Lirik
                </>
              )}
            </button>
          </div>

          {/* Quick Vibe & Genre Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-bold text-[var(--fluid-2)] uppercase tracking-wider shrink-0 mr-1">
              Kategori Cepat:
            </span>
            {[
              { label: '🔥 Viral TikTok', q: 'Lagu viral TikTok trending Instagram Reels' },
              { label: '🌊 Chill Lofi', q: 'Lofi chill instrumental relaxed sunset' },
              { label: '💔 Lagu Galau', q: 'Lagu galau Indonesia sedih patah hati' },
              { label: '☀️ Sunset Aesthetic', q: 'Lagu mood sunset pantai sore estetik' },
              { label: '⚡ Upbeat Pop', q: 'Upbeat energetic pop hits dance' },
              { label: '🇰🇷 K-Pop Vibe', q: 'K-Pop aesthetic chill vibe Korean hits' },
              { label: '🎸 Indie Folk', q: 'Indie folk akustik senja kopi' },
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => {
                  setQuery(chip.q);
                  // Trigger search with new query
                  setTimeout(() => {
                    fetchMusicAI(chip.q).then((res) => {
                      setResultText(res.resultText);
                      setSongList(res.songs || []);
                    }).catch((err) => setErrorMessage(String(err)));
                  }, 50);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-[var(--ice-bg)] hover:bg-[#3D5AFE] hover:text-white border border-[var(--ice-border)] text-xs font-bold transition-all active:scale-95 shadow-xs"
              >
                {chip.label}
              </button>
            ))}
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
        <div className="mt-8 space-y-6">
          {isLoading && (
            <div className="text-center py-12 border border-white/10 rounded-3xl bg-black/10 backdrop-blur-md">
              <ThemeLoader text="Menghubungkan katalog YouTube Music & menyintesis lirik resmi..." size="lg" />
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

          {!isLoading && !errorMessage && (songList.length > 0 || resultText) && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Song List Cards Grid */}
              {songList.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm sm:text-base font-black flex items-center gap-2">
                      <Music className="w-4 h-4 text-[var(--fluid-2)]" />
                      <span>Katalog Lagu Resmi Ditemukan ({songList.length})</span>
                    </h3>
                    <a
                      href={`https://music.youtube.com/search?q=${encodeURIComponent(query || 'Lagu populer')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1"
                    >
                      <Youtube className="w-4 h-4" /> Buka Selengkapnya di YouTube Music
                    </a>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {songList.map((song) => (
                      <div
                        key={song.trackId}
                        className="p-3.5 rounded-2xl bg-[var(--card-bg)] border border-[var(--ice-border)] shadow-md hover:border-[#3D5AFE] transition-all flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {song.artworkUrl ? (
                            <img
                              src={song.artworkUrl}
                              alt={song.trackName}
                              className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-sm border border-white/20"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                              <Music className="w-6 h-6 text-white" />
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="font-bold text-xs sm:text-sm truncate leading-tight group-hover:text-[var(--fluid-2)] transition-colors">
                              {song.trackName}
                            </p>
                            <p className="text-[11px] font-medium opacity-75 truncate mt-0.5">
                              {song.artistName}
                            </p>
                            {song.primaryGenreName && (
                              <span className="inline-block mt-1 text-[9px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20">
                                {song.primaryGenreName}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              const formattedCaption = `🎵 Listening to: ${song.trackName} - ${song.artistName}\n\n✨ "Suasana & nada visual menyatu sempurna dalam ritme nada."\n\n#FluostStudio #NowPlaying #${song.artistName.replace(/\s+/g, '')} #${song.trackName.replace(/\s+/g, '')} #ReelsAudio #InstagramFeed`;
                              navigator.clipboard.writeText(formattedCaption);
                              onShowModal(
                                'Caption IG Lirik Tersalin!',
                                `Caption berikut telah disalin ke clipboard:\n\n${formattedCaption}`
                              );
                            }}
                            className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-all font-bold text-xs flex items-center justify-center shadow-md active:scale-95"
                            title="Salin sebagai Caption IG Lirik"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {song.previewUrl && (
                            <button
                              type="button"
                              onClick={() => toggleAudioPreview(song.trackId, song.previewUrl)}
                              className={`p-2.5 rounded-xl transition-all font-bold text-xs flex items-center justify-center ${
                                playingTrackId === song.trackId
                                  ? 'bg-emerald-500 text-white shadow-lg animate-pulse'
                                  : 'bg-[var(--ice-bg)] border border-[var(--ice-border)] hover:bg-[#3D5AFE] hover:text-white'
                              }`}
                              title={playingTrackId === song.trackId ? 'Hentikan Preview' : 'Putar Sample Preview Audio 30 Detik'}
                            >
                              {playingTrackId === song.trackId ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </button>
                          )}

                          <a
                            href={song.youtubeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2.5 rounded-xl bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition-all font-bold text-xs flex items-center justify-center border border-red-500/20"
                            title="Buka di YouTube Music"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gemini AI Detailed Lyrics & Vibe Analysis Card */}
              {resultText && (
                <div className="bg-[var(--card-bg)] p-6 md:p-8 rounded-[2rem] border border-[var(--ice-border)] shadow-xl relative overflow-hidden backdrop-blur-xl space-y-6">
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
                      <Sparkles className="w-5 h-5" /> Analisis Lirik Resmi & Vibe Audio
                    </div>

                    <div 
                      className="whitespace-pre-wrap space-y-2"
                      dangerouslySetInnerHTML={{
                        __html: String(resultText || '')
                          .replace(/### (.*?)\n/g, '<h3 class="text-base font-bold text-[var(--fluid-2)] mt-4 mb-2">$1</h3>')
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[var(--fluid-1)] font-bold">$1</strong>')
                      }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {!isLoading && !resultText && songList.length === 0 && !errorMessage && (
            <div className="text-center py-16 border-2 border-dashed border-[var(--ice-border)] rounded-3xl bg-black/5">
              <Disc className="w-16 h-16 text-[var(--fluid-2)] opacity-40 mx-auto mb-3 animate-spin" style={{ animationDuration: '20s' }} />
              <p className="font-bold text-sm tracking-wide">Pencari Audio & Katalog Musik Siap Dijalankan</p>
              <p className="text-xs opacity-70 mt-1 max-w-md mx-auto">
                Ketik penyanyi favorit Anda (Sheila On 7, Mahalini, Taylor Swift, dll.) atau deskripsi mood untuk menemukan ribuan lagu & lirik resmi YouTube Music.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

