import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Helper function to get GoogleGenAI client
function getGenAIClient(customApiKey?: string | string[]) {
  const key = typeof customApiKey === 'string' && customApiKey.trim().length > 0
    ? customApiKey.trim()
    : process.env.GEMINI_API_KEY;

  if (!key) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }

  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const hasEnvKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: 'ok',
    hasApiKey: hasEnvKey,
    timestamp: new Date().toISOString(),
  });
});

// Helper for generating content with fallback model names
async function generateWithFallback(ai: GoogleGenAI, contents: any) {
  const modelsToTry = ['gemini-3.6-flash', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Model ${model} failed, trying fallback model...`, err?.message || err);
      lastError = err;
    }
  }
  throw lastError || new Error('Gagal mendapatkan tanggapan dari Gemini AI.');
}

// API: ListenList (Music & Lyric Vibes with Real iTunes/YouTube Music Catalog)
app.post('/api/gemini/music', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query tema visual/audio diperlukan.' });
    }

    const customKey = req.headers['x-custom-api-key'];
    const ai = getGenAIClient(customKey);

    // Fetch real tracks from global music catalog (iTunes API)
    let realTracks: Array<{
      trackId: number;
      trackName: string;
      artistName: string;
      collectionName?: string;
      previewUrl?: string;
      artworkUrl?: string;
      primaryGenreName?: string;
      youtubeUrl: string;
    }> = [];

    try {
      const itunesRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=10`);
      if (itunesRes.ok) {
        const itunesData = await itunesRes.json();
        if (itunesData.results && Array.isArray(itunesData.results)) {
          realTracks = itunesData.results.map((t: any) => ({
            trackId: t.trackId,
            trackName: t.trackName,
            artistName: t.artistName,
            collectionName: t.collectionName,
            previewUrl: t.previewUrl,
            artworkUrl: t.artworkUrl100?.replace('100x100bb', '300x300bb'),
            primaryGenreName: t.primaryGenreName,
            youtubeUrl: `https://music.youtube.com/search?q=${encodeURIComponent(`${t.trackName} ${t.artistName}`)}`,
          }));
        }
      }
    } catch (searchErr) {
      console.warn('Live iTunes Music catalog search failed, using Gemini direct search:', searchErr);
    }

    const catalogSummary = realTracks.length > 0
      ? realTracks.slice(0, 5).map((t, i) => `${i + 1}. "${t.trackName}" oleh ${t.artistName} (Genre: ${t.primaryGenreName || 'Pop'})`).join('\n')
      : 'Gunakan pengetahuan luas Anda mengenai katalog lagu dunia populer (Indonesia, Western, K-Pop, Anime, Tiktok Trends).';

    const prompt = `Anda adalah Master Kurator Musik & Aesthetics Specialist Fluost Studio untuk Instagram & TikTok.
Tema/Query Pencarian User: "${query}".

Berikut adalah hasil pencarian lagu ASLI dari katalog musik resmi dunia:
${catalogSummary}

INSTRUKSI KRUSIAL:
1. PILIH 3-5 LAGU ASLI & RESMI yang paling cocok dengan mood "${query}".
2. KUTIP LIRIK ASLI DAN RESMI dari lagu-lagu tersebut. SANGAT DILARANG MEMBUAT LIRIK PALSU ATAU REKAYASA SENDIRI.
3. Berikan kutipan lirik asli beserta terjemahan/pembedahan maknanya.

Format output (Gunakan Markdown rapi dengan emoji):
### 🎵 Rekomendasi 3-5 Lagu Asli & Resmi
[Sebutkan judul lagu asli, penyanyi/band asli, dan genre/mood dari masing-masing lagu secara mendalam]

### 📝 Lirik Kunci Resmi (Ideal untuk Caption / Reels)
> "[Kutipan lirik resmi 1 - Bahasa Asli]"
*Arti/Vibe*: [Penjelasan makna]

> "[Kutipan lirik resmi 2 - Bahasa Asli]"
*Arti/Vibe*: [Penjelasan makna]

### 🌊 Mood & Aura Audio Visual
[Penjelasan emosi frekuensi suara, instrumen, dan kesesuaian dengan foto/video]

### 📱 Arahan Konsep Instagram & TikTok Reels
- **Tipe Post**: [Grid Carousel / Reels / Single Photo]
- **Filter Color Tone**: [Misal: Warm Sun, Moody Film, Cyberpunk Teal]
- **Panduan Cuts & Transisi**: [Tips memotong klip sesuai beat lagu]`;

    const resultText = await generateWithFallback(ai, prompt);

    res.json({ 
      result: resultText,
      songs: realTracks.slice(0, 6)
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/music:', error);
    if (error.message === 'GEMINI_API_KEY_MISSING') {
      return res.status(401).json({
        error: 'API Key Gemini tidak ditemukan. Masukkan API key manual di menu Pengaturan API.',
      });
    }
    res.status(500).json({ error: error.message || 'Gagal memproses permintaan audio.' });
  }
});

