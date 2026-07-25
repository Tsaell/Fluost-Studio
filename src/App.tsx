import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { TabType, ThemeMode } from './types';
import { Header } from './components/Header';
import { EnGrid } from './components/EnGrid';
import { ListenList } from './components/ListenList';
import { AiSpark } from './components/AiSpark';
import { Visualost } from './components/Visualost';
import { Planner } from './components/Planner';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { NotificationModal } from './components/NotificationModal';
import { ThemeBackground } from './components/ThemeBackground';
import { initAuthListener, googleSignIn, googleSignOut, loadUserDataFromCloud, saveUserDataToCloud } from './lib/firebase';

import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('grid');
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('sky');
  const [hasEnvApiKey, setHasEnvApiKey] = useState<boolean>(true);

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
    default: 'Blueen',
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
    setCurrentTheme(themeName);
    if (user) {
      saveUserDataToCloud(user.uid, { theme: themeName });
    }
    showModal('Evolusi Tema', `UI Fluost telah beradaptasi ke atmosfer artistik: ${themeLabels[themeName] || themeName}.`);
  };

  return (
    <div className="min-h-screen flex flex-col relative pb-52 pt-6 sm:pt-8 lg:pb-12 lg:pt-8 lg:pl-72 transition-colors duration-500 overflow-x-hidden">
      {/* Dynamic Theme Background Canvas & Particle Animations */}
      <ThemeBackground currentTheme={currentTheme} />

      {/* PC Sidebar & Mobile Floating Taskbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentTheme={currentTheme}
        setTheme={handleSetTheme}
        onOpenApiModal={() => setIsApiModalOpen(true)}
        hasApiKey={true}
        user={user}
        onGoogleLogin={handleGoogleLogin}
        onGoogleLogout={handleGoogleLogout}
      />

      {/* Main Content Viewport */}
      <main className="w-full px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto flex-grow relative z-10">
        <ErrorBoundary>
          {activeTab === 'grid' && <EnGrid onShowModal={showModal} />}
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
