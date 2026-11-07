// Firebase Client Configuration for ResiSync
// Project: resisync-46166

export const firebaseConfig = {
  apiKey: "AIzaSyBU5c6H4Hj12qu-3Sf1YqbmWdU_JQz70Z8",
  authDomain: "resisync-46166.firebaseapp.com",
  projectId: "resisync-46166",
  storageBucket: "resisync-46166.firebasestorage.app",
  messagingSenderId: "213466114463",
  appId: "1:213466114463:web:a938b580c3c74f329f35aa",
  measurementId: "G-BBV8PBPJG0"
};

// Safe helper to check if Firebase is configured
export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.projectId && firebaseConfig.apiKey);
}

export default firebaseConfig;

