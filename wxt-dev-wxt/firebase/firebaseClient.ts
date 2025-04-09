import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAnHyYS-zdzfiTe97jJDfEaf1HxqmvLzmc",
  authDomain: "conflictology-conflict.firebaseapp.com",
  projectId: "conflictology-conflict",
  storageBucket: "conflictology-conflict.appspot.com",
  messagingSenderId: "205495071119",
  appId: "1:205495071119:web:c9077530939d71160c1bfa"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const db = getFirestore(app);

// Function to authenticate with Firebase using a custom token
export async function authenticateWithFirebase(uid: string): Promise<User | null> {
  try {
    // You would need to have a backend service that generates a custom token
    // For this example, we're assuming you have an endpoint that returns a token
    // based on the Google OAuth user ID
    const response = await fetch('https://your-backend-service.com/generateCustomToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uid }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate custom token');
    }
    
    const { token } = await response.json();
    
    // Sign in with the custom token
    const userCredential = await signInWithCustomToken(auth, token);
    return userCredential.user;
  } catch (error) {
    console.error('Error authenticating with Firebase:', error);
    return null;
  }
}

// Function to sign out
export async function signOut(): Promise<void> {
  return auth.signOut();
}

// Function to get the current user
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

// Export auth for direct access if needed
export { auth };