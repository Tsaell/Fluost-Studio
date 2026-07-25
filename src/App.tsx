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
import { handleOAuthRedirectHash, fetchGoogleUserProfile, triggerGoogleOAuthFlow, setSavedGoogleAccessToken } from './lib/googleAuth';

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

  // On mount: Check Google OAuth redirect token hash or saved token
  useEffect(() => {
    const { accessToken: token, isPopup } = handleOAuthRedirectHash();
    if (isPopup) return;

    if (token) {
      setAccessToken(token);
      fetchGoogleUserProfile(token)
        .then((profile) => {
          const u = {
            uid: profile.uid,
            displayName: profile.displayName,
            email: profile.email,
            photoURL: profile.photoURL,
          } as User;
          setUser(u);
        })
        .catch((err) => {
          console.warn('Google saved token expired:', err);
          setSavedGoogleAccessToken(null);
        });
    }
  }, []);

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
      const { token, profile } = await triggerGoogleOAuthFlow();
      setAccessToken(token);
      const loggedUser = {
        uid: profile.uid,
        displayName: profile.displayName,
        email: profile.email,
        photoURL: profile.photoURL,
      } as User;
      setUser(loggedUser);
      showModal(
        'Login Google Workspace Berhasil',
        `Selamat datang, ${profile.displayName} (${profile.email})!\n\nAkses Google Calendar, Tasks, dan Drive telah terhubung secara penuh.`
      );
    } catch (err: any) {
      // Fallback try Firebase Sign in
      try {
        const { user: loggedInUser, accessToken: token } = await googleSignIn();
        if (loggedInUser && token && !token.startsWith('mock-')) {
          setUser(loggedInUser);
          setAccessToken(token);
          setSavedGoogleAccessToken(token);
          showModal('Login Google Berhasil', `Selamat datang kembali, ${loggedInUser.displayName || loggedInUser.email}!`);
          return;
        }
      } catch (e) {
        console.warn('Firebase login fallback:', e);
      }

      showModal('Informasi Login Google', err.message || 'Gagal login Google Workspace. Izinkan popup browser untuk melanjutkan.');
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await googleSignOut();
      setSavedGoogleAccessToken(null);
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
