import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

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

// API: ListenList (Music & Lyric Vibes)
app.post('/api/gemini/music', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query tema visual/audio diperlukan.' });
    }

    const customKey = req.headers['x-custom-api-key'];
    const ai = getGenAIClient(customKey);

    const prompt = `Anda adalah kurator musik & konsep visualFluost AI untuk Instagram.
Tema visual/mood dari user: "${query}".

Tugas Anda:
Berikan rekomendasi lagu, lirik, mood audio, dan arahan konten Instagram yang sangat estetik dan menarik.

Format output (Gunakan format Markdown bergaya rapi, elegan, dan siap dibaca):
### 🎵 Rekomendasi Lagu & Artis
- **Judul Lagu**: [Judul] - [Artis]
- **Genre/Vibe**: [Misal: Lofi Chill / Cinematic Classical / Indie Synth / Pop Warm]

### 📝 Lirik Kunci (Ideal untuk Caption / Reels)
> "[Kutipan lirik paling berkesan dan puitis dalam bahasa asli / terjemahan Indonesia]"

### 🌊 Mood & Aura Audio
[Penjelasan singkat mengenai frekuensi dan emosi audio ini saat dipadukan dengan foto/video]

### 📱 Arahan Konsep Konten Instagram
- **Tipe Post**: [Grid Carousel / Reels / Single Photo]
- **Filter Color Tone**: [Misal: Warm Gold, Moody Cyan, Vintage Sepia]
- **Tips Transisi**: [Panduan potongan visual agar menyatu dengan tempo lagu]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error('Error in /api/gemini/music:', error);
    if (error.message === 'GEMINI_API_KEY_MISSING') {
      return res.status(401).json({
        error: 'API Key Gemini tidak ditemukan. AI Studio akan menyuntikkan key secara otomatis atau masukkan API key manual di menu Pengaturan API.',
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: contentsParam,
    });

    res.json({ result: response.text });
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
    const { base64Data, mimeType } = req.body;
    if (!base64Data || !mimeType) {
      return res.status(400).json({ error: 'Data gambar base64 & mimeType diperlukan.' });
    }

    const customKey = req.headers['x-custom-api-key'];
    const ai = getGenAIClient(customKey);

    const prompt = `Anda adalah pakar Colorist, Visual Art Director & Master Lightroom / CapCut dari Fluost Studio.
Analisis gambar ini secara mendalam dan berikan resep color grading serta panduan estetika visual.

Berikan analisis dalam format Markdown berikut:
### 🎨 Analisis Komposisi & Palet Warna
- **Dominan Warna**: [Sebutkan 3-4 warna utama]
- **Mood / Atmosphere**: [Suasana emosional gambar]
- **Keseimbangan Pencahayaan**: [Highlights, shadows, dan kontras]

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

    const imagePart = {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: { parts: [imagePart, { text: prompt }] },
    });

    res.json({ result: response.text });
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
