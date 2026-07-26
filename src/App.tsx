import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from 'firebase/auth';
import { TabType, ThemeMode } from './types';
import { Header } from './components/Header';
import { EnGrid } from './components/EnGrid';
import { ListenList } from './components/ListenList';
import { AiSpark } from './components/AiSpark';
import { Visualost } from './components/Visualost';
import { Planner } from './components/Planner';
import { GeminiChatbot } from './components/GeminiChatbot';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { NotificationModal } from './components/NotificationModal';
import { ThemeBackground } from './components/ThemeBackground';
import { initAuthListener, googleSignIn, googleSignOut, loadUserDataFromCloud, saveUserDataToCloud } from './lib/firebase';

import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('grid');
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('sky');
  const [isSmartTheme, setIsSmartTheme] = useState<boolean>(true);
  const [smartThemeInfo, setSmartThemeInfo] = useState<{
    resolvedTheme: ThemeMode;
    label: string;
    timeRange: string;
  }>({
    resolvedTheme: 'sky',
    label: 'Mode Pagi Hari',
    timeRange: '06:00 - 11:00',
  });
  const [hasEnvApiKey, setHasEnvApiKey] = useState<boolean>(true);

  // Smart Theme Auto-Calculation logic based on local time & browser color-scheme preference
  const updateSmartTheme = () => {
    const hour = new Date().getHours();
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    let theme: ThemeMode = 'sky';
    let label = 'Mode Pagi (Panoramic Sky)';
    let timeRange = '06:00 - 11:00';

    if (hour >= 6 && hour < 11) {
      theme = 'sky';
      label = 'Pagi Hari (Panoramic Sky)';
      timeRange = '06:00 - 11:00';
    } else if (hour >= 11 && hour < 17) {
      if (prefersDark) {
        theme = 'cyberpunk';
        label = 'Siang Mode Gelap (Cyberpunk)';
        timeRange = '11:00 - 17:00';
      } else {
        theme = 'light';
        label = 'Siang Terang (Classic White)';
        timeRange = '11:00 - 17:00';
      }
    } else if (hour >= 17 && hour < 19) {
      theme = 'sunset';
      label = 'Senja Golden Hour (Crimson Sunset)';
      timeRange = '17:00 - 19:00';
    } else {
      theme = 'dark';
      label = 'Malam Hari (Authentic Dark)';
      timeRange = '19:00 - 06:00';
    }

    setSmartThemeInfo({ resolvedTheme: theme, label, timeRange });
    return theme;
  };

  // Effect to apply theme (either manual or smart mode)
  useEffect(() => {
    let appliedTheme = currentTheme;
    if (isSmartTheme) {
      appliedTheme = updateSmartTheme();
    }
    document.documentElement.setAttribute('data-theme', appliedTheme);

    const interval = setInterval(() => {
      if (isSmartTheme) {
        const theme = updateSmartTheme();
        document.documentElement.setAttribute('data-theme', theme);
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [currentTheme, isSmartTheme]);

  // User Auth & Cloud Persistence State
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Modal State
  const [isApiModalOpen, setIsApiModalOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    title: string;
    body: string;
    autoDismiss?: boolean;
    copyText?: string;
    externalUrl?: string;
  }>({
    isOpen: false,
    title: '',
    body: '',
  });

  // Auth Listener and Cloud Sync Init
  useEffect(() => {
    const unsubscribe = initAuthListener(async (currentUser, token) => {
      if (currentUser && !user) {
        setUser(currentUser);
      }
      if (token && !accessToken) {
        setAccessToken(token);
      }
      if (currentUser) {
        const cloudData = await loadUserDataFromCloud(currentUser.uid);
        if (cloudData?.theme) {
          setCurrentTheme(cloudData.theme);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // On mount: verify server health
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.hasApiKey !== undefined) {
          setHasEnvApiKey(data.hasApiKey);
        }
      })
      .catch((err) => console.log('Server health check:', err));
  }, []);

  // Update theme data-theme attribute on <html> element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  const handleGoogleLogin = async () => {
    try {
      const res = await googleSignIn();
      if (res.user) {
        setUser(res.user);
        if (res.accessToken) {
          setAccessToken(res.accessToken);
        }
        if (res.isDemoMode) {
          showModal(
            'Sesi Pengguna Studio (Mode Preview)',
            `Selamat datang, ${res.user.displayName || 'Pengguna'}!\n\n` +
            `Sesi pengguna telah diaktifkan secara otomatis.\n\n` +
            `💡 Catatan Otorisasi Domain Google:\n` +
            `Di lingkungan preview container iframe Cloud Run, Google OAuth membatasi otorisasi redirect URL domain. Sistem secara otomatis mengalihkan sesi ke Mode Simulasi Studio agar Anda dapat mencoba seluruh fitur Planner, Google Calendar, Tasks, dan Drive secara langsung tanpa hambatan.`,
            { autoDismiss: false }
          );
        } else {
          showModal(
            'Login Google Workspace Berhasil',
            `Selamat datang, ${res.user.displayName || res.user.email}!\n\nAkses Google Calendar, Tasks, dan Drive telah aktif.`
          );
        }
      }
    } catch (err: any) {
      showModal('Informasi Login', err.message || 'Gagal terhubung dengan Google.');
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await googleSignOut();
      setUser(null);
      setAccessToken(null);
      showModal('Logout Berhasil', 'Anda telah keluar dari akun Google Workspace.');
    } catch (err: any) {
      showModal('Logout Gagal', err.message || 'Gagal keluar dari akun.');
    }
  };

  const showModal = (
    title: string,
    body: string,
    options?: { autoDismiss?: boolean; copyText?: string; externalUrl?: string }
  ) => {
    setNotification({
      isOpen: true,
      title,
      body,
      autoDismiss: options?.autoDismiss ?? true,
      copyText: options?.copyText,
      externalUrl: options?.externalUrl,
    });
  };

  const closeModal = () => {
    setNotification((prev) => ({ ...prev, isOpen: false }));
  };

  const themeLabels: Record<ThemeMode, string> = {
    sky: 'Panoramic Sky',
    default: 'Blueen v3.0',
    blueen: 'Blueen v3.0',
    light: 'Classic White',
    renaissance: 'Fluost Renaissance',
    islamic: 'Golden Age',
    atom: 'Tiny World',
    dark: 'Authentic Dark',
    cyberpunk: 'Neon Cyberpunk',
    nature: 'Serene Nature',
    monochrome: 'Pure Monochrome',
    sunset: 'Crimson Sunset',
  };

  const handleSetTheme = (themeName: ThemeMode) => {
    setIsSmartTheme(false);
    setCurrentTheme(themeName);
    if (user) {
      saveUserDataToCloud(user.uid, { theme: themeName });
    }
    showModal('Evolusi Tema', `UI Fluost telah beradaptasi ke atmosfer artistik: ${themeLabels[themeName] || themeName}.`);
  };

  const handleToggleSmartTheme = (enable?: boolean) => {
    const nextSmartState = enable !== undefined ? enable : !isSmartTheme;
    setIsSmartTheme(nextSmartState);
    if (nextSmartState) {
      const activeTheme = updateSmartTheme();
      showModal(
        'Mode Smart Theme Aktif ⚡',
        `Tema UI kini beradaptasi secara otomatis berdasarkan waktu lokal & preferensi sistem (${smartThemeInfo.label} ➔ Tema ${themeLabels[activeTheme] || activeTheme}).`
      );
    } else {
      showModal(
        'Mode Manual Aktif 🎨',
        `Smart Theme dinonaktifkan. Anda dapat memilih dari 11 tema artistik secara bebas.`
      );
    }
  };

  const activeEffectiveTheme = isSmartTheme ? smartThemeInfo.resolvedTheme : currentTheme;

  return (
    <div className="min-h-screen flex flex-col relative pb-52 pt-6 sm:pt-8 lg:pb-12 lg:pt-8 lg:pl-72 transition-colors duration-500 overflow-x-hidden">
      {/* Dynamic Theme Background Canvas & Particle Animations */}
      <ThemeBackground currentTheme={activeEffectiveTheme} />

      {/* PC Sidebar & Mobile Floating Taskbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentTheme={activeEffectiveTheme}
        setTheme={handleSetTheme}
        isSmartTheme={isSmartTheme}
        onToggleSmartTheme={handleToggleSmartTheme}
        smartThemeInfo={smartThemeInfo}
        onOpenApiModal={() => setIsApiModalOpen(true)}
        hasApiKey={true}
        user={user}
        onGoogleLogin={handleGoogleLogin}
        onGoogleLogout={handleGoogleLogout}
      />

      {/* Main Content Viewport */}
      <main className="w-full px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto flex-grow relative z-10">
        <ErrorBoundary>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 14, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.985 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="w-full"
            >
              {activeTab === 'grid' && <EnGrid onShowModal={showModal} />}
              {activeTab === 'chat' && (
                <GeminiChatbot
                  onShowModal={showModal}
                  onOpenApiModal={() => setIsApiModalOpen(true)}
                />
              )}
              {activeTab === 'music' && (
                <ListenList
                  onShowModal={showModal}
                  onOpenApiModal={() => setIsApiModalOpen(true)}
                />
              )}
              {activeTab === 'ai' && (
                <AiSpark
                  onShowModal={showModal}
                  onOpenApiModal={() => setIsApiModalOpen(true)}
                />
              )}
              {activeTab === 'assistant' && (
                <Visualost
                  onShowModal={showModal}
                  onOpenApiModal={() => setIsApiModalOpen(true)}
                />
              )}
              {activeTab === 'planner' && <Planner onShowModal={showModal} user={user} accessToken={accessToken} />}
            </motion.div>
          </AnimatePresence>
        </ErrorBoundary>
      </main>

      {/* App Footer */}
      <footer className="w-full px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto mt-12 text-center text-xs opacity-70 font-semibold relative z-10">
        <p>Fluost Studio &copy; {new Date().getFullYear()} • Instagram Content & Grid Architecture Slicer</p>
      </footer>

      {/* Modals */}
      <ApiSettingsModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        onShowModal={showModal}
        onStatusChange={() => {}}
      />

      <NotificationModal
        isOpen={notification.isOpen}
        title={notification.title}
        body={notification.body}
        autoDismiss={notification.autoDismiss}
        copyText={notification.copyText}
        externalUrl={notification.externalUrl}
        onClose={closeModal}
      />
    </div>
  );
}
