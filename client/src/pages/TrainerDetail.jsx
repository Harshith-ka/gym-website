import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, Award, Calendar, Clock, MapPin, Play, CheckCircle2, ChevronLeft, ShieldCheck, Heart, Share2, Info } from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';
import api from '../services/api';
import ReviewForm from '../components/ReviewForm';

export default function TrainerDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getToken, isSignedIn } = useAuth();
    const { user } = useUser();

    const [trainer, setTrainer] = useState(null);
    const [availability, setAvailability] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
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
                    try {
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
                    } catch (error) {
                        console.error('Payment verification failed:', error);
                        const errorMsg = error.response?.data?.error || 'Payment verification failed.';
                        alert(`${errorMsg}\n\nNote: If you are using an international card, please ensure "International Payments" is enabled in the gym's Razorpay dashboard.`);
                    }
                },
                prefill: {
                    ...(user?.fullName || user?.firstName ? { name: user.fullName || user.firstName } : {}),
                    ...(user?.primaryEmailAddress?.emailAddress ? { email: user.primaryEmailAddress.emailAddress } : {}),
                    ...(user?.primaryPhoneNumber?.phoneNumber ? { contact: user.primaryPhoneNumber.phoneNumber } : {})
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
                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading trainer profile...</p>
            </div>
        );
    }

    if (!trainer) {
        return (
            <div className="container" style={styles.error}>
                <div style={styles.errorCard}>
                    <h2>Trainer profile not found</h2>
                    <p>The profile you're looking for might have been moved or doesn't exist.</p>
                    <Link to="/trainers" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                        Back to Trainers
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.pageWrapper}>
            {/* Navigation Header */}
            <div style={styles.navHeader}>
                <div className="container" style={styles.navContent}>
                    <Link to="/trainers" style={styles.backLink}>
                        <ChevronLeft size={20} />
                        <span>Back to Trainers</span>
                    </Link>
                    <div style={styles.navActions}>
                        <button style={styles.iconBtn}><Heart size={20} /></button>
                        <button style={styles.iconBtn}><Share2 size={20} /></button>
                    </div>
                </div>
            </div>

            <div className="container" style={styles.layout}>
                {/* Main Content Side */}
                <div style={styles.mainContent}>
                    {/* Hero Section */}
                    <section style={styles.heroSection}>
                        <div style={styles.headerLayout}>
                            <div style={styles.profileImageWrapper}>
                                <img
                                    src={trainer.profile_image || 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=800'}
                                    alt={trainer.name}
                                    style={styles.profileImage}
                                />
                                {trainer.is_premium && (
                                    <div style={styles.eliteBadge}>
                                        <Award size={14} fill="currentColor" />
                                        <span>ELITE</span>
                                    </div>
                                )}
                            </div>
                            <div style={styles.headerInfo}>
                                <div style={styles.nameRow}>
                                    <h1 style={styles.name}>{trainer.name}</h1>
                                    <div style={styles.verifiedBadge}>
                                        <ShieldCheck size={18} fill="var(--accent)" color="#fff" />
                                        <span>Verified Professional</span>
                                    </div>
                                </div>

                                {trainer.gym_name && (
                                    <div style={styles.gymLink}>
                                        <MapPin size={16} />
                                        <span>Senior Trainer at </span>
                                        <Link to={`/gym/${trainer.gym_id}`} style={styles.link}>
                                            {trainer.gym_name}
                                        </Link>
                                        <span style={{ color: 'var(--text-tertiary)' }}> • {trainer.gym_city}</span>
                                    </div>
                                )}

                                <div style={styles.statsRow}>
                                    <div style={styles.statItem}>
                                        <div style={styles.statValue}>
                                            <Star size={18} fill="var(--accent)" color="var(--accent)" />
                                            <span>{trainer.rating ? Number(trainer.rating).toFixed(1) : '5.0'}</span>
                                        </div>
                                        <div style={styles.statLabel}>{trainer.total_reviews || 0} Client Reviews</div>
                                    </div>
                                    <div style={styles.statDivider} />
                                    <div style={styles.statItem}>
                                        <div style={styles.statValue}>
                                            <Award size={18} color="var(--accent)" />
                                            <span>{trainer.experience_years || 0} Years</span>
                                        </div>
                                        <div style={styles.statLabel}>Pro Experience</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* About Section */}
                    <section className="card" style={styles.section}>
                        <div style={styles.sectionHeader}>
                            <Info size={20} color="var(--accent)" />
                            <h2 style={styles.sectionTitle}>Expertise & Bio</h2>
                        </div>
                        <p style={styles.bio}>{trainer.bio || `${trainer.name} is a dedicated fitness professional with a focus on delivering transformative results. With years of experience in personal training, they combine technical knowledge with personalized motivation to help clients surpass their fitness milestones.`}</p>

                        <div style={styles.specializationGrid}>
                            {trainer.specializations?.map((spec) => (
                                <div key={spec} style={styles.specItem}>
                                    <CheckCircle2 size={16} color="var(--accent)" />
                                    <span>{spec.replace('_', ' ')}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Video Section */}
                    {trainer.intro_video && (
                        <section className="card" style={styles.section}>
                            <div style={styles.sectionHeader}>
                                <Play size={20} color="var(--accent)" />
                                <h2 style={styles.sectionTitle}>Introduction Video</h2>
                            </div>
                            <div style={styles.videoContainer}>
                                {trainer.intro_video.includes('youtube.com') || trainer.intro_video.includes('youtu.be') ? (
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={trainer.intro_video.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                                        title="Trainer Introduction"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        style={{ border: 'none' }}
                                    ></iframe>
                                ) : (
                                    <div style={styles.videoPlaceholder}>
                                        <div style={styles.videoPlayBtn}>
                                            <Play size={32} fill="currentColor" />
                                        </div>
                                        <p>Watch Introduction</p>
                                        <a href={trainer.intro_video} target="_blank" rel="noopener noreferrer" style={styles.videoLink}>
                                            Open external video link
                                        </a>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Certifications */}
                    {trainer.certifications && trainer.certifications.length > 0 && (
                        <section className="card" style={styles.section}>
                            <div style={styles.sectionHeader}>
                                <Award size={20} color="var(--accent)" />
                                <h2 style={styles.sectionTitle}>Certifications</h2>
                            </div>
                            <div style={styles.certGrid}>
                                {trainer.certifications.map((cert, idx) => (
                                    <div key={idx} style={styles.certItem}>
                                        <CheckCircle2 size={16} color="var(--accent)" />
                                        <span>{cert}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Availability */}
                    <section className="card" style={styles.section}>
                        <div style={styles.sectionHeader}>
                            <Clock size={20} color="var(--accent)" />
                            <h2 style={styles.sectionTitle}>Working Hours</h2>
                        </div>
                        {availability.length === 0 ? (
                            <p style={styles.noData}>No availability schedule provided yet.</p>
                        ) : (
                            <div style={styles.availabilityGrid}>
                                {availability.map((slot) => (
                                    <div key={slot.id} style={styles.availabilityCard}>
                                        <span style={styles.availDay}>{dayNames[slot.day_of_week]}</span>
                                        <div style={styles.availTime}>
                                            <Clock size={14} />
                                            <span>{slot.start_time} - {slot.end_time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Reviews */}
                    <section className="card" style={styles.section}>
                        <div style={styles.sectionHeader}>
                            <Star size={20} color="var(--accent)" />
                            <h2 style={styles.sectionTitle}>Client Feedback</h2>
                        </div>
                        {reviews.length === 0 ? (
                            <div style={styles.emptyReviews}>
                                <p>Be the first to train with {trainer.name} and leave a review!</p>
                            </div>
                        ) : (
                            <div style={styles.reviewList}>
                                {reviews.map((review) => (
                                    <div key={review.id} style={styles.reviewItem}>
                                        <div style={styles.reviewUser}>
                                            <img
                                                src={review.user_image || 'https://via.placeholder.com/40'}
                                                alt={review.user_name}
                                                style={styles.reviewAvatar}
                                            />
                                            <div style={styles.reviewUserInfo}>
                                                <div style={styles.reviewName}>{review.user_name}</div>
                                                <div style={styles.reviewStars}>
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={12}
                                                            fill={i < review.rating ? 'var(--accent)' : 'none'}
                                                            color="var(--accent)"
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <p style={styles.reviewText}>{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ marginTop: '2.5rem' }}>
                            {eligibleBookingId ? (
                                <ReviewForm
                                    trainerId={trainer.id}
                                    trainerBookingId={eligibleBookingId}
                                    onSuccess={fetchTrainerDetails}
                                />
                            ) : (
                                <div style={styles.reviewNotice}>
                                    <span style={{ fontSize: '0.9rem' }}>
                                        {isSignedIn ? 'Reviews are only available for confirmed clients after a session.' : 'Please sign in to provide feedback.'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar Booking Side */}
                <aside style={styles.sidebar}>
                    <div className="card" style={styles.bookingCard}>
                        <div style={styles.bookingPricing}>
                            <span style={styles.pricingLabel}>Session Rate</span>
                            <div style={styles.pricingValue}>
                                <span>₹{trainer.hourly_rate || 0}</span>
                                <span style={styles.pricingUnit}>/ hr</span>
                            </div>
                        </div>

                        <div style={styles.bookingForm}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    <Calendar size={16} />
                                    <span>Session Date</span>
                                </label>
                                <input
                                    type="date"
                                    value={bookingData.date}
                                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    <Clock size={16} />
                                    <span>Start Time</span>
                                </label>
                                <input
                                    type="time"
                                    value={bookingData.startTime}
                                    onChange={(e) => setBookingData({ ...bookingData, startTime: e.target.value })}
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Duration (Hours)</label>
                                <div style={styles.durationSelector}>
                                    {[1, 2, 3].map(h => (
                                        <button
                                            key={h}
                                            onClick={() => setBookingData({ ...bookingData, duration: h })}
                                            style={{
                                                ...styles.durationBtn,
                                                ...(bookingData.duration === h ? styles.durationBtnActive : {})
                                            }}
                                        >
                                            {h}h
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Notes or Goals</label>
                                <textarea
                                    value={bookingData.notes}
                                    onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                                    style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }}
                                    placeholder="Tell the trainer about your fitness goals..."
                                />
                            </div>

                            <div style={styles.summaryTable}>
                                <div style={styles.summaryRow}>
                                    <span>Rate</span>
                                    <span>₹{trainer.hourly_rate || 0} x {bookingData.duration}h</span>
                                </div>
                                <div style={{ ...styles.summaryRow, color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.25rem', marginTop: '0.5rem' }}>
                                    <span>Total</span>
                                    <span>₹{(trainer.hourly_rate || 0) * bookingData.duration}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleBooking}
                                disabled={!bookingData.date || !bookingData.startTime}
                                className="btn btn-primary"
                                style={styles.bookBtn}
                            >
                                <Calendar size={18} />
                                Reserve Session
                            </button>

                            <p style={styles.bookingFineprint}>
                                Secure payment via Razorpay. Cancellations allowed up to 12h before start.
                            </p>
                        </div>
                    </div>

                    <div style={styles.helpCard}>
                        <Info size={16} color="var(--accent)" />
                        <p>Have questions? Chat with our support team for help choosing the right trainer.</p>
                    </div>
                </aside>
            </div>
        </div>
    );
}

const styles = {
    pageWrapper: {
        background: 'var(--bg-primary)',
        minHeight: '100vh',
        color: 'var(--text-primary)',
    },
    navHeader: {
        background: 'rgba(0,0,0,0.3)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)',
        padding: '1.5rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 10,
    },
    navContent: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: 'var(--text-secondary)',
        fontWeight: 600,
        fontSize: '0.9rem',
        transition: 'color 0.2s ease',
    },
    navActions: {
        display: 'flex',
        gap: '1rem',
    },
    iconBtn: {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid var(--border)',
        borderRadius: '0.75rem',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'var(--text-secondary)',
        transition: 'all 0.2s ease',
    },
    layout: {
        display: 'grid',
        gridTemplateColumns: '1fr 400px',
        gap: '3rem',
        paddingTop: '3rem',
        paddingBottom: '5rem',
    },
    mainContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
    },
    heroSection: {
        marginBottom: '1rem',
    },
    headerLayout: {
        display: 'flex',
        gap: '2.5rem',
        alignItems: 'flex-start',
    },
    profileImageWrapper: {
        position: 'relative',
        width: '200px',
        height: '200px',
        flexShrink: 0,
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: '2rem',
        objectFit: 'cover',
        border: '4px solid var(--bg-secondary)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
    },
    eliteBadge: {
        position: 'absolute',
        bottom: '-10px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--accent)',
        color: '#fff',
        padding: '0.4rem 1rem',
        borderRadius: '0.75rem',
        fontSize: '0.75rem',
        fontWeight: 800,
        letterSpacing: '0.1em',
        boxShadow: '0 5px 15px rgba(139, 92, 246, 0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
    },
    headerInfo: {
        flex: 1,
        paddingTop: '0.5rem',
    },
    nameRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        flexWrap: 'wrap',
        marginBottom: '0.5rem',
    },
    name: {
        fontSize: '3rem',
        fontWeight: 800,
        margin: 0,
        letterSpacing: '-0.02em',
    },
    verifiedBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'rgba(139, 92, 246, 0.1)',
        color: 'var(--accent)',
        padding: '0.5rem 1rem',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.85rem',
        fontWeight: 700,
    },
    gymLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        color: 'var(--text-secondary)',
        marginBottom: '2rem',
        fontSize: '1rem',
    },
    link: {
        color: 'var(--text-primary)',
        textDecoration: 'none',
        fontWeight: 700,
        borderBottom: '2px solid var(--accent)',
    },
    statsRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '3rem',
    },
    statItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
    },
    statValue: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '1.5rem',
        fontWeight: 800,
    },
    statLabel: {
        fontSize: '0.85rem',
        color: 'var(--text-tertiary)',
        fontWeight: 600,
        textTransform: 'uppercase',
    },
    statDivider: {
        width: '1px',
        height: '40px',
        background: 'var(--border)',
    },
    section: {
        padding: '2.5rem',
        border: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(255,255,255,0.02)',
    },
    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.8rem',
    },
    sectionTitle: {
        fontSize: '1.5rem',
        fontWeight: 700,
        margin: 0,
    },
    bio: {
        fontSize: '1.1rem',
        lineHeight: 1.8,
        color: 'var(--text-secondary)',
        marginBottom: '2rem',
    },
    specializationGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1rem',
    },
    specItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1rem',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '1rem',
        fontSize: '0.95rem',
        fontWeight: 600,
        textTransform: 'capitalize',
    },
    videoContainer: {
        aspectRatio: '16/9',
        borderRadius: '1.5rem',
        overflow: 'hidden',
        background: '#000',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    },
    videoPlaceholder: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        background: 'linear-gradient(135deg, #111, #222)',
    },
    videoPlayBtn: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'var(--accent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
    },
    videoLink: {
        color: 'var(--text-tertiary)',
        fontSize: '0.85rem',
        textDecoration: 'underline',
    },
    certGrid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    certItem: {
        padding: '0.8rem 1.2rem',
        background: 'rgba(139, 92, 246, 0.05)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.9rem',
        fontWeight: 600,
    },
    availabilityGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '1.25rem',
    },
    availabilityCard: {
        padding: '1.25rem',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '1.25rem',
        border: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    availDay: {
        fontSize: '1rem',
        fontWeight: 800,
    },
    availTime: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.85rem',
        color: 'var(--text-tertiary)',
    },
    reviewList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    reviewItem: {
        padding: '1.5rem',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '1.5rem',
    },
    reviewUser: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        marginBottom: '1rem',
    },
    reviewAvatar: {
        width: '48px',
        height: '48px',
        borderRadius: '1rem',
        objectFit: 'cover',
    },
    reviewUserInfo: {
        display: 'flex',
        flexDirection: 'column',
    },
    reviewName: {
        fontWeight: 700,
        fontSize: '1rem',
    },
    reviewStars: {
        display: 'flex',
        gap: '2px',
    },
    reviewText: {
        fontSize: '0.95rem',
        lineHeight: 1.6,
        color: 'var(--text-secondary)',
    },
    reviewNotice: {
        padding: '1.5rem',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '1.25rem',
        textAlign: 'center',
        color: 'var(--text-tertiary)',
        border: '1px dashed var(--border)',
    },
    sidebar: {
        position: 'sticky',
        top: '120px',
        height: 'fit-content',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    bookingCard: {
        padding: '2.5rem',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
    },
    bookingPricing: {
        marginBottom: '2.5rem',
        textAlign: 'center',
    },
    pricingLabel: {
        fontSize: '0.85rem',
        color: 'var(--text-tertiary)',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        display: 'block',
        marginBottom: '0.5rem',
    },
    pricingValue: {
        fontSize: '2.5rem',
        fontWeight: 800,
        color: 'var(--accent)',
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'center',
        gap: '0.4rem',
    },
    pricingUnit: {
        fontSize: '1rem',
        color: 'var(--text-secondary)',
        fontWeight: 600,
    },
    bookingForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    label: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.9rem',
        fontWeight: 700,
    },
    input: {
        width: '100%',
        padding: '1rem',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border)',
        borderRadius: '0.75rem',
        color: '#fff',
        fontSize: '1rem',
    },
    durationSelector: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.5rem',
    },
    durationBtn: {
        padding: '0.8rem',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border)',
        borderRadius: '0.75rem',
        color: 'var(--text-secondary)',
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    durationBtnActive: {
        background: 'var(--accent)',
        borderColor: 'var(--accent)',
        color: '#fff',
    },
    summaryTable: {
        padding: '1.5rem 0',
        borderTop: '1px solid var(--border)',
        marginTop: '0.5rem',
    },
    summaryRow: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.95rem',
        color: 'var(--text-secondary)',
        marginBottom: '0.5rem',
    },
    bookBtn: {
        width: '100%',
        padding: '1.25rem',
        fontSize: '1.1rem',
        gap: '0.75rem',
        boxShadow: '0 10px 20px rgba(139, 92, 246, 0.3)',
    },
    bookingFineprint: {
        fontSize: '0.75rem',
        color: 'var(--text-tertiary)',
        textAlign: 'center',
        lineHeight: 1.5,
    },
    helpCard: {
        padding: '1.5rem',
        background: 'rgba(139, 92, 246, 0.05)',
        borderRadius: '1.5rem',
        border: '1px solid rgba(139, 92, 246, 0.1)',
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-start',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
    },
    loading: {
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    error: {
        height: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorCard: {
        textAlign: 'center',
        maxWidth: '400px',
    }
};
