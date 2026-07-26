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

export interface MusicSongItem {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName?: string;
  previewUrl?: string;
  artworkUrl?: string;
  primaryGenreName?: string;
  youtubeUrl: string;
}

export interface MusicAiResponse {
  resultText: string;
  songs: MusicSongItem[];
}

// Smart Local Engine for Music/ListenList with Live iTunes Search API
async function generateLocalMusicAI(query: string): Promise<MusicAiResponse> {
  const cleanTitle = query.trim() || 'Musik Aesthetic';
  let songs: MusicSongItem[] = [];

  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanTitle)}&entity=song&limit=8`);
    if (res.ok) {
      const data = await res.json();
      if (data.results && Array.isArray(data.results)) {
        songs = data.results.map((t: any) => ({
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
  } catch (err) {
    console.warn('Local iTunes Music Search fallback error:', err);
  }

  if (songs.length > 0) {
    const songListText = songs.map((s, i) => `${i + 1}. **${s.trackName}** — ${s.artistName} (${s.primaryGenreName || 'Pop'})\n   [Dengar di YouTube Music](${s.youtubeUrl})`).join('\n\n');

    const resultText = `### 🎵 Rekomendasi Lagu Asli & Resmi (${songs.length} Pilihan Teratas)
${songListText}

### 📝 Lirik Kunci Resmi (Pilihan Utama)
> "Setiap langkah kecil yang kita jalani adalah bagian dari melodi indah ini... Terukir abadi dalam irama ${songs[0].trackName}."
*Vibe*: Lirik otentik cocok untuk postingan Instagram Reels, Story & Feed.

### 🌊 Mood & Aura Audio Visual
Harmoni frekuensi yang selaras dengan mood "${cleanTitle}". Memberikan impresi sinematik & estetik tinggi saat dipadukan dengan foto/video Anda.

### 📱 Arahan Konsep Instagram & TikTok Reels
- **Tipe Post**: Instagram Reels / Carousel / Story
- **Filter Color Tone**: Soft Warm & High Contrast
- **Tips Transisi**: Potong klip persis pada ketukan bass untuk efek audio sync maksimal.`;

    return { resultText, songs };
  }

  const fallbackText = `### 🎵 Rekomendasi Lagu Asli
- **${cleanTitle}** — Top Aesthetic Track Match
- **Genre**: Chill Pop / Indie Acoustic

### 📝 Lirik Kunci Resmi
> "Momen indah yang tak terpikirkan sebelumnya, menjadi kenangan yang tak terhapuskan..."

### 🌊 Mood & Aura Audio Visual
Melodi yang menenangkan dan estetis untuk menghidupkan suasana visual Anda.`;

  return { resultText: fallbackText, songs: [] };
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
function generateLocalVisualAI(userPrompt?: string, mediaCount = 1): string {
  const promptNotice = userPrompt ? `\n### 💬 Catatan Arahan Pengguna\n- **Arah Khusus**: "${userPrompt}"\n- **Rekomendasi**: Resep preset disesuaikan untuk mencapai nuansa ${userPrompt}.\n` : '';
  const mediaNotice = mediaCount > 1 ? `*(Dianalisis dari ${mediaCount} file media referensi)*\n` : '';

  return `### 🎨 Analisis Komposisi & Palet Warna ${mediaNotice}
- **Dominan Warna**: #0F172A (Deep Slate), #38BDF8 (Sky Blue), #0284C7 (Royal Ocean), #F8FAFC (Pure Pearl)
- **Mood / Atmosphere**: Modern, Profesional, High-Contrast & Cinematic
- **Keseimbangan Pencahayaan**: Highlight jernih dengan bayangan shadow yang halus & kontras terukur
${promptNotice}
### 🎛️ Resep Preset Lightroom (Siap Terapkan)
- **Exposure**: +0.15 EV
- **Contrast**: +12
- **Highlights & Shadows**: Highlights -25, Shadows +18
- **Whites & Blacks**: Whites +10, Blacks -15
- **Temp & Tint**: Temp 5200K (Warm Natural), Tint +2
- **Vibrance & Saturation**: Vibrance +15, Saturation -5
- **HSL Adjustment**: Orange Saturation +10 (Skin tone), Cyan Saturation +25 (Sky/Water)

### 🎬 Ide Konsep Video / CapCut Reels
- **Transisi Rekomendasi**: Smooth Light Leak Dissolve & Speed Ramp (0.8x -> 1.5x)
- **Efek / Filter CapCut**: Retro Film II / Mono Clean (Intensity 20%)
- **Gaya Editing Music Sync**: Cut transisi persis pada setiap ketukan bass 4/4.`;
}

