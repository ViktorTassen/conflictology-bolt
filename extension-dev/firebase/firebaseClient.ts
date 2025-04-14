
import { getApps, initializeApp } from "firebase/app"
import { getAuth, signInWithCustomToken, setPersistence, indexedDBLocalPersistence, User } from "firebase/auth/web-extension"
import { getFirestore } from "firebase/firestore"
import { getDatabase } from "firebase/database"
import { browser } from 'wxt/browser'

export const clientCredentials = {
  apiKey: "AIzaSyAnHyYS-zdzfiTe97jJDfEaf1HxqmvLzmc",
  authDomain: "conflictology-conflict.firebaseapp.com",
  projectId: "conflictology-conflict",
  storageBucket: "conflictology-conflict.appspot.com",
  messagingSenderId: "205495071119",
  appId: "1:205495071119:web:c9077530939d71160c1bfa",
  databaseURL: "https://conflictology-conflict-default-rtdb.firebaseio.com",
}

let firebase_app = getApps().length ? getApps()[0] : initializeApp(clientCredentials)

export const auth = getAuth(firebase_app)
export const db = getFirestore(firebase_app)
export const rtdb = getDatabase(firebase_app)

setPersistence(auth, indexedDBLocalPersistence)

// Initialize auth state from localStorage when the module is loaded
browser.storage.local.get('user').then(({ user }) => {
  if (user && user.uid) {
    console.log("Found user in local storage, authenticating with Firebase...");
    authenticateWithFirebase(user.uid)
      .then(() => console.log("Successfully initialized Firebase auth from storage"))
      .catch(err => console.error("Failed to initialize Firebase auth from storage:", err));
  } else {
    console.log("No user found in local storage");
  }
});

// Function to authenticate with Firebase using custom token
export const authenticateWithFirebase = async (uid: string) => {
  try {
    console.log("Authenticating with Firebase using UID:", uid);
    
    // Exchange UID for a custom token
    console.log("Fetching custom token from API...");
    const response = await fetch('https://conflictology-web.vercel.app/api/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // no cors co-cors
      },
      body: JSON.stringify({ uid })
    });

    console.log("API response status:", response.status);
    
    if (!response.ok) {
      const error = await response.json();
      console.error("API error response:", error);
      throw new Error(error.error || 'Failed to get custom token');
    }

    const responseData = await response.json();
    console.log("API response data:", responseData);
    
    const { customToken } = responseData;
    console.log("Custom token received:", customToken ? customToken.substring(0, 10) + "..." : "None");
    
    if (!customToken) {
      throw new Error('No custom token received');
    }
    
    // Sign in with the custom token
    console.log("Signing in with custom token...");
    const result = await signInWithCustomToken(auth, customToken);
    console.log("Sign in successful, user:", result.user?.uid);
    
    // Additional verification
    const currentUser = auth.currentUser;
    console.log("Current Firebase user after authentication:", currentUser?.uid);
    
    return result;
  } catch (error) {
    console.error("Authentication error:", error);
    throw error;
  }
}

export default firebase_app


// Function to sign out
export async function signOut(): Promise<void> {
  return auth.signOut();
}

// Function to get the current user
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

