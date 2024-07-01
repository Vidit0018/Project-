import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import {getStorage} from 'firebase/storage';


const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchat-aec82.firebaseapp.com",
  projectId: "reactchat-aec82",
  storageBucket: "reactchat-aec82.appspot.com",
  messagingSenderId: "947608629260",
  appId: "1:947608629260:web:cd04695f12bc9fac703e29",
  measurementId: "G-0B9K7ZT8M1"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();