// API: AI Spark (Sintesis Konten / Caption Generator + Photo/Video Multimodal)
app.post('/api/gemini/ai-studio', async (req, res) => {
  try {
    const { topic, style, base64Data, mimeType, fileName } = req.body;

    if (!topic && !base64Data) {
      return res.status(400).json({ error: 'Harap masukkan deskripsi topik atau lampirkan foto/video.' });
    }

    const customKey = req.headers['x-custom-api-key'];
    const ai = getGenAIClient(customKey);

    const isMediaAttached = Boolean(base64Data && mimeType);
    const mediaTypeLabel = mimeType?.startsWith('video/') ? 'video' : 'foto';

    const prompt = `Anda adalah Fluost Content Strategist & Copywriter profesional untuk Instagram.
${topic ? `Tema Visual / Catatan Pengguna: "${topic}"` : ''}
Gaya Bahasa / Tone: "${style || 'Klasik & Elegan'}"
${isMediaAttached ? `[Catatan Media]: Pengguna melampirkan sebuah file ${mediaTypeLabel} (${fileName || 'Lampiran Custom'}). Analisis elemen visual, warna, pencahayaan, objek, mood, dan suasana dari media ini secara mendalam untuk membuat konten yang sangat selaras.` : ''}

Tugas: Buat paket konten Instagram lengkap yang sangat memikat dan meningkatkan engagement.

Format Output (Gunakan Markdown yang rapi):
### ✍️ Opsi Caption Main (Siap Copy-Paste)
**Opsi 1 (Hook Kuat):**
[Tulis caption dengan kalimat pembuka menarik, pesan bernilai yang relevan dengan ${isMediaAttached ? 'media & topik' : 'topik'}, dan Call To Action]

**Opsi 2 (Minimalis & Estetik):**
[Tulis caption versi pendek puitis/modern]

### 🏷️ Racikan Hashtag Strategis
\`#fluost #instagramgrid #[HashtagSpesifikTema1] #[HashtagSpesifikTema2] #[HashtagNiche1] #[HashtagNiche2] #[HashtagViral]\`

### 💡 Strategi Interaksi & Hook Story
- **Pertanyaan untuk Followers**: [Pertanyaan memicu komentar berdasarkan visual/topik ini]
- **Konsep Cover Slide / Story**: [Judul teks pendek yang paling cocok dipasang di story/carousel]`;

    let contentsParam: any;

    if (isMediaAttached) {
      const mediaPart = {
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      };
      contentsParam = { parts: [mediaPart, { text: prompt }] };
    } else {
      contentsParam = prompt;
    }

    const resultText = await generateWithFallback(ai, contentsParam);

    res.json({ result: resultText });
  } catch (error: any) {
    console.error('Error in /api/gemini/ai-studio:', error);
    if (error.message === 'GEMINI_API_KEY_MISSING') {
      return res.status(401).json({
        error: 'API Key Gemini tidak ditemukan.',
      });
    }
    res.status(500).json({ error: error.message || 'Gagal mensintesis konten.' });
  }
});

