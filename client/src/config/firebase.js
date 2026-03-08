import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyB9jjZJIpGal8rZOBnXTgVUw9v44ey5i6w",
    authDomain: "gymato-c9660.firebaseapp.com",
    projectId: "gymato-c9660",
    storageBucket: "gymato-c9660.firebasestorage.app",
    messagingSenderId: "78336517175",
    appId: "1:78336517175:web:28ac6af2a08394f3b9cbb2",
    measurementId: "G-Y82GZ5R330"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export default app;
