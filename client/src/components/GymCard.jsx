import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Heart } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import api from '../services/api';

export default function GymCard({ gym, initialWishlisted = false }) {
    const { getToken, isSignedIn } = useAuth();
    const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
    const [loading, setLoading] = useState(false);

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
            alert(error.response?.data?.error || 'Failed to update wishlist');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Link to={`/gym/${gym.id}`} className="card" style={styles.card}>
            <div style={styles.imageContainer}>
                <img
                    src={gym.images?.[0] || 'https://via.placeholder.com/400x250?text=Gym'}
                    alt={gym.name}
                    style={styles.image}
                />
                <button
                    onClick={handleWishlist}
                    style={{
                        ...styles.wishlistBtn,
                        background: isWishlisted ? 'white' : 'rgba(0,0,0,0.5)',
                        color: isWishlisted ? '#EF4444' : 'white',
                    }}
                >
                    <Heart size={18} fill={isWishlisted ? '#EF4444' : 'none'} strokeWidth={2.5} />
                </button>
                {gym.is_featured && (
                    <span style={styles.featuredBadge}>
                        ⭐ FEATURED
                    </span>
                )}
            </div>

            <div style={styles.content}>
                <div style={styles.header}>
                    <h3 style={styles.name}>{gym.name}</h3>
                    <div style={styles.rating}>
                        <Star size={14} fill="white" color="white" />
                        <span style={styles.ratingText}>
                            {gym.rating ? Number(gym.rating).toFixed(1) : '0.0'}
                        </span>
                    </div>
                </div>

                <div style={styles.location}>
                    <MapPin size={14} color="#a1a1aa" />
                    <span>{gym.city} {gym.distance && <span style={styles.distance}>• {gym.distance} km away</span>}</span>
                </div>

                <div style={styles.footer}>
                    <div style={styles.categories}>
                        {gym.categories?.slice(0, 2).map((cat) => (
                            <span key={cat} style={styles.categoryBadge}>
                                {cat}
                            </span>
                        ))}
                    </div>
                    <div style={styles.price}>
                        ₹{gym.min_price || '0'}<span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#a1a1aa' }}>/session</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

const styles = {
    card: {
        background: '#1a1a1a',
        borderRadius: '1rem',
        overflow: 'hidden',
        border: '1px solid #333',
        textDecoration: 'none',
        display: 'block',
        transition: 'transform 0.2s, box-shadow 0.2s',
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: '220px',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    wishlistBtn: {
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        border: 'none',
        borderRadius: '50%',
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
        zIndex: 2,
    },
    featuredBadge: {
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        background: 'linear-gradient(135deg, #F59E0B, #D97706)',
        color: 'white',
        padding: '0.4rem 0.75rem',
        borderRadius: '999px',
        fontSize: '0.7rem',
        fontWeight: 800,
        letterSpacing: '0.5px',
        boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)',
        zIndex: 2,
    },
    content: {
        padding: '1.25rem',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '0.5rem',
    },
    name: {
        fontSize: '1.125rem',
        fontWeight: 600,
        color: 'white',
        lineHeight: 1.3,
    },
    rating: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        background: '#27272a',
        padding: '0.2rem 0.5rem',
        borderRadius: '0.5rem',
    },
    ratingText: {
        fontSize: '0.75rem',
        fontWeight: 700,
        color: 'white',
    },
    location: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: '#a1a1aa',
        fontSize: '0.875rem',
        marginBottom: '1.25rem',
    },
    footer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: '1px solid #333',
        paddingTop: '1rem',
    },
    categories: {
        display: 'flex',
        gap: '0.5rem',
    },
    categoryBadge: {
        fontSize: '0.75rem',
        color: '#d4d4d8',
        background: '#27272a',
        padding: '0.2rem 0.6rem',
        borderRadius: '0.5rem',
    },
    price: {
        fontSize: '1rem',
        fontWeight: 700,
        color: 'white',
        display: 'flex',
        alignItems: 'baseline',
        gap: '2px',
    },
    distance: {
        color: 'var(--primary)',
        fontWeight: 600,
        marginLeft: '4px',
    },
};
