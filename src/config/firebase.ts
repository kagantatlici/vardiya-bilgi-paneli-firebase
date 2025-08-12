import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDOWuhIL2Wez2Ae18R6wFiYrDu5r22qGrA",
  authDomain: "istanbul-bogazi-pilot-panel.firebaseapp.com",
  projectId: "istanbul-bogazi-pilot-panel",
  storageBucket: "istanbul-bogazi-pilot-panel.firebasestorage.app",
  messagingSenderId: "1097470522641",
  appId: "1:1097470522641:web:8c47d11a1e8f0e3a7b5f2e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;