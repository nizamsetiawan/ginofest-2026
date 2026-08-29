// Firebase Configuration for ginofest-2026
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCqYxL4HM-4dBM8cDfNhu8x-vxX3vOCwQY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "ginofest-2026.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "ginofest-2026",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "ginofest-2026.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "19574959170",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:19574959170:web:ca37e18784de2eeb3511db",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-KKJMJ66N8Q",
};

export default firebaseConfig;
