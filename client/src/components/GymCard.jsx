import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Heart, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function GymCard({ gym, initialWishlisted = false }) {
    const { user } = useAuth();
    const getToken = async () => {
        if (!user) return null;
        return await user.getIdToken();
    };
    const isSignedIn = !!user;
    const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
    const [loading, setLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleWishlist = async (e) => {
        e.preventDefault();
        if (!isSignedIn) {
            alert('Please sign in to add gyms to your wishlist');
            return;
        }
        if (loading) return;

        try {
            setLoading(true);
            const token = await getToken();
            if (isWishlisted) {
                await api.delete(`/users/wishlist/${gym.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setIsWishlisted(false);
            } else {
                await api.post(`/users/wishlist/${gym.id}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setIsWishlisted(true);
            }
        } catch (error) {
            console.error('Wishlist error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Link
            to={`/gym/${gym.id}`}
            style={{
                ...styles.card,
                transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
                boxShadow: isHovered ? '0 20px 40px rgba(0,0,0,0.6)' : '0 10px 20px rgba(0,0,0,0.3)',
                borderColor: isHovered ? 'var(--primary)' : '#333'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={styles.imageContainer}>
                <img
                    src={gym.images?.[0] || 'https://via.placeholder.com/400x250?text=Gym'}
                    alt={gym.name}
                    style={{
                        ...styles.image,
                        transform: isHovered ? 'scale(1.05)' : 'scale(1)'
                    }}
                    loading="lazy"
                />

                {/* Overlay Gradient */}
                <div style={styles.overlay} />

                <button
                    onClick={handleWishlist}
                    style={{
                        ...styles.wishlistBtn,
                        background: isWishlisted ? 'white' : 'rgba(0,0,0,0.5)',
                        color: isWishlisted ? '#EF4444' : 'white',
                        transform: isHovered ? 'scale(1.1)' : 'scale(1)'
                    }}
                >
                    <Heart size={18} fill={isWishlisted ? '#EF4444' : 'none'} strokeWidth={2.5} />
                </button>

                {gym.is_featured && (
                    <div style={styles.featuredBadge}>
                        <Star size={10} fill="white" /> FEATURED
                    </div>
                )}

                <div style={styles.badgeRow}>
                    {gym.distance && (
                        <div style={styles.distanceBadge}>
                            <MapPin size={10} /> {gym.distance} km
                        </div>
                    )}
                </div>
            </div>

            <div style={styles.content}>
                <div style={styles.topInfo}>
                    <div style={styles.categoryInfo}>
                        {gym.categories?.slice(0, 1).map((cat) => (
                            <span key={cat} style={styles.primaryCategory}>
                                {cat.replace('_', ' ')}
                            </span>
                        ))}
                    </div>
                    <div style={styles.ratingBox}>
                        <Star size={12} fill="var(--primary)" color="var(--primary)" />
                        <span>{gym.rating ? Number(gym.rating).toFixed(1) : '5.0'}</span>
                    </div>
                </div>

                <h3 style={styles.name}>{gym.name}</h3>

                <p style={styles.location}>
                    <MapPin size={14} style={{ flexShrink: 0 }} />
                    <span style={styles.truncatedText}>{gym.address || gym.city}</span>
                </p>

                <div style={styles.divider} />

                <div style={styles.footer}>
                    <div style={styles.priceContainer}>
                        <span style={styles.priceLabel}>Starting from</span>
                        <div style={styles.priceValue}>
                            ₹{gym.min_session_price || gym.min_price || '0'}
                            <span style={styles.priceUnit}>/session</span>
                        </div>
                    </div>
                    <div style={{
                        ...styles.viewBtn,
                        background: isHovered ? 'var(--primary)' : 'transparent',
                        color: isHovered ? 'black' : 'var(--primary)',
                    }}>
                        <ArrowRight size={18} />
                    </div>
                </div>
            </div>
        </Link>
    );
}

const styles = {
    card: {
        background: '#1a1a1a',
        borderRadius: '1.5rem',
        overflow: 'hidden',
        border: '1px solid #333',
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        cursor: 'pointer',
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: '240px',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)',
    },
    overlay: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%)',
        zIndex: 1,
    },
    wishlistBtn: {
        position: 'absolute',
        top: '1.25rem',
        right: '1.25rem',
        border: 'none',
        borderRadius: '1rem',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        zIndex: 10,
        backdropFilter: 'blur(4px)',
    },
    featuredBadge: {
        position: 'absolute',
        top: '1.25rem',
        left: '1.25rem',
        background: 'var(--primary)',
        color: 'black',
        padding: '0.4rem 0.8rem',
        borderRadius: '0.75rem',
        fontSize: '0.7rem',
        fontWeight: 800,
        letterSpacing: '1px',
        zIndex: 5,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        boxShadow: '0 4px 12px rgba(255,255,255,0.2)',
    },
    badgeRow: {
        position: 'absolute',
        bottom: '1.25rem',
        left: '1.25rem',
        display: 'flex',
        gap: '8px',
        zIndex: 5,
    },
    distanceBadge: {
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        color: 'white',
        padding: '0.35rem 0.75rem',
        borderRadius: '0.5rem',
        fontSize: '0.75rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        border: '1px solid rgba(255,255,255,0.1)',
    },
    content: {
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
    },
    topInfo: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem',
    },
    categoryInfo: {
        display: 'flex',
        gap: '6px',
    },
    primaryCategory: {
        fontSize: '0.7rem',
        background: 'rgba(255,255,255,0.05)',
        color: 'var(--primary)',
        padding: '0.25rem 0.6rem',
        borderRadius: '0.5rem',
        textTransform: 'uppercase',
        fontWeight: 700,
        letterSpacing: '0.5px',
    },
    ratingBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '0.85rem',
        fontWeight: 700,
        color: 'white',
    },
    name: {
        fontSize: '1.35rem',
        fontWeight: 800,
        color: 'white',
        marginBottom: '0.5rem',
        lineHeight: 1.25,
    },
    location: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: '#a1a1aa',
        fontSize: '0.9rem',
        marginBottom: '1.5rem',
    },
    truncatedText: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    divider: {
        height: '1px',
        background: 'linear-gradient(to right, #333 0%, transparent 100%)',
        marginBottom: '1.5rem',
        marginTop: 'auto',
    },
    footer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    priceContainer: {
        display: 'flex',
        flexDirection: 'column',
    },
    priceLabel: {
        fontSize: '0.7rem',
        color: '#71717a',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    priceValue: {
        fontSize: '1.25rem',
        fontWeight: 800,
        color: 'white',
        display: 'flex',
        alignItems: 'baseline',
        gap: '2px',
    },
    priceUnit: {
        fontSize: '0.8rem',
        fontWeight: 500,
        color: '#555',
    },
    viewBtn: {
        width: '44px',
        height: '44px',
        borderRadius: '1rem',
        border: '1px solid var(--primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
    },
};
