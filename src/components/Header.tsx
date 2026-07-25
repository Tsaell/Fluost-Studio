import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { TabType, ThemeMode } from '../types';
import { 
  Grid2X2, 
  Headphones, 
  Sparkles, 
  Eye, 
  Calendar, 
  Key, 
  Palette,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Info,
  X,
  LogOut,
  User as UserIcon
} from 'lucide-react';

const WaveIceLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="4" stroke="currentColor" strokeOpacity="0.8" />
    <path d="M2 12c3-4 6-4 10 0s7 4 10 0" stroke="currentColor" strokeWidth="2" />
    <path d="M2 17c3-3 6-3 10 0s7 3 10 0" stroke="currentColor" strokeOpacity="0.3" />
    <path d="M2 7c3-3 6-3 10 0s7 3 10 0" stroke="currentColor" strokeOpacity="0.3" />
  </svg>
);

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  currentTheme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  onOpenApiModal: () => void;
  hasApiKey: boolean;
  user: User | null;
  onGoogleLogin: () => void;
  onGoogleLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentTheme,
  setTheme,
  onOpenApiModal,
  hasApiKey,
  user,
  onGoogleLogin,
  onGoogleLogout,
}) => {
  const tabs = [
    { id: 'grid', label: 'EnGrid', sub: 'Grid Slicer & Live Feed Simulator', desc: 'Pemotong grid Instagram presisi tinggi dengan simulasi umpan profil.', icon: Grid2X2, badge: 'Most Recommended!' },
    { id: 'music', label: 'Audio', sub: 'ListenList Music Synthesis', desc: 'Sintesis frekuensi musik, lirik, dan atmosfer visual Instagram.', icon: Headphones, badge: 'Find your music!' },
    { id: 'ai', label: 'AI Spark', sub: 'Caption & Custom Media AI', desc: 'Racik caption, hashtag, dan analisis foto/video custom instan.', icon: Sparkles, badge: 'Make your caption!' },
    { id: 'assistant', label: 'Visualizer', sub: 'Aesthetic Palette & Contrast', desc: 'Analisis suhu warna, pencahayaan, dan keseimbangan visual foto.', icon: Eye, badge: 'Your editing assistant' },
    { id: 'planner', label: 'Planner', sub: 'Schedule Feed & Drag Planner', desc: 'Rencanakan postingan, draf caption, dan kalender feed Instagram.', icon: Calendar, badge: 'Organizer' },
  ] as const;

  const themes: { id: ThemeMode; label: string; color: string; desc: string }[] = [
    { 
      id: 'sky', 
      label: 'Panoramic Sky', 
      color: 'bg-[#38BDF8]',
      desc: 'Atmosfer langit biru cerah dengan font biru tua kontras tinggi tanpa bidang abu-abu gelap.' 
    },
    { 
      id: 'default', 
      label: 'Blueen', 
      color: 'bg-[#0B132B]',
      desc: 'Tema cyber bernuansa biru deep space futuristik dengan aksen neon khas Fluost Studio.' 
    },
    { 
      id: 'light', 
      label: 'Classic White', 
      color: 'bg-slate-100',
      desc: 'Tema serba putih bersih dengan font hitam pekat, kontras maksimal, dan permukaan yang jernih.' 
    },
    { 
      id: 'renaissance', 
      label: 'Fluost Renaissance', 
      color: 'bg-[#D4AF37]',
      desc: 'Tema artistik klasik dengan kehangatan warna emas murni, merah kirmizi, dan estetika seni tinggi.' 
    },
    { 
      id: 'islamic', 
      label: 'Golden Age', 
      color: 'bg-[#046307]',
      desc: 'Tema keemasan bernuansa keagungan sejarah peradaban Islam dengan aksen hijau zamrud & emas.' 
    },
    { 
      id: 'atom', 
      label: 'Tiny World', 
      color: 'bg-[#EF4444]',
      desc: 'Tema fiksi ilmiah berskala kuantum atomik dengan aksen merah energi dan geometri kosmik.' 
    },
    { 
      id: 'dark', 
      label: 'Authentic Dark', 
      color: 'bg-pink-500',
      desc: 'Tema malam gelap autentik berdaya hemat energi dengan aksen magenta & cyan menyala.' 
    },
    { 
      id: 'cyberpunk', 
      label: 'Neon Cyberpunk', 
      color: 'bg-[#0FF4C6]',
      desc: 'Tema neon futuristik dengan kilauan cyan dan merah muda tajam berlatar belakang ungu gelap.' 
    },
    { 
      id: 'nature', 
      label: 'Serene Nature', 
      color: 'bg-[#4CAF50]',
      desc: 'Tema alam organik yang menenangkan dengan paduan hijau cerah dan latar putih natural.' 
    },
    { 
      id: 'monochrome', 
      label: 'Pure Monochrome', 
      color: 'bg-gray-400',
      desc: 'Tema hitam putih minimalis dengan kontras tajam untuk fokus bebas gangguan.' 
    },
    { 
      id: 'sunset', 
      label: 'Crimson Sunset', 
      color: 'bg-[#FF9800]',
      desc: 'Tema senja hangat menyala dengan gradasi merah tua dan oranye matahari terbenam.' 
    },
  ];

  // Feature Showcase Slider Index & Refs for Mobile Topbar
  const [mobileSlideIndex, setMobileSlideIndex] = useState(0);
  const [showThemeGuideModal, setShowThemeGuideModal] = useState(false);
  const mobileTabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Keep mobileSlideIndex in sync with activeTab
  useEffect(() => {
    const idx = tabs.findIndex((t) => t.id === activeTab);
    if (idx !== -1 && idx !== mobileSlideIndex) {
      setMobileSlideIndex(idx);
    }
  }, [activeTab]);

  // Automatically scroll active feature button into center of topbar with smooth animation
  useEffect(() => {
    const activeBtn = mobileTabRefs.current[mobileSlideIndex];
    if (activeBtn) {
      activeBtn.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [mobileSlideIndex]);

  const activeFeature = tabs[mobileSlideIndex] || tabs[0];
  const activeThemeObj = themes.find((t) => t.id === currentTheme) || themes[0];

  const nextMobileSlide = () => {
    const next = (mobileSlideIndex + 1) % tabs.length;
    setMobileSlideIndex(next);
    setActiveTab(tabs[next].id as TabType);
  };

  const prevMobileSlide = () => {
    const prev = (mobileSlideIndex - 1 + tabs.length) % tabs.length;
    setMobileSlideIndex(prev);
    setActiveTab(tabs[prev].id as TabType);
  };

  return (
    <>
      {/* ========================================== */}
      {/* PC / DESKTOP SIDEBAR NAVIGATION (lg:flex)  */}
      {/* ========================================== */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-72 z-50 p-5 flex-col justify-between bg-[var(--card-bg)] backdrop-blur-2xl border-r border-[var(--ice-border)] text-[var(--text-main)] shadow-[10px_0_40px_rgba(0,0,0,0.15)] select-none overflow-y-auto hide-scrollbar">
        <div className="space-y-5">
          {/* Brand Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-[var(--ice-border)]">
            <div className="w-11 h-11 bg-gradient-to-tr from-[#3D5AFE] to-[#2563EB] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(61,90,254,0.6)] border border-white/30 shrink-0">
              <WaveIceLogo className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider flex items-center gap-1.5">
                FLUOST <span className="text-[#38BDF8] text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#3D5AFE]/20 border border-[#38BDF8]/40">STUDIO</span>
              </h1>
              <p className="text-[10px] opacity-70 font-mono tracking-widest uppercase mt-0.5">
                Instagram Grid Architecture
              </p>
            </div>
          </div>

          {/* User Google Account Login / Profile (Positioned High for Immediate Visibility on PC) */}
          {user ? (
            <div className="p-3 rounded-2xl bg-[var(--ice-bg)] border border-[#3D5AFE]/40 text-xs space-y-2 shadow-md">
              <div className="flex items-center gap-2.5">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full border border-[#3D5AFE] shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#3D5AFE] text-white flex items-center justify-center font-bold shrink-0">
                    {user.email?.[0].toUpperCase() || 'U'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-xs truncate">{user.displayName || 'Akun Google'}</p>
                  <p className="text-[10px] opacity-70 truncate font-mono">{user.email}</p>
                </div>
              </div>
              <button
                onClick={onGoogleLogout}
                className="w-full py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-500 border border-red-500/30 text-[10px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95"
              >
                <LogOut className="w-3 h-3" /> Keluar Akun Google
              </button>
            </div>
          ) : (
            <button
              onClick={onGoogleLogin}
              className="w-full flex items-center justify-center gap-2.5 p-3 rounded-2xl bg-[#3D5AFE] hover:bg-[#2563EB] text-white font-bold text-xs shadow-lg shadow-[#3D5AFE]/30 transition-all active:scale-95 group"
            >
              <svg className="w-4 h-4 bg-white rounded-full p-0.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.1 0-5.73-2.1-6.67-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"/>
                <path fill="#FBBC05" d="M5.33 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l4.04-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l4.04 3.15c.94-2.83 3.57-4.98 6.67-4.98z"/>
              </svg>
              <span>Login dengan Google</span>
            </button>
          )}

          {/* Navigation Items (PC Mode) */}
          <nav className="space-y-1.5">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#3D5AFE] px-3 py-0.5">
              Navigasi Fitur Studio
            </p>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200 text-left group ${
                    isActive
                      ? 'bg-gradient-to-r from-[#3D5AFE] to-[#1D4ED8] text-white shadow-lg shadow-[#3D5AFE]/40 border border-white/30 font-extrabold scale-[1.01]'
                      : 'hover:bg-black/5 dark:hover:bg-white/10 border border-transparent font-semibold'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[var(--ice-bg)] text-[#3D5AFE] group-hover:scale-105'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold leading-tight flex items-center justify-between">
                      <span>{tab.label}</span>
                      {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-sky-300" />}
                    </div>
                    <div
                      className={`text-[10px] truncate mt-0.5 ${
                        isActive ? 'text-sky-100 font-medium' : 'opacity-70 group-hover:opacity-100'
                      }`}
                    >
                      {tab.sub}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Controls: Theme Palette & API Settings */}
        <div className="space-y-3 pt-4 my-2 border-t border-[var(--ice-border)]">
          {/* Theme Palette Switcher */}
          <div>
            <div className="flex items-center justify-between px-1 mb-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#3D5AFE] flex items-center gap-1">
                <Palette className="w-3 h-3" /> Tema UI Artistik
              </span>
              <button
                onClick={() => setShowThemeGuideModal(true)}
                className="text-[10px] font-mono text-[#3D5AFE] hover:underline font-bold uppercase flex items-center gap-1"
                title="Lihat semua deskripsi tema"
              >
                <Info className="w-3 h-3" /> Info Tema
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1.5 p-2 rounded-2xl bg-[var(--ice-bg)] border border-[var(--ice-border)]">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  title={`${t.label}: ${t.desc}`}
                  className={`w-full aspect-square rounded-xl ${t.color} border transition-all duration-200 flex items-center justify-center ${
                    currentTheme === t.id
                      ? 'border-white scale-110 shadow-md ring-2 ring-[#3D5AFE]'
                      : 'border-white/30 opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                />
              ))}
            </div>

            {/* Active Theme Description Box */}
            <div className="mt-2 p-2 rounded-2xl bg-[var(--ice-bg)] border border-[var(--ice-border)] text-xs space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-[10px] font-extrabold tracking-wider text-[#3D5AFE]">
                <span>{activeThemeObj.label}</span>
                <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-[#3D5AFE]/15 border border-[#3D5AFE]/30">Aktif</span>
              </div>
              <p className="text-[10px] leading-relaxed opacity-85 font-medium">
                {activeThemeObj.desc}
              </p>
            </div>
          </div>

          {/* API Key Modal Button */}
          <button
            onClick={onOpenApiModal}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-[var(--ice-bg)] hover:border-[#3D5AFE] border border-[var(--ice-border)] transition-all text-xs font-bold shadow-md group"
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#3D5AFE]/20 text-[#3D5AFE] border border-[#3D5AFE]/30">
                <Key className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-extrabold">Gemini API Key</p>
                <p className="text-[10px] opacity-70 font-mono">
                  {hasApiKey ? 'Terhubung & Aktif' : 'Belum Dikonfigurasi'}
                </p>
              </div>
            </div>
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                hasApiKey ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400 animate-pulse'
              }`}
            />
          </button>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MOBILE / TABLET FLOATING TASKBAR + SLIDER (lg:hidden)    */}
      {/* ======================================================== */}
      <header className="lg:hidden fixed bottom-4 left-0 right-0 z-50 px-2.5 sm:px-4 pointer-events-none transition-all duration-300 pb-safe">
        <div className="pointer-events-auto bg-[var(--card-bg)] backdrop-blur-3xl border-2 border-[var(--ice-border)] p-3 shadow-[0_-15px_40px_rgba(0,0,0,0.2)] flex flex-col gap-2.5 transition-colors duration-500 mx-auto max-w-3xl rounded-2xl text-[var(--text-main)]">
          
          {/* Top Row: Brand Logo, Theme Palette & API Button */}
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-gradient-to-tr from-[#3D5AFE] to-sky-400 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(61,90,254,0.6)] shrink-0 border border-white/30">
                <WaveIceLogo className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tight flex items-center gap-1">
                  FLUOST <span className="text-[#3D5AFE] text-[8px] font-mono px-1 py-0.2 rounded bg-[#3D5AFE]/20 border border-[#3D5AFE]/30">STUDIO</span>
                </h1>
              </div>
            </div>

            {/* Mobile Controls: Themes Button, Google Login & API Key */}
            <div className="flex items-center gap-1.5 shrink-0 pl-1">
              {/* Mobile Theme Selector Button */}
              <button
                onClick={() => setShowThemeGuideModal(true)}
                title="Pilih Tema UI (11 Atmosfer Berbeda)"
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-[var(--ice-bg)] border border-[var(--ice-border)] hover:border-[#3D5AFE] text-xs font-extrabold shrink-0 active:scale-95 transition-all shadow-sm"
              >
                <Palette className="w-3.5 h-3.5 text-[#3D5AFE] shrink-0" />
                <div className={`w-3 h-3 rounded-full ${activeThemeObj.color} border border-white/60 shadow-sm shrink-0`} />
                <span className="text-[10px] font-extrabold max-w-[70px] sm:max-w-[110px] truncate">
                  {activeThemeObj.label}
                </span>
              </button>

              {user ? (
                <button
                  onClick={onGoogleLogout}
                  title={`Login sebagai ${user.email}. Klik untuk keluar.`}
                  className="px-2 py-1.5 rounded-xl bg-[var(--ice-bg)] border border-[#3D5AFE] text-[10px] flex items-center gap-1 font-bold shrink-0 hover:bg-red-500/20 transition-all"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-4 h-4 rounded-full" />
                  ) : (
                    <UserIcon className="w-3.5 h-3.5 text-[#3D5AFE]" />
                  )}
                  <span className="hidden sm:inline truncate max-w-[60px]">{user.displayName?.split(' ')[0] || 'User'}</span>
                </button>
              ) : (
                <button
                  onClick={onGoogleLogin}
                  title="Login dengan Google"
                  className="px-2.5 py-1.5 rounded-xl bg-[#3D5AFE] text-white text-xs flex items-center gap-1.5 font-bold shrink-0 active:scale-95 shadow-md"
                >
                  <svg className="w-3.5 h-3.5 bg-white rounded-full p-0.5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.1 0-5.73-2.1-6.67-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.33 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l4.04-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l4.04 3.15c.94-2.83 3.57-4.98 6.67-4.98z"/>
                  </svg>
                  <span className="text-[11px]">Google</span>
                </button>
              )}

              <button
                onClick={onOpenApiModal}
                title="Pengaturan API Gemini"
                className="p-1.5 rounded-xl bg-[var(--ice-bg)] border border-[var(--ice-border)] text-xs flex items-center gap-1 font-bold hover:opacity-80 shrink-0"
              >
                <Key className="w-3.5 h-3.5 text-[#3D5AFE]" />
                <span className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              </button>
            </div>
          </div>

          {/* Horizontal Scrollable Theme Palette Bar for Mobile */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full hide-scrollbar py-1 border-t border-b border-[var(--ice-border)]/60 my-0.5">
            <span className="text-[9px] font-mono font-black uppercase tracking-wider text-[#3D5AFE] shrink-0 pl-1 flex items-center gap-1">
              <Palette className="w-3 h-3" /> Tema UI:
            </span>
            {themes.map((t) => {
              const isCurrent = currentTheme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  title={`${t.label}: ${t.desc}`}
                  className={`shrink-0 px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all border ${
                    isCurrent
                      ? 'bg-[#3D5AFE] text-white border-white/80 shadow-md scale-105 ring-1 ring-[#3D5AFE]'
                      : 'bg-[var(--ice-bg)] border-[var(--ice-border)] opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${t.color} border border-white/60 shrink-0`} />
                  <span className="truncate max-w-[90px]">{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation Tab Pills (Scrollable Horizontal) */}
          <nav className="flex items-center gap-1.5 overflow-x-auto w-full hide-scrollbar py-0.5">
            {tabs.map((tab, idx) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    mobileTabRefs.current[idx] = el;
                  }}
                  onClick={() => {
                    setActiveTab(tab.id as TabType);
                    setMobileSlideIndex(idx);
                  }}
                  className={`shrink-0 px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 rounded-xl transition-all border ${
                    isActive
                      ? 'bg-gradient-to-r from-[#3D5AFE] to-blue-600 text-white shadow-lg shadow-[#3D5AFE]/50 border-white/50 scale-105'
                      : 'bg-[var(--ice-bg)] border-[var(--ice-border)] opacity-80 hover:opacity-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-[#3D5AFE]" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Interactive Mobile Feature Slider Showcase Banner */}
          <div className="relative rounded-xl bg-[var(--ice-bg)] border border-[var(--ice-border)] p-2.5 flex items-center justify-between gap-2 overflow-hidden shadow-inner">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--fluid-1)]/15 rounded-full blur-xl pointer-events-none" />

            {/* Previous Slide Button */}
            <button
              onClick={prevMobileSlide}
              className="p-1 rounded-lg bg-[var(--card-bg)] hover:opacity-80 shrink-0 border border-[var(--ice-border)] transition-all active:scale-95"
              title="Fitur Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Feature Slide Info */}
            <div
              onClick={() => setActiveTab(activeFeature.id as TabType)}
              className="flex-1 min-w-0 cursor-pointer group flex items-center justify-between gap-2 px-1"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.2 rounded bg-[#3D5AFE]/20 text-[#3D5AFE] border border-[#3D5AFE]/30">
                    {activeFeature.badge}
                  </span>
                  <h3 className="text-xs font-extrabold truncate flex items-center gap-1">
                    {activeFeature.label} <span className="opacity-60 text-[10px]">({mobileSlideIndex + 1}/5)</span>
                  </h3>
                </div>
                <p className="text-[10px] opacity-80 truncate mt-0.5 font-medium">
                  {activeFeature.desc}
                </p>
              </div>

              <div className="shrink-0 p-1.5 rounded-lg bg-[#3D5AFE] text-white group-hover:scale-110 transition-transform flex items-center justify-center">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Next Slide Button */}
            <button
              onClick={nextMobileSlide}
              className="p-1 rounded-lg bg-[var(--card-bg)] hover:opacity-80 shrink-0 border border-[var(--ice-border)] transition-all active:scale-95"
              title="Fitur Selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Theme Guide Modal */}
      {showThemeGuideModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-[var(--card-bg)] text-[var(--text-main)] border border-[var(--ice-border)] rounded-3xl p-5 md:p-6 max-w-lg w-full space-y-4 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="fluost-fluid-bg opacity-20" />
            <div className="flex items-center justify-between border-b border-[var(--ice-border)] pb-3 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#3D5AFE]/20 text-[#3D5AFE] border border-[#3D5AFE]/30">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-tight">Koleksi 11 Tema UI Fluost Studio</h3>
                  <p className="text-xs opacity-70">Pilih dari 11 atmosfer & estetika visual eksklusif</p>
                </div>
              </div>
              <button 
                onClick={() => setShowThemeGuideModal(false)}
                className="p-1.5 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 transition-all"
                aria-label="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Informative Banner */}
            <div className="p-3 rounded-2xl bg-[#3D5AFE]/15 border border-[#3D5AFE]/30 text-xs relative z-10 space-y-1">
              <p className="font-extrabold text-[#3D5AFE] flex items-center gap-1.5">
                <Palette className="w-4 h-4 shrink-0" />
                <span>11 Pilihan Atmosfer Warna & Tema UI:</span>
              </p>
              <p className="opacity-90 leading-relaxed text-[11px]">
                Masing-masing warna di bawah mewakili tema visual yang berbeda (Panoramic Sky, Renaissance, Golden Age, Neon Cyberpunk, Sunset, dll.). Pilih warna favorit Anda untuk mengubah seluruh warna, font, dan latar belakang aplikasi secara instan!
              </p>
            </div>

            <div className="space-y-2.5 relative z-10">
              {themes.map((t) => {
                const isCurrent = currentTheme === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      setShowThemeGuideModal(false);
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isCurrent
                        ? 'border-[#3D5AFE] bg-[#3D5AFE]/15 shadow-md ring-1 ring-[#3D5AFE]'
                        : 'border-[var(--ice-border)] bg-[var(--ice-bg)] hover:border-[#3D5AFE]/50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full ${t.color} border border-white/50 shrink-0 mt-0.5 shadow-sm`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-extrabold tracking-wide flex items-center gap-2">
                          {t.label}
                        </h4>
                        {isCurrent && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#3D5AFE] text-white font-bold">
                            Aktif
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] opacity-85 mt-0.5 leading-relaxed font-medium">
                        {t.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowThemeGuideModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#3D5AFE] hover:bg-[#2563EB] text-white font-bold text-xs transition-all shadow-md relative z-10 active:scale-95"
            >
              Tutup Panduan Tema
            </button>
          </div>
        </div>
      )}
    </>
  );
};

