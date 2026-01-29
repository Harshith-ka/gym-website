import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// We'll use environment variables for safety, but since user provided a client config,
// we'll advise them on how to generate the Service Account JSON.
// For now, we'll implement a robust check.

const getServiceAccount = () => {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    }

    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
        return {
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        };
    }

    return null;
};

const serviceAccount = getServiceAccount();

if (serviceAccount) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase Admin SDK initialized');
    } catch (error) {
        console.error('❌ Firebase Admin SDK initialization error:', error.message);
    }
} else {
    console.warn('⚠️ Firebase Admin SDK not initialized: Missing credentials in environment variables');
}

export default admin;
export const auth = serviceAccount ? admin.auth() : null;
