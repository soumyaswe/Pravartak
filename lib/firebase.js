import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firebase App Hosting provides FIREBASE_WEBAPP_CONFIG automatically
// Parse it if available, otherwise use individual env vars
let firebaseConfig;

if (typeof window !== 'undefined' && window.__FIREBASE_DEFAULTS__) {
  // Use the config injected by Firebase App Hosting
  firebaseConfig = window.__FIREBASE_DEFAULTS__;
} else if (process.env.NEXT_PUBLIC_FIREBASE_WEBAPP_CONFIG) {
  // Parse from NEXT_PUBLIC_FIREBASE_WEBAPP_CONFIG if available
  try {
    firebaseConfig = JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_WEBAPP_CONFIG);
  } catch (e) {
    console.error('Failed to parse FIREBASE_WEBAPP_CONFIG:', e);
    firebaseConfig = null;
  }
} else {
  // Fallback to individual environment variables
  firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'pravartak-15665.firebaseapp.com',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'pravartak-15665',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'pravartak-15665.firebasestorage.app',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '393621785566',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:393621785566:web:44c4f82cb61b6dbe73ab4f'
  };
}

// Only initialize Firebase if we have valid config (runtime check)
let app;
let auth;
let googleProvider;

if (typeof window !== 'undefined' && firebaseConfig && firebaseConfig.apiKey) {
  // Client-side initialization only
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    
    // Configure Google provider
    googleProvider.addScope('profile');
    googleProvider.addScope('email');
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

export { auth, googleProvider };