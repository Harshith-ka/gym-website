import React from 'react';
import { Check, Zap, Crown, Shield, Star, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Membership() {
    const plans = [
        {
            name: "Starter",
            price: "1,999",
            duration: "month",
            description: "Perfect for those just starting their fitness journey.",
            features: [
                "Access to 2 Gyms",
                "2 Personal Training Sessions",
                "Basic Workout Plans",
                "Locker Room Access",
                "Standard Mobile App Features"
            ],
            btnText: "Start My Journey",
            featured: false
        },
        {
            name: "Pro",
            price: "4,999",
            duration: "month",
            description: "The optimal choice for dedicated athletes and lifters.",
            features: [
                "Unlimited Gym Access (All Locations)",
                "5 Personal Training Sessions",
                "Advanced Nutrition Guides",
                "Access to All Group Classes",
                "Priority Support",
                "Free Guest Passes (2/month)"
            ],
            btnText: "Level Up Now",
            featured: true
        },
        {
            name: "Elite",
            price: "9,999",
            duration: "month",
            description: "Unlock the full potential of your physical excellence.",
            features: [
                "All Pro Features",
                "Daily 1-on-1 Dedicated Coaching",
                "Biometric Progress Tracking",
                "Custom Supplement Strategy",
                "VIP Lounge & Spa Access",
                "Exclusive Community Events"
            ],
            btnText: "Join the Elite",
            featured: false
        }
    ];

    return (
        <div style={styles.pageWrapper}>
            {/* Hero Section */}
            <section style={styles.hero}>
                <div className="container" style={styles.heroContent}>
                    <div style={styles.badge}>MEMBERSHIP PLANS</div>
                    <h1 style={styles.heroTitle}>Unlock Your <br /><span className="text-gradient">Potential</span></h1>
                    <p style={styles.heroSub}>
                        Choose the plan that fits your ambition. No hidden fees, just results.
                    </p>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="container" style={{ paddingBottom: '10rem' }}>
                <div className="pricing-grid">
                    {plans.map((plan, index) => (
                        <div key={index} className={`pricing-card ${plan.featured ? 'featured' : ''}`}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                {plan.name === "Elite" ? <Crown size={24} color="var(--primary)" /> : <Shield size={24} color="var(--primary)" />}
                                <h3 className="pricing-title">{plan.name}</h3>
                            </div>
                            <p style={{ color: '#a1a1aa', fontSize: '0.9rem', lineHeight: 1.5 }}>{plan.description}</p>

                            <div className="pricing-price">
                                <span style={{ fontSize: '1.5rem', alignSelf: 'flex-start', marginTop: '0.5rem' }}>₹</span>
                                {plan.price}
                                <span>/{plan.duration}</span>
                            </div>

                            <ul className="pricing-features">
                                {plan.features.map((feature, fIndex) => (
                                    <li key={fIndex} className="pricing-feature-item">
                                        <div style={styles.checkCircle}>
                                            <Check size={14} color="white" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                to="/explore"
                                className={`pricing-btn ${plan.featured ? 'pricing-btn-primary' : 'pricing-btn-outline'}`}
                            >
                                {plan.btnText}
                            </Link>
                        </div>
                    ))}
                </div>

                {/* FAQ / Trust Section */}
                <div style={styles.trustRow}>
                    <div style={styles.trustItem}>
                        <Zap size={24} color="var(--primary)" />
                        <div>
                            <h4>Instant Activation</h4>
                            <p>Get started immediately after booking.</p>
                        </div>
                    </div>
                    <div style={styles.trustItem}>
                        <Shield size={24} color="var(--primary)" />
                        <div>
                            <h4>Flexible Cancellation</h4>
                            <p>Pause or cancel your plan anytime.</p>
                        </div>
                    </div>
                    <div style={styles.trustItem}>
                        <Star size={24} color="var(--primary)" />
                        <div>
                            <h4>5-Star Facilities</h4>
                            <p>Only the best gyms pass our vetting.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonial / Brand Story */}
            <section style={styles.ctaBanner}>
                <div className="container" style={styles.ctaContent}>
                    <h2 style={styles.ctaTitle}>Still unsure which plan is right?</h2>
                    <p style={styles.ctaSub}>Schedule a 15-minute consultation with our fitness experts to find your perfect match.</p>
                    <Link to="/contact" className="btn btn-primary" style={{ padding: '1.25rem 2.5rem', borderRadius: '1rem' }}>
                        Book Free Consultation
                    </Link>
                </div>
            </section>
        </div>
    );
}

const styles = {
    pageWrapper: {
        background: '#0a0a0a',
        minHeight: '100vh',
    },
    hero: {
        paddingTop: '8rem',
        paddingBottom: '4rem',
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
        color: 'white',
        lineHeight: 1.1,
    },
    heroSub: {
        fontSize: '1.25rem',
        color: '#a1a1aa',
        maxWidth: '600px',
        margin: '0 auto',
        lineHeight: 1.6,
    },
    badge: {
        color: 'var(--primary)',
        fontWeight: 800,
        fontSize: '0.8rem',
        textTransform: 'uppercase',
        letterSpacing: '3px',
        marginBottom: '1.5rem',
    },
    checkCircle: {
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: 'var(--primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    trustRow: {
        display: 'flex',
        justifyContent: 'center',
        gap: '4rem',
        marginTop: '8rem',
        paddingTop: '4rem',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        flexWrap: 'wrap',
    },
    trustItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        textAlign: 'left',
        maxWidth: '280px',
    },
    ctaBanner: {
        background: 'linear-gradient(to bottom, transparent, rgba(139, 92, 246, 0.05))',
        padding: '8rem 0',
        textAlign: 'center',
    },
    ctaContent: {
        maxWidth: '700px',
    },
    ctaTitle: {
        fontSize: '3rem',
        fontWeight: 800,
        marginBottom: '1.5rem',
        color: 'white',
    },
    ctaSub: {
        fontSize: '1.1rem',
        color: '#a1a1aa',
        marginBottom: '2.5rem',
        lineHeight: 1.6,
    }
};
