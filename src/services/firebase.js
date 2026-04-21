import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Replace with your actual Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyBIPSMWU5hyuK97_rz6-3EEerZwbqmFsYE",
    authDomain: "housekeeping-sytem.firebaseapp.com",
    projectId: "housekeeping-sytem",
    storageBucket: "housekeeping-sytem.firebasestorage.app",
    messagingSenderId: "85757089580",
    appId: "1:85757089580:web:7e79a16672f3e25fe13e89",
    measurementId: "G-45G6B6BBL6"
};

const app = initializeApp(firebaseConfig);
export { app, firebaseConfig };
export const db = getFirestore(app);
export const auth = getAuth(app);
