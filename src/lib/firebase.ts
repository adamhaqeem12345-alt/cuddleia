
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "studio-5450973740-67f46",
  "appId": "1:401211074012:web:de084bb5f12e061492db19",
  "apiKey": "AIzaSyAkvAAXeFVPXxBv7DaiF0pkU8kcFpWd-kc",
  "authDomain": "studio-5450973740-67f46.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "401211074012"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
