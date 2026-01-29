import React from 'react';
import { X, Sparkles } from 'lucide-react';
import AuthForm from './AuthForm';

export default function AuthModal({ isOpen, onClose, onSuccess }) {
    if (!isOpen) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <button onClick={onClose} style={styles.closeBtn}>
                    <X size={24} />
                </button>

                <div style={styles.header}>
                    <div style={styles.logoBox}>
                        <Sparkles size={24} color="white" />
                    </div>
                    <h2 style={styles.title}>Welcome Back</h2>
                    <p style={styles.subtitle}>Login to proceed with your booking</p>
                </div>

                <AuthForm onSuccess={() => {
                    onSuccess();
                    onClose();
                }} inModal={true} />
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
    },
    modal: {
        width: '100%',
        maxWidth: '450px',
        background: '#1a1a1a',
        borderRadius: '28px',
        padding: '2.5rem',
        position: 'relative',
        border: '1px solid #333',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
    },
    closeBtn: {
        position: 'absolute',
        top: '1.5rem',
        right: '1.5rem',
        background: '#222',
        border: 'none',
        color: '#888',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
        zIndex: 10
    },
    header: {
        textAlign: 'center',
        marginBottom: '1.5rem'
    },
    logoBox: {
        width: '48px',
        height: '48px',
        background: 'var(--primary)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1rem'
    },
    title: {
        fontSize: '1.75rem',
        fontWeight: 700,
        color: 'white',
        marginBottom: '0.5rem'
    },
    subtitle: {
        fontSize: '0.9rem',
        color: '#888'
    }
};
