import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Plus, Lightbulb, Layers, CheckCircle2, Trash2, CheckSquare, HardDrive } from 'lucide-react';
import { 
  saveUserDataToCloud, 
  googleSignIn, 
  createGoogleCalendarEvent, 
  createGoogleTask, 
  saveFileToGoogleDrive 
} from '../lib/firebase';

interface PlannerProps {
  onShowModal: (title: string, body: string) => void;
  user: User | null;
  accessToken: string | null;
}

interface PlannerCard {
  id: string;
  title: string;
  description: string;
  column: 'ideas' | 'render' | 'published';
  tag: string;
}

export const Planner: React.FC<PlannerProps> = ({ onShowModal, user, accessToken }) => {
  const [cards, setCards] = useState<PlannerCard[]>([
    {
      id: '1',
      title: 'Konsep Mozaik Marmer 3x3',
      description: 'Foto sudut arsitektur eropa dengan warm golden tone.',
      column: 'ideas',
      tag: 'Grid 3x3',
    },
    {
      id: '2',
      title: 'Carousel Sejarah Art Nouveau',
      description: '5 Slide informasi warna pastel ivory & emas.',
      column: 'render',
      tag: 'Carousel',
    },
    {
      id: '3',
      title: 'Peluncuran Tema Fluost Sky',
      description: 'Konten feed dengan nuansa awan dan biru langit.',
      column: 'published',
      tag: 'Single Post',
    },
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTag, setNewTag] = useState('Grid 3x3');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const syncCardsToCloud = (updatedCards: PlannerCard[]) => {
    setCards(updatedCards);
    if (user) {
      saveUserDataToCloud(user.uid, { plannerCards: updatedCards });
    }
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const card: PlannerCard = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      description: newDesc.trim() || 'Tidak ada deskripsi tambahan.',
      column: 'ideas',
      tag: newTag,
    };

    const updated = [...cards, card];
    syncCardsToCloud(updated);
    setNewTitle('');
    setNewDesc('');
    setShowAddForm(false);
    onShowModal('Kartu Ditambahkan', 'Konsep baru berhasil masuk ke kolom Ide Mentah dan tersimpan ke akun.');
  };

  const moveCard = (id: string, targetCol: 'ideas' | 'render' | 'published') => {
    const updated = cards.map((card) => (card.id === id ? { ...card, column: targetCol } : card));
    syncCardsToCloud(updated);
  };

  const deleteCard = (id: string) => {
    const updated = cards.filter((card) => card.id !== id);
    syncCardsToCloud(updated);
  };

  // Helper for triggering OAuth if missing real token
  const handleOAuthConnectPrompt = async (): Promise<string | null> => {
    try {
      setIsSyncing(true);
      const res = await googleSignIn();
      if (res.user && res.accessToken && !res.accessToken.startsWith('mock-')) {
        onShowModal(
          'Google Workspace Terhubung',
          `Akses Google Calendar, Tasks, dan Drive telah aktif untuk ${res.user.displayName || res.user.email}. Silakan coba kembali aksi Anda!`
        );
        return res.accessToken;
      } else if (res.isDemoMode) {
        onShowModal(
          'Mode Preview Aset',
          'Login popup Google diblokir oleh kebijakan keamanan domain browser/iframe. Untuk menguji integrasi Google Calendar, Tasks & Drive dengan akun asli, silakan buka aplikasi di tab baru.'
        );
      }
    } catch (err: any) {
      onShowModal('Login Google Dibatalkan', err.message || 'Harap izinkan popup browser untuk login Google Workspace.');
    } finally {
      setIsSyncing(false);
    }
    return null;
  };

  // Google Calendar Integration
  const handleAddToCalendar = async (card: PlannerCard) => {
    let activeToken = accessToken;
    if (!activeToken || activeToken.startsWith('mock-')) {
      activeToken = await handleOAuthConnectPrompt();
      if (!activeToken) return;
    }

    try {
      setIsSyncing(true);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      const endTomorrow = new Date(tomorrow);
      endTomorrow.setHours(11, 0, 0, 0);

      await createGoogleCalendarEvent(activeToken, {
        summary: `[Fluost Studio] Posting: ${card.title}`,
        description: `Tag: ${card.tag}\nDeskripsi: ${card.description}`,
        startIso: tomorrow.toISOString(),
        endIso: endTomorrow.toISOString(),
      });

      onShowModal(
        'Google Calendar Terhubung',
        `Jadwal posting "${card.title}" telah ditambahkan ke Google Calendar Anda untuk besok pukul 10:00 AM.`
      );
    } catch (err: any) {
      if (err.message === 'NO_TOKEN' || err.message?.includes('401') || err.message?.includes('Otentikasi')) {
        await handleOAuthConnectPrompt();
      } else {
        onShowModal('Gagal Google Calendar', err.message || 'Terjadi kesalahan saat menghubungkan Google Calendar.');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Google Tasks Integration
  const handleAddToTasks = async (card: PlannerCard) => {
    let activeToken = accessToken;
    if (!activeToken || activeToken.startsWith('mock-')) {
      activeToken = await handleOAuthConnectPrompt();
      if (!activeToken) return;
    }

    try {
      setIsSyncing(true);
      await createGoogleTask(activeToken, {
        title: `Fluost Content: ${card.title} (${card.tag})`,
        notes: card.description,
      });

      onShowModal(
        'Google Tasks Terhubung',
        `Tugas "${card.title}" telah berhasil masuk ke Google Tasks Anda.`
      );
    } catch (err: any) {
      if (err.message === 'NO_TOKEN' || err.message?.includes('401') || err.message?.includes('Otentikasi')) {
        await handleOAuthConnectPrompt();
      } else {
        onShowModal('Gagal Google Tasks', err.message || 'Terjadi kesalahan saat mengirim ke Google Tasks.');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Google Drive Integration
  const handleExportToDrive = async () => {
    let activeToken = accessToken;
    if (!activeToken || activeToken.startsWith('mock-')) {
      activeToken = await handleOAuthConnectPrompt();
      if (!activeToken) return;
    }

    try {
      setIsSyncing(true);
      const reportContent = `=====================================\nFLUOST STUDIO - INSTAGRAM CONTENT PLANNER\nTanggal Export: ${new Date().toLocaleString('id-ID')}\n=====================================\n\n` +
        cards.map((c, i) => `${i + 1}. [${c.column.toUpperCase()}] ${c.title} (${c.tag})\n   Deskripsi: ${c.description}\n`).join('\n');

      const fileName = `Fluost_Planner_${Date.now()}.txt`;
      await saveFileToGoogleDrive(activeToken, fileName, reportContent, 'text/plain');

      onShowModal(
        'Tersimpan di Google Drive',
        `Dokumen perencana "${fileName}" telah berhasil diunggah ke Google Drive Anda!`
      );
    } catch (err: any) {
      if (err.message === 'NO_TOKEN' || err.message?.includes('401') || err.message?.includes('Otentikasi')) {
        await handleOAuthConnectPrompt();
      } else {
        onShowModal('Gagal Google Drive', err.message || 'Terjadi kesalahan saat menyimpan file ke Google Drive.');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fluost-box p-4 sm:p-6 md:p-8">
      <div className="fluost-fluid-bg"></div>
      <div className="fluost-sand-corner"></div>

      <div className="relative z-10 space-y-5 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black flex items-center gap-2.5">
              <Calendar className="w-6 h-6 text-[var(--fluid-2)]" /> Timeline Arsitektur Content
            </h2>
            <p className="text-xs md:text-sm font-medium opacity-80 mt-1">
              Papan perencana alur konten visual, integrasi Google Calendar, Tasks, Drive & Cloud sync.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportToDrive}
              disabled={isSyncing}
              className="fluost-btn px-4 py-2 text-xs flex items-center gap-1.5 bg-[#4285F4]/20 hover:bg-[#4285F4]/30 text-[#4285F4] border border-[#4285F4]/40"
              title="Simpan jadwal planner ke Google Drive"
            >
              <HardDrive className="w-3.5 h-3.5" /> Export Google Drive
            </button>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="fluost-btn px-5 py-2 text-xs md:text-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> {showAddForm ? 'Tutup Form' : 'Entri Konsep Baru'}
            </button>
          </div>
        </div>

        {/* Add Card Form Modal / Expand */}
        <AnimatePresence>
          {showAddForm && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleAddCard}
              className="bg-black/20 p-5 rounded-3xl border border-[var(--ice-border)] space-y-4 backdrop-blur-md"
            >
              <h3 className="font-bold text-sm text-[var(--fluid-2)]">Buat Rencana Konten Baru</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Judul Konten / Konsep Grid..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="fluost-input w-full p-3 text-xs md:text-sm font-bold"
                  required
                />

                <select
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="fluost-input w-full p-3 text-xs md:text-sm font-bold"
                >
                  <option value="Grid 3x3">Grid 3x3</option>
                  <option value="Grid Panorama">Grid Panorama</option>
                  <option value="Carousel Slide">Carousel Slide</option>
                  <option value="Instagram Reels">Instagram Reels</option>
                  <option value="Single Feed">Single Feed</option>
                </select>
              </div>

              <textarea
                placeholder="Catatan detail, filter tone, atau lirik lagu..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={2}
                className="fluost-input w-full p-3 text-xs md:text-sm font-medium"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-xs opacity-70 hover:opacity-100"
                >
                  Batal
                </button>
                <button type="submit" className="fluost-btn px-6 py-2 text-xs">
                  Simpan ke Ide Mentah
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Kanban Board Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Ideas */}
          <div className="bg-black/10 backdrop-blur-md rounded-[2rem] p-5 border border-white/10 shadow-inner flex flex-col justify-between min-h-[350px]">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center justify-between border-b border-[var(--ice-border)] pb-2 text-[var(--fluid-2)]">
                <span className="flex items-center gap-1.5"><Lightbulb className="w-4 h-4" /> Ide Mentah</span>
                <span className="ice-badge">{cards.filter((c) => c.column === 'ideas').length}</span>
              </h3>

              <div className="space-y-3">
                {cards
                  .filter((c) => c.column === 'ideas')
                  .map((card) => (
                    <div
                      key={card.id}
                      className="bg-[var(--card-bg)] p-4 rounded-2xl border border-[var(--ice-border)] shadow-md hover:-translate-y-1 transition-all space-y-2 group"
                    >
                      <div className="flex justify-between items-start">
                        <span className="ice-badge text-[10px] py-0.5 px-2">{card.tag}</span>
                        <button
                          onClick={() => deleteCard(card.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="font-bold text-sm text-[var(--text-main)]">{card.title}</h4>
                      <p className="text-xs opacity-70 leading-relaxed">{card.description}</p>

                      <div className="flex items-center gap-1.5 pt-1.5 border-t border-[var(--ice-border)]/40">
                        <button
                          onClick={() => handleAddToCalendar(card)}
                          className="px-2 py-0.5 rounded-lg bg-[#EA4335]/15 hover:bg-[#EA4335]/30 text-[#EA4335] text-[10px] font-bold flex items-center gap-1 border border-[#EA4335]/30"
                          title="Tambah ke Google Calendar"
                        >
                          <Calendar className="w-3 h-3" /> +Cal
                        </button>
                        <button
                          onClick={() => handleAddToTasks(card)}
                          className="px-2 py-0.5 rounded-lg bg-[#34A853]/15 hover:bg-[#34A853]/30 text-[#34A853] text-[10px] font-bold flex items-center gap-1 border border-[#34A853]/30"
                          title="Kirim ke Google Tasks"
                        >
                          <CheckSquare className="w-3 h-3" /> +Task
                        </button>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => moveCard(card.id, 'render')}
                          className="text-[11px] font-bold text-[var(--fluid-2)] hover:underline flex items-center gap-1"
                        >
                          Pindah ke Render &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Column 2: Render / Process */}
          <div className="bg-black/10 backdrop-blur-md rounded-[2rem] p-5 border border-white/10 shadow-inner flex flex-col justify-between min-h-[350px]">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center justify-between border-b border-[var(--ice-border)] pb-2 text-[var(--fluid-1)]">
                <span className="flex items-center gap-1.5"><Layers className="w-4 h-4" /> Tahap Render</span>
                <span className="ice-badge">{cards.filter((c) => c.column === 'render').length}</span>
              </h3>

              <div className="space-y-3">
                {cards
                  .filter((c) => c.column === 'render')
                  .map((card) => (
                    <div
                      key={card.id}
                      className="bg-[var(--card-bg)] p-4 rounded-2xl border border-[var(--ice-border)] shadow-md hover:-translate-y-1 transition-all space-y-2 group"
                    >
                      <div className="flex justify-between items-start">
                        <span className="ice-badge text-[10px] py-0.5 px-2">{card.tag}</span>
                        <button
                          onClick={() => deleteCard(card.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="font-bold text-sm text-[var(--text-main)]">{card.title}</h4>
                      <p className="text-xs opacity-70 leading-relaxed">{card.description}</p>

                      <div className="flex items-center gap-1.5 pt-1.5 border-t border-[var(--ice-border)]/40">
                        <button
                          onClick={() => handleAddToCalendar(card)}
                          className="px-2 py-0.5 rounded-lg bg-[#EA4335]/15 hover:bg-[#EA4335]/30 text-[#EA4335] text-[10px] font-bold flex items-center gap-1 border border-[#EA4335]/30"
                          title="Tambah ke Google Calendar"
                        >
                          <Calendar className="w-3 h-3" /> +Cal
                        </button>
                        <button
                          onClick={() => handleAddToTasks(card)}
                          className="px-2 py-0.5 rounded-lg bg-[#34A853]/15 hover:bg-[#34A853]/30 text-[#34A853] text-[10px] font-bold flex items-center gap-1 border border-[#34A853]/30"
                          title="Kirim ke Google Tasks"
                        >
                          <CheckSquare className="w-3 h-3" /> +Task
                        </button>
                      </div>

                      <div className="pt-2 flex justify-between items-center text-[11px]">
                        <button
                          onClick={() => moveCard(card.id, 'ideas')}
                          className="opacity-70 hover:opacity-100"
                        >
                          &larr; Ide
                        </button>
                        <button
                          onClick={() => moveCard(card.id, 'published')}
                          className="font-bold text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          Selesai &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Column 3: Published */}
          <div className="bg-black/10 backdrop-blur-md rounded-[2rem] p-5 border border-white/10 shadow-inner flex flex-col justify-between min-h-[350px]">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center justify-between border-b border-[var(--ice-border)] pb-2 text-emerald-400">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Terpublikasi</span>
                <span className="ice-badge">{cards.filter((c) => c.column === 'published').length}</span>
              </h3>

              <div className="space-y-3 opacity-80">
                {cards
                  .filter((c) => c.column === 'published')
                  .map((card) => (
                    <div
                      key={card.id}
                      className="bg-[var(--card-bg)] p-4 rounded-2xl border border-[var(--ice-border)] shadow-sm space-y-2 group"
                    >
                      <div className="flex justify-between items-start">
                        <span className="ice-badge text-[10px] py-0.5 px-2 bg-emerald-500/20 text-emerald-300">
                          {card.tag}
                        </span>
                        <button
                          onClick={() => deleteCard(card.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="font-bold text-sm line-through text-[var(--text-main)]">{card.title}</h4>
                      <p className="text-xs opacity-60 leading-relaxed">{card.description}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
