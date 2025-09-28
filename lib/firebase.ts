// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "studio-5450973740-67f46",
  appId: "1:401211074012:web:de084bb5f12e061492db19",
  apiKey: "AIzaSyAkvAAXeFVPXxBv7DaiF0pkU8kcFpWd-kc",
  authDomain: "studio-5450973740-67f46.firebaseapp.com",
  // The databaseURL is essential for Realtime Database to work.
  databaseURL: "https://studio-5450973740-67f46-default-rtdb.firebaseio.com",
};

// Initialize Firebase for server-side use
// A simple initialization is sufficient and safer for server environments.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getDatabase(app);

export { app, db };
