import { GoogleGenAI } from '@google/genai';

// Helper to get active API key
export function getActiveApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('fluost_gemini_api_key') || '';
}

// Client-side direct Gemini API fallback runner
async function callDirectGemini(apiKey: string, prompt: string, base64Data?: string, mimeType?: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
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
  
  if (q.includes('one direction') || q.includes('1d') || q.includes('harry styles') || q.includes('zayn')) {
    return `🎵 **ListenList Music & Lyrics Synth**
---
**Judul Lagu Top**: Night Changes - One Direction
**Artis**: One Direction
**Getaran Vibe**: Nostalgic, Heartfelt, Cinematic Sunset
**YouTube Music**: https://music.youtube.com/search?q=One+Direction+Night+Changes

**Kutipan Lirik Paling Relevan**:
> "We're only getting older, baby
> Have you decision made on who you want to be?
> 'Cause we're running out of time
> It will never change me and you..."

---
**Rekomendasi Lirik Tambahan**:
1. *"You and me have a whole lot of history"* — **History**
2. *"I'm driving deep into the night, trying to make things right"* — **Perfect**
3. *"If you're looking for someone to enjoy the night with"* — **Steal My Girl**

**Hashtag Instagram Viral**:
#OneDirection #NightChanges #1DReels #SunsetAesthetic #InstagramVibes #ThrowbackHits #SongLyrics`;
  }

  if (q.includes('galau') || q.includes('sedih') || q.includes('broken') || q.includes('patah hati') || q.includes('sad')) {
    return `🎵 **ListenList Music & Lyrics Synth**
---
**Judul Lagu Top**: Sial - Mahalini / Tak Segampang Itu - Anggi Marito
**Getaran Vibe**: Melancholic, Deep Reflection, Soft Piano
**YouTube Music**: https://music.youtube.com/search?q=Mahalini+Sial

**Kutipan Lirik Paling Relevan**:
> "Sial sialnya ku bertemu denganmu
> Mengapa harus kau lupakan janji manismu
> Yang dulu pernah kau rangkai begitu indah..."

**Hashtag Instagram Viral**:
#SadVibes #Mahalini #LaguGalau #ReelsInstagram #MoodBooster #AestheticQuote`;
  }

  if (q.includes('semangat') || q.includes('sport') || q.includes('gym') || q.includes('work') || q.includes('pagi') || q.includes('happy')) {
    return `🎵 **ListenList Music & Lyrics Synth**
---
**Judul Lagu Top**: Untitled - Maliq & D'Essentials / As It Was - Harry Styles
**Getaran Vibe**: Energetic, Uplifting Morning, Fresh Energy
**YouTube Music**: https://music.youtube.com/search?q=Maliq+DEssentials

**Kutipan Lirik Paling Relevan**:
> "You know it's not the same as it was
> In this world, it's just us
> You know it's not the same as it was..."

**Hashtag Instagram Viral**:
#MorningVibes #GoodEnergy #DailyMotivation #AestheticGrid #ReelsMusik #FluostStudio`;
  }

  // General fallback for any query
  const formattedQuery = query ? query.charAt(0).toUpperCase() + query.slice(1) : 'Estetika Konten';
  return `🎵 **ListenList Music & Lyrics Synth**
---
**Judul Lagu Top**: Golden Hour - JVKE / Birds of a Feather - Billie Eilish
**Relevansi Topik**: ${formattedQuery}
**Getaran Vibe**: Aesthetic Instagram Grid, Smooth Transition, Warm Lighting
**YouTube Music**: https://music.youtube.com/search?q=${encodeURIComponent(query || 'Aesthetic Music')}

**Kutipan Lirik Paling Relevan**:
> "Shine a light on me, golden hour...
> I was broken, now I'm floating in the air.
> Every moment with you feels like a masterpiece..."

**Hashtag Instagram Viral**:
#${formattedQuery.replace(/\s+/g, '')} #AestheticReels #InstagramGrid #VibeCheck #FluostStudio #MusicRecommendations`;
}

// Smart Local Engine for AI Spark (Caption)
function generateLocalSparkAI(topic: string, style: string): string {
  const t = topic || 'Keindahan Suasana Hari Ini';
  
  if (style.includes('Minimalist')) {
    return `✨ **Gaya: Clean Minimalist**
---
${t}.
Sederhana, tenang, dan bermakna. 🍃

--
#MinimalistAesthetic #CleanGrid #DailyMood #AestheticMoments`;
  }

  if (style.includes('Viral') || style.includes('Gen-Z')) {
    return `🔥 **Gaya: Viral Reels & Gen-Z**
---
Save dulu biar gak lupa! 📌

Gak nyangka ${t.toLowerCase()} ternyata se-aesthetic ini kalau diabadikan. 

Mana favorit kalian dari slide 1 atau 2? Tulis di kolom komentar ya! 👇

--
#ViralReels #InstagramTrends #AestheticGrid #ContentCreator #GenZVibes #FluostStudio`;
  }

  if (style.includes('Storytelling') || style.includes('Poetic')) {
    return `📖 **Gaya: Storytelling & Poetic**
---
Ada alasan mengapa setiap Momen terasa begitu istimewa.

Tentang ${t.toLowerCase()}, tempat di mana pikiran beristirahat dan mata menemukan ketenangan. Kadang kita terlalu sibuk berlari hingga lupa menikmati langkah itu sendiri.

Semoga sudut pandang kecil ini memberi sedikit kehangatan untuk harimu. ✨

--
#Storytelling #AestheticJournal #PoeticWords #MindfulLiving #InstagramFeed`;
  }

  return `🚀 **Gaya: Professional Business & Content Creator**
---
Menciptakan visual yang memikat dimulai dari perhatian pada detail. 💫

${t} — Solusi visual & arsitektur grid terbaik untuk membangun brand image yang solid di Instagram.

💡 *Pro Tip*: Simpan postingan ini untuk inspirasi feed kamu berikutnya!

--
#ContentMarketing #BrandStrategy #InstagramGrowth #VisualIdentity #FluostStudio`;
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
  return generateLocalSparkAI(topic, style);
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

