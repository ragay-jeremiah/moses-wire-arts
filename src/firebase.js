import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAnxnDII5Ih4Vw9DTt5LGEIkYUXN3l1ItA",
    authDomain: "moses-wire-arts.firebaseapp.com",
    projectId: "moses-wire-arts",
    storageBucket: "moses-wire-arts.firebasestorage.app",
    messagingSenderId: "958270404385",
    appId: "1:958270404385:web:a2f25c35fdb16f759ef060",
    measurementId: "G-H8CCZMGDQ7"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);