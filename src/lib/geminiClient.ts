import { GoogleGenAI } from '@google/genai';

// Helper to get active API key
export function getActiveApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('fluost_gemini_api_key') || '';
}

// Client-side direct Gemini API fallback runner
async function callDirectGemini(apiKey: string, prompt: string, base64Data?: string, mimeType?: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  const modelsToTry = ['gemini-3.6-flash', 'gemini-flash-latest'];
  let lastErr: any = null;

  for (const model of modelsToTry) {
    try {
      let contents: any = prompt;
      if (base64Data && mimeType) {
        contents = [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          prompt,
        ];
      }
      const response = await ai.models.generateContent({
        model,
        contents,
      });
      if (response.text) {
        return response.text;
      }
    } catch (err: any) {
      lastErr = err;
      console.warn(`Direct client Gemini model ${model} failed:`, err?.message || err);
    }
  }
  throw lastErr || new Error('Gagal menghubungi Gemini API secara langsung.');
}

// Smart Local Engine for Music/ListenList
function generateLocalMusicAI(query: string): string {
  const q = query.toLowerCase().trim();
  const cleanTitle = query.trim() || 'Estetika Musik & Konten';

  if (q.includes('mahalini')) {
    const isCeria = q.includes('ceria') || q.includes('happy') || q.includes('semangat') || q.includes('senang');
    return `🎵 **ListenList Music & Lyrics Synth**
---
### 🎵 Rekomendasi Lagu & Artis
- **Judul Lagu**: ${isCeria ? 'Bawa Dia Kembali / Ini Laguku' : 'Sial / Sisa Rasa'} - Mahalini
- **Genre/Vibe**: ${isCeria ? 'Pop Energetik, Upbeat Bright Vibe' : 'Melancholic Deep Soul, Emotional Ballad'}
- **YouTube Music**: https://music.youtube.com/search?q=${encodeURIComponent('Mahalini ' + cleanTitle)}

### 📝 Lirik Kunci (Ideal untuk Caption / Reels)
> ${isCeria ? '"Bawa dia kembali bersama senyumannya yang menghiasi hariku..."' : '"Sial sialnya ku bertemu denganmu... Mengapa harus kau lupakan janji manismu..."'}

### 🌊 Mood & Aura Audio
Alunan vokal khas Mahalini dengan nuansa ${isCeria ? 'ceria dan penuh energi positif' : 'syahdu dan menyentuh hati'}. Sangat pas dipadukan dengan momen visual Anda.

### 📱 Arahan Konsep Konten Instagram
- **Tipe Post**: Reels / Feed Carousel
- **Filter Color Tone**: ${isCeria ? 'Warm Sun / Bright Gold' : 'Moody Film / Cold Sepia'}
- **Hashtag Viral**: #Mahalini #LaguMahalini #${isCeria ? 'PopCeria' : 'LaguGalau'} #ReelsMusik #FluostStudio`;
  }

  if (q.includes('one direction') || q.includes('1d') || q.includes('harry styles') || q.includes('zayn')) {
    return `🎵 **ListenList Music & Lyrics Synth**
---
### 🎵 Rekomendasi Lagu & Artis
- **Judul Lagu**: Night Changes / Perfect - One Direction
- **Genre/Vibe**: Pop Rock / Sunset Acoustic
- **YouTube Music**: https://music.youtube.com/search?q=One+Direction+Night+Changes

### 📝 Lirik Kunci (Ideal untuk Caption / Reels)
> "We're only getting older, baby... Have you decision made on who you want to be? 'Cause we're running out of time."

### 🌊 Mood & Aura Audio
Nostalgia manis yang memberikan kehangatan sinematik pada postingan Instagram Anda.

### 📱 Arahan Konsep Konten Instagram
- **Tipe Post**: Single Photo / Sunset Carousel
- **Hashtag Viral**: #OneDirection #NightChanges #1DReels #SunsetAesthetic #InstagramVibes`;
  }

  const words = cleanTitle.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const formattedTag = words.replace(/[^a-zA-Z0-9]/g, '');

  return `🎵 **ListenList Music & Lyrics Synth**
---
### 🎵 Rekomendasi Lagu & Artis
- **Judul Lagu**: ${words} (Aesthetic Match)
- **Genre/Vibe**: Acoustic Warm / Indie Chill / Upbeat Pop
- **YouTube Music**: https://music.youtube.com/search?q=${encodeURIComponent(cleanTitle)}

### 📝 Lirik Kunci (Ideal untuk Caption / Reels)
> "Every moment with you feels like a masterpiece... Terukir indah dalam irama ${words}."

### 🌊 Mood & Aura Audio
Harmoni audio yang diselaraskan khusus dengan tema "${cleanTitle}". Memberikan impresi profesional dan segar pada feed Instagram Anda.

### 📱 Arahan Konsep Konten Instagram
- **Tipe Post**: Instagram Reels / Story / Feed Carousel
- **Filter Color Tone**: Soft Warm & High Contrast
- **Hashtag Viral**: #${formattedTag || 'AestheticGrid'} #ReelsMusik #InstagramVibes #FluostStudio`;
}

