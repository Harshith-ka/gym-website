import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Award, SlidersHorizontal, Search, ChevronRight } from 'lucide-react';
import api from '../services/api';

export default function Trainers() {
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        specialization: '',
        minRating: '',
    });

    useEffect(() => {
        fetchTrainers();
    }, []);

    const fetchTrainers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.specialization) params.append('specialization', filters.specialization);
            if (filters.minRating) params.append('minRating', filters.minRating);

            const response = await api.get(`/trainers?${params.toString()}`);
            setTrainers(response.data.trainers || []);
        } catch (error) {
            console.error('Error fetching trainers:', error);
        } finally {
            setLoading(false);
        }
    };

    const specializations = [
        'weight_loss',
        'muscle_gain',
        'yoga',
        'cardio',
        'strength',
        'flexibility',
    ];

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        // Using temporary value to avoid stale state in fetchTrainers
        const params = new URLSearchParams();
        if (newFilters.specialization) params.append('specialization', newFilters.specialization);
        if (newFilters.minRating) params.append('minRating', newFilters.minRating);

        fetchFilteredTrainers(params);
    };

    const fetchFilteredTrainers = async (params) => {
        try {
            setLoading(true);
            const response = await api.get(`/trainers?${params.toString()}`);
            setTrainers(response.data.trainers || []);
        } catch (error) {
            console.error('Error fetching trainers:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={styles.pageWrapper}>
            {/* Hero Header */}
            <header style={styles.heroHeader}>
                <div className="container" style={styles.heroContent}>
                    <div style={styles.heroText}>
                        <h1 style={styles.title}>Find Your <span style={styles.titleAccent}>Perfect</span> Trainer</h1>
                        <p style={styles.subtitle}>
                            Work with industry leaders and certified professionals to reach your fitness goals faster.
                        </p>
                    </div>
                </div>
                <div style={styles.headerGradient} />
            </header>

            <div className="container" style={styles.container}>
                <div className="trainers-content" style={styles.content}>
                    {/* Filters Sidebar */}
                    <aside className="trainers-sidebar" style={styles.sidebar}>
                        <div style={styles.filterCard}>
                            <div style={styles.filterHeader}>
                                <SlidersHorizontal size={18} color="var(--accent)" />
                                <h3 style={styles.filterTitle}>Refine Search</h3>
                            </div>

                            <div style={styles.filterSection}>
                                <label style={styles.label}>Specialization</label>
                                <div style={styles.chipGrid}>
                                    <button
                                        style={{
                                            ...styles.filterChip,
                                            ...(filters.specialization === '' ? styles.filterChipActive : {})
                                        }}
                                        onClick={() => handleFilterChange('specialization', '')}
                                    >
                                        All Focus
                                    </button>
                                    {specializations.map((spec) => (
                                        <button
                                            key={spec}
                                            style={{
                                                ...styles.filterChip,
                                                ...(filters.specialization === spec ? styles.filterChipActive : {})
                                            }}
                                            onClick={() => handleFilterChange('specialization', spec)}
                                        >
                                            {spec.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={styles.filterSection}>
                                <label style={styles.label}>Expertise Level</label>
                                <div style={styles.chipGrid}>
                                    {[
                                        { label: 'Any Rating', value: '' },
                                        { label: '4.5+ Stars', value: '4.5' },
                                        { label: '4.0+ Stars', value: '4' },
                                        { label: '3.5+ Stars', value: '3.5' }
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            style={{
                                                ...styles.filterChip,
                                                ...(filters.minRating === opt.value ? styles.filterChipActive : {})
                                            }}
                                            onClick={() => handleFilterChange('minRating', opt.value)}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setFilters({ specialization: '', minRating: '' });
                                    fetchFilteredTrainers(new URLSearchParams());
                                }}
                                style={styles.clearButton}
                            >
                                Reset All Filters
                            </button>
                        </div>
                    </aside>

                    {/* Trainers Grid */}
                    <main style={styles.main}>
                        {loading ? (
                            <div style={styles.loadingContainer}>
                                <div className="spinner" />
                                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Finding the best trainers for you...</p>
                            </div>
                        ) : trainers.length === 0 ? (
                            <div style={styles.emptyState}>
                                <Search size={48} color="var(--text-tertiary)" style={{ marginBottom: '1.5rem' }} />
                                <h3>No matching trainers found</h3>
                                <p>Try adjusting your filters or searching for something else.</p>
                                <button
                                    onClick={() => {
                                        setFilters({ specialization: '', minRating: '' });
                                        fetchFilteredTrainers(new URLSearchParams());
                                    }}
                                    className="btn btn-secondary"
                                    style={{ marginTop: '1.5rem' }}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-3" style={styles.grid}>
                                {trainers.map((trainer) => (
                                    <Link
                                        key={trainer.id}
                                        to={`/trainer/${trainer.id}`}
                                        className="trainer-card-hover"
                                        style={styles.trainerCard}
                                    >
                                        <div style={styles.cardMedia}>
                                            <img
                                                src={trainer.profile_image || 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=800'}
                                                alt={trainer.name}
                                                style={styles.trainerImage}
                                            />
                                            {trainer.is_premium && (
                                                <div style={styles.premiumBadge}>
                                                    <Award size={12} fill="currentColor" />
                                                    <span>Elite</span>
                                                </div>
                                            )}
                                            <div style={styles.cardOverlay}>
                                                <div style={styles.rateTag}>
                                                    ₹{trainer.hourly_rate}<span>/hr</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={styles.cardBody}>
                                            <div style={styles.cardHeader}>
                                                <h3 style={styles.trainerName}>{trainer.name}</h3>
                                                <div style={styles.ratingBadge}>
                                                    <Star size={14} fill="var(--accent)" color="var(--accent)" />
                                                    <span>{trainer.rating ? Number(trainer.rating).toFixed(1) : '5.0'}</span>
                                                </div>
                                            </div>

                                            {trainer.gym_name && (
                                                <div style={styles.locationInfo}>
                                                    <MapPin size={14} />
                                                    <span>{trainer.gym_name}</span>
                                                </div>
                                            )}

                                            <p style={styles.bioText}>
                                                {trainer.bio ? (trainer.bio.length > 90 ? `${trainer.bio.substring(0, 90)}...` : trainer.bio) : 'Elite fitness trainer specializing in personalized strength and conditioning programs.'}
                                            </p>

                                            <div style={styles.specializationRow}>
                                                {trainer.specializations?.slice(0, 2).map((spec) => (
                                                    <span key={spec} style={styles.specTag}>
                                                        {spec.replace('_', ' ')}
                                                    </span>
                                                ))}
                                                {trainer.specializations?.length > 2 && (
                                                    <span style={styles.moreSpec}>+{trainer.specializations.length - 2}</span>
                                                )}
                                            </div>

                                            <div style={styles.cardFooter}>
                                                <div style={styles.expInfo}>
                                                    <span style={styles.expLabel}>EXPERIENCE</span>
                                                    <span style={styles.expValue}>{trainer.experience_years || 0} Years</span>
                                                </div>
                                                <div style={styles.viewProfile}>
                                                    <span>Profile</span>
                                                    <ChevronRight size={16} />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            <style>{`
                .trainer-card-hover {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    height: 100%;
                }
                .trainer-card-hover:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
                    border-color: rgba(239, 68, 68, 0.3) !important;
                }
                .trainer-card-hover:hover img {
                    transform: scale(1.05);
                }
            `}</style>
        </div>
    );
}

const styles = {
    pageWrapper: {
        backgroundColor: 'var(--bg-primary)',
        minHeight: '100vh',
    },
    heroHeader: {
        position: 'relative',
        padding: '6rem 0 4rem',
        background: '#0a0a0a',
        overflow: 'hidden',
        borderBottom: '1px solid var(--border)',
    },
    heroContent: {
        position: 'relative',
        zIndex: 2,
    },
    heroText: {
        maxWidth: '700px',
    },
    title: {
        fontSize: '3.5rem',
        fontWeight: 800,
        marginBottom: '1rem',
        letterSpacing: '-0.02em',
        lineHeight: 1.1,
    },
    titleAccent: {
        color: 'var(--accent)',
        position: 'relative',
    },
    subtitle: {
        fontSize: '1.25rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.6,
        maxWidth: '500px',
    },
    headerGradient: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        background: 'radial-gradient(circle at 80% 20%, rgba(239, 68, 68, 0.1) 0%, transparent 40%)',
        zIndex: 1,
    },
    container: {
        paddingTop: '3rem',
        paddingBottom: '5rem',
    },
    content: {
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: '3rem',
    },
    sidebar: {
        position: 'sticky',
        top: '120px',
        height: 'fit-content',
    },
    filterCard: {
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '1.5rem',
        padding: '2rem',
    },
    filterHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '2rem',
    },
    filterTitle: {
        fontSize: '1.25rem',
        fontWeight: 700,
        margin: 0,
    },
    filterSection: {
        marginBottom: '2rem',
    },
    label: {
        display: 'block',
        fontSize: '0.85rem',
        fontWeight: 600,
        color: 'var(--text-tertiary)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '1rem',
    },
    chipGrid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
    },
    filterChip: {
        padding: '0.6rem 1rem',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '0.75rem',
        color: 'var(--text-secondary)',
        fontSize: '0.875rem',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textTransform: 'capitalize',
    },
    filterChipActive: {
        background: 'var(--accent)',
        borderColor: 'var(--accent)',
        color: '#fff',
    },
    clearButton: {
        width: '100%',
        padding: '0.8rem',
        background: 'transparent',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '0.75rem',
        color: 'var(--text-tertiary)',
        fontSize: '0.9rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        marginTop: '1rem',
    },
    main: {
        minHeight: '600px',
    },
    grid: {
        gap: '2rem',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
    },
    emptyState: {
        textAlign: 'center',
        padding: '5rem 2rem',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '2rem',
        border: '1px dashed rgba(255,255,255,0.1)',
    },
    trainerCard: {
        background: 'var(--bg-secondary)',
        borderRadius: '1.5rem',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    cardMedia: {
        position: 'relative',
        height: '240px',
        overflow: 'hidden',
    },
    trainerImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)',
    },
    premiumBadge: {
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        background: 'var(--accent)',
        color: '#fff',
        padding: '0.35rem 0.75rem',
        borderRadius: '0.5rem',
        fontSize: '0.75rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        zIndex: 2,
    },
    cardOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '1.5rem',
        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
        display: 'flex',
        justifyContent: 'flex-end',
    },
    rateTag: {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: '#fff',
        padding: '0.4rem 0.8rem',
        borderRadius: '0.75rem',
        fontSize: '1.125rem',
        fontWeight: 700,
    },
    cardBody: {
        padding: '1.5rem',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '0.5rem',
    },
    trainerName: {
        fontSize: '1.25rem',
        fontWeight: 700,
        margin: 0,
    },
    ratingBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem',
        background: 'rgba(239, 68, 68, 0.1)',
        color: 'var(--accent)',
        padding: '0.2rem 0.5rem',
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: 700,
    },
    locationInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        color: 'var(--text-secondary)',
        fontSize: '0.85rem',
        marginBottom: '1rem',
    },
    bioText: {
        fontSize: '0.9rem',
        color: 'var(--text-tertiary)',
        lineHeight: 1.5,
        marginBottom: '1.5rem',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
    },
    specializationRow: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.4rem',
        marginBottom: '1.5rem',
    },
    specTag: {
        fontSize: '0.75rem',
        padding: '0.25rem 0.6rem',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '0.5rem',
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
        fontWeight: 500,
    },
    moreSpec: {
        fontSize: '0.75rem',
        color: 'var(--text-tertiary)',
        display: 'flex',
        alignItems: 'center',
    },
    cardFooter: {
        marginTop: 'auto',
        paddingTop: '1.25rem',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    expInfo: {
        display: 'flex',
        flexDirection: 'column',
    },
    expLabel: {
        fontSize: '0.65rem',
        color: 'var(--text-tertiary)',
        fontWeight: 700,
        letterSpacing: '0.05em',
    },
    expValue: {
        fontSize: '0.9rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
    },
    viewProfile: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        color: 'var(--accent)',
        fontWeight: 600,
        fontSize: '0.9rem',
    }
};
