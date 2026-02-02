import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Dumbbell, Heart, Play, Award, TrendingUp } from 'lucide-react';

export default function Categories() {
    const categories = [
        { name: 'Workout', desc: 'High-intensity strength and cardio training for all levels.', image: '/src/assets/categories/category_workout_1768968216853.png', color: '#DC2626', area: 'workout' },
        { name: 'Yoga', desc: 'Find your balance and flexibility with our expert-led yoga sessions.', image: '/src/assets/categories/category_yoga_1768968232399.png', color: '#06B6D4', area: 'yoga' },
        { name: 'Dance', desc: 'Express yourself and stay fit with our energetic dance classes.', image: '/src/assets/categories/category_dance_1768968250236.png', color: '#EC4899', area: 'dance' },
        { name: 'Zumba', desc: 'Party yourself into shape with our rhythm-based cardio workouts.', image: '/src/assets/categories/category_zumba_1768968273976.png', color: '#F59E0B', area: 'zumba' },
        { name: 'CrossFit', desc: 'Challenge your limits with our functional fitness programs.', image: '/src/assets/categories/category_crossfit_1768968291984.png', color: '#10B981', area: 'crossfit' },
        { name: 'Badminton', desc: 'Improve your agility and precision on our professional courts.', image: '/src/assets/categories/category_badminton_1768968311997.png', color: '#EF4444', area: 'badminton' },
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
    }, []);

    return (
        <div style={{ background: '#000', color: 'white', minHeight: '100vh' }}>
            <div className="container" style={styles.container}>
                <div style={styles.centeredHeader}>
                    <span style={styles.sectionLabel}>Discover Your Potential</span>
                    <h1 style={styles.title}>Browse by Category</h1>
                    <p style={styles.subtitle}>Find premium fitness spaces that match your goals</p>
                </div>

                <div style={styles.categoriesGrid}>
                    {categories.map((cat, index) => (
                        <Link
                            key={cat.name}
                            to={`/category/${cat.name.toLowerCase()}`}
                            style={{
                                ...styles.categoryCard3D,
                                backgroundColor: cat.color,
                                gridArea: cat.area,
                                animationDelay: `${index * 0.1}s`
                            }}
                            className="scroll-reveal"
                        >
                            <div style={styles.cardInfoTop}>
                                <h3 style={styles.cardTitle3D}>{cat.name}</h3>
                                <p style={styles.cardDesc3D}>{cat.desc}</p>
                            </div>
                            <div style={styles.cardImageContainer} className="image-container">
                                <img src={cat.image} alt={cat.name} style={styles.cardImage3D} />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
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

                .scroll-reveal:hover {
                    transform: scale(1.02) translateY(-10px);
                    box-shadow: 0 30px 60px rgba(0,0,0,0.5);
                    z-index: 10;
                }

                .scroll-reveal:hover .image-container {
                    transform: scale(1.1) rotate(0deg) translate(-10px, -10px);
                }

                .scroll-reveal:hover h3 {
                    transform: translateX(10px);
                    transition: all 0.3s ease;
                }
            `}</style>
        </div>
    );
}

const styles = {
    container: {
        paddingTop: '6rem',
        paddingBottom: '8rem',
    },
    centeredHeader: {
        textAlign: 'center',
        marginBottom: '5rem',
    },
    sectionLabel: {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: 600,
        color: '#ef4444',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        marginBottom: '1rem',
    },
    title: {
        fontSize: '4rem',
        fontWeight: 800,
        color: 'white',
        letterSpacing: '-2px',
        marginBottom: '1.5rem',
        lineHeight: 1,
    },
    subtitle: {
        fontSize: '1.25rem',
        color: '#a1a1aa',
        maxWidth: '600px',
        margin: '0 auto',
    },
    categoriesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateAreas: `
            "workout yoga dance"
            "zumba crossfit badminton"
        `,
        gap: '2.5rem',
        marginTop: '3rem',
    },
    categoryCard3D: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '520px',
        padding: '3rem',
        borderRadius: '3.5rem',
        border: '14px solid #000',
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
        fontSize: '3rem',
        fontWeight: 800,
        color: 'white',
        lineHeight: 1,
        marginBottom: '1.25rem',
        letterSpacing: '-1.5px',
    },
    cardDesc3D: {
        fontSize: '1.1rem',
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: 1.6,
        maxWidth: '85%',
    },
    cardImageContainer: {
        position: 'absolute',
        bottom: '-5%',
        right: '-5%',
        width: '85%',
        height: '75%',
        zIndex: 1,
        transition: 'all 0.5s ease',
    },
    cardImage3D: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        transform: 'rotate(-5deg)',
    },
};
