import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import { 
  Crop, 
  Upload, 
  Download, 
  RotateCcw, 
  ZoomIn, 
  Move, 
  CheckCircle2, 
  Layers, 
  Grid3x3, 
  Info, 
  Maximize2, 
  X, 
  Copy,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { GridPiece } from '../types';

interface EnGridProps {
  onShowModal: (title: string, body: string) => void;
}

const DEFAULT_IMAGE_URL = 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=1200';

export const EnGrid: React.FC<EnGridProps> = ({ onShowModal }) => {
  const [cols, setCols] = useState<number>(3);
  const [rows, setRows] = useState<number>(3);
  const [imageSrc, setImageSrc] = useState<string>(DEFAULT_IMAGE_URL);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [gridPieces, setGridPieces] = useState<GridPiece[]>([]);
  
  // Transform & Pan / Scale controls for precise cropping
  const [scale, setScale] = useState<number>(1);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Lightbox preview for single tile
  const [selectedPiece, setSelectedPiece] = useState<GridPiece | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Load default image on mount
  useEffect(() => {
    loadImage(DEFAULT_IMAGE_URL);
  }, []);

  const loadImage = (url: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImageObj(img);
      setImageSrc(url);
      setScale(1);
      setOffsetX(0);
      setOffsetY(0);
    };
    img.src = url;
  };

  // Re-generate grid slices whenever imageObj, cols, rows, scale, offsetX, or offsetY change
  useEffect(() => {
    if (imageObj) {
      generateSlices();
    }
  }, [imageObj, cols, rows, scale, offsetX, offsetY]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 15 * 1024 * 1024) {
        onShowModal('Ukuran File Besar', 'Ukuran foto melebihi 15MB. Harap gunakan foto dengan ukuran lebih kecil.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          loadImage(event.target.result as string);
          onShowModal('Visual Diterima', 'Foto berhasil dimuat. Atur posisi dan eksekusi pemotongan EnGrid!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const generateSlices = () => {
    if (!imageObj) return;

    const totalTiles = cols * rows;
    const pieces: GridPiece[] = [];

    // Target grid aspect ratio is cols : rows
    const targetAspect = cols / rows;
    const imgAspect = imageObj.width / imageObj.height;

    let cropW = imageObj.width;
    let cropH = imageObj.height;
    let cropX = 0;
    let cropY = 0;

    if (imgAspect > targetAspect) {
      // Image is wider than target aspect
      cropW = imageObj.height * targetAspect;
      cropH = imageObj.height;
      cropX = (imageObj.width - cropW) / 2;
    } else {
      // Image is taller than target aspect
      cropW = imageObj.width;
      cropH = imageObj.width / targetAspect;
      cropY = (imageObj.height - cropH) / 2;
    }

    // Apply scale & pan offset
    const scaledCropW = cropW / scale;
    const scaledCropH = cropH / scale;

    const maxShiftX = (cropW - scaledCropW) / 2;
    const maxShiftY = (cropH - scaledCropH) / 2;

    const finalCropX = cropX + (cropW - scaledCropW) / 2 - (offsetX / 100) * (maxShiftX || cropW * 0.25);
    const finalCropY = cropY + (cropH - scaledCropH) / 2 - (offsetY / 100) * (maxShiftY || cropH * 0.25);

    const tileW = scaledCropW / cols;
    const tileH = scaledCropH / rows;

    let tileId = 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const canvas = document.createElement('canvas');
        // Export high-res tile (e.g. 1080x1080 standard for Instagram)
        const exportSize = 1080;
        canvas.width = exportSize;
        canvas.height = exportSize;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(
            imageObj,
            finalCropX + c * tileW,
            finalCropY + r * tileH,
            tileW,
            tileH,
            0,
            0,
            exportSize,
            exportSize
          );
        }

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        
        // Instagram posts appear in reverse feed order (last uploaded is on top-left)
        // Upload order: bottom row rightmost tile (#N) is uploaded FIRST
        const uploadOrder = totalTiles - tileId + 1;

        pieces.push({
          id: tileId,
          dataUrl,
          row: r,
          col: c,
          uploadOrder,
        });

        tileId++;
      }
    }

    setGridPieces(pieces);
  };

  // Drag handlers for pan offset on mobile/desktop
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - offsetX, y: clientY - offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const newX = Math.max(-100, Math.min(100, clientX - dragStart.x));
    const newY = Math.max(-100, Math.min(100, clientY - dragStart.y));
    
    setOffsetX(newX);
    setOffsetY(newY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Preset dimension button click handler
  const setPresetDimensions = (c: number, r: number) => {
    setCols(c);
    setRows(r);
  };

  // Batch ZIP Download using JSZip
  const handleDownloadAllZip = async () => {
    if (gridPieces.length === 0) return;

    setIsProcessing(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder(`fluost_grid_${cols}x${rows}`);

      // Add readme instructions for Instagram upload order
      const instructions = `================================================
FLUOST ENGRID - PANDUAN UNGGAN INSTAGRAM GRID
================================================
Total Potongan: ${gridPieces.length} (${cols} x ${rows})

PETUNJUK UNGGUNG AGAR TATA LETAK SEMPURNA:
Instagram menampilkan foto terbaru di paling atas kiri.
Oleh karena itu, unggah file dengan urutan TERBALIK:

1. Unggah pertama kali: File bernomor terendah dalam antrean upload (misal: "01_unggah_pertama.jpg")
2. Lanjutkan hingga file terakhir ("${gridPieces.length.toString().padStart(2, '0')}_unggah_terakhir.jpg").

Daftar File Dalam Paket Ini:
${gridPieces
  .slice()
  .sort((a, b) => a.uploadOrder - b.uploadOrder)
  .map(
    (p, idx) =>
      `[Langkah ${idx + 1}] -> File: tile_grid_${p.id.toString().padStart(2, '0')}.jpg (Potongan #${p.id})`
  )
  .join('\n')}

Dibuat dengan Fluost - Instagram Content & Grid Studio.
`;

      folder?.file('BACA_PANDUAN_UPLOAD.txt', instructions);

      gridPieces.forEach((piece) => {
        const base64Data = piece.dataUrl.replace(/^data:image\/jpeg;base64,/, '');
        // Format filename with order hint
        const filename = `tile_${piece.uploadOrder.toString().padStart(2, '0')}_of_${gridPieces.length}_grid_${piece.id}.jpg`;
        folder?.file(filename, base64Data, { base64: true });
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `fluost_grid_${cols}x${rows}_pack.zip`;
      link.click();

      onShowModal('Unduhan Paket Berhasil', `Paket ZIP berisi ${gridPieces.length} gambar dan panduan upload Instagram berhasil diunduh.`);
    } catch (err: any) {
      console.error(err);
      onShowModal('Gagal Mengunduh', 'Terjadi kesalahan saat memproses file ZIP.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Single tile download
  const downloadSingleTile = (piece: GridPiece) => {
    const link = document.createElement('a');
    link.href = piece.dataUrl;
    link.download = `fluost_grid_tile_${piece.id}.jpg`;
    link.click();
  };

  return (
    <div className="space-y-5 sm:space-y-8">
      {/* Top Banner Intro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[var(--card-bg)] p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] border border-[var(--ice-border)] shadow-xl relative overflow-hidden backdrop-blur-xl">
        <div className="fluost-fluid-bg"></div>
        <div className="fluost-sand-corner"></div>
        <div className="relative z-10 flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-[var(--fluid-1)] to-[var(--fluid-2)] flex items-center justify-center text-white shadow-lg shrink-0">
            <Crop className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg sm:text-2xl font-black flex items-center gap-2">
              EnGrid Studio Pro
            </h2>
            <p className="text-xs sm:text-sm font-medium opacity-80 mt-0.5">
              Presisi tinggi pemotongan grid Instagram, kontrol pan/zoom interaktif, dan simulasi umpan langsung responsive.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setScale(1);
              setOffsetX(0);
              setOffsetY(0);
            }}
            className="ice-badge hover:opacity-100 transition-all flex items-center gap-1.5 py-2 px-3 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Posisi
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8">
        
        {/* Left Controls & Cropper Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="fluost-box p-4 sm:p-6 md:p-8">
            <div className="fluost-fluid-bg"></div>
            <div className="fluost-sand-corner"></div>
            
            <div className="relative z-10 space-y-6">
              
              {/* Dropzone & Interactive Pan Area */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-[var(--fluid-2)]">
                  <span>Input Visual & Area Potong</span>
                  <span className="opacity-70 font-mono">{cols} x {rows} ({cols * rows} Grid)</span>
                </div>

                <div 
                  ref={containerRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onTouchStart={handleMouseDown}
                  onTouchMove={handleMouseMove}
                  onTouchEnd={handleMouseUp}
                  className="relative aspect-square w-full rounded-3xl overflow-hidden border-2 border-dashed border-[var(--ice-border)] bg-black/20 hover:border-[var(--fluid-2)] transition-colors cursor-grab active:cursor-grabbing group shadow-inner touch-none select-none"
                >
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-30"
                    title="Pilih gambar baru"
                  />

                  {/* Cropped Image Canvas Preview */}
                  {imageSrc && (
                    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-black/40">
                      <img 
                        src={imageSrc} 
                        alt="Target visual" 
                        style={{
                          transform: `scale(${scale}) translate(${offsetX * 0.5}px, ${offsetY * 0.5}px)`,
                          transition: isDragging ? 'none' : 'transform 0.2s ease-out'
                        }}
                        className="w-full h-full object-cover pointer-events-none"
                      />

                      {/* Interactive Crop Grid Lines Overlay */}
                      <div 
                        className="absolute inset-0 grid pointer-events-none z-10 border-2 border-[var(--fluid-2)] shadow-[0_0_20px_var(--accent-glow)]"
                        style={{
                          gridTemplateColumns: `repeat(${cols}, 1fr)`,
                          gridTemplateRows: `repeat(${rows}, 1fr)`,
                        }}
                      >
                        {Array.from({ length: cols * rows }).map((_, idx) => (
                          <div 
                            key={idx} 
                            className="border border-white/40 border-dashed relative flex items-center justify-center bg-black/5"
                          >
                            <span className="text-[10px] font-black text-white/70 bg-black/50 px-1.5 py-0.5 rounded-full border border-white/20 backdrop-blur-sm">
                              #{idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Drag / Upload Prompt Badge */}
                  <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-none flex items-center justify-between bg-black/60 backdrop-blur-md p-2.5 rounded-2xl border border-white/20 text-white text-xs">
                    <div className="flex items-center gap-2 font-medium">
                      <Move className="w-4 h-4 text-[var(--fluid-2)] animate-pulse" />
                      <span>Geser untuk atur posisi</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-[var(--fluid-2)]">
                      <Upload className="w-3.5 h-3.5" /> Ganti Foto
                    </div>
                  </div>
                </div>
              </div>

              {/* Zoom & Pan Sliders */}
              <div className="space-y-4 bg-black/10 p-4 rounded-2xl border border-white/10">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-[var(--text-main)]">
                    <span className="flex items-center gap-1.5 text-[var(--fluid-2)]">
                      <ZoomIn className="w-3.5 h-3.5" /> Zoom / Skala Crop
                    </span>
                    <span className="font-mono text-xs">{scale.toFixed(2)}x</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="2.5" 
                    step="0.05" 
                    value={scale} 
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full accent-[var(--fluid-2)] cursor-pointer h-1.5 bg-black/30 rounded-lg"
                  />
                </div>
              </div>

              {/* Grid Layout Presets */}
              <div className="space-y-3">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[var(--fluid-2)] flex items-center gap-1.5">
                  <Grid3x3 className="w-4 h-4" /> Preset Baris & Kolom Grid
                </label>

                <div className="grid grid-cols-3 gap-2.5">
                  <button 
                    onClick={() => setPresetDimensions(3, 1)}
                    className={`fluost-input p-2.5 text-xs font-bold text-center transition-all ${
                      cols === 3 && rows === 1 
                        ? 'border-[var(--fluid-2)] shadow-[0_0_12px_var(--accent-glow)] bg-white/10 text-[var(--fluid-2)]' 
                        : 'hover:bg-white/5'
                    }`}
                  >
                    3x1 (Banner)
                  </button>

                  <button 
                    onClick={() => setPresetDimensions(3, 2)}
                    className={`fluost-input p-2.5 text-xs font-bold text-center transition-all ${
                      cols === 3 && rows === 2 
                        ? 'border-[var(--fluid-2)] shadow-[0_0_12px_var(--accent-glow)] bg-white/10 text-[var(--fluid-2)]' 
                        : 'hover:bg-white/5'
                    }`}
                  >
                    3x2 (Ganda)
                  </button>

                  <button 
                    onClick={() => setPresetDimensions(3, 3)}
                    className={`fluost-input p-2.5 text-xs font-bold text-center transition-all ${
                      cols === 3 && rows === 3 
                        ? 'border-[var(--fluid-2)] shadow-[0_0_12px_var(--accent-glow)] bg-white/10 text-[var(--fluid-2)]' 
                        : 'hover:bg-white/5'
                    }`}
                  >
                    3x3 (Standard)
                  </button>

                  <button 
                    onClick={() => setPresetDimensions(3, 4)}
                    className={`fluost-input p-2.5 text-xs font-bold text-center transition-all ${
                      cols === 3 && rows === 4 
                        ? 'border-[var(--fluid-2)] shadow-[0_0_12px_var(--accent-glow)] bg-white/10 text-[var(--fluid-2)]' 
                        : 'hover:bg-white/5'
                    }`}
                  >
                    3x4 (Panorama)
                  </button>

                  <button 
                    onClick={() => setPresetDimensions(2, 2)}
                    className={`fluost-input p-2.5 text-xs font-bold text-center transition-all ${
                      cols === 2 && rows === 2 
                        ? 'border-[var(--fluid-2)] shadow-[0_0_12px_var(--accent-glow)] bg-white/10 text-[var(--fluid-2)]' 
                        : 'hover:bg-white/5'
                    }`}
                  >
                    2x2 (Quad)
                  </button>

                  <button 
                    onClick={() => setPresetDimensions(1, 3)}
                    className={`fluost-input p-2.5 text-xs font-bold text-center transition-all ${
                      cols === 1 && rows === 3 
                        ? 'border-[var(--fluid-2)] shadow-[0_0_12px_var(--accent-glow)] bg-white/10 text-[var(--fluid-2)]' 
                        : 'hover:bg-white/5'
                    }`}
                  >
                    1x3 (Strip)
                  </button>
                </div>

                {/* Custom Grid Sliders */}
                <div className="pt-2 grid grid-cols-2 gap-3 bg-black/10 p-3.5 rounded-2xl border border-white/10">
                  <div>
                    <div className="flex justify-between text-[11px] font-bold mb-1">
                      <span>Kolom: {cols}</span>
                    </div>
                    <input 
                      type="range" min="1" max="6" value={cols} 
                      onChange={(e) => setCols(parseInt(e.target.value))}
                      className="w-full accent-[var(--fluid-1)] cursor-pointer h-1 bg-black/40 rounded"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-bold mb-1">
                      <span>Baris: {rows}</span>
                    </div>
                    <input 
                      type="range" min="1" max="6" value={rows} 
                      onChange={(e) => setRows(parseInt(e.target.value))}
                      className="w-full accent-[var(--fluid-1)] cursor-pointer h-1 bg-black/40 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button 
                  onClick={handleDownloadAllZip}
                  disabled={isProcessing || gridPieces.length === 0}
                  className="fluost-btn w-full py-4 flex items-center justify-center gap-2 text-sm shadow-xl"
                >
                  {isProcessing ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" /> Memproses Paket ZIP...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" /> Unduh Paket ZIP ({gridPieces.length} Potongan)
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Right Panel: Instagram Live Simulator (7 cols) */}
        <div className="lg:col-span-7">
          <div className="fluost-box p-4 sm:p-6 md:p-8 h-full flex flex-col justify-between">
            <div className="fluost-fluid-bg"></div>
            <div className="fluost-sand-corner"></div>

            <div className="relative z-10 space-y-6">
              
              {/* Instagram Header Simulator Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/15 pb-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-[var(--fluid-2)] via-[var(--fluid-1)] to-amber-400 shadow-md">
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
                      alt="Creator Avatar" 
                      className="w-full h-full rounded-full object-cover border-2 border-[var(--bg-base)]"
                    />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base flex items-center gap-1.5">
                      @fluost.studio <CheckCircle2 className="w-4 h-4 text-[var(--fluid-2)] fill-[var(--fluid-2)] text-white" />
                    </h3>
                    <p className="text-xs font-medium opacity-80 mt-0.5 flex items-center gap-2">
                      <span><strong>1,280</strong> postingan</span>
                      <span>•</span>
                      <span><strong>42.8k</strong> pengikut</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="ice-badge font-mono">
                    {cols} x {rows} Feed Preview
                  </span>
                </div>
              </div>

              {/* Feed Grid Preview Area */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold tracking-widest text-[var(--fluid-2)] px-1">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4" /> TAMPILAN UMPAN LIVE INSTAGRAM
                  </span>
                  <span className="text-[11px] font-mono opacity-80">
                    Klik foto untuk lihat urutan unggah
                  </span>
                </div>

                {/* Interactive Dynamic Grid */}
                <div 
                  className="grid gap-1.5 bg-black/30 p-2.5 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden"
                  style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                  }}
                >
                  <AnimatePresence>
                    {gridPieces.map((piece, idx) => (
                      <motion.div
                        key={piece.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: idx * 0.03 }}
                        onClick={() => setSelectedPiece(piece)}
                        className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer border border-white/10 hover:border-[var(--fluid-2)] shadow-md transition-all hover:scale-[1.02] hover:z-20"
                      >
                        <img 
                          src={piece.dataUrl} 
                          alt={`Potongan #${piece.id}`} 
                          className="w-full h-full object-cover"
                        />

                        {/* Tile Overlay Badge */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center backdrop-blur-xs">
                          <span className="font-black text-white text-base">
                            #{piece.id}
                          </span>
                          <span className="text-[10px] font-bold text-[var(--fluid-2)] bg-black/60 px-2 py-0.5 rounded-full mt-1 border border-white/20">
                            Unggah ke-{piece.uploadOrder}
                          </span>
                          <div className="mt-2 flex items-center gap-1 text-[10px] text-white/90">
                            <Maximize2 className="w-3 h-3" /> Detail
                          </div>
                        </div>

                        {/* Permanent Corner Number Tag */}
                        <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[10px] font-extrabold text-white border border-white/20">
                          #{piece.id}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Upload Order Instructions Banner */}
              <div className="bg-black/20 p-4 rounded-2xl border border-[var(--ice-border)] flex items-start gap-3">
                <Info className="w-5 h-5 text-[var(--fluid-2)] shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-[var(--text-main)]">
                    Tips Urutan Unggah Instagram:
                  </p>
                  <p className="opacity-80 leading-relaxed">
                    Unggah potongan foto mulai dari nomor urut unggah <strong>#1</strong> (file paling bawah kanan) hingga <strong>#{cols * rows}</strong> (paling atas kiri) agar tata letak di profile Instagram tersusun sempurna!
                  </p>
                </div>
              </div>

            </div>

            {/* Bottom Footer Actions */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3">
              <button 
                onClick={handleDownloadAllZip}
                disabled={isProcessing || gridPieces.length === 0}
                className="fluost-btn flex-1 py-3.5 text-xs md:text-sm flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Unduh Semua Potongan ({gridPieces.length})
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Lightbox Modal for Selected Tile */}
      <AnimatePresence>
        {selectedPiece && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fluost-box p-6 max-w-lg w-full relative"
            >
              <div className="fluost-fluid-bg"></div>
              <div className="fluost-sand-corner"></div>

              <div className="relative z-10 space-y-5">
                <div className="flex justify-between items-center border-b border-[var(--ice-border)] pb-3">
                  <div>
                    <h3 className="font-black text-lg text-[var(--fluid-2)] flex items-center gap-2">
                      Potongan Grid #{selectedPiece.id}
                    </h3>
                    <p className="text-xs opacity-70">
                      Baris ke-{selectedPiece.row + 1}, Kolom ke-{selectedPiece.col + 1}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedPiece(null)}
                    className="p-1 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Tile Large Preview */}
                <div className="aspect-square w-full max-w-xs mx-auto rounded-2xl overflow-hidden border-2 border-[var(--fluid-2)] shadow-2xl relative">
                  <img src={selectedPiece.dataUrl} alt={`Slice ${selectedPiece.id}`} className="w-full h-full object-cover" />
                </div>

                <div className="bg-black/20 p-4 rounded-2xl border border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between items-center font-bold">
                    <span>Urutan Unggah Instagram:</span>
                    <span className="ice-badge font-extrabold text-[var(--fluid-2)]">
                      Langkah #{selectedPiece.uploadOrder} dari {cols * rows}
                    </span>
                  </div>
                  <p className="opacity-80">
                    Untuk hasil terbaik, unggah potongan ini pada langkah ke-{selectedPiece.uploadOrder}.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => downloadSingleTile(selectedPiece)}
                    className="fluost-btn w-full py-3 text-xs flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Unduh Gambar Ini (HD)
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
