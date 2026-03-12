'use client';

import React, { ReactNode, useMemo, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { firebaseConfig } from './config';
import { FirebaseProvider } from './provider';

/**
 * FirebaseClientProvider component
 * 
 * Initializes the Firebase JS SDK on the client side and provides
 * a context for the Auth and Firestore instances.
 * 
 * It also automatically signs in the user anonymously to satisfy
 * Firestore Security Rules requirements.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const { app, firestore, auth } = useMemo(() => {
    // Prevent multiple initializations of the Firebase App
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const auth = getAuth(app);
    return { app, firestore, auth };
  }, []);

  useEffect(() => {
    // Automatically sign in anonymously on mount.
    // This provides a UID to the Firestore Security Rules context.
    signInAnonymously(auth).catch((error) => {
      if (error.code === 'auth/configuration-not-found') {
        console.warn("Firebase Anonymous Auth is not enabled in the Firebase Console. Go to Authentication > Sign-in method to enable it.");
      } else {
        console.error("Firebase Auth Error:", error);
      }
    });
  }, [auth]);

  return (
    <FirebaseProvider app={app} firestore={firestore} auth={auth}>
      {children}
    </FirebaseProvider>
  );
}