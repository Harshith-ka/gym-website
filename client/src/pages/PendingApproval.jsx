import React from 'react';
import { Clock, CheckCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function PendingApproval() {
    const { user, logout } = useAuth();

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.iconWrapper}>
                    <Clock size={48} color="#ef4444" />
                </div>
                <h1 style={styles.title}>Registration Pending</h1>
                <p style={styles.text}>
                    Hi <strong>{user?.displayName || 'Gym Owner'}</strong>, your gym registration is currently being reviewed by our Super Admin.
                </p>
                <div style={styles.steps}>
                    <div style={styles.step}>
                        <CheckCircle size={20} color="#10B981" />
                        <span>Registration Submitted</span>
                    </div>
                    <div style={styles.step}>
                        <div style={styles.pulse}></div>
                        <span>Admin Review in Progress</span>
                    </div>
                    <div style={styles.step}>
                        <ShieldCheck size={20} color="#333" />
                        <span style={{ color: '#666' }}>Dashboard Access</span>
                    </div>
                </div>
                <p style={styles.note}>
                    You will receive an email once your gym is approved. Usually, this takes 24-48 hours.
                </p>
                <button onClick={() => logout()} style={styles.btn}>Sign Out</button>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: '#111',
    },
    card: {
        background: '#18181b',
        border: '1px solid #27272a',
        padding: '3rem',
        borderRadius: '1.5rem',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
    },
    iconWrapper: {
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'center',
    },
    title: {
        fontSize: '2rem',
        fontWeight: 700,
        marginBottom: '1rem',
        color: 'white',
    },
    text: {
        color: '#a1a1aa',
        fontSize: '1.1rem',
        lineHeight: 1.6,
        marginBottom: '2rem',
    },
    steps: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        background: '#111',
        padding: '1.5rem',
        borderRadius: '1rem',
        marginBottom: '2rem',
        textAlign: 'left',
    },
    step: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        color: 'white',
        fontSize: '0.95rem',
    },
    pulse: {
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: '#ef4444',
        boxShadow: '0 0 0 rgba(239, 68, 68, 0.4)',
        animation: 'pulse 2s infinite',
    },
    note: {
        color: '#666',
        fontSize: '0.9rem',
        marginBottom: '2rem',
    },
    btn: {
        background: '#333',
        color: 'white',
        border: 'none',
        padding: '0.75rem 2rem',
        borderRadius: '0.75rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
        ':hover': { background: '#444' }
    }
};

// Add pulse animation to global CSS or inline
const styleTag = document.createElement('style');
styleTag.innerHTML = `
@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.7; }
  70% { transform: scale(1); opacity: 0.3; }
  100% { transform: scale(0.95); opacity: 0; }
}
`;
document.head.appendChild(styleTag);
