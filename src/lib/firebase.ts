import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut, 
  User 
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/userinfo.email');
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/calendar');
provider.addScope('https://www.googleapis.com/auth/tasks');
provider.addScope('https://www.googleapis.com/auth/youtube.readonly');

let cachedAccessToken: string | null = null;

export const initAuthListener = (
  onUserChanged: (user: User | null, token: string | null) => void
) => {
  // Check for redirect result first
  getRedirectResult(auth).then((result) => {
    if (result) {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        cachedAccessToken = credential.accessToken;
      }
    }
  }).catch((error) => {
    console.error('Redirect sign-in error:', error);
  });

  return onAuthStateChanged(auth, (user) => {
    if (user) {
      onUserChanged(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      onUserChanged(null, null);
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User | null; accessToken: string; isDemoMode?: boolean }> => {
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken || null;
    if (token) {
      cachedAccessToken = token;
    }
    return { user: result.user, accessToken: token || '', isDemoMode: false };
  } catch (error: any) {
    console.warn('Google Sign-in auth constraint (iframe/domain):', error?.message || error);
    
    // Seamless Fallback to Demo Profile so user can test all Planner & Cloud features in preview
    const mockUser = {
      uid: 'guest-user-fluost',
      displayName: 'Pengguna Google (Mode Preview)',
      email: 'user.demo@fluost.studio',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    } as User;
    
    cachedAccessToken = 'mock-access-token-demo';
    return { user: mockUser, accessToken: cachedAccessToken, isDemoMode: true };
  }
};

export const googleSignOut = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export const getAccessToken = (): string | null => cachedAccessToken;

// Firestore Cloud Persistence Helpers
export const saveUserDataToCloud = async (userId: string, data: Record<string, any>) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.error('Cloud save error:', err);
  }
};

export const loadUserDataFromCloud = async (userId: string) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err) {
    console.error('Cloud load error:', err);
  }
  return null;
};

// Google Calendar Integration
export const createGoogleCalendarEvent = async (
  accessToken: string,
  eventData: { summary: string; description: string; startIso: string; endIso: string }
) => {
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
    const err = await response.json();
    throw new Error(err.error?.message || 'Gagal menambahkan jadwal ke Google Calendar');
  }
  return response.json();
};

// Google Tasks Integration
export const createGoogleTask = async (
  accessToken: string,
  taskData: { title: string; notes?: string; dueIso?: string }
) => {
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
    const err = await response.json();
    throw new Error(err.error?.message || 'Gagal membuat Google Task');
  }
  return response.json();
};

// Google Drive Integration
export const saveFileToGoogleDrive = async (
  accessToken: string,
  fileName: string,
  content: string,
  mimeType: string = 'text/plain'
) => {
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
    const err = await response.json();
    throw new Error(err.error?.message || 'Gagal menyimpan file ke Google Drive');
  }
  return response.json();
};
