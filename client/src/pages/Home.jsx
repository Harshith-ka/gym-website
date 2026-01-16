import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Dumbbell, Users, Award, TrendingUp, Play, Star, Heart } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import api from '../services/api';
import GymCard from '../components/GymCard';

export default function Home() {
    const [featuredGyms, setFeaturedGyms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeaturedGyms();
    }, []);

    const fetchFeaturedGyms = async () => {
        try {
            const response = await api.get('/gyms/search?limit=6');
            setFeaturedGyms(response.data.gyms || []);
        } catch (error) {
            console.error('Error fetching gyms:', error);
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        { name: 'Workout', icon: '💪', color: '#8B5CF6', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop' },
        { name: 'Yoga', icon: '🧘', color: '#06B6D4', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop' },
        { name: 'Dance', icon: '💃', color: '#EC4899', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop' },
        { name: 'Zumba', icon: '🎵', color: '#F59E0B', image: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?q=80&w=600&auto=format&fit=crop' },
        { name: 'CrossFit', icon: '🏋️', color: '#10B981', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600&auto=format&fit=crop' },
        { name: 'Badminton', icon: '🏸', color: '#EF4444', image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=600&auto=format&fit=crop' },
    ];

    return (
        <div style={{ background: '#000', color: 'white', minHeight: '100vh' }}>
            {/* Hero Section */}
            <section style={styles.hero}>
                <div className="container" style={styles.heroContainer}>
                    {/* Left Content */}
                    <div style={styles.heroContent}>
                        {/* Member Badge */}
                        <div style={styles.memberBadge}>
                            <div style={styles.avatarGroup}>
                                <img src="https://i.pravatar.cc/100?img=1" alt="User" style={styles.avatar} />
                                <img src="https://i.pravatar.cc/100?img=2" alt="User" style={styles.avatar} />
                                <img src="https://i.pravatar.cc/100?img=3" alt="User" style={styles.avatar} />
                            </div>
                            <span style={styles.badgeText}>1,200+ Active Global Membership</span>
                        </div>

                        <h1 style={styles.heroTitle}>
                            Built for Every <br />
                            Body, Backed by <br />
                            Real Progress.
                        </h1>
                        <p style={styles.heroSubtitle}>
                            At Purpul Hue we believe fitness is for everybody. Our gym is your
                            dedicated space to grow, transform, and thrive.
                        </p>

                        <div style={styles.heroActions}>
                            <Link to="/membership" style={styles.primaryBtn}>
                                See Membership Plans
                            </Link>
                            <button style={styles.secondaryBtn}>
                                Watch Virtual Tour <div style={styles.playIcon}><Play size={12} fill="white" /></div>
                            </button>
                        </div>

                        {/* Stats */}
                        <div style={styles.statsRow}>
                            <div style={styles.statItem}>
                                <div style={styles.statIcon}><Users size={20} /></div>
                                <div>
                                    <div style={styles.statValue}>1,200+</div>
                                    <div style={styles.statLabel}>Active Members</div>
                                </div>
                            </div>
                            <div style={styles.statItem}>
                                <div style={styles.statIcon}><Heart size={20} /></div>
                                <div>
                                    <div style={styles.statValue}>95%</div>
                                    <div style={styles.statLabel}>Satisfaction Rate</div>
                                </div>
                            </div>
                            <div style={styles.statItem}>
                                <div style={styles.statIcon}><Star size={20} /></div>
                                <div>
                                    <div style={styles.statValue}>60+</div>
                                    <div style={styles.statLabel}>Weekly Classes</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Image */}
                    <div style={styles.heroImageWrapper}>
                        <img
                            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop"
                            alt="Gym Athlete"
                            style={styles.heroImage}
                        />
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="container" style={styles.section}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>Browse by Category</h2>
                    <Link to="/categories" style={styles.viewAll}>
                        View All Categories <ArrowRight size={20} />
                    </Link>
                </div>
                <div style={styles.categories}>
                    {categories.map((cat) => (
                        <Link
                            key={cat.name}
                            to={`/category/${cat.name.toLowerCase()}`}
                            style={styles.categoryCard}
                        >
                            <div style={styles.categoryImageContainer}>
                                <img src={cat.image} alt={cat.name} style={styles.categoryImg} />
                                <div style={{ ...styles.categoryOverlay, borderBottom: `4px solid ${cat.color}` }}>
                                    <div style={styles.categoryGlass}>
                                        <span style={styles.categoryIcon}>{cat.icon}</span>
                                        <span style={styles.categoryName}>{cat.name}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Featured Gyms */}
            <section className="container" style={styles.section}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>Featured Gyms</h2>
                    <Link to="/explore" style={styles.viewAll}>
                        View All <ArrowRight size={20} />
                    </Link>
                </div>

                {loading ? (
                    <div style={styles.loading}>
                        <div className="spinner" />
                    </div>
                ) : (
                    <div className="grid grid-3">
                        {featuredGyms.map((gym) => (
                            <GymCard key={gym.id} gym={gym} />
                        ))}
                    </div>
                )}
            </section>

            {/* Why Choose Section - Updated for Dark Theme */}
            <section style={styles.featuresSection}>
                <div className="container">
                    <h2 style={styles.sectionTitle}>Why Choose FitBook?</h2>
                    <div className="grid grid-4" style={{ marginTop: '2rem' }}>
                        <div style={styles.feature}>
                            <div style={styles.featureIcon}>
                                <Dumbbell size={32} />
                            </div>
                            <h3 style={styles.featureTitle}>Wide Selection</h3>
                            <p style={styles.featureText}>
                                Access hundreds of gyms and fitness centers in your area
                            </p>
                        </div>

                        <div style={styles.feature}>
                            <div style={styles.featureIcon}>
                                <Users size={32} />
                            </div>
                            <h3 style={styles.featureTitle}>Expert Trainers</h3>
                            <p style={styles.featureText}>
                                Book sessions with certified personal trainers
                            </p>
                        </div>

                        <div style={styles.feature}>
                            <div style={styles.featureIcon}>
                                <Award size={32} />
                            </div>
                            <h3 style={styles.featureTitle}>Verified Reviews</h3>
                            <p style={styles.featureText}>
                                Read authentic reviews from real users
                            </p>
                        </div>

                        <div style={styles.feature}>
                            <div style={styles.featureIcon}>
                                <TrendingUp size={32} />
                            </div>
                            <h3 style={styles.featureTitle}>Flexible Plans</h3>
                            <p style={styles.featureText}>
                                Choose from sessions, passes, or memberships
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

const styles = {
    hero: {
        background: 'linear-gradient(to right, #1a1a1a, #0a0a0a)',
        padding: '2rem 0',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
    },
    heroContainer: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '4rem',
        alignItems: 'center',
        padding: '0 2rem',
        maxWidth: '1280px',
        margin: '0 auto',
    },
    heroContent: {
        maxWidth: '600px',
    },
    memberBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: 'rgba(255,255,255,0.1)',
        padding: '0.5rem 1rem',
        borderRadius: '999px',
        marginBottom: '2rem',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
    },
    avatarGroup: {
        display: 'flex',
        marginLeft: '0.5rem',
    },
    avatar: {
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        border: '2px solid #1a1a1a',
        marginLeft: '-0.5rem',
    },
    badgeText: {
        fontSize: '0.875rem',
        color: '#e5e5e5',
        fontWeight: 500,
    },
    heroTitle: {
        fontSize: '4rem',
        fontWeight: 700, // Reduced from 800 to standard bold for serif
        fontFamily: 'serif', // Simple serif fallback
        lineHeight: 1.1,
        marginBottom: '1.5rem',
        letterSpacing: '-1px',
    },
    heroSubtitle: {
        fontSize: '1.125rem',
        color: '#a1a1aa',
        marginBottom: '2.5rem',
        lineHeight: 1.6,
        maxWidth: '480px',
    },
    heroActions: {
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        marginBottom: '4rem',
    },
    primaryBtn: {
        background: 'white',
        color: 'black',
        padding: '1rem 2rem',
        borderRadius: '999px',
        textDecoration: 'none',
        fontWeight: 600,
        fontSize: '1rem',
        transition: 'transform 0.2s',
    },
    secondaryBtn: {
        background: 'transparent',
        border: 'none',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 500,
    },
    playIcon: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(255,255,255,0.2)',
    },
    statsRow: {
        display: 'flex',
        gap: '3rem',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        paddingTop: '2rem',
    },
    statItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        alignItems: 'flex-start', // Align left as per design
    },
    statIcon: {
        marginBottom: '0.5rem',
        color: 'white',
    },
    statValue: {
        fontSize: '1.5rem',
        fontWeight: 700,
        lineHeight: 1,
    },
    statLabel: {
        fontSize: '0.875rem',
        color: '#a1a1aa',
    },
    heroImageWrapper: {
        position: 'relative',
        height: '600px',
        borderRadius: '2rem',
        overflow: 'hidden',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },

    // Global Section Styles (Updated for Dark)
    section: {
        padding: '4rem 0',
    },
    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem',
    },
    sectionTitle: {
        fontSize: '2rem',
        fontWeight: 700,
        marginBottom: '1rem',
        color: 'white',
    },
    viewAll: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: '#8B5CF6',
        textDecoration: 'none',
        fontWeight: 600,
    },
    categories: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1.5rem',
    },
    categoryCard: {
        position: 'relative',
        borderRadius: '1.5rem',
        overflow: 'hidden',
        textDecoration: 'none',
        height: '240px',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
    },
    categoryImageContainer: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    categoryImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform 0.5s ease',
    },
    categoryOverlay: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '1.25rem',
        transition: 'background 0.3s ease',
    },
    categoryGlass: {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(8px)',
        borderRadius: '1rem',
        padding: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    categoryIcon: {
        fontSize: '1.5rem',
    },
    categoryName: {
        fontSize: '1.125rem',
        fontWeight: 700,
        color: 'white',
        letterSpacing: '0.5px',
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        padding: '4rem 0',
    },
    featuresSection: {
        background: '#111',
        padding: '4rem 0',
        borderTop: '1px solid #222',
    },
    feature: {
        textAlign: 'center',
    },
    featureIcon: {
        width: '80px',
        height: '80px',
        margin: '0 auto 1.5rem',
        background: 'linear-gradient(135deg, #333 0%, #000 100%)',
        border: '1px solid #333',
        borderRadius: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
    },
    featureTitle: {
        fontSize: '1.25rem',
        fontWeight: 600,
        marginBottom: '0.75rem',
        color: 'white',
    },
    featureText: {
        color: '#a1a1aa',
    },
};
