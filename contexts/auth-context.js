"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check/create user in database via API
        try {
          console.log('Creating/checking user for:', firebaseUser.uid);
          
          const response = await fetch('/api/user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ firebaseUser }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${errorData.error || 'Unknown error'}`);
          }

          const { user } = await response.json();
          console.log('User created/found:', user.id);
          
          setUser(firebaseUser);
          
          // Get Firebase ID token and set it as a cookie for server actions
          const idToken = await firebaseUser.getIdToken();
          console.log("Setting firebase-token cookie, token length:", idToken.length);
          
          // Set cookies with proper configuration
          const cookieOptions = `path=/; max-age=${60 * 60}; SameSite=Lax; Secure`;
          document.cookie = `firebase-token=${encodeURIComponent(idToken)}; ${cookieOptions}`;
          
          // Also set user data cookie
          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL
          };
          console.log("Setting firebase-user cookie for user:", userData.uid);
          document.cookie = `firebase-user=${encodeURIComponent(JSON.stringify(userData))}; ${cookieOptions}`;
          
          // Verify cookies were set
          const cookies = document.cookie;
          console.log("Cookies after setting:", {
            hasFirebaseUser: cookies.includes('firebase-user'),
            hasFirebaseToken: cookies.includes('firebase-token'),
            allCookies: cookies
          });
        } catch (error) {
          console.error('Error checking user:', error);
          setUser(firebaseUser); // Still set user even if database check fails
        }
      } else {
        setUser(null);
        // Remove cookies when user signs out
        document.cookie = 'firebase-user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        document.cookie = 'firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      }
      setLoading(false);
    });

    // Check for redirect result on app load
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          console.log('Redirect sign-in successful:', result.user.uid);
          // The onAuthStateChanged will handle the rest
        }
      } catch (error) {
        console.error('Redirect result error:', error);
        setLoading(false);
      }
    };

    checkRedirectResult();

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      // First try popup method
      const result = await signInWithPopup(auth, googleProvider);
      
      // Check if there's a stored redirect path
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterLogin');
        window.location.href = redirectPath;
      }
      
      return result.user;
    } catch (error) {
      console.error('Popup sign-in failed:', error);
      
      // If popup was blocked, try redirect method
      if (error.code === 'auth/popup-blocked') {
        console.log('Popup blocked, trying redirect method...');
        try {
          // Store current path for redirect after sign-in
          const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
          sessionStorage.setItem('redirectAfterLogin', redirectPath);
          
          await signInWithRedirect(auth, googleProvider);
          // The redirect will handle the rest, so we don't return anything here
        } catch (redirectError) {
          console.error('Redirect sign-in also failed:', redirectError);
          throw redirectError;
        }
      } else {
        throw error;
      }
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if there's a stored redirect path
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterLogin');
        window.location.href = redirectPath;
      }
      
      return result.user;
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email, password, name) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name
      if (name && result.user) {
        await updateProfile(result.user, {
          displayName: name
        });
      }
      
      return result.user;
    } catch (error) {
      console.error('Error signing up with email:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};