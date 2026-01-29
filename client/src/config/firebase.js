import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyCWbMn0rcb1oUyseHTrzG6Qp1lxTGgC1B0",
    authDomain: "gym-website-01.firebaseapp.com",
    projectId: "gym-website-01",
    storageBucket: "gym-website-01.firebasestorage.app",
    messagingSenderId: "798530599900",
    appId: "1:798530599900:web:4e2b79d1dce23378956d19",
    measurementId: "G-PCLQTKN93Y"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
