import React from 'react';
import { Target, Users, Award, Zap, ChevronRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
    const stats = [
        { label: 'Happy Athletes', value: '10k+' },
        { label: 'Expert Coaches', value: '45+' },
        { label: 'Premium Gyms', value: '120+' },
        { label: 'Weekly Sessions', value: '500+' },
    ];

    const values = [
        {
            icon: <Target size={24} />,
            title: "Our Mission",
            description: "To democratize elite-level fitness by connecting passionate athletes with the best facilities and expert coaching in their local communities."
        },
        {
            icon: <Users size={24} />,
            title: "Community First",
            description: "We believe fitness is a team sport. Our platform fosters a supportive environment where everyone can thrive, regardless of their starting point."
        },
        {
            icon: <Award size={24} />,
            title: "Excellence Only",
            description: "We handpick every gym and trainer on our platform to ensure you receive the highest standard of service and results-driven training."
        }
    ];

    return (
        <div style={styles.container}>
            {/* Hero Section */}
            <section className="hero-gradient" style={styles.hero}>
                <div className="container" style={styles.heroContent}>
                    <div style={styles.heroText}>
                        <h1 className="text-gradient" style={styles.heroTitle}>Our Story</h1>
                        <p style={styles.heroSub}>
                            Purpul Hue started with a simple observation: finding high-quality, local fitness options shouldn't be a workout in itself.
                        </p>
                        <div style={styles.heroActions}>
                            <Link to="/explore" className="btn btn-primary">Start Training</Link>
                            <button style={styles.videoBtn}>
                                <div style={styles.playIcon}><Play size={16} fill="white" /></div>
                                Watch Our Film
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="container" style={styles.statsSection}>
                <div className="grid grid-4">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card">
                            <h2 style={styles.statValue}>{stat.value}</h2>
                            <p style={styles.statLabel}>{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Mission & Values */}
            <section className="container" style={styles.valuesSection}>
                <div style={styles.sectionHeader}>
                    <span style={styles.tag}>What defines us</span>
                    <h2 style={styles.sectionTitle}>Driven by Performance</h2>
                </div>
                <div className="grid grid-3">
                    {values.map((value, index) => (
                        <div key={index} className="section-glass" style={styles.valueCard}>
                            <div style={styles.valueIcon}>{value.icon}</div>
                            <h3 style={styles.valueTitle}>{value.title}</h3>
                            <p style={styles.valueDesc}>{value.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Story Layout */}
            <section className="container" style={styles.storySection}>
                <div style={styles.storyGrid}>
                    <div style={styles.storyImageWrapper}>
                        <img
                            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop"
                            alt="Gym Atmosphere"
                            style={styles.storyImage}
                        />
                        <div style={styles.imageOverlay} className="section-glass">
                            <Zap size={32} color="var(--primary)" />
                            <p>Founded on Passion</p>
                        </div>
                    </div>
                    <div style={styles.storyContent}>
                        <h2 style={styles.storyTitle}>From a Single Gym to an International Network</h2>
                        <p style={styles.storyText}>
                            What began as a small directory for local boxing clubs has evolved into a premier fitness ecosystem spanning multiple countries. We've spent the last 5 years building relationships with the most dedicated gym owners and trainers across India and internationally.
                        </p>
                        <p style={styles.storyText}>
                            Today, Purpul Hue is more than just a booking app. It's a global partner in your journey—providing the tools, data, and community you need to reach your peak performance, whether you're in Mumbai, London, or New York.
                        </p>
                        <div style={styles.globalBadge}>
                            <span style={styles.globalIcon}>🌍</span>
                            <div>
                                <h4 style={styles.globalTitle}>Available Internationally</h4>
                                <p style={styles.globalText}>Serving fitness enthusiasts across India, UK, USA, and expanding globally</p>
                            </div>
                        </div>
                        <div style={styles.storyQuote} className="section-glass">
                            <p>"Our goal isn't just to help you find a gym; it's to help you find your purpose through physical excellence, no matter where you are in the world."</p>
                            <span style={styles.quoteAuthor}>— Harshith, Founder of Purpul Hue</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Partner Section */}
            <section className="container" style={styles.partnerSection}>
                <div style={styles.partnerGrid}>
                    <div style={styles.partnerContent}>
                        <span style={styles.tag}>For Gym Owners</span>
                        <h2 style={styles.partnerTitle}>Scale Your Facility with Purpul Hue</h2>
                        <p style={styles.partnerText}>
                            Are you a gym owner looking to reach more customers? Partner with us to list your facility, manage bookings, and grow your community.
                        </p>
                        <Link to="/partnership" className="btn btn-outline" style={styles.partnerBtn}>
                            Explore Partnership
                            <ChevronRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="container" style={styles.ctaSection}>
                <div className="section-glass" style={styles.ctaCard}>
                    <h2 style={styles.ctaTitle}>Ready to begin your journey?</h2>
                    <p style={styles.ctaSub}>Join thousands of athletes who have already transformed their lives.</p>
                    <Link to="/explore" className="btn btn-primary" style={styles.ctaBtn}>
                        Find a Gym Near You
                        <ChevronRight size={18} />
                    </Link>
                </div>
            </section>
        </div>
    );
}

const styles = {
    container: {
        background: '#0a0a0a',
        color: 'white',
        overflow: 'hidden',
    },
    hero: {
        paddingTop: '6rem',
        paddingBottom: '6rem',
        textAlign: 'center',
    },
    heroContent: {
        maxWidth: '800px',
    },
    heroTitle: {
        fontSize: '5rem',
        fontWeight: 900,
        marginBottom: '1.5rem',
        letterSpacing: '-2px',
    },
    heroSub: {
        fontSize: '1.25rem',
        color: '#a1a1aa',
        lineHeight: 1.6,
        marginBottom: '2.5rem',
    },
    heroActions: {
        display: 'flex',
        gap: '1.5rem',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: 'transparent',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '0.95rem',
    },
    playIcon: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'rgba(139, 92, 246, 0.2)',
        border: '1px solid rgba(139, 92, 246, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: '3px',
    },
    statsSection: {
        marginTop: '-4rem',
        marginBottom: '4rem',
        position: 'relative',
        zIndex: 10,
    },
    statValue: {
        fontSize: '2.5rem',
        fontWeight: 800,
        color: 'var(--primary)',
        marginBottom: '0.25rem',
    },
    statLabel: {
        color: '#a1a1aa',
        fontSize: '0.9rem',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '1px',
    },
    valuesSection: {
        paddingTop: '8rem',
        paddingBottom: '8rem',
    },
    sectionHeader: {
        textAlign: 'center',
        marginBottom: '4rem',
    },
    tag: {
        color: 'var(--primary)',
        fontWeight: 700,
        fontSize: '0.8rem',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        marginBottom: '0.5rem',
        display: 'block',
    },
    sectionTitle: {
        fontSize: '3rem',
        fontWeight: 800,
    },
    valueCard: {
        padding: '3rem 2rem',
        textAlign: 'center',
    },
    valueIcon: {
        width: '60px',
        height: '60px',
        background: 'rgba(139, 92, 246, 0.1)',
        borderRadius: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--primary)',
        margin: '0 auto 2rem',
    },
    valueTitle: {
        fontSize: '1.5rem',
        fontWeight: 700,
        marginBottom: '1rem',
    },
    valueDesc: {
        color: '#a1a1aa',
        lineHeight: 1.6,
    },
    storySection: {
        paddingBottom: '8rem',
    },
    storyGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '6rem',
        alignItems: 'center',
    },
    storyImageWrapper: {
        position: 'relative',
    },
    storyImage: {
        width: '100%',
        borderRadius: '2rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: '2rem',
        right: '-2rem',
        padding: '1.5rem 2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        fontWeight: 700,
    },
    storyContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    storyTitle: {
        fontSize: '2.5rem',
        fontWeight: 800,
        lineHeight: 1.2,
    },
    storyText: {
        fontSize: '1.1rem',
        color: '#a1a1aa',
        lineHeight: 1.7,
    },
    storyQuote: {
        marginTop: '2rem',
        padding: '2.5rem',
        fontSize: '1.2rem',
        fontStyle: 'italic',
        lineHeight: 1.6,
        color: 'white',
        borderLeft: '4px solid var(--primary)',
    },
    quoteAuthor: {
        display: 'block',
        marginTop: '1rem',
        fontSize: '1rem',
        fontWeight: 600,
        color: 'var(--primary)',
        fontStyle: 'normal',
    },
    ctaSection: {
        paddingBottom: '10rem',
    },
    ctaCard: {
        padding: '5rem',
        textAlign: 'center',
        background: 'linear-gradient(to bottom right, rgba(139, 92, 246, 0.1), rgba(0, 0, 0, 0))',
    },
    ctaTitle: {
        fontSize: '3.5rem',
        fontWeight: 900,
        marginBottom: '1rem',
    },
    ctaSub: {
        fontSize: '1.25rem',
        color: '#a1a1aa',
        marginBottom: '3rem',
    },
    ctaBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '1.1rem',
        padding: '1.25rem 2.5rem',
    },
    partnerSection: {
        paddingBottom: '8rem',
    },
    partnerGrid: {
        background: 'linear-gradient(90deg, #111, #000)',
        borderRadius: '2rem',
        padding: '4rem',
        border: '1px solid #1a1a1a',
        display: 'flex',
        justifyContent: 'center',
        textAlign: 'center',
    },
    partnerContent: {
        maxWidth: '600px',
    },
    partnerTitle: {
        fontSize: '2.5rem',
        fontWeight: 800,
        marginBottom: '1rem',
    },
    partnerText: {
        fontSize: '1.1rem',
        color: '#a1a1aa',
        lineHeight: 1.6,
        marginBottom: '2rem',
    },
    partnerBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        borderColor: 'var(--primary)',
        color: 'var(--primary)',
    },
    globalBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        background: 'rgba(139, 92, 246, 0.1)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '1rem',
        padding: '1.5rem 2rem',
        marginTop: '2rem',
        marginBottom: '2rem',
    },
    globalIcon: {
        fontSize: '2.5rem',
    },
    globalTitle: {
        fontSize: '1.1rem',
        fontWeight: 700,
        color: 'var(--primary)',
        marginBottom: '0.25rem',
    },
    globalText: {
        fontSize: '0.95rem',
        color: '#a1a1aa',
        margin: 0,
    }
};
