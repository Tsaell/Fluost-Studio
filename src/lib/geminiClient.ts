import { GoogleGenAI } from '@google/genai';

function getClientApiKey(customKey?: string): string | null {
  if (customKey && customKey.trim()) return customKey.trim();
  const savedKey = typeof window !== 'undefined' ? localStorage.getItem('fluost_custom_gemini_api_key') : null;
  if (savedKey && savedKey.trim()) return savedKey.trim();
  if (import.meta.env.VITE_GEMINI_API_KEY) return import.meta.env.VITE_GEMINI_API_KEY;
  return null;
}

export async function fetchMusicAI(query: string, customApiKey?: string): Promise<string> {
  // 1. Try server endpoint first
  try {
    const res = await fetch('/api/gemini/music', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(customApiKey ? { 'x-custom-api-key': customApiKey } : {}),
      },
      body: JSON.stringify({ query }),
    });

    const contentType = res.headers.get('content-type');
    if (res.ok && contentType && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.result) return data.result;
    }
  } catch (err) {
    console.warn('Server endpoint /api/gemini/music unavailable, attempting client-side Gemini fallback:', err);
  }

  // 2. Client-side fallback via @google/genai SDK
  const apiKey = getClientApiKey(customApiKey);
  if (!apiKey) {
    throw new Error(
      'Server API tidak memberikan tanggapan JSON (404/Hosting Statis). Masukkan API Key Gemini gratis Anda melalui menu Pengaturan API Key (ikon kunci di topbar) untuk mengaktifkan AI di domain ini.'
    );
  }

  const ai = new GoogleGenAI({ apiKey });
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
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  if (!response.text) {
    throw new Error('Gagal mendapatkan tanggapan teks dari Gemini.');
  }

  return response.text;
}

export async function fetchSparkAI(
  topic: string,
  style: string,
  base64Data?: string,
  mimeType?: string,
  fileName?: string,
  customApiKey?: string
): Promise<string> {
  // 1. Try server endpoint first
  try {
    const res = await fetch('/api/gemini/ai-studio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(customApiKey ? { 'x-custom-api-key': customApiKey } : {}),
      },
      body: JSON.stringify({ topic, style, base64Data, mimeType, fileName }),
    });

    const contentType = res.headers.get('content-type');
    if (res.ok && contentType && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.result) return data.result;
    }
  } catch (err) {
    console.warn('Server endpoint /api/gemini/ai-studio unavailable, attempting client-side Gemini fallback:', err);
  }

  // 2. Client-side fallback
  const apiKey = getClientApiKey(customApiKey);
  if (!apiKey) {
    throw new Error(
      'Server API tidak memberikan tanggapan JSON (404/Hosting Statis). Masukkan API Key Gemini gratis Anda melalui menu Pengaturan API Key (ikon kunci di topbar) untuk mengaktifkan AI di domain ini.'
    );
  }

  const ai = new GoogleGenAI({ apiKey });
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
  if (isMediaAttached && base64Data && mimeType) {
    contentsParam = {
      parts: [
        {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        },
        { text: prompt },
      ],
    };
  } else {
    contentsParam = prompt;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: contentsParam,
  });

  if (!response.text) {
    throw new Error('Gagal mendapatkan tanggapan sintesis dari Gemini.');
  }

  return response.text;
}

export async function fetchVisualAI(
  base64Data: string,
  mimeType: string,
  customApiKey?: string
): Promise<string> {
  // 1. Try server endpoint first
  try {
    const res = await fetch('/api/gemini/analyze-media', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(customApiKey ? { 'x-custom-api-key': customApiKey } : {}),
      },
      body: JSON.stringify({ base64Data, mimeType }),
    });

    const contentType = res.headers.get('content-type');
    if (res.ok && contentType && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.result) return data.result;
    }
  } catch (err) {
    console.warn('Server endpoint /api/gemini/analyze-media unavailable, attempting client-side Gemini fallback:', err);
  }

  // 2. Client-side fallback
  const apiKey = getClientApiKey(customApiKey);
  if (!apiKey) {
    throw new Error(
      'Server API tidak memberikan tanggapan JSON (404/Hosting Statis). Masukkan API Key Gemini gratis Anda melalui menu Pengaturan API Key (ikon kunci di topbar) untuk mengaktifkan AI di domain ini.'
    );
  }

  const ai = new GoogleGenAI({ apiKey });
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
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, { text: prompt }] },
  });

  if (!response.text) {
    throw new Error('Gagal mendapatkan tanggapan analisis visual dari Gemini.');
  }

  return response.text;
}
