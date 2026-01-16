import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Calendar, Heart, ArrowRight, Clock, MapPin, Star,
    Flame, Trophy, Activity, Dumbbell, Settings
} from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';
import api from '../services/api';
import ReviewModal from '../components/ReviewModal';

export default function UserDashboard() {
    const { getToken } = useAuth();
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const headers = { Authorization: `Bearer ${token}` };

            // Always fetch stats for the overview
            const statsRes = await api.get('/users/stats', { headers });
            setStats(statsRes.data.stats);

            if (activeTab === 'bookings' || activeTab === 'overview') {
                const bookingsRes = await api.get('/users/bookings', { headers });
                setBookings(bookingsRes.data.bookings || []);
            }

            if (activeTab === 'wishlist') {
                const wishlistRes = await api.get('/users/wishlist', { headers });
                setWishlist(wishlistRes.data.wishlist || []);
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const nextSession = stats?.nextSession;

    // Helper to get time until session
    const getTimeUntil = (dateStr, timeStr) => {
        const sessionDate = new Date(`${dateStr.split('T')[0]}T${timeStr}`);
        const now = new Date();
        const diffMs = sessionDate - now;
        const diffHrs = Math.floor(diffMs / 3600000);

        if (diffHrs < 0) return 'Happening now';
        if (diffHrs < 24) return `In ${diffHrs} hours`;
        return `In ${Math.floor(diffHrs / 24)} days`;
    };

    if (loading && !stats) return (
        <div style={styles.loadingContainer}>
            <div className="spinner"></div>
        </div>
    );

    return (
        <div style={styles.container}>
            <div className="container">
                {/* Header Section */}
                <div style={styles.header}>
                    <div style={styles.userInfo}>
                        <img
                            src={user?.imageUrl}
                            alt="Profile"
                            style={styles.avatar}
                        />
                        <div>
                            <h1 style={styles.greeting}>Hello, {user?.firstName}! 👋</h1>
                            <p style={styles.joinDate}>Member since {new Date(user?.createdAt).getFullYear()}</p>
                        </div>
                    </div>
                    {/* Floating Ticket for Next Session (Desktop) */}
                    {nextSession && (
                        <div style={styles.ticketWidget}>
                            <div style={styles.ticketContent}>
                                <div style={styles.ticketHeader}>
                                    <span style={styles.ticketLabel}>UPCOMING SESSION</span>
                                    <span style={styles.ticketTime}>{getTimeUntil(nextSession.booking_date, nextSession.start_time)}</span>
                                </div>
                                <h3 style={styles.ticketGym}>{nextSession.gym_name}</h3>
                                <div style={styles.ticketDetailRow}>
                                    <span style={styles.ticketDetail}>
                                        <Calendar size={14} /> {new Date(nextSession.booking_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </span>
                                    <span style={styles.ticketDetail}>
                                        <Clock size={14} /> {nextSession.start_time.slice(0, 5)}
                                    </span>
                                </div>
                            </div>
                            <Link to={`/booking-confirmation/${nextSession.id}`} style={styles.ticketAction}>
                                <ArrowRight size={20} />
                            </Link>
                        </div>
                    )}
                </div>

                {/* Stats Grid */}
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <div style={{ ...styles.statIcon, background: 'rgba(59, 130, 246, 0.2)', color: '#60A5FA' }}>
                            <Dumbbell size={24} />
                        </div>
                        <div>
                            <h3 style={styles.statValue}>{stats?.totalWorkouts || 0}</h3>
                            <p style={styles.statLabel}>Total Workouts</p>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{ ...styles.statIcon, background: 'rgba(16, 185, 129, 0.2)', color: '#34D399' }}>
                            <MapPin size={24} />
                        </div>
                        <div>
                            <h3 style={styles.statValue}>{stats?.visitedGyms || 0}</h3>
                            <p style={styles.statLabel}>Gyms Explored</p>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{ ...styles.statIcon, background: 'rgba(245, 158, 11, 0.2)', color: '#ea580c' }}> {/* Darker orange for higher contrast */}
                            <Flame size={24} fill="#ea580c" />
                        </div>
                        <div>
                            <h3 style={styles.statValue}>{stats?.streak || 0} Days</h3>
                            <p style={styles.statLabel}>Active Streak</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div style={styles.tabs}>
                    <button
                        onClick={() => setActiveTab('overview')}
                        style={activeTab === 'overview' ? styles.activeTab : styles.tab}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('bookings')}
                        style={activeTab === 'bookings' ? styles.activeTab : styles.tab}
                    >
                        History ({bookings.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('wishlist')}
                        style={activeTab === 'wishlist' ? styles.activeTab : styles.tab}
                    >
                        Wishlist ({wishlist.length})
                    </button>
                </div>

                {/* Tab Content */}
                <div style={styles.contentArea}>

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div>
                            <h3 style={styles.sectionTitle}>Recent Activity</h3>
                            <div style={styles.activityFeed}>
                                {bookings.slice(0, 3).map(booking => (
                                    <div key={booking.id} style={styles.activityItem}>
                                        <div style={styles.activityIcon}>
                                            <Activity size={18} />
                                        </div>
                                        <div style={styles.activityContent}>
                                            <p style={styles.activityText}>
                                                Booked a <strong>{booking.service_name}</strong> at <strong>{booking.gym_name}</strong>
                                            </p>
                                            <span style={styles.activityTime}>{new Date(booking.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <span style={{
                                            ...styles.statusPill,
                                            background: booking.status === 'confirmed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(113, 113, 122, 0.2)',
                                            color: booking.status === 'confirmed' ? '#34D399' : '#A1A1AA'
                                        }}>
                                            {booking.status}
                                        </span>
                                    </div>
                                ))}
                                {bookings.length === 0 && (
                                    <p style={{ color: '#666', fontStyle: 'italic' }}>No recent activity.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* BOOKINGS TAB */}
                    {activeTab === 'bookings' && (
                        <div style={styles.grid}>
                            {bookings.map(booking => (
                                <div key={booking.id} style={styles.bookingCard}>
                                    <div style={styles.bookingHeader}>
                                        <span style={{
                                            ...styles.statusBadge,
                                            background: booking.status === 'confirmed' ? '#fff' : '#27272a',
                                            color: booking.status === 'confirmed' ? '#000' : '#a1a1aa'
                                        }}>
                                            {booking.status}
                                        </span>
                                        <span style={styles.bookingDate}>
                                            {new Date(booking.booking_date).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <h3 style={styles.gymName}>{booking.gym_name}</h3>
                                    <p style={styles.serviceName}>{booking.service_name}</p>

                                    <div style={styles.bookingDetails}>
                                        <div style={styles.detailItem}>
                                            <Clock size={14} />
                                            <span>
                                                {booking.start_time
                                                    ? `${booking.start_time.slice(0, 5)} (${booking.duration_hours}h)`
                                                    : `${booking.duration_days || 1} Days`}
                                            </span>
                                        </div>
                                        {booking.trainer_name && (
                                            <div style={{ ...styles.detailItem, color: 'var(--primary)' }}>
                                                <Activity size={14} />
                                                <span>Trainer: {booking.trainer_name}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div style={styles.cardActions}>
                                        <Link to={`/booking-confirmation/${booking.id}`} style={styles.viewBtn}>
                                            View Ticket <ArrowRight size={14} />
                                        </Link>
                                        {(booking.status === 'used' || (booking.status === 'confirmed' && new Date(booking.booking_date) < new Date())) && !booking.is_reviewed && (
                                            <button
                                                onClick={() => setSelectedBooking(booking)}
                                                style={{ ...styles.viewBtn, marginTop: '0.5rem', background: '#d97706', color: 'white', border: 'none' }}
                                            >
                                                <Star size={14} /> Rate
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* WISHLIST TAB */}
                    {activeTab === 'wishlist' && (
                        <div style={styles.grid}>
                            {wishlist.map(gym => (
                                <Link key={gym.id} to={`/gym/${gym.id}`} style={styles.wishlistCard}>
                                    <img src={gym.images?.[0]} style={styles.wishlistImg} alt={gym.name} />
                                    <div style={styles.wishlistInfo}>
                                        <h4>{gym.name}</h4>
                                        <p><MapPin size={12} /> {gym.city}</p>
                                    </div>
                                </Link>
                            ))}
                            {wishlist.length === 0 && (
                                <div style={styles.emptyState}>
                                    <Heart size={40} color="#333" />
                                    <p>Your wishlist is empty.</p>
                                    <Link to="/explore" style={styles.link}>Explore Gyms</Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {selectedBooking && <ReviewModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} onSuccess={() => { fetchData(); setSelectedBooking(null); }} />}
        </div>
    );
}

const styles = {
    loadingContainer: { background: '#111', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    container: { background: '#111', minHeight: '100vh', padding: '2rem 1rem', color: '#fff', fontFamily: 'var(--font-sans)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '2rem' },
    userInfo: { display: 'flex', alignItems: 'center', gap: '1.5rem' },
    avatar: { width: '80px', height: '80px', borderRadius: '50%', border: '2px solid #333', objectFit: 'cover' },
    greeting: { fontSize: '2rem', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' },
    joinDate: { color: '#888', margin: '0.25rem 0 0 0', fontSize: '0.9rem' },

    // Ticket Widget
    ticketWidget: { background: 'linear-gradient(135deg, #27272a 0%, #1e1e20 100%)', border: '1px solid #333', borderRadius: '16px', padding: '0', display: 'flex', overflow: 'hidden', minWidth: '300px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' },
    ticketContent: { padding: '1.25rem', flex: 1 },
    ticketHeader: { display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#a1a1aa', marginBottom: '0.5rem' },
    ticketLabel: { border: '1px solid #444', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem' },
    ticketTime: { color: '#10b981' },
    ticketGym: { margin: '0 0 0.75rem 0', fontSize: '1.25rem', fontWeight: 600, color: '#fff' },
    ticketDetailRow: { display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#ccc' },
    ticketDetail: { display: 'flex', alignItems: 'center', gap: '6px' },
    ticketAction: { width: '60px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', transition: 'background 0.2s' },

    // Stats
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' },
    statCard: { background: '#1a1a1a', border: '1px solid #27272a', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s' },
    statIcon: { width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    statValue: { fontSize: '1.75rem', fontWeight: 700, margin: 0 },
    statLabel: { color: '#888', fontSize: '0.9rem', margin: 0 },

    // Tabs
    tabs: { display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' },
    tab: { background: 'transparent', border: 'none', color: '#666', fontSize: '1rem', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 500 },
    activeTab: { background: 'transparent', borderBottom: '2px solid #fff', color: '#fff', fontSize: '1rem', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 500 },

    // Content
    sectionTitle: { marginBottom: '1.5rem', fontSize: '1.25rem' },
    activityFeed: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    activityItem: { display: 'flex', alignItems: 'center', gap: '1rem', background: '#1a1a1a', padding: '1rem', borderRadius: '8px', border: '1px solid #27272a' },
    activityIcon: { background: '#27272a', padding: '0.5rem', borderRadius: '50%', color: '#888' },
    activityContent: { flex: 1 },
    activityText: { margin: 0, fontSize: '0.95rem' },
    activityTime: { fontSize: '0.8rem', color: '#666' },
    statusPill: { fontSize: '0.75rem', padding: '4px 8px', borderRadius: '99px', fontWeight: 600 },

    // Grid for Bookings/Wishlist
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' },
    bookingCard: { background: '#1a1a1a', border: '1px solid #333', borderRadius: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column' },
    bookingHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
    statusBadge: { fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: '0.25rem', textTransform: 'uppercase' },
    bookingDate: { color: '#a1a1aa', fontSize: '0.875rem' },
    gymName: { fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' },
    serviceName: { color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '1rem' },
    bookingDetails: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderTop: '1px solid #333', paddingTop: '1rem' },
    detailItem: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#d4d4d8' },
    cardActions: { marginTop: 'auto' },
    viewBtn: { width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: '#27272a', color: 'white', borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'background 0.2s', border: 'none', cursor: 'pointer' },

    // Wishlist
    wishlistCard: { textDecoration: 'none', color: '#fff', background: '#1a1a1a', borderRadius: '12px', overflow: 'hidden', border: '1px solid #333', display: 'flex', flexDirection: 'column' },
    wishlistImg: { width: '100%', height: '160px', objectFit: 'cover' },
    wishlistInfo: { padding: '1rem' },
    emptyState: { gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', background: '#1a1a1a', borderRadius: '12px' },
    link: { color: '#3b82f6', textDecoration: 'underline', marginTop: '1rem', display: 'inline-block' },
};
