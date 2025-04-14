import { useState, useEffect } from 'react';
import { User, getUser, saveUser, clearUser, savePlayerName, removePlayerName } from '../utils/storage';
import { browser } from 'wxt/browser';

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: false,
    error: null
  });

  // Load user data on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUser = await getUser();
        if (savedUser) {
          setAuthState(prev => ({ ...prev, user: savedUser }));
        }
      } catch (err) {
        console.error('Error loading user data:', err);
      }
    };
    
    loadUser();
    
    // Listen for auth state changes from background script
    const handleAuthChange = async (event: any) => {
      if (event.type === 'AUTH_STATE_CHANGED') {
        // Set state
        setAuthState(prev => ({ 
          ...prev, 
          user: event.user,
          isLoading: false,
          error: null
        }));
        
        // Update player name if user is logged in
        if (event.user && event.user.displayName) {
          savePlayerName(event.user.displayName);
        }
        
        // Manually fetch custom token for this context and sign in to Firebase
        if (event.user && event.user.uid) {
          try {
            console.log("Received auth state change, authenticating with Firebase...");
            
            // Exchange UID for a custom token
            const response = await fetch('https://conflictology-web.vercel.app/api/auth/token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ uid: event.user.uid })
            });
            
            if (!response.ok) {
              throw new Error('Failed to get custom token');
            }
            
            const { customToken } = await response.json();
            
            if (!customToken) {
              throw new Error('No custom token received');
            }
            
            // Import auth dynamically to avoid circular dependencies
            const { auth } = await import('../firebase/firebaseClient');
            
            // Sign in with the custom token
            const { signInWithCustomToken } = await import('firebase/auth/web-extension');
            await signInWithCustomToken(auth, customToken);
            console.log("Firebase auth synchronized");
            
          } catch (error) {
            console.error("Failed to sync Firebase auth:", error);
          }
        }
      }
    };
    
    browser.runtime.onMessage.addListener(handleAuthChange);
    
    return () => {
      browser.runtime.onMessage.removeListener(handleAuthChange);
    };
  }, []);
  
  const signIn = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Send a message to the background script to initiate sign-in
      browser.runtime.sendMessage({ action: "signIn" }, (response) => {
        if (browser.runtime.lastError) {
          console.error("Error signing in:", browser.runtime.lastError);
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            error: "Failed to sign in with Google. Please try again."
          }));
        } else if (response.error) {
          console.error("Authentication error:", response.error);
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            error: response.error
          }));
        } else {
          // Authentication successful, handled by the message listener
          console.log("Sign in successful:", response.user);
          // The state will be updated by the message listener
        }
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in with Google';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
    }
  };
  
  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Clear user data from storage
      await clearUser();
      
      // Clear player name from storage
      await removePlayerName();
      
      // Notify background script about logout
      await browser.runtime.sendMessage({ 
        action: "signOut"
      });
      
      // Update state
      setAuthState({
        user: null,
        isLoading: false,
        error: null
      });
      
      // If there's an active Firebase user, sign them out
      try {
        const { auth } = await import('../firebase/firebaseClient');
        const { signOut: firebaseSignOut } = await import('firebase/auth/web-extension');
        await firebaseSignOut(auth);
        console.log("Firebase sign out complete");
      } catch (error) {
        console.error("Error signing out of Firebase:", error);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign out';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
    }
  };
  
  return {
    user: authState.user,
    isLoading: authState.isLoading,
    error: authState.error,
    signIn,
    signOut
  };
}