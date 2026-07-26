import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Send,
  Paperclip,
  Sparkles,
  Bot,
  User,
  Trash2,
  Copy,
  Check,
  Search,
  Globe,
  Film,
  Image as ImageIcon,
  Zap,
  Sliders,
  X,
  FileText,
  RotateCcw
} from 'lucide-react';
import {
  ChatMessageItem,
  ChatAttachment,
  sendGeminiChatMessage
} from '../lib/geminiClient';

interface GeminiChatbotProps {
  onShowModal: (title: string, message: string) => void;
  onOpenApiModal: () => void;
}

interface PresetRole {
  id: string;
  title: string;
  icon: string;
  instruction: string;
  description: string;
}

const PRESET_ROLES: PresetRole[] = [
  {
    id: 'art_director',
    title: 'Art & Grid Director',
    icon: '🎨',
    instruction: 'Anda adalah Pengarah Seni Visual & Desainer Feed Instagram senior dari Fluost Studio. Berikan saran mendalam mengenai estetika, warna, komposisi grid, dan branding visual.',
    description: 'Saran tata letak grid, palet warna, dan gaya visual branding.'
  },
  {
    id: 'copywriter',
    title: 'Copywriter & Caption Strategist',
    icon: '✍️',
    instruction: 'Anda adalah pakar penulisan caption Instagram & TikTok tingkat tinggi. Buat caption dengan hook memikat, cerita ringkas bernilai tinggi, call to action, serta hashtag viral yang relevan.',
    description: 'Caption berdaya pikat tinggi, hook cerita, & racikan hashtag.'
  },
  {
    id: 'music_curator',
    title: 'Music & Audio Curator',
    icon: '🎵',
    instruction: 'Anda adalah spesialis kurator musik, lirik resmi, dan tren audio untuk Instagram Reels & TikTok. Berikan saran lagu otentik, lirik resmi, dan transisi potongan klip.',
    description: 'Rekomendasi lagu asli, kutipan lirik, & tren audio Reels.'
  },
  {
    id: 'trend_analyst',
    title: 'Trend Analyst & Researcher',
    icon: '🔍',
    instruction: 'Anda adalah analis tren media sosial terkini. Gunakan pencarian fakta dan data terbaru dari Google Search untuk memberikan wawasan tren paling hangat minggu ini.',
    description: 'Riset tren terkini & ide konten hangat berbasis Google Search.'
  },
  {
    id: 'media_critic',
    title: 'Video & Photo Content Critic',
    icon: '🎬',
    instruction: 'Anda adalah kritikus & editor video/foto profesional. Menganalisis secara kritis foto atau video yang diunggah pengguna: memeriksa lighting, color grading, pacing, framing, dan potensi kesuksesan di sosial media.',
    description: 'Pembedahan mendalam foto & video dengan masukan profesional.'
  },
  {
    id: 'custom',
    title: 'Kustom Role',
    icon: '⚙️',
    instruction: '',
    description: 'Tulis sistem instruksi unik sesuai peran yang Anda inginkan.'
  }
];

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  onShowModal,
  onOpenApiModal
}) => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>('art_director');
  const [customInstruction, setCustomInstruction] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.5-flash');
  const [enableSearchGrounding, setEnableSearchGrounding] = useState<boolean>(true);

  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: 'welcome_msg',
      role: 'model',
      text: `### 🤖 Halo! Selamat Datang di Chatbot Gemini Studio
Saya adalah Asisten AI Multi-peran dari Fluost Studio. Saya siap membantu Anda merancang konten, menulis caption, menganalisis foto/video, serta mencari tren terbaru berbasis data Google Search.

**Pilihan Mode & Fitur Utama:**
- 🎭 **Sistem Peran/Role**: Pilih peran spesialis di panel atas.
- 🔍 **Google Search Grounding**: Mengambil data fakta real-time dari web.
- 📷 🎬 **Analis Foto & Video**: Unggah file foto atau video untuk dibedah.
- ⚡ **Pilihan Model**: gemini-3.5-flash, gemini-3.1-pro-preview, atau gemini-3.1-flash-lite.

Apa yang ingin kita buat atau analisis hari ini?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputText, setInputText] = useState<string>('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const threadEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll chat thread to bottom
  const scrollToBottom = () => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const activeRole = PRESET_ROLES.find((r) => r.id === selectedRoleId) || PRESET_ROLES[0];
  const effectiveSystemInstruction =
    selectedRoleId === 'custom' ? customInstruction : activeRole.instruction;

  // Handle file uploads (Images & Videos)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      // Limit size to 25MB
      if (file.size > 25 * 1024 * 1024) {
        onShowModal('Ukuran File Terlalu Besar', `File "${file.name}" melebihi batas 25MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const resultStr = reader.result as string;
        const base64Data = resultStr.split(',')[1];
        setAttachments((prev) => [
          ...prev,
          {
            base64Data,
            mimeType: file.type || (file.name.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg'),
            fileName: file.name
          }
        ]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle Send Chat
  const handleSendMessage = async (overridePrompt?: string) => {
    const promptToSend = overridePrompt !== undefined ? overridePrompt : inputText;
    if ((!promptToSend || !promptToSend.trim()) && attachments.length === 0) return;
    if (isLoading) return;

    const userMsgId = `user_${Date.now()}`;
    const userMsg: ChatMessageItem = {
      id: userMsgId,
      role: 'user',
      text: promptToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: attachments.length > 0 ? [...attachments] : undefined
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setAttachments([]);
    setIsLoading(true);

    try {
      // Prepare API message format
      const apiMessages = newMessages
        .filter((m) => m.id !== 'welcome_msg')
        .map((m) => ({
          role: m.role,
          text: m.text,
          attachments: m.attachments
        }));

      const res = await sendGeminiChatMessage({
        messages: apiMessages,
        systemInstruction: effectiveSystemInstruction,
        model: selectedModel,
        enableSearchGrounding,
      });

      const modelMsg: ChatMessageItem = {
        id: `model_${Date.now()}`,
        role: 'model',
        text: res.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundingSources: res.groundingSources,
        modelUsed: selectedModel
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      onShowModal('Gagal Memproses Chat', err.message || 'Terjadi kesalahan saat berkomunikasi dengan Gemini.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        role: 'model',
        text: 'Riwayat percakapan telah dibersihkan. Apa yang ingin kita diskusikan selanjutnya?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="w-full space-y-6 pb-20">
      {/* Top Banner Header */}
      <div className="fluost-box p-6 sm:p-8 rounded-3xl backdrop-blur-2xl bg-[var(--ice-bg)] border border-[var(--ice-border)] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
              <Bot className="w-3.5 h-3.5" /> Multi-Turn Gemini Assistant & Search Grounding
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-main)]">
              Studio Chatbot & Multi-Role AI
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-main)] opacity-80 max-w-2xl font-medium">
              Diskusikan ide konten, buatkan script/caption, bedah file foto & video, serta dapatkan fakta tren terkini dengan dukungan Google Search Grounding.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearHistory}
              className="px-3.5 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 text-xs font-bold transition-all flex items-center gap-1.5"
              title="Bersihkan percakapan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Bersihkan Chat</span>
            </button>
            <button
              onClick={onOpenApiModal}
              className="px-3.5 py-2 rounded-xl bg-[var(--ice-border)] text-[var(--text-main)] hover:bg-[#3D5AFE] hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>API Key</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Settings Bar: Role Selection, Model Selection, Grounding Toggle */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Roles Carousel/Grid */}
        <div className="lg:col-span-8 fluost-box p-4 rounded-3xl bg-[var(--ice-bg)] border border-[var(--ice-border)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#3D5AFE] flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" /> Peran / Role Asisten AI:
            </span>
            <span className="text-[10px] font-mono opacity-70">
              {activeRole.title}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESET_ROLES.map((role) => {
              const isSelected = selectedRoleId === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`p-2.5 rounded-2xl border text-left transition-all relative overflow-hidden active:scale-95 ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white border-white/40 shadow-md font-bold'
                      : 'bg-[var(--ice-bg)] border-[var(--ice-border)] text-[var(--text-main)] hover:border-[#3D5AFE]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{role.icon}</span>
                    <span className="text-xs font-bold truncate">{role.title}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedRoleId === 'custom' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="pt-2"
            >
              <textarea
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                placeholder="Tulis sistem instruksi khusus (misal: 'Anda adalah pakar strategi pemasaran merek kopi kekinian...')"
                className="w-full p-3 rounded-2xl bg-[var(--ice-bg)] border border-[var(--ice-border)] text-xs text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[#3D5AFE] resize-none h-20"
              />
            </motion.div>
          )}
        </div>

        {/* Model Selection & Google Search Grounding Toggle */}
        <div className="lg:col-span-4 fluost-box p-4 rounded-3xl bg-[var(--ice-bg)] border border-[var(--ice-border)] space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#3D5AFE] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Model Gemini:
            </span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full p-2.5 rounded-2xl bg-[var(--ice-bg)] border border-[var(--ice-border)] text-xs font-bold text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]"
            >
              <option value="gemini-3.5-flash">Gemini 3.5 Flash (Umum & Kencang)</option>
              <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Analisis Kompleks)</option>
              <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Super Cepat)</option>
            </select>
          </div>

          {/* Search Grounding Toggle */}
          <div className="p-3 rounded-2xl bg-[var(--ice-bg)] border border-[var(--ice-border)] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[var(--text-main)]">Google Search Data</h4>
                <p className="text-[10px] opacity-70 leading-tight truncate">Grounding fakta & tren terkini</p>
              </div>
            </div>

            <button
              onClick={() => setEnableSearchGrounding(!enableSearchGrounding)}
              className={`w-11 h-6 rounded-full transition-all relative p-0.5 shrink-0 ${
                enableSearchGrounding ? 'bg-indigo-600' : 'bg-slate-500/30'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-all transform shadow-sm ${
                  enableSearchGrounding ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Thread Display Area */}
      <div className="fluost-box p-4 sm:p-6 rounded-3xl bg-[var(--ice-bg)] border border-[var(--ice-border)] min-h-[420px] max-h-[600px] flex flex-col justify-between overflow-hidden relative">
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 sm:pr-2 custom-scrollbar">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                    isUser
                      ? 'bg-gradient-to-tr from-sky-500 to-indigo-600 text-white'
                      : 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble Container */}
                <div className={`max-w-[85%] sm:max-w-[78%] space-y-2`}>
                  <div
                    className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed relative group ${
                      isUser
                        ? 'bg-[#3D5AFE] text-white rounded-tr-sm shadow-md'
                        : 'bg-[var(--ice-bg)] border border-[var(--ice-border)] text-[var(--text-main)] rounded-tl-sm shadow-sm'
                    }`}
                  >
                    {/* Attached Photos/Videos in message bubble */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {msg.attachments.map((att, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-2xl bg-black/20 border border-white/20 flex items-center gap-2 max-w-full text-xs"
                          >
                            {att.mimeType.startsWith('video/') ? (
                              <Film className="w-4 h-4 text-pink-300 shrink-0" />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-sky-300 shrink-0" />
                            )}
                            <span className="truncate max-w-[140px] text-[11px] font-medium">
                              {att.fileName || `Media ${idx + 1}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Formatted Text Content */}
                    <div className="whitespace-pre-wrap font-sans break-words">
                      {msg.text}
                    </div>

                    {/* Grounding Sources Badges */}
                    {msg.groundingSources && msg.groundingSources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/15 space-y-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Sumber Fakta (Google Search Grounding):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.groundingSources.map((source, idx) => (
                            <a
                              key={idx}
                              href={source.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-400/30 text-[10px] text-indigo-200 flex items-center gap-1 transition-all"
                            >
                              <Globe className="w-2.5 h-2.5" />
                              <span className="truncate max-w-[160px]">{source.title || source.uri}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions: Copy */}
                    <button
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-lg bg-black/20 hover:bg-black/40 text-white transition-all"
                      title="Salin teks"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>

                  {/* Timestamp & Info */}
                  <div
                    className={`flex items-center gap-2 text-[10px] opacity-60 px-1 ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.modelUsed && <span className="font-mono">({msg.modelUsed})</span>}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-3xl bg-[var(--ice-bg)] border border-[var(--ice-border)] text-xs flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                <span className="font-medium opacity-80">Menganalisis & meracik tanggapan...</span>
              </div>
            </motion.div>
          )}

          <div ref={threadEndRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        {messages.length <= 2 && (
          <div className="pt-3 pb-1 border-t border-[var(--ice-border)] flex flex-wrap gap-1.5">
            <span className="text-[10px] font-extrabold uppercase text-[#3D5AFE] flex items-center gap-1 mr-1">
              <Zap className="w-3 h-3" /> Ide Pertanyaan:
            </span>
            {[
              'Analisis tren Instagram Reels minggu ini',
              'Buat caption untuk foto pantai aesthetic',
              'Saran kombinasi warna feed feed grid 3x3',
              'Rekomendasi lagu santai untuk foto senja'
            ].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="px-2.5 py-1 rounded-xl bg-[var(--ice-bg)] hover:bg-[#3D5AFE] hover:text-white border border-[var(--ice-border)] text-[11px] font-medium transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input Area + File Attachment Preview Bar */}
      <div className="fluost-box p-4 rounded-3xl bg-[var(--ice-bg)] border border-[var(--ice-border)] space-y-3">
        {/* Attachment Preview Chips */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-1 border-b border-[var(--ice-border)]">
            {attachments.map((att, idx) => (
              <div
                key={idx}
                className="px-3 py-1.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs flex items-center gap-2 text-[var(--text-main)]"
              >
                {att.mimeType.startsWith('video/') ? (
                  <Film className="w-3.5 h-3.5 text-pink-400" />
                ) : (
                  <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                )}
                <span className="truncate max-w-[160px] font-medium">{att.fileName || `Attachment ${idx + 1}`}</span>
                <button
                  onClick={() => removeAttachment(idx)}
                  className="p-1 rounded-lg hover:bg-red-500/20 text-red-400 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* File Picker Button */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-2xl bg-[var(--ice-bg)] border border-[var(--ice-border)] hover:border-[#3D5AFE] text-[var(--text-main)] transition-all shrink-0 active:scale-95"
            title="Unggah Foto atau Video untuk Didekonstruksi Gemini"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Textarea Input */}
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Tulis pertanyaan, instruksi konten, atau deskripsi foto/video Anda di sini... (Shift + Enter untuk baris baru)"
            className="flex-1 p-3 rounded-2xl bg-[var(--ice-bg)] border border-[var(--ice-border)] text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[#3D5AFE] resize-none h-12 max-h-32 custom-scrollbar"
          />

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || (!inputText.trim() && attachments.length === 0)}
            className="p-3 rounded-2xl bg-[#3D5AFE] text-white hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 shadow-md active:scale-95"
          >
            {isLoading ? <Bot className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
