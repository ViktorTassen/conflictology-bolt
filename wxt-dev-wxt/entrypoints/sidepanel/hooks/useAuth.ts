import { useState, useEffect } from 'react';
import { User, getUser, saveUser, clearUser, savePlayerName } from '../utils/storage';

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
    const handleAuthChange = (event: any) => {
      if (event.type === 'AUTH_STATE_CHANGED') {
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
      
      // Update state
      setAuthState({
        user: null,
        isLoading: false,
        error: null
      });
      
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