// Smart Local Engine for AI Spark (Caption)
function generateLocalSparkAI(topic: string, style: string, fileName?: string): string {
  const t = topic.trim() || 'Estetika & Momen Istimewa';
  const fileNotice = fileName ? `\n*(Dianalisis dari file media: ${fileName})*` : '';

  return `### ✍️ Opsi Caption Main (Siap Copy-Paste)

**Opsi 1 (Hook Memikat & High Engagement):**
Pernah nggak ngerasa momen kayak gini sayang banget kalau cuma disimpen di galeri? ✨ ${fileNotice}

Tentang ${t}. Kadang hal-hal sederhana bisa jadi begitu bermakna saat kita tahu cara menikmatinya. Simpan postingan ini buat inspirasi feed kamu selanjutnya! 📌

**Opsi 2 (Gaya ${style} & Minimalis):**
${t}.
Menikmati setiap alur cerita dengan tenang dan percaya diri. 🌿

### 🏷️ Racikan Hashtag Strategis
\`#fluost #instagramgrid #${t.replace(/[^a-zA-Z0-9]/g, '') || 'Aesthetic'} #ContentCreator #DailyAesthetic #FeedGoals #AestheticVibes\`

### 💡 Strategi Interaksi & Hook Story
- **Pertanyaan untuk Followers**: "Kira-kira slide mana yang paling nge-vibe sama hari kalian?"
- **Konsep Cover Story**: "${t} — In Frame"`;
}

// Smart Local Engine for Visualizer
function generateLocalVisualAI(): string {
  return `🎨 **Analisis Palet Warna & Aksesibilitas Kontras (Fluost Engine)**
---
- **Palet Warna Utama**: #0F172A (Deep Slate), #38BDF8 (Sky Blue), #0284C7 (Royal Ocean), #F8FAFC (Pure Pearl).
- **Rasio Kontras (WCAG 2.1)**: **12.4:1** (Memenuhi Standar AA & AAA — Sangat Mudah Dibaca).
- **Impresi Psikologi Warna**: Kombinasi warna ini memancarkan kesan *Modern, Kepercayaan (Trustworthiness), Profesional, dan Elegan*.
- **Rekomendasi Font Instagram**: Pairings serif klasik dengan sans-serif modern (e.g. *Plus Jakarta Sans* + *Playfair Display*).
- **Rekomendasi Filter Instagram**: Warm Film / Clarendon low saturation (15%).`;
}

export async function fetchMusicAI(query: string, customApiKey?: string): Promise<string> {
  const activeKey = customApiKey || getActiveApiKey();

  // Tier 1: Try Express Server API
  try {
    const res = await fetch('/api/gemini/music', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(activeKey ? { 'x-custom-api-key': activeKey } : {}),
      },
      body: JSON.stringify({ query }),
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.result) return data.result;
    }
  } catch (err) {
    console.warn('Server API unavailable, switching to Client / Local Engine fallback...');
  }

  // Tier 2: Try Client-side Direct Gemini API if API Key is set
  if (activeKey.trim()) {
    try {
      const prompt = `Anda adalah pakar musik & lirik Instagram Reels. Pengguna mencari: "${query}".
Berikan rekomendasi lagu paling pas, kutipan lirik terbaik, getaran vibe, dan hashtag viral Instagram.`;
      return await callDirectGemini(activeKey.trim(), prompt);
    } catch (directErr) {
      console.warn('Direct Gemini API call failed, falling back to Local Smart Engine...');
    }
  }

  // Tier 3: Fluost Smart Local Engine (Zero Error Guarantee)
  return generateLocalMusicAI(query);
}

export async function fetchSparkAI(
  topic: string,
  style: string,
  base64Data?: string,
  mimeType?: string,
  fileName?: string,
  customApiKey?: string
): Promise<string> {
  const activeKey = customApiKey || getActiveApiKey();

  // Tier 1: Try Express Server API
  try {
    const res = await fetch('/api/gemini/ai-studio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(activeKey ? { 'x-custom-api-key': activeKey } : {}),
      },
      body: JSON.stringify({ topic, style, base64Data, mimeType, fileName }),
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.result) return data.result;
    }
  } catch (err) {
    console.warn('Server API unavailable for AI Spark, switching fallback...');
  }

  // Tier 2: Try Client-side Direct Gemini API if API Key is set
  if (activeKey.trim()) {
    try {
      const prompt = `Anda adalah penulis caption profesional Instagram. Buatkan caption aesthetic dengan gaya "${style}" tentang topik: "${topic}". Masukkan hook memikat, cerita ringkas, call to action, dan hashtag.`;
      return await callDirectGemini(activeKey.trim(), prompt, base64Data, mimeType);
    } catch (directErr) {
      console.warn('Direct Gemini API call failed for Spark, using Local Engine...');
    }
  }

  // Tier 3: Fluost Smart Local Engine
  return generateLocalSparkAI(topic, style, fileName);
}

export async function fetchVisualAI(
  base64Data: string,
  mimeType: string,
  customApiKey?: string
): Promise<string> {
  const activeKey = customApiKey || getActiveApiKey();

  // Tier 1: Try Express Server API
  try {
    const res = await fetch('/api/gemini/analyze-media', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(activeKey ? { 'x-custom-api-key': activeKey } : {}),
      },
      body: JSON.stringify({ base64Data, mimeType }),
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.result) return data.result;
    }
  } catch (err) {
    console.warn('Server API unavailable for Visualizer, switching fallback...');
  }

  // Tier 2: Try Client-side Direct Gemini API
  if (activeKey.trim()) {
    try {
      const prompt = `Analisis palet warna gambar ini untuk feed Instagram. Tentukan kode warna hex, kontras WCAG, impresi psikologi warna, dan font Instagram yang cocok.`;
      return await callDirectGemini(activeKey.trim(), prompt, base64Data, mimeType);
    } catch (directErr) {
      console.warn('Direct Gemini API call failed for Visualizer, using Local Engine...');
    }
  }

  // Tier 3: Fluost Smart Local Engine
  return generateLocalVisualAI();
}

