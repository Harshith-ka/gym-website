import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Dumbbell, Users, Award, TrendingUp, Play, Star, Heart, X } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import api from '../services/api';
import GymCard from '../components/GymCard';

// Video Modal Component
const VideoModal = ({ isOpen, onClose, videoUrl }) => {
    if (!isOpen) return null;
    return (
        <div style={styles.modalOverlay} onClick={onClose}>
            <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                <button style={styles.closeBtn} onClick={onClose}>
                    <X size={24} />
                </button>
                <iframe
                    width="100%"
                    height="100%"
                    src={videoUrl}
                    title="Coach Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ borderRadius: '1.5rem' }}
                ></iframe>
            </div>
        </div>
    );
};

export default function Home() {
    const [featuredGyms, setFeaturedGyms] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [currentReview, setCurrentReview] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [videoUrl, setVideoUrl] = useState('');

    useEffect(() => {
        fetchFeaturedGyms();
        fetchReviews();
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

    const fetchReviews = async () => {
        try {
            const response = await api.get('/reviews?limit=10');
            setReviews(response.data.reviews || []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const nextReview = () => {
        setCurrentReview(prev => (prev + 1) % reviews.length);
    };

    const prevReview = () => {
        setCurrentReview(prev => (prev - 1 + reviews.length) % reviews.length);
    };

    const openVideo = (url) => {
        setVideoUrl(url);
        setIsVideoModalOpen(true);
    };

    const categories = [
        { name: 'Workout', desc: 'High-intensity strength and cardio training for all levels.', image: '/src/assets/categories/category_workout_1768968216853.png', color: '#8B5CF6' },
        { name: 'Yoga', desc: 'Find your balance and flexibility with our expert-led yoga sessions.', image: '/src/assets/categories/category_yoga_1768968232399.png', color: '#06B6D4' },
        { name: 'Dance', desc: 'Express yourself and stay fit with our energetic dance classes.', image: '/src/assets/categories/category_dance_1768968250236.png', color: '#EC4899' },
        { name: 'Zumba', desc: 'Party yourself into shape with our rhythm-based cardio workouts.', image: '/src/assets/categories/category_zumba_1768968273976.png', color: '#F59E0B' },
        { name: 'CrossFit', desc: 'Challenge your limits with our functional fitness programs.', image: '/src/assets/categories/category_crossfit_1768968291984.png', color: '#10B981' },
        { name: 'Badminton', desc: 'Improve your agility and precision on our professional courts.', image: '/src/assets/categories/category_badminton_1768968311997.png', color: '#EF4444' },
    ];

    // Scroll Reveal Logic
    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-active');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const revealElements = document.querySelectorAll('.scroll-reveal');
        revealElements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, [loading]);

    return (
        <div style={{ background: '#000', color: 'white', minHeight: '100vh' }}>
            {/* Hero Section */}
            <section style={styles.hero}>
                <div className="container hero-container" style={styles.heroContainer}>
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
                            At FitBook we believe fitness is for everybody. Our platform is your
                            dedicated space to find the best gyms, transform, and thrive.
                        </p>

                        <div style={styles.heroActions}>
                            <Link to="/explore" style={styles.primaryBtn}>
                                Explore All Gyms
                            </Link>
                            <button style={styles.secondaryBtn} onClick={() => openVideo('https://www.youtube.com/embed/dQw4w9WgXcQ')}>
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
                    <div className="hero-image-wrapper" style={styles.heroImageWrapper}>
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
                <div style={styles.centeredHeader} className="scroll-reveal">
                    <span style={styles.sectionLabel}>What We Can Do For You</span>
                    <h2 style={styles.sectionTitleCenter}>Gym categories we can help you with</h2>
                </div>

                <div style={styles.categoriesGrid}>
                    {categories.map((cat, index) => (
                        <Link
                            key={cat.name}
                            to={`/category/${cat.name.toLowerCase()}`}
                            style={{
                                ...styles.categoryCard3D,
                                backgroundColor: cat.color,
                                animationDelay: `${index * 0.1}s`
                            }}
                            className="scroll-reveal"
                        >
                            <div style={styles.cardInfoTop}>
                                <h3 style={styles.cardTitle3D}>{cat.name}</h3>
                                <p style={styles.cardDesc3D}>{cat.desc}</p>
                            </div>
                            <div style={styles.cardImageContainer}>
                                <img src={cat.image} alt={cat.name} style={styles.cardImage3D} />
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

            {/* Gallery Section */}
            <section className="container" style={styles.section}>
                <div style={styles.centeredHeader}>
                    <h2 style={styles.galleryTitle}>Category Gallery: Home to <br /> Fitness Masterpieces</h2>
                    <p style={styles.gallerySubtitle}>
                        "Discover a stunning collection of workout spaces from top-rated gyms. Explore well-organized categories to inspire your journey and enhance your performance."
                    </p>
                </div>

                <div className="gallery-grid" style={styles.galleryGrid}>
                    <div style={{ ...styles.galleryItem, gridArea: 'min' }}>
                        <img src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=800&auto=format&fit=crop" alt="Cardio" style={styles.galleryImg} />
                        <div style={styles.galleryTextVertical}>Cardio</div>
                    </div>
                    <div style={{ ...styles.galleryItem, gridArea: 'nat' }}>
                        <img src="https://images.unsplash.com/photo-1518611012118-29615638ec4a?q=80&w=800&auto=format&fit=crop" alt="Strength" style={styles.galleryImg} />
                        <div style={styles.galleryTextHorizontalTop}>Strength</div>
                    </div>
                    <div style={{ ...styles.galleryItem, gridArea: 'art' }}>
                        <img src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop" alt="Mindset" style={styles.galleryImg} />
                        <div style={styles.galleryTextCenter}>Mindset</div>
                    </div>
                    <div style={{ ...styles.galleryItem, gridArea: 'arch' }}>
                        <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop" alt="Nutrition" style={styles.galleryImg} />
                        <div style={styles.galleryTextHorizontalBottom}>Nutrition</div>
                    </div>
                    <div style={{ ...styles.galleryItem, gridArea: 'ani' }}>
                        <img src="https://images.unsplash.com/photo-1599058917232-d750c185967c?q=80&w=800&auto=format&fit=crop" alt="Recovery" style={styles.galleryImg} />
                        <div style={styles.galleryTextHorizontalTopRight}>Recovery</div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section style={styles.whySection}>
                <div className="container">
                    <div style={styles.whyHeader}>
                        <span style={styles.whyBadge}>WHY CHOOSE US</span>
                        <h2 style={styles.whyTitle}>
                            Why <span style={{ color: '#8B5CF6' }}>FitBook</span> is The <br />
                            Right Choice for You
                        </h2>
                    </div>

                    <div className="why-grid" style={styles.whyGrid}>
                        {/* Expert Instructors */}
                        <div style={{ ...styles.whyCardSmall, gridArea: 's1' }}>
                            <div style={styles.whyIconCircle}>
                                <Users size={24} color="#8B5CF6" />
                            </div>
                            <h3 style={styles.whyCardTitle}>Expert Personal Trainers</h3>
                            <p style={styles.whyCardText}>
                                Work with certified professionals who bring elite-level training experience to help you reach your maximum potential.
                            </p>
                        </div>

                        {/* Certified Trainers */}
                        <div style={{ ...styles.whyCardSmall, gridArea: 's2' }}>
                            <div style={styles.whyIconCircle}>
                                <Award size={24} color="#8B5CF6" />
                            </div>
                            <h3 style={styles.whyCardTitle}>Certified Fitness Programs</h3>
                            <p style={styles.whyCardText}>
                                Our programs are scientifically backed and designed to deliver measurable results in strength, endurance, and flexibility.
                            </p>
                        </div>

                        {/* Flexible Schedules (Dark Card) */}
                        <div style={styles.whyCardPrimary}>
                            <div style={styles.primaryIconCircle}>
                                <TrendingUp size={32} color="white" />
                            </div>
                            <h2 style={styles.primaryCardTitle}>All-Day Gym Access</h2>
                            <p style={styles.primaryCardText}>
                                At FitBook, we know life is busy. That's why we partner with gyms that offer 24/7 access, letting you train whenever your schedule allows.
                            </p>
                            <p style={{ ...styles.primaryCardText, marginBottom: '2.5rem' }}>
                                Find spaces that fit your lifestyle and keep your fitness journey moving forward without interruptions.
                            </p>
                            <Link to="/explore" style={styles.startTrialBtn}>
                                Book a session slot <ArrowRight size={20} />
                            </Link>
                        </div>

                        {/* 100+ High Impact Sessions (Wide Card) */}
                        <div style={styles.whyCardWide}>
                            <div style={styles.whyIconCircle}>
                                <Dumbbell size={24} color="#8B5CF6" />
                            </div>
                            <h3 style={styles.whyCardTitle}>100+ Premium Gym Partners</h3>
                            <p style={styles.whyCardText}>
                                FitBook connects you with over 100 top-rated fitness centers across the city. From boutique studios to massive powerlifting gyms, we have the perfect place for your workout.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Result Flow Section */}
            <section style={styles.resultSection}>
                <div className="container">
                    <div style={styles.resultHeader}>
                        <div style={styles.resultTitleCol}>
                            <span style={styles.resultSmallTitle}>TRANSFORM YOUR BODY</span>
                            <h2 style={styles.resultBigTitle}>WITH FITBOOK</h2>
                        </div>
                        <div style={styles.resultDescCol}>
                            <p style={styles.resultDesc}>
                                Ready to take the first step towards a healthier, stronger you?
                                Our seamless booking process ensures you find the perfect gym and stay on track.
                            </p>
                        </div>
                    </div>

                    <div className="flow-row" style={styles.flowRow}>
                        <div style={styles.flowStep}>
                            <div style={styles.flowCircle}><Award size={32} /></div>
                            <div style={styles.flowDashedLine}></div>
                        </div>
                        <div style={styles.flowStep}>
                            <div style={{ ...styles.flowCircle, background: '#111', color: 'white' }}><Dumbbell size={32} /></div>
                            <div style={styles.flowDashedLine}></div>
                        </div>
                        <div style={styles.flowStep}>
                            <div style={styles.flowCircle}><Heart size={32} /></div>
                            <div style={styles.flowDashedLine}></div>
                        </div>
                        <div style={styles.flowStep}>
                            <div style={styles.flowCircle}><TrendingUp size={32} /></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Coaches Section */}
            <section style={styles.coachesSection}>
                <div className="container coaches-container" style={styles.coachesContainer}>
                    <div className="coaches-images" style={styles.coachesImages}>
                        <div style={styles.coachImageMain}>
                            <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop" alt="Coach" style={styles.coachImg} />
                        </div>
                        <div style={styles.coachImageSecondary} onClick={() => openVideo('https://www.youtube.com/embed/ysz5S6PUM-U')}>
                            <img src="https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=800&auto=format&fit=crop" alt="Coach" style={styles.coachImg} />
                            <div style={styles.playOverlay}><Play size={24} fill="white" /></div>
                        </div>
                    </div>
                    <div style={styles.coachesContent}>
                        <span style={styles.mentorSub}>ARE YOU LOOKING FOR A MENTOR?</span>
                        <h2 style={styles.coachesTitle}>COACHES</h2>
                        <p style={styles.coachesText}>
                            Our team of certified and experienced trainers is dedicated to helping you achieve your fitness goals. Whether you're looking to build muscle, lose weight, or improve overall health, our trainers will create a personalized plan to guide you every step of the way.
                        </p>
                        <Link to="/trainers" style={styles.exploreMoreBtn}>
                            Explore More
                        </Link>
                    </div>
                </div>
            </section>

            {/* Reviews Section */}
            <section style={styles.reviewsSection}>
                <div className="container">
                    <div className="reviews-header" style={styles.reviewsHeader}>
                        <div style={styles.reviewsTitleCol}>
                            <span style={styles.reviewsSub}>REVIEWS</span>
                            <h2 style={styles.reviewsMainTitle}>FROM YOU</h2>
                            <div style={styles.avatarStack}>
                                <img src="https://i.pravatar.cc/100?img=11" alt="User" style={styles.stackAvatar} />
                                <img src="https://i.pravatar.cc/100?img=12" alt="User" style={styles.stackAvatar} />
                                <img src="https://i.pravatar.cc/100?img=13" alt="User" style={styles.stackAvatar} />
                                <img src="https://i.pravatar.cc/100?img=14" alt="User" style={styles.stackAvatar} />
                            </div>
                        </div>
                        <div style={styles.reviewsContentCol}>
                            {reviews.length > 0 ? (
                                <div style={styles.reviewCard}>
                                    <div style={styles.reviewCardHeader}>
                                        <div style={styles.reviewerName}>{reviews[currentReview].user_name}</div>
                                        <div style={styles.quoteIcon}>"</div>
                                    </div>
                                    <p style={styles.reviewText}>
                                        {reviews[currentReview].comment}
                                    </p>
                                    <div style={styles.reviewTargetGym}>
                                        {reviews[currentReview].gym_name}
                                    </div>
                                </div>
                            ) : (
                                <div style={styles.reviewCard}>
                                    <p style={styles.reviewText}>Loading reviews...</p>
                                </div>
                            )}
                            <div style={styles.reviewsNav}>
                                <button style={styles.navBtnActive} onClick={prevReview}><ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} /></button>
                                <button style={styles.navBtn} onClick={nextReview}><ArrowRight size={20} /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <VideoModal
                isOpen={isVideoModalOpen}
                onClose={() => setIsVideoModalOpen(false)}
                videoUrl={videoUrl}
            />
            {/* Global Smooth Animations */}
            <style>{`
                .scroll-reveal {
                    opacity: 0;
                    transform: translateY(40px);
                    transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }

                .reveal-active {
                    opacity: 1;
                    transform: translateY(0);
                }

                .categoryCard3D:hover {
                    transform: scale(1.02) translateY(-10px);
                    box-shadow: 0 30px 60px rgba(0,0,0,0.5);
                }

                .categoryCard3D:hover .cardImageContainer {
                    transform: scale(1.1) rotate(0deg) translate(-10px, -10px);
                }

                .categoryCard3D:hover .cardTitle3D {
                    transform: translateX(10px);
                }
            `}</style>
        </div >
    );
}

const styles = {
    hero: {
        background: 'linear-gradient(to right, #1a1a1a, #0a0a0a)',
        padding: '1rem 0',
        minHeight: '75vh',
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
    centeredHeader: {
        textAlign: 'center',
        marginBottom: '4rem',
    },
    sectionLabel: {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: 600,
        color: '#8B5CF6',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        marginBottom: '1rem',
    },
    sectionTitleCenter: {
        fontSize: '3rem',
        fontWeight: 800,
        color: 'white',
        maxWidth: '800px',
        margin: '0 auto',
        lineHeight: 1.2,
    },
    categoriesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        gap: '2.5rem',
        marginTop: '3rem',
    },
    categoryCard3D: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '480px',
        padding: '2.5rem',
        borderRadius: '3rem',
        border: '12px solid #000',
        textDecoration: 'none',
        overflow: 'hidden',
        transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        cursor: 'pointer',
    },
    cardInfoTop: {
        zIndex: 2,
        position: 'relative',
    },
    cardTitle3D: {
        fontSize: '2.5rem',
        fontWeight: 800,
        color: 'white',
        lineHeight: 1,
        marginBottom: '1rem',
        letterSpacing: '-1px',
    },
    cardDesc3D: {
        fontSize: '1rem',
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: 1.5,
        maxWidth: '80%',
    },
    cardImageContainer: {
        position: 'absolute',
        bottom: '-10%',
        right: '-10%',
        width: '80%',
        height: '70%',
        zIndex: 1,
        transition: 'all 0.5s ease',
    },
    cardImage3D: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        transform: 'rotate(-5deg)',
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        padding: '4rem 0',
    },
    galleryTitle: {
        fontSize: '3.5rem',
        fontWeight: 750,
        color: 'white',
        lineHeight: 1.1,
        marginBottom: '1.5rem',
    },
    gallerySubtitle: {
        fontSize: '1.1rem',
        color: '#A1A1AA',
        maxWidth: '700px',
        margin: '0 auto',
        lineHeight: 1.6,
        fontStyle: 'italic',
    },
    galleryGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'auto auto',
        gridTemplateAreas: `
            "min nat art"
            "arch arch ani"
        `,
        gap: '2rem',
        marginTop: '2rem',
    },
    galleryItem: {
        position: 'relative',
        borderRadius: '2.5rem',
        overflow: 'hidden',
        height: '350px',
        border: '1px solid #1A1A1A',
    },
    galleryImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        opacity: 0.8,
    },
    galleryTextVertical: {
        position: 'absolute',
        top: '2.5rem',
        left: '2rem',
        fontSize: '3rem',
        fontWeight: 600,
        color: 'white',
        writingMode: 'vertical-rl',
        transform: 'rotate(180deg)',
    },
    galleryTextHorizontalTop: {
        position: 'absolute',
        top: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '3rem',
        fontWeight: 500,
        color: 'white',
    },
    galleryTextCenter: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '3rem',
        fontWeight: 500,
        color: 'white',
    },
    galleryTextHorizontalBottom: {
        position: 'absolute',
        bottom: '1.5rem',
        left: '2.5rem',
        fontSize: '4rem',
        fontWeight: 500,
        color: 'white',
    },
    galleryTextHorizontalTopRight: {
        position: 'absolute',
        top: '1.5rem',
        right: '2.5rem',
        fontSize: '3rem',
        fontWeight: 500,
        color: 'white',
    },
    whySection: {
        padding: '8rem 0',
        background: '#050505',
    },
    whyHeader: {
        textAlign: 'center',
        marginBottom: '5rem',
    },
    whyBadge: {
        padding: '0.5rem 1.25rem',
        border: '1px solid #333',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: '#A1A1AA',
        letterSpacing: '1px',
        marginBottom: '1.5rem',
        display: 'inline-block',
    },
    whyTitle: {
        fontSize: '3.5rem',
        fontWeight: 800,
        color: 'white',
        lineHeight: 1.1,
        letterSpacing: '-2px',
    },
    whyGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'auto auto',
        gridTemplateAreas: `
            "s1 s2 p"
            "w w p"
        `,
        gap: '2rem',
    },
    whyCardSmall: {
        background: '#0D0D0D',
        padding: '3rem',
        borderRadius: '2.5rem',
        border: '1px solid #1A1A1A',
    },
    whyCardWide: {
        gridArea: 'w',
        background: '#0D0D0D',
        padding: '3rem',
        borderRadius: '2.5rem',
        border: '1px solid #1A1A1A',
    },
    whyCardPrimary: {
        gridArea: 'p',
        background: '#06112E', // Deep navy
        padding: '3.5rem',
        borderRadius: '2.5rem',
        border: '1px solid #0A1F4D',
        display: 'flex',
        flexDirection: 'column',
    },
    whyIconCircle: {
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: 'rgba(139, 92, 246, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '2rem',
    },
    primaryIconCircle: {
        width: '72px',
        height: '72px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '2.5rem',
    },
    whyCardTitle: {
        fontSize: '1.75rem',
        fontWeight: 700,
        color: 'white',
        marginBottom: '1rem',
    },
    whyCardText: {
        fontSize: '1.05rem',
        color: '#A1A1AA',
        lineHeight: 1.6,
    },
    primaryCardTitle: {
        fontSize: '2.25rem',
        fontWeight: 700,
        color: 'white',
        lineHeight: 1.2,
        marginBottom: '1.5rem',
    },
    primaryCardText: {
        fontSize: '1.1rem',
        color: '#94A3B8',
        lineHeight: 1.7,
        marginBottom: '1rem',
    },
    startTrialBtn: {
        marginTop: 'auto',
        background: '#22C55E', // Green like in the image
        color: 'black',
        padding: '1.25rem 2rem',
        borderRadius: '1rem',
        fontSize: '1.1rem',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        textDecoration: 'none',
        transition: 'transform 0.2s ease',
    },

    // Result Flow Styles
    resultSection: {
        padding: '10rem 0',
        background: '#000',
        color: 'white',
    },
    resultHeader: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '4rem',
        marginBottom: '6rem',
        alignItems: 'flex-end',
    },
    resultTitleCol: {
        display: 'flex',
        flexDirection: 'column',
    },
    resultSmallTitle: {
        fontSize: '1.25rem',
        fontWeight: 600,
        color: '#8B5CF6',
        letterSpacing: '1px',
    },
    resultBigTitle: {
        fontSize: '6rem',
        fontWeight: 900,
        lineHeight: 0.9,
        margin: 0,
        letterSpacing: '-2px',
        color: 'white',
    },
    resultDescCol: {
        maxWidth: '400px',
    },
    resultDesc: {
        fontSize: '1.25rem',
        color: '#A1A1AA',
        lineHeight: 1.6,
    },
    flowRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 4rem',
    },
    flowStep: {
        display: 'flex',
        alignItems: 'center',
        flex: 1,
    },
    flowCircle: {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        border: '1px solid #222',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        background: '#0A0A0A',
        color: '#8B5CF6',
    },
    flowDashedLine: {
        flex: 1,
        height: '1px',
        borderBottom: '2px dashed #222',
        margin: '0 1.5rem',
    },

    // Coaches Styles
    coachesSection: {
        padding: '8rem 0',
        background: '#0A0A0A',
        color: 'white',
    },
    coachesContainer: {
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '6rem',
        alignItems: 'center',
    },
    coachesImages: {
        display: 'flex',
        gap: '1.5rem',
        alignItems: 'center',
    },
    coachImageMain: {
        flex: 1,
        borderRadius: '2.5rem',
        overflow: 'hidden',
        height: '500px',
        border: '1px solid #1A1A1A',
    },
    coachImageSecondary: {
        flex: 1,
        borderRadius: '2.5rem',
        overflow: 'hidden',
        height: '400px',
        position: 'relative',
        border: '1px solid #1A1A1A',
    },
    coachImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        opacity: 0.8,
    },
    playOverlay: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: 'rgba(139, 92, 246, 0.2)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #8B5CF6',
    },
    coachesContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    mentorSub: {
        fontSize: '1.125rem',
        fontWeight: 600,
        color: '#8B5CF6',
        marginBottom: '1rem',
        letterSpacing: '1px',
    },
    coachesTitle: {
        fontSize: '6rem',
        fontWeight: 900,
        marginBottom: '2rem',
        letterSpacing: '-2px',
        color: 'white',
    },
    coachesText: {
        fontSize: '1.125rem',
        color: '#A1A1AA',
        lineHeight: 1.7,
        marginBottom: '3rem',
        maxWidth: '500px',
    },
    exploreMoreBtn: {
        background: '#8B5CF6',
        color: 'white',
        padding: '1.25rem 2.5rem',
        borderRadius: '999px',
        fontSize: '1.1rem',
        fontWeight: 700,
        textDecoration: 'none',
        transition: 'transform 0.2s ease',
    },

    // Reviews Styles
    reviewsSection: {
        padding: '10rem 0',
        background: '#000',
        color: 'white',
    },
    reviewsHeader: {
        display: 'grid',
        gridTemplateColumns: '1fr 1.2fr',
        gap: '6rem',
    },
    reviewsTitleCol: {
        display: 'flex',
        flexDirection: 'column',
    },
    reviewsSub: {
        fontSize: '1.125rem',
        fontWeight: 600,
        color: '#8B5CF6',
        marginBottom: '1rem',
        letterSpacing: '2px',
    },
    reviewsMainTitle: {
        fontSize: '6rem',
        fontWeight: 900,
        marginBottom: '4rem',
        letterSpacing: '-2px',
        color: 'white',
    },
    avatarStack: {
        display: 'flex',
        gap: '1rem',
    },
    stackAvatar: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        border: '4px solid #111',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    },
    reviewsContentCol: {
        display: 'flex',
        flexDirection: 'column',
        gap: '3rem',
    },
    reviewCard: {
        background: '#0A0A0A',
        padding: '4rem',
        borderRadius: '2.5rem',
        border: '1px solid #1A1A1A',
        position: 'relative',
    },
    reviewCardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
    },
    reviewerName: {
        fontSize: '1.5rem',
        fontWeight: 700,
        padding: '0.5rem 1.5rem',
        border: '1px solid #222',
        borderRadius: '999px',
        color: 'white',
    },
    quoteIcon: {
        fontSize: '4rem',
        color: '#8B5CF6',
        fontWeight: 900,
        lineHeight: 1,
        opacity: 0.3,
    },
    reviewText: {
        fontSize: '1.25rem',
        color: '#A1A1AA',
        lineHeight: 1.6,
    },
    reviewsNav: {
        display: 'flex',
        gap: '1.5rem',
    },
    navBtn: {
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        border: '1px solid #222',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0A0A0A',
        color: '#A1A1AA',
        cursor: 'pointer',
    },
    navBtnActive: {
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#8B5CF6',
        color: 'white',
        cursor: 'pointer',
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
    // Modal Styles
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.9)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
    },
    modalContent: {
        width: '100%',
        maxWidth: '1000px',
        height: '600px',
        position: 'relative',
    },
    closeBtn: {
        position: 'absolute',
        top: '-3rem',
        right: 0,
        background: 'transparent',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
    },
    reviewTargetGym: {
        marginTop: '1.5rem',
        fontSize: '0.875rem',
        color: '#8B5CF6',
        fontWeight: 600,
        textTransform: 'uppercase',
    },
};
