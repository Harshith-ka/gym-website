import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Users, TrendingUp, ShieldCheck, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Partnership() {
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

    const benefits = [
        {
            title: "Grow Your Business",
            desc: "Reach thousands of fitness enthusiasts in your area and fill your off-peak hours with new customers.",
            icon: <TrendingUp size={24} />,
            color: "#ef4444"
        },
        {
            title: "Verified Community",
            desc: "Build trust with real, verified reviews from users who have actually checked into your facility.",
            icon: <ShieldCheck size={24} />,
            color: "#06B6D4"
        },
        {
            title: "Seamless Management",
            desc: "Get access to a powerful dashboard to manage your gym's profile, sessions, and bookings with ease.",
            icon: <Globe size={24} />,
            color: "#10B981"
        }
    ];

    return (
        <div style={{ background: '#000', color: 'white', minHeight: '100vh' }}>
            {/* Hero Section */}
            <section style={styles.hero}>
                <div className="container" style={styles.heroContainer}>
                    <div style={styles.heroContent} className="scroll-reveal">
                        <span style={styles.sectionLabel}>Empower Your Facility</span>
                        <h1 style={styles.heroTitle}>Partner with Gymato</h1>
                        <p style={styles.heroSubtitle}>
                            Join the fastest-growing fitness network. List your gym, manage bookings effortlessly,
                            and connect with thousands of local members looking for their next workout space.
                        </p>
                        <div style={styles.heroActions}>
                            <Link to="/register-gym" style={styles.primaryBtn}>
                                Register Your Gym <ArrowRight size={20} />
                            </Link>
                            <Link to="/contact" style={styles.secondaryBtn}>
                                Contact Sales
                            </Link>
                        </div>
                    </div>
                    <div style={styles.heroImageWrapper} className="scroll-reveal">
                        <img
                            src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1470&auto=format&fit=crop"
                            alt="Gym Owner"
                            style={styles.heroImage}
                        />
                        <div style={styles.glassBadge}>
                            <Users size={20} color="var(--primary)" />
                            <span>100+ Active Partners</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section style={styles.section}>
                <div className="container">
                    <div style={styles.centeredHeader} className="scroll-reveal">
                        <h2 style={styles.sectionTitle}>Why Partner with Us?</h2>
                        <p style={styles.sectionSubtitle}>We provide the tools you need to succeed in the digital fitness landscape.</p>
                    </div>

                    <div style={styles.benefitsGrid}>
                        {benefits.map((benefit, index) => (
                            <div key={index} style={styles.benefitCard} className="scroll-reveal">
                                <div style={{ ...styles.iconCircle, background: `${benefit.color}15`, color: benefit.color }}>
                                    {benefit.icon}
                                </div>
                                <h3 style={styles.benefitTitle}>{benefit.title}</h3>
                                <p style={styles.benefitDesc}>{benefit.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Preview */}
            <section style={styles.featuresSection}>
                <div className="container" style={styles.featuresContainer}>
                    <div style={styles.featuresImageWrapper} className="scroll-reveal">
                        <img
                            src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1470&auto=format&fit=crop"
                            alt="Dashboard Preview"
                            style={styles.featuresImage}
                        />
                    </div>
                    <div style={styles.featuresContent} className="scroll-reveal">
                        <h2 style={styles.sectionTitle}>Built for Scale</h2>
                        <p style={styles.sectionSubtitle}>Our platform takes care of the technicalities so you can focus on training.</p>

                        <ul style={styles.featuresList}>
                            <li style={styles.featureItem}>
                                <CheckCircle2 size={20} color="#10B981" />
                                <span>Real-time booking and slot management</span>
                            </li>
                            <li style={styles.featureItem}>
                                <CheckCircle2 size={20} color="#10B981" />
                                <span>Automated payments and payouts</span>
                            </li>
                            <li style={styles.featureItem}>
                                <CheckCircle2 size={20} color="#10B981" />
                                <span>Advanced analytics and revenue reports</span>
                            </li>
                            <li style={styles.featureItem}>
                                <CheckCircle2 size={20} color="#10B981" />
                                <span>Verified customer reviews and ratings</span>
                            </li>
                        </ul>

                        <Link to="/register-gym" style={styles.textLink}>
                            Get Started Now <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={styles.ctaSection}>
                <div className="container scroll-reveal" style={styles.ctaContainer}>
                    <h2 style={styles.ctaTitle}>Ready to grow your fitness community?</h2>
                    <p style={styles.ctaSubtitle}>It takes less than 5 minutes to submit your gym for approval.</p>
                    <Link to="/register-gym" style={styles.ctaBtn}>
                        Start Your Registration
                    </Link>
                </div>
            </section>

            {/* Global Style */}
            <style>{`
                .scroll-reveal {
                    opacity: 0;
                    transform: translateY(30px);
                    transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }
                .reveal-active {
                    opacity: 1;
                    transform: translateY(0);
                }
            `}</style>
        </div>
    );
}

const styles = {
    hero: {
        paddingTop: '8rem',
        paddingBottom: '6rem',
        background: 'radial-gradient(circle at 10% 20%, rgba(239, 68, 68, 0.05) 0%, transparent 40%)',
    },
    heroContainer: {
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '4rem',
        alignItems: 'center',
    },
    heroContent: {
        maxWidth: '650px',
    },
    sectionLabel: {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: 700,
        color: '#ef4444',
        textTransform: 'uppercase',
        letterSpacing: '3px',
        marginBottom: '1.5rem',
    },
    heroTitle: {
        fontSize: '4.5rem',
        fontWeight: 800,
        lineHeight: 1.1,
        marginBottom: '2rem',
        letterSpacing: '-2px',
    },
    heroSubtitle: {
        fontSize: '1.25rem',
        color: '#a1a1aa',
        lineHeight: 1.6,
        marginBottom: '3rem',
    },
    heroActions: {
        display: 'flex',
        gap: '1.5rem',
        alignItems: 'center',
    },
    primaryBtn: {
        background: 'white',
        color: 'black',
        padding: '1.25rem 2.5rem',
        borderRadius: '16px',
        textDecoration: 'none',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        transition: 'all 0.2s',
        boxShadow: '0 10px 20px rgba(255,255,255,0.1)',
    },
    secondaryBtn: {
        color: 'white',
        textDecoration: 'none',
        fontWeight: 600,
        fontSize: '1rem',
        borderBottom: '2px solid transparent',
        transition: 'all 0.2s',
        ':hover': {
            borderBottom: '2px solid white',
        }
    },
    heroImageWrapper: {
        position: 'relative',
        height: '550px',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '2.5rem',
        border: '1px solid rgba(255,255,255,0.1)',
    },
    glassBadge: {
        position: 'absolute',
        bottom: '2rem',
        left: '-2rem',
        background: 'rgba(15, 15, 15, 0.8)',
        backdropFilter: 'blur(12px)',
        padding: '1.25rem 2rem',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        fontSize: '1rem',
        fontWeight: 600,
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
    },
    section: {
        padding: '8rem 0',
    },
    centeredHeader: {
        textAlign: 'center',
        marginBottom: '5rem',
    },
    sectionTitle: {
        fontSize: '3rem',
        fontWeight: 800,
        marginBottom: '1.25rem',
        letterSpacing: '-1px',
    },
    sectionSubtitle: {
        fontSize: '1.125rem',
        color: '#a1a1aa',
        maxWidth: '600px',
        margin: '0 auto',
    },
    benefitsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '2.5rem',
    },
    benefitCard: {
        padding: '3.5rem',
        background: '#0D0D0D',
        borderRadius: '2.5rem',
        border: '1px solid #1A1A1A',
        transition: 'all 0.3s ease',
    },
    iconCircle: {
        width: '64px',
        height: '64px',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '2rem',
    },
    benefitTitle: {
        fontSize: '1.5rem',
        fontWeight: 700,
        marginBottom: '1rem',
    },
    benefitDesc: {
        color: '#a1a1aa',
        lineHeight: 1.6,
        fontSize: '1rem',
    },
    featuresSection: {
        padding: '8rem 0',
        background: '#050505',
    },
    featuresContainer: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '6rem',
        alignItems: 'center',
    },
    featuresImageWrapper: {
        borderRadius: '2.5rem',
        overflow: 'hidden',
        height: '500px',
        border: '1px solid rgba(255,255,255,0.05)',
    },
    featuresImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    featuresList: {
        listStyle: 'none',
        padding: 0,
        margin: '2.5rem 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
    },
    featureItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        fontSize: '1.1rem',
        color: '#e5e5e5',
    },
    textLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: '#ef4444',
        textDecoration: 'none',
        fontWeight: 700,
        fontSize: '1.1rem',
    },
    ctaSection: {
        padding: '10rem 0',
        textAlign: 'center',
    },
    ctaContainer: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '6rem 4rem',
        background: 'linear-gradient(to bottom right, #0D0D0D, #000)',
        borderRadius: '4rem',
        border: '1px solid rgba(239, 68, 68, 0.2)',
    },
    ctaTitle: {
        fontSize: '3.5rem',
        fontWeight: 800,
        lineHeight: 1.2,
        marginBottom: '1.5rem',
        letterSpacing: '-1.5px',
    },
    ctaSubtitle: {
        fontSize: '1.25rem',
        color: '#a1a1aa',
        marginBottom: '3.5rem',
    },
    ctaBtn: {
        background: '#ef4444',
        color: 'white',
        padding: '1.5rem 4rem',
        borderRadius: '16px',
        textDecoration: 'none',
        fontWeight: 800,
        fontSize: '1.1rem',
        display: 'inline-block',
        transition: 'all 0.3s',
        boxShadow: '0 20px 40px rgba(239, 68, 68, 0.3)',
    }
};
