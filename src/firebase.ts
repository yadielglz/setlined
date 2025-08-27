import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCa5eIDv1qjNApgI_uhk8sauc7g9ZJDZq0",
  authDomain: "setlined.firebaseapp.com",
  projectId: "setlined",
  storageBucket: "setlined.firebasestorage.app",
  messagingSenderId: "330776245427",
  appId: "1:330776245427:web:4cac01f7525c7a97b5ecc6",
  measurementId: "G-TP8R1LSRBT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;