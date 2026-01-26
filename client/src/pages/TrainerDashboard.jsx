import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { BarChart3, Calendar, CheckCircle, Star, Sparkles, User } from 'lucide-react';
import api from '../services/api';

export default function TrainerDashboard() {
    const { getToken } = useAuth();
    const { user } = useUser();
    const [trainer, setTrainer] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchTrainerData();
    }, []);

    const fetchTrainerData = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const response = await api.get('/trainers/me', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setTrainer(response.data.trainer);
            setBookings(response.data.bookings || []);

        } catch (error) {
            console.error('Error fetching trainer data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGoPremium = async (months) => {
        try {
            const token = await getToken();
            const orderRes = await api.post('/monetization/trainer-premium/order', {
                trainerId: trainer.id,
                months: months
            }, { headers: { Authorization: `Bearer ${token}` } });

            const { orderId, amount, keyId } = orderRes.data;

            const options = {
                key: keyId,
                amount: amount,
                currency: "INR",
                name: "Gym Booking Platform",
                description: `Trainer Premium - ${months} Months`,
                order_id: orderId,
                handler: async function (response) {
                    try {
                        await api.post('/monetization/trainer-premium/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            trainerId: trainer.id,
                            months: months
                        }, { headers: { Authorization: `Bearer ${token}` } });

                        alert("Welcome to Premium! 🌟");
                        fetchTrainerData();
                    } catch (err) {
                        console.error(err);
                        const errorMsg = err.response?.data?.error || "Verification failed";
                        alert(`${errorMsg}\n\nNote: If you are using an international card, please ensure "International Payments" is enabled in your Razorpay dashboard.`);
                    }
                },
                prefill: {
                    ...(user?.fullName || user?.firstName ? { name: user.fullName || user.firstName } : {}),
                    ...(user?.primaryEmailAddress?.emailAddress ? { email: user.primaryEmailAddress.emailAddress } : {}),
                    ...(user?.primaryPhoneNumber?.phoneNumber ? { contact: user.primaryPhoneNumber.phoneNumber } : {})
                },
                theme: { color: "#ffffff" },
                retry: {
                    enabled: true,
                    max_count: 3
                },
                config: {
                    display: {
                        blocks: {
                            banks: {
                                name: 'UPI and Cards',
                                instruments: [
                                    {
                                        method: 'upi'
                                    },
                                    {
                                        method: 'card'
                                    }
                                ]
                            }
                        },
                        sequence: ['block.banks'],
                        preferences: {
                            show_default_blocks: true
                        }
                    }
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error('Premium error:', error);
            alert("Failed to initiate premium purchase");
        }
    };

    if (loading) return <div style={styles.loading}><div className="spinner" /></div>;
    if (!trainer) return <div style={styles.container}><div className="container">Trainer profile not found. Please contact admin.</div></div>;

    return (
        <div style={styles.container}>
            <div className="container">
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.title}>Trainer Dashboard</h1>
                        <p style={styles.subtitle}>Welcome back, {trainer.name}!</p>
                    </div>
                    {trainer.is_premium && (
                        <div style={styles.premiumBadge}>
                            <Sparkles size={16} fill="black" /> PREMIUM TRAINER
                        </div>
                    )}
                </div>

                <div className="grid grid-3" style={{ marginBottom: '3rem' }}>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}><Star size={24} color="#eab308" /></div>
                        <div>
                            <div style={styles.statLabel}>Rating</div>
                            <div style={styles.statValue}>{trainer.rating || 0} <span style={{ fontSize: '0.9rem', color: '#666' }}>({trainer.total_reviews})</span></div>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}><Calendar size={24} color="#3b82f6" /></div>
                        <div>
                            <div style={styles.statLabel}>Upcoming Sessions</div>
                            <div style={styles.statValue}>{bookings.length}</div>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}><User size={24} color="#10b981" /></div>
                        <div>
                            <div style={styles.statLabel}>Status</div>
                            <div style={styles.statValue}>{trainer.is_active ? 'Active' : 'Inactive'}</div>
                        </div>
                    </div>
                </div>

                {!trainer.is_premium && (
                    <div style={styles.promoCard}>
                        <div style={styles.promoContent}>
                            <h2>Upgrade to Premium 🌟</h2>
                            <p>Get featured in search results, stand out with a premium badge, and attract more clients.</p>
                            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                                <button onClick={() => handleGoPremium(1)} style={styles.primaryBtn}>
                                    1 Month (₹299)
                                </button>
                                <button onClick={() => handleGoPremium(6)} style={{ ...styles.primaryBtn, background: '#eab308', color: 'black' }}>
                                    6 Months (₹1499)
                                </button>
                            </div>
                        </div>
                        <div style={styles.promoImage}>
                            <Sparkles size={100} color="#eab308" style={{ opacity: 0.2 }} />
                        </div>
                    </div>
                )}

                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>My Bookings</h2>
                    {bookings.length === 0 ? (
                        <div style={styles.empty}>No upcoming bookings.</div>
                    ) : (
                        <div style={styles.list}>
                            {bookings.map(b => (
                                <div key={b.id} style={styles.listItem}>
                                    <div>
                                        <div style={styles.itemTitle}>{new Date(b.booking_date).toLocaleDateString()} @ {b.start_time?.slice(0, 5)}</div>
                                        <div style={styles.itemSubtitle}>Client: {b.user_name}</div>
                                    </div>
                                    <div style={styles.status}>{b.status}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        background: '#111',
        minHeight: '100vh',
        padding: '3rem 0',
        color: 'white',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'start',
        marginBottom: '3rem',
        borderBottom: '1px solid #222',
        paddingBottom: '2rem',
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: 700,
        marginBottom: '0.5rem',
    },
    subtitle: {
        color: '#a1a1aa',
        fontSize: '1.1rem',
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        padding: '4rem',
        background: '#111',
        minHeight: '100vh',
    },
    statCard: {
        background: '#1a1a1a',
        padding: '1.5rem',
        borderRadius: '1rem',
        border: '1px solid #333',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    statIcon: {
        width: '48px',
        height: '48px',
        borderRadius: '0.75rem',
        background: '#111',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #333',
    },
    statLabel: {
        color: '#a1a1aa',
        fontSize: '0.875rem',
    },
    statValue: {
        fontSize: '1.5rem',
        fontWeight: 700,
    },
    premiumBadge: {
        background: '#eab308',
        color: 'black',
        padding: '0.5rem 1rem',
        borderRadius: '999px',
        fontWeight: 800,
        fontSize: '0.875rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    promoCard: {
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
        border: '1px solid #333',
        borderRadius: '1rem',
        padding: '3rem',
        marginBottom: '3rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
    },
    promoContent: {
        zIndex: 1,
        maxWidth: '600px',
    },
    promoImage: {
        position: 'absolute',
        right: '2rem',
        top: '50%',
        transform: 'translateY(-50%)',
    },
    primaryBtn: {
        background: 'white',
        color: 'black',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '999px',
        fontWeight: 600,
        cursor: 'pointer',
    },
    section: {
        marginBottom: '3rem',
    },
    sectionTitle: {
        fontSize: '1.5rem',
        fontWeight: 600,
        marginBottom: '1.5rem',
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
    },
    listItem: {
        background: '#1a1a1a',
        padding: '1.5rem',
        borderRadius: '1rem',
        border: '1px solid #333',
        marginBottom: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemTitle: {
        fontWeight: 600,
        marginBottom: '0.25rem',
    },
    itemSubtitle: {
        color: '#a1a1aa',
        fontSize: '0.9rem',
    },
    status: {
        background: '#064e3b',
        color: '#6ee7b7',
        padding: '0.25rem 0.75rem',
        borderRadius: '0.25rem',
        fontSize: '0.875rem',
        fontWeight: 600,
    },
    empty: {
        color: '#666',
        padding: '2rem',
        textAlign: 'center',
        background: '#1a1a1a',
        borderRadius: '1rem',
        border: '1px dashed #333',
    },
};
