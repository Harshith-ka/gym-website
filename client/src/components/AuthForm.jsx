import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Phone, ArrowRight, Chrome as Google, Sparkles } from 'lucide-react';

export default function AuthForm({ onSuccess, inModal = false }) {
    const [isLogin, setIsLogin] = useState(true);
    const [authMethod, setAuthMethod] = useState('email'); // 'email' or 'phone'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, signup, loginWithGoogle, sendOtp } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (authMethod === 'email') {
                if (isLogin) {
                    await login(email, password);
                } else {
                    await signup(email, password);
                }
                if (onSuccess) onSuccess();
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await sendOtp(phoneNumber);
            setConfirmationResult(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await confirmationResult.confirm(otp);
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{ ...styles.card, ...(inModal ? styles.modalCard : {}) }}>
            {!inModal && (
                <div style={styles.header}>
                    <div style={styles.logoBox}>
                        <Sparkles size={24} color="white" />
                    </div>
                    <h2 style={styles.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p style={styles.subtitle}>
                        {isLogin ? 'Login to your Purpul Hue account' : 'Join the Purpul Hue community today'}
                    </p>
                </div>
            )}

            <div style={styles.methodTabs}>
                <button
                    onClick={() => { setAuthMethod('email'); setError(''); }}
                    style={{ ...styles.methodTab, ...(authMethod === 'email' ? styles.methodTabActive : {}) }}
                >
                    Email
                </button>
                <button
                    onClick={() => { setAuthMethod('phone'); setError(''); }}
                    style={{ ...styles.methodTab, ...(authMethod === 'phone' ? styles.methodTabActive : {}) }}
                >
                    Phone
                </button>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            {authMethod === 'email' ? (
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email Address</label>
                        <div style={styles.inputWrapper}>
                            <Mail size={18} style={styles.icon} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                style={styles.input}
                                required
                            />
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <div style={styles.inputWrapper}>
                            <Lock size={18} style={styles.icon} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={styles.input}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} style={styles.submitBtn}>
                        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
                        <ArrowRight size={18} />
                    </button>
                </form>
            ) : (
                <div style={styles.form}>
                    {!confirmationResult ? (
                        <form onSubmit={handleSendOtp} style={styles.form}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Phone Number</label>
                                <div style={styles.inputWrapper}>
                                    <Phone size={18} style={styles.icon} />
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="+91 9876543210"
                                        style={styles.input}
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} style={styles.submitBtn}>
                                {loading ? 'Sending...' : 'Send OTP'}
                                <ArrowRight size={18} />
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} style={styles.form}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Enter OTP</label>
                                <div style={styles.inputWrapper}>
                                    <Lock size={18} style={styles.icon} />
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="123456"
                                        style={styles.input}
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} style={styles.submitBtn}>
                                {loading ? 'Verifying...' : 'Verify OTP'}
                                <ArrowRight size={18} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setConfirmationResult(null)}
                                style={styles.resendBtn}
                            >
                                Change Phone Number
                            </button>
                        </form>
                    )}
                </div>
            )}

            <div id="recaptcha-container"></div>

            <div style={styles.divider}>
                <span style={styles.dividerText}>OR</span>
            </div>

            <button onClick={handleGoogleLogin} style={styles.googleBtn}>
                <Google size={18} />
                Continue with Google
            </button>

            <p style={styles.toggle}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button onClick={() => setIsLogin(!isLogin)} style={styles.toggleBtn}>
                    {isLogin ? 'Sign Up' : 'Login'}
                </button>
            </p>
        </div>
    );
}

const styles = {
    card: {
        width: '100%',
        maxWidth: '400px',
        padding: '2.5rem',
        background: '#1a1a1a',
        borderRadius: '24px',
        border: '1px solid #333',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
    },
    modalCard: {
        padding: '1rem 0 0 0',
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        maxWidth: '100%'
    },
    header: {
        textAlign: 'center',
        marginBottom: '2rem'
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
    },
    error: {
        padding: '0.75rem',
        background: 'rgba(255, 0, 0, 0.1)',
        border: '1px solid rgba(255, 0, 0, 0.2)',
        borderRadius: '12px',
        color: '#ff4d4d',
        fontSize: '0.85rem',
        marginBottom: '1.5rem',
        textAlign: 'center'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    label: {
        fontSize: '0.85rem',
        fontWeight: 600,
        color: '#aaa',
        marginLeft: '4px'
    },
    inputWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
    },
    icon: {
        position: 'absolute',
        left: '1rem',
        color: '#555'
    },
    input: {
        width: '100%',
        padding: '0.75rem 1rem 0.75rem 2.75rem',
        background: '#222',
        border: '1px solid #333',
        borderRadius: '12px',
        color: 'white',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'border-color 0.2s'
    },
    submitBtn: {
        marginTop: '0.5rem',
        padding: '0.85rem',
        background: 'white',
        color: 'black',
        border: 'none',
        borderRadius: '12px',
        fontWeight: 700,
        fontSize: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        transition: 'transform 0.2s'
    },
    divider: {
        margin: '1.5rem 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
    },
    dividerText: {
        background: '#1a1a1a',
        padding: '0 1rem',
        color: '#444',
        fontSize: '0.75rem',
        fontWeight: 700,
        zIndex: 1
    },
    googleBtn: {
        width: '100%',
        padding: '0.75rem',
        background: 'transparent',
        border: '1px solid #333',
        borderRadius: '12px',
        color: 'white',
        fontSize: '0.95rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        cursor: 'pointer',
        marginBottom: '1.5rem'
    },
    toggle: {
        textAlign: 'center',
        fontSize: '0.9rem',
        color: '#888'
    },
    toggleBtn: {
        background: 'none',
        border: 'none',
        color: 'white',
        fontWeight: 700,
        cursor: 'pointer',
        padding: 0
    },
    methodTabs: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        padding: '4px',
        background: '#111',
        borderRadius: '12px',
        border: '1px solid #333'
    },
    methodTab: {
        flex: 1,
        padding: '0.6rem',
        border: 'none',
        background: 'transparent',
        color: '#888',
        fontSize: '0.9rem',
        fontWeight: 600,
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    methodTabActive: {
        background: '#222',
        color: 'white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
    },
    resendBtn: {
        background: 'none',
        border: 'none',
        color: '#888',
        fontSize: '0.85rem',
        marginTop: '0.5rem',
        cursor: 'pointer',
        textDecoration: 'underline'
    }
};
