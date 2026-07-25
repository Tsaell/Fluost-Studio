// Google OAuth 2.0 & Google Workspace (Calendar, Tasks, Drive) Helper
const OAUTH_CLIENT_ID = '174536429048-p18gg9bb5s9lgls1qf3lludemac1psp8.apps.googleusercontent.com';

const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/drive.file',
].join(' ');

export interface GoogleUserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
}

// Get saved token from localStorage
export function getSavedGoogleAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('fluost_google_access_token');
}

// Save token to localStorage
export function setSavedGoogleAccessToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('fluost_google_access_token', token);
  } else {
    localStorage.removeItem('fluost_google_access_token');
  }
}

// Check and handle hash redirect on app load or inside popup window
export function handleOAuthRedirectHash(): { accessToken: string | null; isPopup: boolean } {
  if (typeof window === 'undefined') return { accessToken: null, isPopup: false };

  const hash = window.location.hash;
  if (hash && hash.includes('access_token=')) {
    const params = new URLSearchParams(hash.replace('#', '?'));
    const token = params.get('access_token');
    if (token) {
      setSavedGoogleAccessToken(token);

      // If opened inside a popup window, send postMessage to parent and close popup
      if (window.opener && !window.opener.closed) {
        try {
          window.opener.postMessage({ type: 'FLUOST_GOOGLE_OAUTH_SUCCESS', token }, '*');
        } catch (e) {
          console.warn('postMessage to opener failed:', e);
        }
        window.close();
        return { accessToken: token, isPopup: true };
      }

      // Clean URL hash
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      return { accessToken: token, isPopup: false };
    }
  }
  return { accessToken: getSavedGoogleAccessToken(), isPopup: false };
}

// Fetch Google User Profile using Access Token
export async function fetchGoogleUserProfile(accessToken: string): Promise<GoogleUserProfile> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error('Access Token Google telah kadaluarsa atau tidak valid.');
  }
  const data = await res.json();
  return {
    uid: data.sub || 'google-user-' + Date.now(),
    displayName: data.name || data.given_name || 'Pengguna Google',
    email: data.email || '',
    photoURL: data.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  };
}

// Get Google Authorization URL
export function getGoogleOAuthUrl(): string {
  const redirectUri = window.location.origin;
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${OAUTH_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=token&scope=${encodeURIComponent(SCOPES)}&prompt=consent`;
}

// Initiate Google OAuth 2.0 authorization popup or direct redirect
export function triggerGoogleOAuthFlow(): Promise<{ token: string; profile: GoogleUserProfile }> {
  return new Promise((resolve, reject) => {
    const authUrl = getGoogleOAuthUrl();
    const width = 520;
    const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      authUrl,
      'FluostGoogleOAuth',
      `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`
    );

    const handleMessage = async (event: MessageEvent) => {
      if (event.data && event.data.type === 'FLUOST_GOOGLE_OAUTH_SUCCESS' && event.data.token) {
        window.removeEventListener('message', handleMessage);
        const token = event.data.token;
        setSavedGoogleAccessToken(token);
        try {
          const profile = await fetchGoogleUserProfile(token);
          resolve({ token, profile });
        } catch (err: any) {
          reject(err);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    if (!popup) {
      window.location.href = authUrl;
      return;
    }

    const interval = setInterval(async () => {
      const storedToken = getSavedGoogleAccessToken();
      if (popup.closed) {
        clearInterval(interval);
        window.removeEventListener('message', handleMessage);
        if (storedToken) {
          try {
            const profile = await fetchGoogleUserProfile(storedToken);
            resolve({ token: storedToken, profile });
          } catch (err) {
            reject(new Error('Sesi Google kadaluarsa. Silakan login ulang.'));
          }
        } else {
          reject(new Error('Login Google dibatalkan atau jendela popup ditutup.'));
        }
      }
    }, 1000);
  });
}

// Google Calendar Integration
export async function createGoogleCalendarEvent(
  accessToken: string,
  eventData: { summary: string; description: string; startIso: string; endIso: string }
) {
  if (!accessToken || accessToken.startsWith('mock-')) {
    throw new Error('NO_TOKEN');
  }

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary: eventData.summary,
      description: eventData.description,
      start: { dateTime: eventData.startIso },
      end: { dateTime: eventData.endIso },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gagal menambahkan jadwal ke Google Calendar (Status ${response.status})`);
  }
  return response.json();
}

// Google Tasks Integration
export async function createGoogleTask(
  accessToken: string,
  taskData: { title: string; notes?: string; dueIso?: string }
) {
  if (!accessToken || accessToken.startsWith('mock-')) {
    throw new Error('NO_TOKEN');
  }

  const response = await fetch('https://www.googleapis.com/tasks/v1/lists/@default/tasks', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: taskData.title,
      notes: taskData.notes || '',
      due: taskData.dueIso || undefined,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gagal membuat Google Task (Status ${response.status})`);
  }
  return response.json();
}

// Google Drive Integration
export async function saveFileToGoogleDrive(
  accessToken: string,
  fileName: string,
  content: string,
  mimeType: string = 'text/plain'
) {
  if (!accessToken || accessToken.startsWith('mock-')) {
    throw new Error('NO_TOKEN');
  }

  const metadata = {
    name: fileName,
    mimeType: mimeType,
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([content], { type: mimeType }));

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gagal menyimpan file ke Google Drive (Status ${response.status})`);
  }
  return response.json();
}
