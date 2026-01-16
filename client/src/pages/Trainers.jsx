import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Award, TrendingUp } from 'lucide-react';
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

    return (
        <div className="container" style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Find Your Perfect Trainer</h1>
                    <p style={styles.subtitle}>
                        Book sessions with certified personal trainers
                    </p>
                </div>
            </div>

            <div style={styles.content}>
                {/* Filters */}
                <aside style={styles.sidebar}>
                    <h3 style={styles.filterTitle}>Filters</h3>

                    <div style={styles.filterGroup}>
                        <label style={styles.label}>Specialization</label>
                        <select
                            value={filters.specialization}
                            onChange={(e) => {
                                setFilters({ ...filters, specialization: e.target.value });
                                fetchTrainers();
                            }}
                            className="input"
                        >
                            <option value="">All</option>
                            {specializations.map((spec) => (
                                <option key={spec} value={spec}>
                                    {spec.replace('_', ' ').toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.label}>Minimum Rating</label>
                        <select
                            value={filters.minRating}
                            onChange={(e) => {
                                setFilters({ ...filters, minRating: e.target.value });
                                fetchTrainers();
                            }}
                            className="input"
                        >
                            <option value="">Any</option>
                            <option value="4">4+ Stars</option>
                            <option value="3">3+ Stars</option>
                        </select>
                    </div>
                </aside>

                {/* Trainers Grid */}
                <main style={styles.main}>
                    {loading ? (
                        <div style={styles.loading}>
                            <div className="spinner" />
                        </div>
                    ) : trainers.length === 0 ? (
                        <div style={styles.empty}>
                            <p>No trainers found. Try adjusting your filters.</p>
                        </div>
                    ) : (
                        <div className="grid grid-3">
                            {trainers.map((trainer) => (
                                <Link
                                    key={trainer.id}
                                    to={`/trainer/${trainer.id}`}
                                    className="card"
                                    style={styles.trainerCard}
                                >
                                    <div style={styles.cardHeader}>
                                        <img
                                            src={trainer.profile_image || 'https://via.placeholder.com/150'}
                                            alt={trainer.name}
                                            style={styles.trainerImage}
                                        />
                                        {trainer.is_premium && (
                                            <span className="badge badge-primary" style={styles.premiumBadge}>
                                                Premium
                                            </span>
                                        )}
                                    </div>

                                    <div style={styles.cardContent}>
                                        <h3 style={styles.trainerName}>{trainer.name}</h3>

                                        <div style={styles.rating}>
                                            <Star size={16} fill="#F59E0B" color="#F59E0B" />
                                            <span style={styles.ratingText}>
                                                {trainer.rating?.toFixed(1) || '0.0'}
                                            </span>
                                            <span style={styles.reviewCount}>
                                                ({trainer.total_reviews || 0})
                                            </span>
                                        </div>

                                        {trainer.gym_name && (
                                            <div style={styles.gymInfo}>
                                                <MapPin size={14} />
                                                <span>{trainer.gym_name}, {trainer.gym_city}</span>
                                            </div>
                                        )}

                                        <p style={styles.bio}>
                                            {trainer.bio?.substring(0, 100)}...
                                        </p>

                                        <div style={styles.specializations}>
                                            {trainer.specializations?.slice(0, 3).map((spec) => (
                                                <span key={spec} className="badge">
                                                    {spec.replace('_', ' ')}
                                                </span>
                                            ))}
                                        </div>

                                        <div style={styles.footer}>
                                            <div style={styles.experience}>
                                                <Award size={16} />
                                                <span>{trainer.experience_years || 0} years</span>
                                            </div>
                                            <div style={styles.rate}>
                                                ₹{trainer.hourly_rate || 0}/hr
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
    );
}

const styles = {
    container: {
        paddingTop: '2rem',
        paddingBottom: '4rem',
    },
    header: {
        marginBottom: '2rem',
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: 700,
        marginBottom: '0.5rem',
    },
    subtitle: {
        fontSize: '1.125rem',
        color: 'var(--text-secondary)',
    },
    content: {
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        gap: '2rem',
    },
    sidebar: {
        position: 'sticky',
        top: '100px',
        height: 'fit-content',
    },
    filterTitle: {
        fontSize: '1.25rem',
        fontWeight: 600,
        marginBottom: '1.5rem',
    },
    filterGroup: {
        marginBottom: '1.5rem',
    },
    label: {
        display: 'block',
        fontWeight: 600,
        marginBottom: '0.5rem',
        fontSize: '0.875rem',
    },
    main: {
        minHeight: '400px',
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
    },
    empty: {
        textAlign: 'center',
        padding: '4rem 0',
        color: 'var(--text-secondary)',
    },
    trainerCard: {
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'inherit',
        padding: 0,
    },
    cardHeader: {
        position: 'relative',
        height: '200px',
        background: 'var(--bg-secondary)',
    },
    trainerImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    premiumBadge: {
        position: 'absolute',
        top: '1rem',
        right: '1rem',
    },
    cardContent: {
        padding: '1.5rem',
    },
    trainerName: {
        fontSize: '1.25rem',
        fontWeight: 600,
        marginBottom: '0.5rem',
    },
    rating: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        marginBottom: '0.75rem',
    },
    ratingText: {
        fontWeight: 600,
        fontSize: '0.875rem',
    },
    reviewCount: {
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
    },
    gymInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        marginBottom: '0.75rem',
    },
    bio: {
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
        marginBottom: '1rem',
        lineHeight: 1.6,
    },
    specializations: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginBottom: '1rem',
    },
    footer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '1rem',
        borderTop: '1px solid var(--border)',
    },
    experience: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
    },
    rate: {
        fontSize: '1.125rem',
        fontWeight: 700,
        color: 'var(--primary)',
    },
};