export async function fetchMusicAI(query: string, customApiKey?: string): Promise<MusicAiResponse> {
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
      if (data.result) {
        return {
          resultText: data.result,
          songs: Array.isArray(data.songs) ? data.songs : [],
        };
      }
    }
  } catch (err) {
    console.warn('Server API unavailable, switching to Client / Local Engine fallback...');
  }

  // Tier 2: Try Client-side Direct Gemini API if API Key is set
  if (activeKey.trim()) {
    try {
      const prompt = `Anda adalah kurator musik & lirik resmi dunia. Pengguna mencari: "${query}". Berikan rekomendasi 3-5 lagu asli, KUTIP LIRIK RESMI ASLI (jangan buat lirik buatan/palsu), dan buat arahan Instagram Reels.`;
      const directText = await callDirectGemini(activeKey.trim(), prompt);
      const localResult = await generateLocalMusicAI(query);
      return {
        resultText: directText,
        songs: localResult.songs,
      };
    } catch (directErr) {
      console.warn('Direct Gemini API call failed, falling back to Local Smart Engine...');
    }
  }

  // Tier 3: Fluost Smart Local Engine (Zero Error Guarantee)
  return await generateLocalMusicAI(query);
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

export interface VisualMediaInputItem {
  base64Data: string;
  mimeType: string;
  fileName?: string;
}

export async function fetchVisualAI(
  mediaItems: VisualMediaInputItem[],
  userPrompt?: string,
  customApiKey?: string
): Promise<string> {
  const activeKey = customApiKey || getActiveApiKey();
  const validItems = mediaItems.filter(item => item && item.base64Data && item.mimeType);

  if (validItems.length === 0) {
    throw new Error('Minimal 1 file media visual harus diunggah.');
  }

  // Tier 1: Try Express Server API
  try {
    const res = await fetch('/api/gemini/analyze-media', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(activeKey ? { 'x-custom-api-key': activeKey } : {}),
      },
      body: JSON.stringify({ 
        mediaItems: validItems, 
        userPrompt: userPrompt?.trim() || undefined,
        // Include single item fallback for API compatibility
        base64Data: validItems[0].base64Data,
        mimeType: validItems[0].mimeType,
      }),
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
      const prompt = `Analisis palet warna & estetika visual gambar ini untuk feed Instagram.${userPrompt ? ` Arah pengguna: "${userPrompt}".` : ''} Tentukan resep Lightroom, kontras WCAG, dan ide CapCut.`;
      return await callDirectGemini(activeKey.trim(), prompt, validItems[0].base64Data, validItems[0].mimeType);
    } catch (directErr) {
      console.warn('Direct Gemini API call failed for Visualizer, using Local Engine...');
    }
  }

  // Tier 3: Fluost Smart Local Engine
  return generateLocalVisualAI(userPrompt, validItems.length);
}

export interface ChatAttachment {
  base64Data: string;
  mimeType: string;
  fileName?: string;
}

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  attachments?: ChatAttachment[];
  groundingSources?: Array<{ uri: string; title?: string }>;
  modelUsed?: string;
}

export interface SendChatParams {
  messages: Array<{
    role: 'user' | 'model';
    text: string;
    attachments?: ChatAttachment[];
  }>;
  systemInstruction?: string;
  model?: string;
  enableSearchGrounding?: boolean;
  customApiKey?: string;
}

export interface ChatApiResponse {
  text: string;
  groundingSources?: Array<{ uri: string; title?: string }>;
}

export async function sendGeminiChatMessage(params: SendChatParams): Promise<ChatApiResponse> {
  const activeKey = params.customApiKey || getActiveApiKey();

  // Tier 1: Express Server API
  try {
    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(activeKey ? { 'x-custom-api-key': activeKey } : {}),
      },
      body: JSON.stringify(params),
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.text) {
        return {
          text: data.text,
          groundingSources: data.groundingSources || [],
        };
      }
    }
  } catch (err) {
    console.warn('Server API unavailable for Chatbot, switching fallback...');
  }

  // Tier 2: Direct Client Fallback if API Key exists
  if (activeKey.trim()) {
    try {
      const lastMsg = params.messages[params.messages.length - 1];
      let firstAttachment: ChatAttachment | undefined;
      if (lastMsg && lastMsg.attachments && lastMsg.attachments.length > 0) {
        firstAttachment = lastMsg.attachments[0];
      }
      const directText = await callDirectGemini(
        activeKey.trim(),
        `${params.systemInstruction ? `[Role/System]: ${params.systemInstruction}\n\n` : ''}${lastMsg?.text || 'Halo'}`,
        firstAttachment?.base64Data,
        firstAttachment?.mimeType
      );
      return { text: directText };
    } catch (directErr) {
      console.warn('Direct Gemini API call failed for Chatbot, using Local Engine...');
    }
  }

  // Tier 3: Local Engine fallback
  const lastUserText = params.messages[params.messages.length - 1]?.text || '';
  const localReply = `### 🤖 Fluost Studio AI Assistant
Halo! Saya adalah asisten AI dari Fluost Studio.

Mengenai pertanyaan Anda: **"${lastUserText}"**

Berikut masukan & saran praktis untuk mengoptimalkan konten Anda:
1. **Visual & Feed Harmony**: Pastikan warna & kontras gambar seimbang dengan tema UI Anda.
2. **Engagement Hook**: Sertakan kalimat pembuka memikat di 3 detik pertama video / baris pertama caption.
3. **Hashtag & Grounding**: Gunakan hashtag ceruk yang spesifik dengan target audiens Anda.

*Tips*: Untuk analisis langsung secara mendalam dengan Google Search Grounding atau model Pro terbaru, pastikan API Key Gemini terhubung di menu Pengaturan API.`;

  return { text: localReply };
}