// API: Visualost (Media Visual Analyzer & Preset Generator)
app.post('/api/gemini/analyze-media', async (req, res) => {
  try {
    const { base64Data, mimeType, mediaItems, userPrompt } = req.body;

    // Normalizing media items
    let itemsToProcess: Array<{ base64Data: string; mimeType: string; fileName?: string }> = [];
    if (Array.isArray(mediaItems) && mediaItems.length > 0) {
      itemsToProcess = mediaItems.filter(item => item && item.base64Data && item.mimeType);
    } else if (base64Data && mimeType) {
      itemsToProcess = [{ base64Data, mimeType }];
    }

    if (itemsToProcess.length === 0) {
      return res.status(400).json({ error: 'Minimal 1 data gambar/video base64 & mimeType diperlukan.' });
    }

    const customKey = req.headers['x-custom-api-key'];
    const ai = getGenAIClient(customKey);

    const mediaCount = itemsToProcess.length;
    const prompt = `Anda adalah pakar Colorist, Visual Art Director & Master Lightroom / CapCut dari Fluost Studio.
${userPrompt ? `Arah/Instruksi Khusus Pengguna: "${userPrompt}"\n` : ''}
${mediaCount > 1 ? `Pengguna melampirkan ${mediaCount} buah media visual sebagai referensi/materi pembedahan.` : ''}

Analisis ${mediaCount > 1 ? 'seluruh gambar/media yang dilampirkan ini' : 'gambar ini'} secara mendalam dan berikan resep color grading serta panduan estetika visual${userPrompt ? ' sesuai dengan arahan pengguna' : ''}.

Berikan analisis dalam format Markdown berikut:
### 🎨 Analisis Komposisi & Palet Warna
- **Dominan Warna**: [Sebutkan 3-4 warna utama]
- **Mood / Atmosphere**: [Suasana emosional gambar]
- **Keseimbangan Pencahayaan**: [Highlights, shadows, dan kontras]
${userPrompt ? `\n### 💬 Jawaban atas Arahan Khusus\n- [Penjelasan & rekomendasi spesifik menjawab: "${userPrompt}"]\n` : ''}
### 🎛️ Resep Preset Lightroom (Siap Terapkan)
- **Exposure**: [Rekomendasi nilai +/-]
- **Contrast**: [Nilai +/-]
- **Highlights & Shadows**: [Nilai]
- **Whites & Blacks**: [Nilai]
- **Temp & Tint**: [Nilai Kelvin / Warmth]
- **Vibrance & Saturation**: [Nilai]
- **HSL Adjustment**: [Saran khusus untuk Merah, Emas/Kuning, Biru/Teal]

### 🎬 Ide Konsep Video / CapCut Reels
- **Transisi Rekomendasi**: [Misal: Zoom-in slow blur, Light leak dissolve]
- **Efek / Filter CapCut**: [Nama efek yang serasi]
- **Gaya Editing Music Sync**: [Saran potongan klip sesuai beat]`;

    const parts: any[] = itemsToProcess.map((item) => ({
      inlineData: {
        mimeType: item.mimeType,
        data: item.base64Data,
      },
    }));

    parts.push({ text: prompt });

    const resultText = await generateWithFallback(ai, { parts });

    res.json({ result: resultText });
  } catch (error: any) {
    console.error('Error in /api/gemini/analyze-media:', error);
    if (error.message === 'GEMINI_API_KEY_MISSING') {
      return res.status(401).json({
        error: 'API Key Gemini tidak ditemukan.',
      });
    }
    res.status(500).json({ error: error.message || 'Gagal menganalisis visual.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Fluost server running on http://localhost:${PORT}`);
  });
}

startServer();
