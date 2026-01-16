
import { useState } from 'react';
import { X, Star, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '@clerk/clerk-react';

export default function ReviewModal({ booking, onClose, onSuccess }) {
    const { getToken } = useAuth();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = await getToken();
            const payload = {
                rating,
                comment,
                bookingId: booking.booking_type ? booking.id : undefined, // Standard Booking
                trainerBookingId: !booking.booking_type ? booking.id : undefined, // Trainer Booking (logic depends on how we distinguish)
                // Actually need to check booking object structure. Assuming standard booking for now based on dashboard.
                // If it's a trainer booking, dashboard might differentiate.
                // Let's pass gymId/trainerId if available
                gymId: booking.gym_id,
                trainerId: booking.trainer_id
            };

            // Refined payload logic
            if (booking.gym_id) payload.gymId = booking.gym_id;
            if (booking.trainer_id) payload.trainerId = booking.trainer_id;
            if (booking.id) {
                // Determine if it's trainer booking or gym booking.
                // Database schema has separate tables but dashboard might merge them or use diff endpoints.
                // Current UserDashboard fetches from /users/bookings which likely returns union or standard.
                // Let's assume standard booking ID for now.
                payload.bookingId = booking.id;
            }

            await api.post('/reviews', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onSuccess();
            onClose();
            alert('Review submitted successfully!');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <h3 style={styles.title}>Rate {booking.gym_name || booking.trainer_name}</h3>
                    <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.stars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                style={styles.starBtn}
                            >
                                <Star
                                    size={32}
                                    fill={star <= rating ? "#F59E0B" : "none"}
                                    color={star <= rating ? "#F59E0B" : "#52525b"}
                                />
                            </button>
                        ))}
                    </div>

                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience..."
                        style={styles.textarea}
                        required
                    />

                    <button type="submit" disabled={submitting} style={styles.deployBtn}>
                        {submitting ? <Loader2 className="animate-spin" /> : 'Submit Review'}
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '1rem'
    },
    modal: {
        background: '#18181b',
        borderRadius: '1rem',
        width: '100%',
        maxWidth: '500px',
        padding: '1.5rem',
        border: '1px solid #27272a'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
    },
    title: {
        fontSize: '1.25rem',
        fontWeight: 600,
        color: 'white'
    },
    closeBtn: {
        background: 'transparent',
        border: 'none',
        color: '#a1a1aa',
        cursor: 'pointer'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
    },
    stars: {
        display: 'flex',
        justifyContent: 'center',
        gap: '0.5rem'
    },
    starBtn: {
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '0.25rem',
        transition: 'transform 0.1s'
    },
    textarea: {
        background: '#27272a',
        border: '1px solid #3f3f46',
        borderRadius: '0.5rem',
        padding: '1rem',
        color: 'white',
        minHeight: '120px',
        resize: 'none',
        fontSize: '1rem'
    },
    deployBtn: {
        background: '#F59E0B',
        color: 'black',
        border: 'none',
        padding: '0.75rem',
        borderRadius: '0.5rem',
        fontWeight: 600,
        fontSize: '1rem',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'opacity 0.2s',
        ':disabled': {
            opacity: 0.7,
            cursor: 'not-allowed'
        }
    }
};
