// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBiCClpM0o_hYBh2Z4LH7ai_FIQiyznOSs",
  authDomain: "bla-bla-b4bd5.firebaseapp.com",
  projectId: "bla-bla-b4bd5",
  storageBucket: "bla-bla-b4bd5.firebasestorage.app",
  messagingSenderId: "188179474554",
  appId: "1:188179474554:web:5b1a935bf04320252573c3",
  measurementId: "G-HGJHB5JS8K"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // if already initialized, use that one
}

const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db, analytics };