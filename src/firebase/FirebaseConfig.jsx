// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCX-2KoOgmRVEaXPnoy1zGxS4OBLnPsLAc",
  authDomain: "library-95c1d.firebaseapp.com",
  databaseURL: "https://library-95c1d-default-rtdb.firebaseio.com",
  projectId: "library-95c1d",
  storageBucket: "library-95c1d.firebasestorage.app",
  messagingSenderId: "104133919696",
  appId: "1:104133919696:web:188df1b638ab06963cefd5",
  measurementId: "G-6PZ8T0L3K9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const fireDB = getFirestore(app);
const auth = getAuth(app);

export {fireDB, auth}