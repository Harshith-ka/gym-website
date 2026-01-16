import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ShieldCheck, MapPin, User, Activity } from 'lucide-react';
import api from '../services/api';

export default function VerifyBooking() {
    const { token } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBooking();
    }, [token]);

    const fetchBooking = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/bookings/public/${token}`);
            setBooking(response.data.booking);
        } catch (err) {
            console.error('Verification error:', err);
            setError(err.response?.data?.error || 'Invalid or expired QR code');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div style={styles.center}>
            <div className="spinner"></div>
            <p style={{ marginTop: '1rem', color: '#888' }}>Verifying entry pass...</p>
        </div>
    );

    if (error) return (
        <div style={styles.container}>
            <div style={styles.card}>
                <XCircle size={64} color="#EF4444" style={{ marginBottom: '1.5rem' }} />
                <h1 style={{ ...styles.title, color: '#EF4444' }}>Verification Failed</h1>
                <p style={styles.errorText}>{error}</p>
                <div style={styles.divider} />
                <p style={styles.hint}>Please ask the user to provide their 6-digit manual code or check their booking status.</p>
                <Link to="/" style={styles.homeBtn}>Back to Home</Link>
            </div>
        </div>
    );

    const isUsed = booking.status === 'used';
    const isCancelled = booking.status === 'cancelled';
    const isReady = booking.status === 'confirmed';

    return (
        <div style={styles.container}>
            <div style={{ ...styles.card, borderTop: `8px solid ${isReady ? '#34D399' : '#EF4444'}` }}>
                {isReady ? (
                    <CheckCircle size={64} color="#34D399" style={{ marginBottom: '1.5rem' }} />
                ) : (
                    <XCircle size={64} color="#EF4444" style={{ marginBottom: '1.5rem' }} />
                )}

                <h1 style={styles.title}>
                    {isReady ? 'Valid Booking' : isUsed ? 'Already Used' : 'Invalid Status'}
                </h1>

                <div style={styles.statusPill(isReady)}>
                    {booking.status.toUpperCase()}
                </div>

                <div style={styles.details}>
                    <div style={styles.detailItem}>
                        <User size={18} color="#888" />
                        <div>
                            <span style={styles.label}>Customer</span>
                            <span style={styles.value}>{booking.user_name}</span>
                        </div>
                    </div>

                    <div style={styles.detailItem}>
                        <MapPin size={18} color="#888" />
                        <div>
                            <span style={styles.label}>Gym</span>
                            <span style={styles.value}>{booking.gym_name}</span>
                        </div>
                    </div>

                    <div style={styles.detailItem}>
                        <Activity size={18} color="#888" />
                        <div>
                            <span style={styles.label}>Service</span>
                            <span style={styles.value}>{booking.service_name}</span>
                        </div>
                    </div>

                    <div style={styles.detailItem}>
                        <Clock size={18} color="#888" />
                        <div>
                            <span style={styles.label}>Scheduled For</span>
                            <span style={styles.value}>
                                {new Date(booking.booking_date).toLocaleDateString()}
                                {booking.start_time && ` at ${booking.start_time.slice(0, 5)}`}
                            </span>
                        </div>
                    </div>
                </div>

                <div style={styles.footer}>
                    <ShieldCheck size={16} />
                    <span>Official Verification Page</span>
                </div>
            </div>

            <p style={styles.notice}>
                Staff: Please verify the details above match the customer.
                Manual completion must be done from the Gym Dashboard.
            </p>
        </div>
    );
}

const styles = {
    center: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#fff' },
    container: { minHeight: '100vh', background: '#0a0a0a', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
    card: { background: '#111', borderRadius: '24px', padding: '2.5rem', width: '100%', maxWidth: '450px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', textAlign: 'center', border: '1px solid #222' },
    title: { fontSize: '2rem', fontWeight: 800, margin: '0 0 1rem 0', letterSpacing: '-0.5px', color: '#fff' },
    statusPill: (active) => ({ display: 'inline-block', padding: '6px 16px', borderRadius: '99px', background: active ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: active ? '#34D399' : '#EF4444', fontWeight: 700, fontSize: '0.9rem', marginBottom: '2rem', border: `1px solid ${active ? '#34D39940' : '#EF444440'}` }),
    details: { textAlign: 'left', background: '#1a1a1a', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' },
    detailItem: { display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.25rem' },
    label: { display: 'block', fontSize: '0.75rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' },
    value: { display: 'block', fontSize: '1.1rem', color: '#fff', fontWeight: 600 },
    errorText: { color: '#ccc', marginBottom: '1.5rem', lineHeight: 1.6 },
    divider: { height: '1px', background: '#222', margin: '1.5rem 0' },
    hint: { color: '#666', fontSize: '0.85rem', marginBottom: '2rem' },
    homeBtn: { display: 'inline-block', padding: '0.75rem 2rem', background: '#fff', color: '#000', borderRadius: '12px', textDecoration: 'none', fontWeight: 700 },
    footer: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#444', fontSize: '0.85rem' },
    notice: { marginTop: '2rem', color: '#666', fontSize: '0.85rem', textAlign: 'center', maxWidth: '350px', lineHeight: 1.5 }
};
