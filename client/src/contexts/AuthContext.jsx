import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    auth
} from '../config/firebase';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    signInWithPopup,
    GoogleAuthProvider,
    RecaptchaVerifier,
    signInWithPhoneNumber
} from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const signup = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        return signOut(auth);
    };

    const loginWithGoogle = () => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    };

    const setupRecaptcha = (containerId) => {
        // Clear if already exists to prevent "element has been removed" errors
        if (window.recaptchaVerifier) {
            try {
                window.recaptchaVerifier.clear();
            } catch (e) {
                console.error("Error clearing recaptcha", e);
            }
            window.recaptchaVerifier = null;
        }

        const container = document.getElementById(containerId);
        if (!container) return;

        window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
            'size': 'invisible',
            'callback': (response) => {
                // reCAPTCHA solved, allow signInWithPhoneNumber.
            }
        });
    };

    const sendOtp = async (phoneNumber) => {
        setupRecaptcha('recaptcha-container');

        if (!window.recaptchaVerifier) {
            throw new Error("Recaptcha container not found");
        }

        return signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
    };

    const value = {
        user,
        loading,
        login,
        signup,
        logout,
        loginWithGoogle,
        sendOtp
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
