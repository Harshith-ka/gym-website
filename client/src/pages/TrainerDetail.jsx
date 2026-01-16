import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Award, Calendar, Clock, MapPin, Play } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import api from '../services/api';
import ReviewForm from '../components/ReviewForm';

export default function TrainerDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getToken, isSignedIn } = useAuth();

    const [trainer, setTrainer] = useState(null);
    const [availability, setAvailability] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingData, setBookingData] = useState({
        date: '',
        startTime: '',
        duration: 1,
        notes: '',
    });
    const [eligibleBookingId, setEligibleBookingId] = useState(null);

    useEffect(() => {
        fetchTrainerDetails();
    }, [id]);

    const fetchTrainerDetails = async () => {
        try {
            const response = await api.get(`/trainers/${id}`);
            setTrainer(response.data.trainer);
            setAvailability(response.data.availability || []);
            setReviews(response.data.reviews || []);
            setEligibleBookingId(response.data.eligibleBookingId);
        } catch (error) {
            console.error('Error fetching trainer:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = async () => {
        if (!isSignedIn) {
            alert('Please sign in to book a trainer');
            return;
        }

        try {
            const token = await getToken();
            const response = await api.post('/trainers/book', {
                trainerId: id,
                bookingDate: bookingData.date,
                startTime: bookingData.startTime,
                endTime: addHours(bookingData.startTime, bookingData.duration),
                durationHours: bookingData.duration,
                notes: bookingData.notes,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Initialize Razorpay
            const options = {
                key: response.data.razorpayKeyId,
                amount: trainer.hourly_rate * bookingData.duration * 100,
                currency: 'INR',
                name: trainer.name,
                description: `${bookingData.duration} hour training session`,
                order_id: response.data.razorpayOrderId,
                handler: async function (paymentResponse) {
                    await api.post('/trainers/verify-payment', {
                        razorpayOrderId: response.data.razorpayOrderId,
                        razorpayPaymentId: paymentResponse.razorpay_payment_id,
                        razorpaySignature: paymentResponse.razorpay_signature,
                        bookingId: response.data.booking.id,
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    alert('Booking confirmed!');
                    navigate('/dashboard');
                },
                theme: { color: '#8B5CF6' },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error('Booking error:', error);
            alert('Failed to book trainer');
        }
    };

    const addHours = (time, hours) => {
        const [h, m] = time.split(':');
        const newHour = (parseInt(h) + hours) % 24;
        return `${newHour.toString().padStart(2, '0')}:${m}`;
    };

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    if (loading) {
        return (
            <div style={styles.loading}>
                <div className="spinner" />
            </div>
        );
    }

    if (!trainer) {
        return (
            <div className="container" style={styles.error}>
                <h2>Trainer not found</h2>
            </div>
        );
    }

    return (
        <div className="container" style={styles.container}>
            <div style={styles.content}>
                {/* Main Content */}
                <div style={styles.main}>
                    {/* Header */}
                    <div style={styles.header}>
                        <img
                            src={trainer.profile_image || 'https://via.placeholder.com/150'}
                            alt={trainer.name}
                            style={styles.profileImage}
                        />
                        <div style={styles.headerInfo}>
                            <h1 style={styles.name}>{trainer.name}</h1>
                            {trainer.gym_name && (
                                <div style={styles.gymLink}>
                                    <MapPin size={16} />
                                    <span>Based at </span>
                                    <Link to={`/gym/${trainer.gym_id}`} style={styles.link}>
                                        {trainer.gym_name}
                                    </Link>
                                    <span>, {trainer.gym_city}</span>
                                </div>
                            )}
                            <div style={styles.rating}>
                                <Star size={20} fill="#F59E0B" color="#F59E0B" />
                                <span style={styles.ratingText}>{trainer.rating?.toFixed(1) || '0.0'}</span>
                                <span style={styles.reviewCount}>({trainer.total_reviews || 0} reviews)</span>
                            </div>
                            <div style={styles.experience}>
                                <Award size={18} />
                                <span>{trainer.experience_years || 0} years experience</span>
                            </div>
                        </div>
                    </div>

                    {/* Intro Video */}
                    {/* Intro Video */}
                    {trainer.intro_video && (
                        <div className="card" style={styles.section}>
                            <h2 style={styles.sectionTitle}>Introduction Video</h2>
                            <div style={styles.videoContainer}>
                                {trainer.intro_video.includes('youtube.com') || trainer.intro_video.includes('youtu.be') ? (
                                    <iframe
                                        width="100%"
                                        height="315"
                                        src={trainer.intro_video.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                                        title="Trainer Introduction"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        style={{ borderRadius: 'var(--radius-md)' }}
                                    ></iframe>
                                ) : (
                                    <div style={styles.videoPlaceholder}>
                                        <Play size={48} color="var(--primary)" />
                                        <a href={trainer.intro_video} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                                            Watch Introduction Video
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* About */}
                    <div className="card" style={styles.section}>
                        <h2 style={styles.sectionTitle}>About</h2>
                        <p style={styles.bio}>{trainer.bio || 'No bio available.'}</p>
                    </div>

                    {/* Specializations */}
                    <div className="card" style={styles.section}>
                        <h2 style={styles.sectionTitle}>Specializations</h2>
                        <div style={styles.specializations}>
                            {trainer.specializations?.map((spec) => (
                                <span key={spec} className="badge badge-primary">
                                    {spec.replace('_', ' ').toUpperCase()}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Certifications */}
                    {trainer.certifications && trainer.certifications.length > 0 && (
                        <div className="card" style={styles.section}>
                            <h2 style={styles.sectionTitle}>Certifications</h2>
                            <ul style={styles.certList}>
                                {trainer.certifications.map((cert, idx) => (
                                    <li key={idx}>{cert}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Availability */}
                    <div className="card" style={styles.section}>
                        <h2 style={styles.sectionTitle}>Availability</h2>
                        {availability.length === 0 ? (
                            <p style={styles.noAvailability}>No availability set</p>
                        ) : (
                            <div style={styles.availabilityList}>
                                {availability.map((slot) => (
                                    <div key={slot.id} style={styles.availabilityItem}>
                                        <span style={styles.day}>{dayNames[slot.day_of_week]}</span>
                                        <span style={styles.time}>
                                            {slot.start_time} - {slot.end_time}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Reviews */}
                    <div className="card" style={styles.section}>
                        <h2 style={styles.sectionTitle}>Reviews</h2>
                        {reviews.length === 0 ? (
                            <p style={styles.noReviews}>No reviews yet</p>
                        ) : (
                            <div style={styles.reviews}>
                                {reviews.map((review) => (
                                    <div key={review.id} style={styles.reviewCard}>
                                        <div style={styles.reviewHeader}>
                                            <div style={styles.reviewUser}>
                                                <img
                                                    src={review.user_image || 'https://via.placeholder.com/40'}
                                                    alt={review.user_name}
                                                    style={styles.reviewAvatar}
                                                />
                                                <div>
                                                    <div style={styles.reviewName}>{review.user_name}</div>
                                                    <div style={styles.reviewRating}>
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                size={14}
                                                                fill={i < review.rating ? '#F59E0B' : 'none'}
                                                                color="#F59E0B"
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <p style={styles.reviewComment}>{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div style={{ marginTop: '2rem' }}>
                            {eligibleBookingId ? (
                                <ReviewForm
                                    trainerId={trainer.id}
                                    trainerBookingId={eligibleBookingId}
                                    onSuccess={fetchTrainerDetails}
                                />
                            ) : (
                                <div className="card" style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--bg-secondary)' }}>
                                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                                        {isSignedIn ? 'You can review this trainer after your session.' : 'Sign in to review trainers you have trained with.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <aside style={styles.sidebar}>
                    <div className="card" style={styles.bookingCard}>
                        <div style={styles.price}>
                            <span style={styles.priceLabel}>Hourly Rate</span>
                            <span style={styles.priceValue}>₹{trainer.hourly_rate || 0}</span>
                        </div>

                        <div style={styles.bookingForm}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    <Calendar size={16} />
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={bookingData.date}
                                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="input"
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    <Clock size={16} />
                                    Start Time
                                </label>
                                <input
                                    type="time"
                                    value={bookingData.startTime}
                                    onChange={(e) => setBookingData({ ...bookingData, startTime: e.target.value })}
                                    className="input"
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Duration (hours)</label>
                                <select
                                    value={bookingData.duration}
                                    onChange={(e) => setBookingData({ ...bookingData, duration: parseInt(e.target.value) })}
                                    className="input"
                                >
                                    <option value="1">1 hour</option>
                                    <option value="2">2 hours</option>
                                    <option value="3">3 hours</option>
                                </select>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Notes (optional)</label>
                                <textarea
                                    value={bookingData.notes}
                                    onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                                    className="input"
                                    rows="3"
                                    placeholder="Any specific requirements..."
                                />
                            </div>

                            <div style={styles.total}>
                                <span>Total</span>
                                <span style={styles.totalAmount}>
                                    ₹{(trainer.hourly_rate || 0) * bookingData.duration}
                                </span>
                            </div>

                            <button
                                onClick={handleBooking}
                                disabled={!bookingData.date || !bookingData.startTime}
                                className="btn btn-primary"
                                style={{ width: '100%' }}
                            >
                                Book Session
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

const styles = {
    container: {
        paddingTop: '2rem',
        paddingBottom: '4rem',
    },
    content: {
        display: 'grid',
        gridTemplateColumns: '1fr 400px',
        gap: '2rem',
    },
    main: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    header: {
        display: 'flex',
        gap: '2rem',
        alignItems: 'flex-start',
    },
    profileImage: {
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        objectFit: 'cover',
    },
    headerInfo: {
        flex: 1,
    },
    name: {
        fontSize: '2rem',
        fontWeight: 700,
        marginBottom: '0.25rem',
    },
    gymLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: 'var(--text-secondary)',
        marginBottom: '0.75rem',
        fontSize: '0.95rem',
    },
    link: {
        color: 'var(--primary)',
        textDecoration: 'none',
        fontWeight: 600,
    },
    rating: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.5rem',
    },
    ratingText: {
        fontSize: '1.125rem',
        fontWeight: 600,
    },
    reviewCount: {
        color: 'var(--text-secondary)',
    },
    experience: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: 'var(--text-secondary)',
    },
    section: {
        padding: '1.5rem',
    },
    sectionTitle: {
        fontSize: '1.25rem',
        fontWeight: 600,
        marginBottom: '1rem',
    },
    videoContainer: {
        width: '100%',
        aspectRatio: '16/9',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        background: '#000',
    },
    videoPlaceholder: {
        height: '100%',
        width: '100%',
        background: 'var(--bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
    },
    bio: {
        lineHeight: 1.8,
        color: 'var(--text-secondary)',
    },
    specializations: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
    },
    certList: {
        listStyle: 'disc',
        paddingLeft: '1.5rem',
        lineHeight: 2,
    },
    availabilityList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    availabilityItem: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0.75rem',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
    },
    day: {
        fontWeight: 600,
    },
    time: {
        color: 'var(--text-secondary)',
    },
    noAvailability: {
        color: 'var(--text-secondary)',
        textAlign: 'center',
        padding: '2rem',
    },
    reviews: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    reviewCard: {
        padding: '1rem',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
    },
    reviewHeader: {
        marginBottom: '0.75rem',
    },
    reviewUser: {
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'center',
    },
    reviewAvatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
    },
    reviewName: {
        fontWeight: 600,
        marginBottom: '0.25rem',
    },
    reviewRating: {
        display: 'flex',
        gap: '0.25rem',
    },
    reviewComment: {
        fontSize: '0.875rem',
        lineHeight: 1.6,
    },
    noReviews: {
        color: 'var(--text-secondary)',
        textAlign: 'center',
        padding: '2rem',
    },
    sidebar: {
        position: 'sticky',
        top: '100px',
        height: 'fit-content',
    },
    bookingCard: {
        padding: '1.5rem',
    },
    price: {
        textAlign: 'center',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid var(--border)',
        marginBottom: '1.5rem',
    },
    priceLabel: {
        display: 'block',
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
        marginBottom: '0.5rem',
    },
    priceValue: {
        display: 'block',
        fontSize: '2rem',
        fontWeight: 700,
        color: 'var(--primary)',
    },
    bookingForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    label: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontWeight: 600,
        fontSize: '0.875rem',
    },
    total: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 0',
        borderTop: '1px solid var(--border)',
        fontWeight: 600,
    },
    totalAmount: {
        fontSize: '1.5rem',
        color: 'var(--primary)',
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
    },
    error: {
        textAlign: 'center',
        padding: '4rem 0',
    },
};
