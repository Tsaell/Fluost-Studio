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

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('grid');
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('sky');
  const [customApiKey, setCustomApiKey] = useState<string>('');
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
      setUser(currentUser);
      if (token) {
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

  // On mount: check custom api key in localStorage and verify server health
  useEffect(() => {
    const savedCustomKey = localStorage.getItem('fluost_custom_gemini_api_key');
    if (savedCustomKey) {
      setCustomApiKey(savedCustomKey);
    }

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
      const { user: loggedInUser, accessToken: token } = await googleSignIn();
      setUser(loggedInUser);
      setAccessToken(token);
      showModal(
        'Login Berhasil',
        `Selamat datang kembali, ${loggedInUser.displayName || loggedInUser.email}! Integrasi Google Drive, Calendar, Tasks & Cloud telah aktif.`
      );
    } catch (err: any) {
      const isDomainError = err.message?.includes('belum terdaftar') || err.message?.includes('Authorized Domains');
      const domain = typeof window !== 'undefined' ? window.location.hostname : 'fluost-studio.vercel.app';

      if (isDomainError) {
        showModal(
          'Domain Belum Terdaftar di Firebase',
          `Domain web saat ini (${domain}) belum terdaftar di Firebase Console.\n\n` +
          `Cara cepat mengaktifkannya:\n` +
          `1. Klik tombol "Salin Domain" di bawah ini.\n` +
          `2. Masuk ke Firebase Console -> Authentication -> Settings -> Authorized Domains.\n` +
          `3. Klik "Add domain" lalu tempel (paste) domain ${domain}.\n\n` +
          `Atau Anda dapat tetap menggunakan semua fitur Fluost secara normal dalam Mode Lokal.`,
          {
            autoDismiss: false,
            copyText: domain,
            externalUrl: 'https://console.firebase.google.com/',
          }
        );
      } else {
        showModal('Login Gagal', err.message || 'Gagal melakukan login dengan Google.');
      }
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await googleSignOut();
      setUser(null);
      setAccessToken(null);
      showModal('Logout Berhasil', 'Anda telah keluar dari akun Google.');
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
  };

  const handleSetTheme = (themeName: ThemeMode) => {
    setCurrentTheme(themeName);
    if (user) {
      saveUserDataToCloud(user.uid, { theme: themeName });
    }
    showModal('Evolusi Tema', `UI Fluost telah beradaptasi ke atmosfer artistik: ${themeLabels[themeName] || themeName}.`);
  };

  return (
    <div className="min-h-screen flex flex-col relative pb-12 pt-48 sm:pt-52 lg:pt-8 lg:pl-72 transition-colors duration-500 overflow-x-hidden">
      {/* Dynamic Theme Background Canvas & Particle Animations */}
      <ThemeBackground currentTheme={currentTheme} />

      {/* PC Sidebar & Mobile Floating Taskbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentTheme={currentTheme}
        setTheme={handleSetTheme}
        onOpenApiModal={() => setIsApiModalOpen(true)}
        hasApiKey={hasEnvApiKey || Boolean(customApiKey)}
        user={user}
        onGoogleLogin={handleGoogleLogin}
        onGoogleLogout={handleGoogleLogout}
      />

      {/* Main Content Viewport */}
      <main className="w-full px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto flex-grow relative z-10">
        {activeTab === 'grid' && <EnGrid onShowModal={showModal} />}
        {activeTab === 'music' && <ListenList onShowModal={showModal} customApiKey={customApiKey} />}
        {activeTab === 'ai' && <AiSpark onShowModal={showModal} customApiKey={customApiKey} />}
        {activeTab === 'assistant' && <Visualost onShowModal={showModal} customApiKey={customApiKey} />}
        {activeTab === 'planner' && <Planner onShowModal={showModal} user={user} accessToken={accessToken} />}
      </main>

      {/* App Footer */}
      <footer className="w-full px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto mt-12 text-center text-xs opacity-70 font-semibold relative z-10">
        <p>Fluost Studio &copy; {new Date().getFullYear()} • Instagram Content & Grid Architecture Slicer</p>
      </footer>

      {/* Modals */}
      <ApiSettingsModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        customApiKey={customApiKey}
        setCustomApiKey={setCustomApiKey}
        onShowModal={showModal}
        hasEnvApiKey={hasEnvApiKey}
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
