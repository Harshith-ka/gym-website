import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import api from '../services/api';

export default function ReviewForm({ gymId, trainerId, bookingId, trainerBookingId, onSuccess }) {
    const { getToken } = useAuth();
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            alert('Please select a rating');
            return;
        }

        try {
            setSubmitting(true);
            const token = await getToken();

            await api.post('/reviews', {
                gymId,
                trainerId,
                bookingId,
                trainerBookingId,
                rating,
                comment,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Review submitted successfully!');
            if (onSuccess) onSuccess();

            // Reset form
            setRating(0);
            setComment('');
        } catch (error) {
            console.error('Submit review error:', error);
            alert('Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="card" style={styles.form}>
            <h3 style={styles.title}>Write a Review</h3>

            <div style={styles.ratingSection}>
                <label style={styles.label}>Your Rating</label>
                <div style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            style={styles.starButton}
                        >
                            <Star
                                size={32}
                                fill={star <= (hoveredRating || rating) ? '#F59E0B' : 'none'}
                                color={star <= (hoveredRating || rating) ? '#F59E0B' : 'var(--border)'}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div style={styles.inputGroup}>
                <label style={styles.label}>Your Review</label>
                <textarea
                    id="review-comment"
                    name="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience..."
                    className="input"
                    rows="5"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={submitting || rating === 0}
                className="btn btn-primary"
                style={{ width: '100%' }}
            >
                {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
}

const styles = {
    form: {
        padding: '2rem',
        marginTop: '2rem',
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: 600,
        marginBottom: '1.5rem',
    },
    ratingSection: {
        marginBottom: '1.5rem',
    },
    label: {
        display: 'block',
        fontWeight: 600,
        marginBottom: '0.75rem',
    },
    stars: {
        display: 'flex',
        gap: '0.5rem',
    },
    starButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        transition: 'transform 0.2s',
    },
    inputGroup: {
        marginBottom: '1.5rem',
    },
};
