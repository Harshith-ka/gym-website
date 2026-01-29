import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MapPin, Star, Phone, Mail, Clock, Heart, Play, Video, ChevronRight, Check, Share2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import ReviewForm from '../components/ReviewForm';
import GymMap from '../components/GymMap';
import AuthModal from '../components/AuthModal';

export default function GymDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const getToken = async () => {
        if (!user) return null;
        return await user.getIdToken();
    };
    const isSignedIn = !!user;
    const [gym, setGym] = useState(null);
    const [services, setServices] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedService, setSelectedService] = useState('');
    const [ratingDistribution, setRatingDistribution] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
    const [eligibleBookingId, setEligibleBookingId] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [pendingBookingUrl, setPendingBookingUrl] = useState(null);
    const navigate = useNavigate();

    const categoriesList = [
        { id: 'workout', label: 'Workout / Strength Training' },
        { id: 'dance', label: 'Dance' },
        { id: 'zumba', label: 'Zumba' },
        { id: 'yoga', label: 'Yoga' },
        { id: 'badminton', label: 'Badminton / Indoor Sports' },
        { id: 'crossfit', label: 'CrossFit / Functional Training' }
    ];

    // Helper for rating distribution
    const getRatingDistribution = () => {
        if (!gym?.total_reviews || gym.total_reviews === 0) return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        const dist = { ...ratingDistribution };
        const percentages = {};
        [5, 4, 3, 2, 1].forEach(rating => {
            percentages[rating] = Math.round((dist[rating] / gym.total_reviews) * 100);
        });
        return percentages;
    };

    useEffect(() => {
        fetchGymDetails();
    }, [id]);

    const fetchGymDetails = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await api.get(`/gyms/${id}`, { headers });

            setGym(response.data.gym);
            setServices(response.data.services || []);
            setTrainers(response.data.trainers || []);
            setReviews(response.data.reviews || []);
            setEligibleBookingId(response.data.eligibleBookingId);
            if (response.data.ratingDistribution) {
                setRatingDistribution(response.data.ratingDistribution);
            }
            if (response.data.services?.length > 0) {
                setSelectedService(response.data.services[0].id);
            }
        } catch (error) {
            console.error('Error fetching gym details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBookingClick = (e, targetUrl) => {
        e.preventDefault();
        if (isSignedIn) {
            navigate(targetUrl);
        } else {
            setPendingBookingUrl(targetUrl);
            setShowAuthModal(true);
        }
    };

    const handleAuthSuccess = () => {
        if (pendingBookingUrl) {
            navigate(pendingBookingUrl);
            setPendingBookingUrl(null);
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: gym.name,
            text: `Check out ${gym.name} - ${gym.description?.substring(0, 100) || 'Premium fitness facility'}`,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
            }
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    if (loading) {
        return (
            <div style={styles.loading}>
                <div className="spinner" />
            </div>
        );
    }

    if (!gym) {
        return (
            <div className="container" style={styles.error}>
                <h2>Gym not found</h2>
                <Link to="/explore" className="btn btn-primary">
                    Back to Explore
                </Link>
            </div>
        );
    }

    const images = gym.images && gym.images.length > 0 ? gym.images : [
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1470&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1469&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1470&auto=format&fit=crop',
    ];

    const distribution = getRatingDistribution();

    return (
        <div className="container" style={styles.container}>
            {/* Breadcrumbs */}
            <nav style={styles.breadcrumbs}>
                <Link to="/" style={styles.breadcrumbLink}>Home</Link>
                <span style={styles.breadcrumbSep}>/</span>
                <Link to="/explore" style={styles.breadcrumbLink}>Gyms</Link>
                <span style={styles.breadcrumbSep}>/</span>
                <span style={styles.breadcrumbActive}>{gym.name}</span>
            </nav>

            {/* Header */}
            <header className="gym-detail-header" style={styles.header}>
                <div style={styles.headerLeft}>
                    <h1 style={styles.title}>{gym.name}</h1>
                    <div style={styles.metaRow}>
                        <div style={styles.metaItem}>
                            <MapPin size={16} />
                            <span>{gym.address}, {gym.city}</span>
                        </div>
                        <span style={styles.dot}>•</span>
                        <div style={{ ...styles.metaItem, color: 'var(--primary)' }}>
                            <Clock size={16} />
                            <span>Open Today</span>
                        </div>
                    </div>
                </div>
                <div style={styles.headerRight}>
                    <button className="btn btn-outline" style={styles.actionBtn}>
                        <Heart size={20} />
                        <span className="hide-mobile">Save</span>
                    </button>
                    <button onClick={handleShare} className="btn btn-outline" style={styles.actionBtn}>
                        <Share2 size={20} />
                        <span className="hide-mobile">Share</span>
                    </button>
                </div>
            </header>

            {/* Media Gallery */}
            <div className="gym-detail-image-grid" style={styles.imageGrid}>
                <div style={styles.heroImageContainer}>
                    {gym.videos && gym.videos.length > 0 ? (
                        <div style={{ position: 'relative', height: '100%' }}>
                            <video
                                src={gym.videos[0]}
                                style={styles.heroImage}
                                autoPlay
                                muted
                                loop
                            />
                            <div style={styles.videoBadge}>
                                <Video size={16} /> Live Tour
                            </div>
                        </div>
                    ) : (
                        <img src={images[0]} alt={gym.name} style={styles.heroImage} />
                    )}
                </div>
                <div style={styles.subImages}>
                    {images.slice(1, 5).map((img, idx) => (
                        <div key={idx} style={styles.subImageContainer}>
                            <img src={img} alt={`${gym.name} ${idx + 2}`} style={styles.subImage} />
                            {idx === 3 && images.length > 5 && (
                                <div style={styles.viewAllOverlay}>
                                    <button style={styles.viewAllBtn}>+{images.length - 4} Photos</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="gym-detail-layout" style={styles.layout}>
                {/* Left Column */}
                <div style={styles.leftColumn}>
                    {/* About */}
                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>About {gym.name}</h2>
                        <p style={styles.description}>{gym.description || 'Welcome to our premium fitness facility. We offer state-of-the-art equipment and a supportive community.'}</p>

                        {gym.categories && (
                            <div style={styles.tags}>
                                {gym.categories.map(catId => {
                                    const catLabel = categoriesList.find(c => c.id === catId)?.label || catId.replace('_', ' ');
                                    return <span key={catId} style={styles.tag}>{catLabel}</span>;
                                })}
                            </div>
                        )}
                    </section>

                    <hr style={styles.divider} />

                    {/* Facilities */}
                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>What this place offers</h2>
                        <div style={styles.facilitiesGrid}>
                            {gym.facilities && gym.facilities.length > 0 ? gym.facilities.map((facility, idx) => (
                                <div key={idx} style={styles.facilityItem}>
                                    <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '20px' }}>check_circle</span>
                                    <span>{facility}</span>
                                </div>
                            )) : (
                                <p style={styles.textSecondary}>No specific facilities listed.</p>
                            )}
                        </div>
                    </section>

                    <hr style={styles.divider} />

                    {/* Location & Map */}
                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>Location</h2>
                        <div style={{ height: '400px', width: '100%' }}>
                            {gym.latitude && gym.longitude ? (
                                <GymMap
                                    latitude={gym.latitude}
                                    longitude={gym.longitude}
                                    name={gym.name}
                                />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                                    <MapPin size={32} color="#a1a1aa" />
                                    <p style={{ color: '#a1a1aa' }}>Location coordinates not available</p>
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '1rem' }}>
                            <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                <MapPin size={16} /> {gym.address}, {gym.city}, {gym.state} {gym.pincode}
                            </p>
                            {gym.latitude && gym.longitude && (
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${gym.latitude},${gym.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={styles.mapLink}
                                >
                                    Open in Google Maps
                                </a>
                            )}
                        </div>
                    </section>

                    <hr style={styles.divider} />

                    {/* Services / Pricing */}
                    <section style={styles.section}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ ...styles.sectionTitle, marginBottom: 0 }}>Pricing & Plans</h2>
                        </div>

                        <div style={styles.pricingGrid}>
                            {services.map(service => (
                                <div key={service.id} style={{
                                    ...styles.pricingCard,
                                    border: service.name.toLowerCase().includes('pack') ? '2px solid var(--primary)' : '1px solid var(--border)'
                                }}>
                                    {service.name.toLowerCase().includes('pack') && (
                                        <div style={styles.bestValueBadge}>Best Value</div>
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <h3 style={styles.planName}>{service.name}</h3>
                                            {service.service_type === 'pass' && <span style={styles.planBadge}>Flexible</span>}
                                        </div>
                                        <p style={styles.planDesc}>{service.description || 'Access to gym facilities.'}</p>
                                        <div style={styles.planPriceRow}>
                                            <span style={styles.planPrice}>₹{service.price}</span>
                                            <span style={styles.planPeriod}>/ {service.duration_days ? `${service.duration_days} days` : 'session'}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => handleBookingClick(e, `/booking/${gym.id}?service=${service.id}`)}
                                        style={{
                                            ...styles.planBtn,
                                            background: service.name.toLowerCase().includes('pack') ? 'var(--primary)' : 'var(--background-light)',
                                            color: service.name.toLowerCase().includes('pack') ? 'var(--text-main)' : 'var(--primary)',
                                            border: 'none',
                                            width: '100%',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Select
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    <hr style={styles.divider} />

                    {/* Trainers */}
                    {trainers.length > 0 && (
                        <section style={styles.section}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ ...styles.sectionTitle, marginBottom: 0 }}>Expert Trainers</h2>
                                <Link to="/trainers" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>View All</Link>
                            </div>
                            <div style={styles.trainersScroll}>
                                {trainers.map(trainer => (
                                    <Link key={trainer.id} to={`/trainer/${trainer.id}`} style={styles.trainerScrollCard}>
                                        <div style={styles.trainerImgContainer}>
                                            <img src={trainer.profile_image || 'https://via.placeholder.com/200'} alt={trainer.name} style={styles.trainerScrollImg} />
                                            {trainer.rating > 0 && (
                                                <div style={styles.trainerRatingBadge}>
                                                    <Star size={12} fill="#F59E0B" color="#F59E0B" />
                                                    <span>{Number(trainer.rating).toFixed(1)}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ marginTop: '0.75rem' }}>
                                            <h3 style={styles.trainerName}>{trainer.name}</h3>
                                            <p style={styles.textSecondary}>
                                                {trainer.specializations && trainer.specializations.length > 0
                                                    ? trainer.specializations[0].replace('_', ' ')
                                                    : 'Fitness Coach'}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    <hr style={styles.divider} />

                    {/* Reviews */}
                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>Reviews</h2>
                        {/* Summary */}
                        <div className="gym-detail-review-summary" style={styles.reviewSummary}>
                            <div style={{ textAlign: 'center', paddingRight: '2rem', borderRight: '1px solid var(--border)' }}>
                                <div style={styles.bigRating}>{gym.rating ? Number(gym.rating).toFixed(1) : '0.0'}</div>
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star key={star} size={20} fill={star <= (gym.rating || 0) ? '#F59E0B' : '#e5e7eb'} color="none" />
                                    ))}
                                </div>
                                <div style={styles.textSecondary}>{gym.total_reviews || 0} reviews</div>
                            </div>
                            <div style={{ flex: 1, paddingLeft: '2rem' }}>
                                {[5, 4, 3, 2, 1].map(num => (
                                    <div key={num} style={styles.ratingBarRow}>
                                        <span style={{ fontWeight: 'bold', width: '20px' }}>{num}</span>
                                        <div style={styles.barTrack}>
                                            <div style={{ ...styles.barFill, width: `${distribution[num]}%` }} />
                                        </div>
                                        <span style={styles.textSecondary}>{distribution[num]}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Reviews List */}
                        <div style={styles.reviewList}>
                            {reviews.length > 0 ? reviews.map(review => (
                                <div key={review.id} style={styles.reviewItem}>
                                    <div style={styles.reviewHeader}>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <img src={review.user_image || 'https://via.placeholder.com/40'} alt="User" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                                            <div>
                                                <h4 style={{ fontWeight: 600 }}>{review.user_name}</h4>
                                                <div style={styles.textSecondary}>{new Date(review.created_at).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        {review.is_verified && <span className="badge badge-success">Verified</span>}
                                    </div>
                                    <div style={{ display: 'flex', gap: 2, marginBottom: '0.5rem' }}>
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} fill={i < review.rating ? '#F59E0B' : 'transparent'} color={i < review.rating ? '#F59E0B' : '#d1d5db'} />
                                        ))}
                                    </div>
                                    <p style={{ lineHeight: 1.6, color: 'var(--text-secondary)' }}>{review.comment}</p>
                                </div>
                            )) : (
                                <p style={styles.textSecondary}>No reviews yet.</p>
                            )}
                        </div>
                        <div style={{ marginTop: '2rem' }}>
                            {eligibleBookingId ? (
                                <ReviewForm
                                    gymId={gym.id}
                                    bookingId={eligibleBookingId}
                                    onSuccess={fetchGymDetails}
                                />
                            ) : (
                                <div className="card" style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--surface)' }}>
                                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                                        {isSignedIn ? 'You can review this gym after your visit.' : 'Sign in to review gyms you have visited.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Column (Sticky Widget) */}
                <div style={styles.rightColumn}>
                    <div style={styles.stickyWidget}>
                        <div style={styles.widgetHeader}>
                            <div>
                                <span style={{ textDecoration: 'line-through', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>₹1500</span>
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                                        ₹{services[0]?.price || '0'}
                                    </span>
                                    <span style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '0.875rem' }}>
                                        / {services[0]?.duration_days ? 'month' : 'session'}
                                    </span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Star size={16} fill="var(--primary)" color="var(--primary)" />
                                <span style={{ fontWeight: 700 }}>{gym.rating ? Number(gym.rating).toFixed(1) : '0.0'}</span>
                                <span style={{ color: 'var(--text-secondary)' }}>({gym.total_reviews})</span>
                            </div>
                        </div>

                        <div style={styles.widgetForm}>
                            <label style={styles.widgetLabel}>Select Service</label>
                            <div style={styles.serviceSelectionList}>
                                {services.slice(0, 3).map(s => (
                                    <div
                                        key={s.id}
                                        onClick={() => setSelectedService(s.id)}
                                        style={{
                                            ...styles.serviceItemCompact,
                                            borderColor: selectedService === s.id ? 'var(--primary)' : '#27272a',
                                            background: selectedService === s.id ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent'
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{s.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                {s.duration_days ? `${s.duration_days} Days Access` : 'Single Session'}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 700 }}>₹{s.price}</div>
                                            {selectedService === s.id && <Check size={14} color="var(--primary)" />}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={(e) => handleBookingClick(e, `/booking/${gym.id}?service=${selectedService}`)}
                                className="btn btn-primary"
                                style={{ ...styles.bookBtn, border: 'none', cursor: 'pointer', width: '100%' }}
                            >
                                Continue to Booking <ChevronRight size={18} />
                            </button>
                            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                Secure Checkout • Instant Access
                            </p>
                        </div>

                        <div style={styles.widgetHours}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Mon - Fri</span>
                                <span style={{ fontWeight: 500 }}>06:00 AM - 10:00 PM</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Sat - Sun</span>
                                <span style={{ fontWeight: 500 }}>08:00 AM - 08:00 PM</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onSuccess={handleAuthSuccess}
            />
        </div>
    );
}

const styles = {
    loading: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
    },
    error: {
        textAlign: 'center',
        padding: '4rem 0',
    },
    container: {
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '1.5rem 1rem',
    },
    breadcrumbs: {
        display: 'flex',
        gap: '0.5rem',
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
        marginBottom: '1.5rem',
    },
    breadcrumbLink: {
        textDecoration: 'none',
        color: 'var(--text-secondary)',
        transition: 'color 0.2s',
    },
    breadcrumbSep: { color: 'var(--text-tertiary)' },
    breadcrumbActive: { fontWeight: 500, color: 'var(--text-main)' },

    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
    },
    title: {
        fontSize: '2.25rem',
        fontWeight: 800,
        marginBottom: '0.5rem',
        lineHeight: 1.2,
    },
    metaRow: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        color: 'var(--text-secondary)',
        fontSize: '0.875rem',
    },
    metaItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
    },
    dot: { color: 'var(--text-tertiary)' },
    headerRight: {
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'center',
    },
    actionBtn: {
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
    },

    // Image Grid
    imageGrid: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '0.75rem',
        height: '480px',
        borderRadius: '1rem',
        overflow: 'hidden',
        marginBottom: '2.5rem',
    },
    heroImageContainer: {
        height: '100%',
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    subImages: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: '0.75rem',
        height: '100%',
    },
    subImageContainer: {
        position: 'relative',
        height: '100%',
        width: '100%',
    },
    subImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    videoBadge: {
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        padding: '0.5rem 0.75rem',
        borderRadius: '0.5rem',
        color: 'white',
        fontSize: '0.8rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        border: '1px solid rgba(255,255,255,0.1)',
    },
    viewAllOverlay: {
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.3)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewAllBtn: {
        padding: '0.5rem 1rem',
        background: 'rgba(255,255,255,0.2)',
        backdropFilter: 'blur(4px)',
        border: '1px solid white',
        color: 'white',
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: 500,
        cursor: 'pointer',
    },

    // Layout
    layout: {
        display: 'grid',
        gridTemplateColumns: '1fr 380px',
        gap: '3rem',
    },
    leftColumn: {
        minWidth: 0, // Prevent flex item overflow
    },
    rightColumn: {
        position: 'relative',
        display: 'block',
    },

    // Sections
    section: { marginBottom: '2.5rem' },
    sectionTitle: {
        fontSize: '1.5rem',
        fontWeight: 700,
        marginBottom: '1rem',
        color: 'var(--text-main)',
    },
    description: {
        lineHeight: 1.7,
        color: 'var(--text-secondary)',
        marginBottom: '1rem',
    },
    tags: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
    },
    tag: {
        padding: '0.25rem 0.75rem',
        borderRadius: '999px',
        border: '1px solid var(--border)',
        fontSize: '0.875rem',
        color: 'var(--text-main)',
        background: 'var(--surface)',
    },
    divider: {
        height: '1px',
        background: 'var(--border)',
        border: 'none',
        margin: '2rem 0',
    },

    // Facilities
    facilitiesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '1rem 2rem',
    },
    facilityItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '1rem',
        color: 'var(--text-main)',
    },

    // Pricing
    pricingGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1rem',
    },
    pricingCard: {
        padding: '1.5rem',
        borderRadius: '0.75rem',
        background: 'var(--surface)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        transition: 'all 0.2s',
        position: 'relative',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-sm)',
    },
    bestValueBadge: {
        position: 'absolute',
        top: '-12px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--primary)',
        color: 'var(--text-main)',
        fontSize: '0.75rem',
        fontWeight: 700,
        padding: '0.25rem 0.75rem',
        borderRadius: '999px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    planName: {
        fontSize: '1.125rem',
        fontWeight: 700,
    },
    planBadge: {
        fontSize: '0.75rem',
        fontWeight: 700,
        background: 'var(--background)',
        padding: '0.25rem 0.5rem',
        borderRadius: '0.25rem',
    },
    planDesc: {
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
        marginBottom: '1rem',
        marginTop: '0.5rem',
    },
    planPriceRow: {
        display: 'flex',
        alignItems: 'flex-end',
        gap: '0.25rem',
    },
    planPrice: {
        fontSize: '1.75rem',
        fontWeight: 800,
        color: 'var(--text-main)',
    },
    planPeriod: {
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
        marginBottom: '6px',
    },
    planBtn: {
        textAlign: 'center',
        padding: '0.75rem',
        borderRadius: '0.5rem',
        fontWeight: 700,
        textDecoration: 'none',
        display: 'block',
        transition: 'all 0.2s',
    },

    // TRAINERS SCROLL
    trainersScroll: {
        display: 'flex',
        gap: '1rem',
        overflowX: 'auto',
        paddingBottom: '1rem',
    },
    trainerScrollCard: {
        minWidth: '200px',
        flex: '0 0 auto',
        textDecoration: 'none',
        color: 'inherit',
    },
    trainerScrollImg: {
        width: '100%',
        height: '100%',
        borderRadius: '0.5rem',
        objectFit: 'cover',
        transition: 'transform 0.3s ease',
    },
    trainerImgContainer: {
        position: 'relative',
        width: '100%',
        aspectRatio: '1',
        borderRadius: '0.5rem',
        overflow: 'hidden',
    },
    trainerRatingBadge: {
        position: 'absolute',
        bottom: '8px',
        right: '8px',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        color: 'white',
        padding: '2px 6px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '0.75rem',
        fontWeight: 600,
    },
    trainerName: {
        fontWeight: 700,
        fontSize: '1rem',
    },

    // Review Summary
    reviewSummary: {
        display: 'flex',
        alignItems: 'center',
        padding: '1.5rem',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '0.75rem',
        marginBottom: '1.5rem',
    },
    bigRating: {
        fontSize: '3rem',
        fontWeight: 900,
        lineHeight: 1,
        marginBottom: '0.5rem',
    },
    ratingBarRow: {
        display: 'grid',
        gridTemplateColumns: '20px 1fr 30px',
        gap: '0.75rem',
        alignItems: 'center',
        marginBottom: '0.5rem',
        fontSize: '0.75rem',
    },
    barTrack: {
        width: '100%',
        height: '6px',
        background: 'var(--background)',
        borderRadius: '99px',
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        background: 'var(--text-main)',
        borderRadius: '99px',
    },
    reviewList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    reviewItem: {
        padding: '1rem',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '0.75rem',
    },
    reviewHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem',
    },

    // Sticky Widget
    stickyWidget: {
        position: 'sticky',
        top: '100px',
        background: 'var(--surface)',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid var(--border)',
    },
    widgetHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border)',
        marginBottom: '1rem',
    },
    widgetForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0rem',
    },
    widgetLabel: {
        fontSize: '0.75rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        color: 'var(--text-secondary)',
        marginBottom: '0.5rem',
    },
    bookBtn: {
        width: '100%',
        padding: '1rem',
        fontSize: '1rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(var(--primary-rgb), 0.3)',
    },
    widgetHours: {
        marginTop: '1.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--border)',
    },

    // Service Widget
    serviceSelectionList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        marginBottom: '1.5rem',
    },
    serviceItemCompact: {
        display: 'flex',
        alignItems: 'center',
        padding: '0.75rem 1rem',
        borderRadius: '0.75rem',
        border: '1px solid #27272a',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    mapLink: {
        color: 'var(--primary)',
        textDecoration: 'none',
        fontSize: '0.85rem',
        fontWeight: 600,
        border: '1px solid var(--primary)',
        padding: '0.4rem 0.8rem',
        borderRadius: '0.5rem',
        transition: 'all 0.2s',
    },

    // Text utils
    textSecondary: { color: 'var(--text-secondary)', fontSize: '0.875rem' },
};
