import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, Upload, Palette, Microscope, AlertTriangle, Plus, X, Sparkles, Image as ImageIcon, Film, MessageSquareCode, Download, Play, Pause, Activity, Disc, Wand2, FileCheck } from 'lucide-react';
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

export const generateLightroomXmpPreset = (presetName: string, config?: {
  exposure?: number;
  contrast?: number;
  highlights?: number;
  shadows?: number;
  temperature?: number;
  tint?: number;
  saturation?: number;
  clarity?: number;
}) => {
  const name = presetName || 'Fluost_Cinematic_Preset';
  const exp = config?.exposure ?? 0.20;
  const contrast = config?.contrast ?? 25;
  const highlights = config?.highlights ?? -30;
  const shadows = config?.shadows ?? 20;
  const temp = config?.temperature ?? 5600;
  const tint = config?.tint ?? 8;
  const sat = config?.saturation ?? 12;
  const clarity = config?.clarity ?? 18;

  const xmpContent = `<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 7.0-c000">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about=""
    xmlns:crs="http://ns.adobe.com/camera-raw-settings/1.0/"
   crs:PresetType="Normal"
   crs:Cluster="FluostStudio"
   crs:UUID="${Math.random().toString(36).substring(2)}"
   crs:SupportsAmount="200"
   crs:SupportsColor="True"
   crs:SupportsMonochrome="True"
   crs:SupportsHighDynamicRange="True"
   crs:SupportsNormalDynamicRange="True"
   crs:SupportsSceneReferred="True"
   crs:SupportsOutputReferred="True"
   crs:CameraConfig="AdobeStandard"
   crs:HasSettings="True"
   crs:Exposure2012="${exp}"
   crs:Contrast2012="${contrast}"
   crs:Highlights2012="${highlights}"
   crs:Shadows2012="${shadows}"
   crs:Temperature="${temp}"
   crs:Tint="${tint}"
   crs:Saturation="${sat}"
   crs:Clarity2012="${clarity}">
   <crs:Name>
    <rdf:Alt>
     <rdf:li xml:lang="x-default">${name}</rdf:li>
    </rdf:Alt>
   </crs:Name>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>`;

  const blob = new Blob([xmpContent], { type: 'application/x-xmp' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name.replace(/\s+/g, '_')}_FluostStudio.xmp`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const Visualost: React.FC<VisualostProps> = ({ onShowModal, onOpenApiModal }) => {
  const [mediaList, setMediaList] = useState<VisualMediaItem[]>([]);
  const [userPrompt, setUserPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Interactive Beat Match Preview State
  const [isPlayingBeat, setIsPlayingBeat] = useState(false);
  const [bpm, setBpm] = useState<number>(120);
  const [beatPulse, setBeatPulse] = useState(false);

  // Hex Palette & Watermark State
  const [extractedPalette, setExtractedPalette] = useState<string[]>([]);
  const [watermarkText, setWatermarkText] = useState('@fluost.studio');

  useEffect(() => {
    let interval: any;
    if (isPlayingBeat) {
      const intervalMs = (60 / bpm) * 1000;
      interval = setInterval(() => {
        setBeatPulse(true);
        setTimeout(() => setBeatPulse(false), 120);
      }, intervalMs);
    } else {
      setBeatPulse(false);
    }
    return () => clearInterval(interval);
  }, [isPlayingBeat, bpm]);

  const handleExtractPalette = () => {
    if (mediaList.length === 0) {
      onShowModal('Media Kosong', 'Harap unggah minimal 1 foto terlebih dahulu.');
      return;
    }
    const targetMedia = mediaList[0];
    if (targetMedia.isVideo) {
      onShowModal('Ekstraksi Warna', 'Ekstraksi warna Hex direkomendasikan untuk format foto.');
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 80;
      canvas.height = 80;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, 80, 80);
      const data = ctx.getImageData(0, 0, 80, 80).data;

      const map = new Map<string, number>();
      for (let i = 0; i < data.length; i += 16) {
        const r = Math.round(data[i] / 32) * 32;
        const g = Math.round(data[i + 1] / 32) * 32;
        const b = Math.round(data[i + 2] / 32) * 32;
        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
        map.set(hex, (map.get(hex) || 0) + 1);
      }

      const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
      const top5 = sorted.slice(0, 5).map((item) => item[0]);
      const finalPalette = top5.length >= 5 ? top5 : [...top5, '#3D5AFE', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'].slice(0, 5);
      setExtractedPalette(finalPalette);
      onShowModal(
        'Ekstraksi Palet Warna Hex Selesai',
        `Berhasil mengekstrak 5 warna utama: ${finalPalette.join(', ')}.\nKlik swatch warna untuk menyalin kode Hex langsung!`
      );
    };
    img.src = targetMedia.previewUrl;
  };

  const handleDownloadWatermarkedImage = () => {
    if (mediaList.length === 0) return;
    const targetMedia = mediaList[0];

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      // Draw Watermark Badge
      const text = watermarkText || '@fluost.studio';
      const fontSize = Math.max(24, Math.round(img.width * 0.035));
      ctx.font = `bold ${fontSize}px sans-serif`;

      const metrics = ctx.measureText(text);
      const padding = fontSize * 0.5;
      const boxW = metrics.width + padding * 2;
      const boxH = fontSize * 1.6;
      const x = img.width - boxW - padding;
      const y = img.height - boxH - padding;

      // Background Pill
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.beginPath();
      ctx.roundRect(x, y, boxW, boxH, fontSize * 0.5);
      ctx.fill();

      // Text
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(text, x + padding, y + fontSize * 1.1);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `Fluost_Watermarked_${Date.now()}.jpg`;
      a.click();

      onShowModal('Foto Ber-Watermark Diunduh', `Foto berhasil diimpor dengan watermark "${text}".`);
    };
    img.src = targetMedia.previewUrl;
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const filesArray = Array.from(e.target.files) as File[];
    const newItems: VisualMediaItem[] = [];

    for (const file of filesArray) {
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

  const handleDownloadXmp = () => {
    generateLightroomXmpPreset(userPrompt || 'Fluost_Cinematic_Tone');
    onShowModal(
      'Preset Lightroom Terunduh (.XMP)',
      'File preset .XMP berhasil diunduh! Anda dapat langsung mengimpor file ini ke Adobe Lightroom Mobile atau Desktop.'
    );
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
                <div className="flex flex-wrap justify-between items-center pb-3 border-b border-white/10 gap-2">
                  <h3 className="font-bold text-sm text-[var(--fluid-2)] flex items-center gap-2">
                    <Palette className="w-4 h-4" /> Hasil Pembedahan Color Grading
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExtractPalette}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95"
                      title="Ekstrak 5 Kode Warna Hex Dominan dari Foto"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Ekstrak Hex Warna</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadXmp}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
                      title="Unduh Preset Asli Adobe Lightroom (.XMP)"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Preset (.XMP)</span>
                    </button>
                  </div>
                </div>

                {/* Hex Palette Swatches Bar */}
                {extractedPalette.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-purple-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                      <span className="flex items-center gap-1.5">
                        <Palette className="w-4 h-4 text-purple-400" /> Palet Hex Dominan (Klik untuk salin):
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {extractedPalette.map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(hex);
                            onShowModal('Kode Warna Tersalin!', `Kode warna Hex ${hex} berhasil disalin ke clipboard.`);
                          }}
                          className="group relative p-2 rounded-xl flex flex-col items-center justify-center gap-1 border border-white/10 hover:border-white transition-all active:scale-95"
                          style={{ backgroundColor: hex }}
                        >
                          <span className="text-[10px] font-mono font-black text-white bg-black/70 px-1.5 py-0.5 rounded shadow-sm">
                            {hex}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Watermark Generator Bar */}
                {mediaList.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                      <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <input
                        type="text"
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        placeholder="Watermark, misal: @username_kamu"
                        className="bg-black/50 border border-white/20 text-white text-xs rounded-xl px-3 py-1.5 w-full focus:border-emerald-400 outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadWatermarkedImage}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh Ber-Watermark</span>
                    </button>
                  </div>
                )}

                {/* Idea 1: Interactive Audio-Visual Beat Match Engine */}
                {mediaList.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-black/30 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                      <Activity className={`w-4 h-4 ${isPlayingBeat ? 'animate-bounce text-emerald-400' : 'text-indigo-400'}`} />
                      <span>Live Audio-Visual Beat Sync Engine:</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* BPM Selector */}
                      <select
                        value={bpm}
                        onChange={(e) => setBpm(Number(e.target.value))}
                        className="bg-black/60 border border-white/20 text-white text-[11px] font-mono px-2 py-1 rounded-lg"
                      >
                        <option value={90}>90 BPM (Chill)</option>
                        <option value={120}>120 BPM (Pop)</option>
                        <option value={128}>128 BPM (Dance)</option>
                        <option value={140}>140 BPM (Beat Drop)</option>
                      </select>

                      {/* Play/Pause Beat Simulation */}
                      <button
                        type="button"
                        onClick={() => setIsPlayingBeat(!isPlayingBeat)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                          isPlayingBeat
                            ? 'bg-red-500 text-white shadow-md'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        {isPlayingBeat ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        <span>{isPlayingBeat ? 'Stop Beat' : 'Test Beat Sync'}</span>
                      </button>
                    </div>

                    {/* Beat Pulse Preview Frame */}
                    {isPlayingBeat && mediaList[0] && (
                      <div className="w-full mt-1 pt-2 border-t border-white/10 flex items-center gap-3">
                        <div
                          className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-100 ${
                            beatPulse
                              ? 'scale-110 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.8)]'
                              : 'scale-100 border-white/20 opacity-80'
                          }`}
                        >
                          <img
                            src={mediaList[0].previewUrl}
                            alt="Beat Pulse Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-[11px] font-mono text-emerald-400 space-y-0.5">
                          <p className="font-bold flex items-center gap-1">
                            <Disc className="w-3 h-3 animate-spin" /> Audio Pulse Active ({bpm} BPM)
                          </p>
                          <p className="text-[10px] text-white/70">
                            Transisi visual dipasang persis pada detak {bpm} BPM untuk Reels & TikTok.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-black/20 p-5 rounded-2xl border border-[var(--ice-border)] overflow-y-auto max-h-[480px] prose prose-invert max-w-none text-xs md:text-sm font-medium leading-relaxed">
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
