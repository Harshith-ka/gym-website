import { CheckCircle, Search, Calendar, CreditCard, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HowItWorks() {
    const steps = [
        {
            icon: Search,
            title: 'Find Your Gym',
            description: 'Search for gyms near you by location, category, or name. Filter by price, ratings, and amenities.',
        },
        {
            icon: Calendar,
            title: 'Book Your Session',
            description: 'Choose from sessions, day passes, or memberships. Select your preferred date and time slot.',
        },
        {
            icon: CreditCard,
            title: 'Make Payment',
            description: 'Secure payment through Razorpay. Get instant confirmation and booking details.',
        },
        {
            icon: QrCode,
            title: 'Show QR Code',
            description: 'Present your QR code at the gym entrance. Staff will scan and validate your booking.',
        },
    ];

    return (
        <div>
            {/* Hero */}
            <section style={styles.hero}>
                <div className="container" style={styles.heroContent}>
                    <h1 style={styles.heroTitle}>How FitBook Works</h1>
                    <p style={styles.heroSubtitle}>
                        Book your perfect workout space in 4 simple steps
                    </p>
                </div>
            </section>

            {/* Steps */}
            <section className="container" style={styles.stepsSection}>
                <div style={styles.steps}>
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <div key={index} style={styles.step}>
                                <div style={styles.stepNumber}>{index + 1}</div>
                                <div style={styles.stepIcon}>
                                    <Icon size={32} />
                                </div>
                                <h3 style={styles.stepTitle}>{step.title}</h3>
                                <p style={styles.stepDescription}>{step.description}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Features */}
            <section style={styles.featuresSection}>
                <div className="container">
                    <h2 style={styles.sectionTitle}>Why Choose Us?</h2>
                    <div className="grid grid-3" style={{ marginTop: '2rem' }}>
                        <div className="card" style={styles.featureCard}>
                            <CheckCircle size={32} color="var(--primary)" />
                            <h3 style={styles.featureTitle}>Verified Gyms</h3>
                            <p style={styles.featureText}>
                                All gyms are verified and approved by our team
                            </p>
                        </div>

                        <div className="card" style={styles.featureCard}>
                            <CheckCircle size={32} color="var(--primary)" />
                            <h3 style={styles.featureTitle}>Secure Payments</h3>
                            <p style={styles.featureText}>
                                Safe and secure payment processing through Razorpay
                            </p>
                        </div>

                        <div className="card" style={styles.featureCard}>
                            <CheckCircle size={32} color="var(--primary)" />
                            <h3 style={styles.featureTitle}>Instant Confirmation</h3>
                            <p style={styles.featureText}>
                                Get instant booking confirmation with QR code
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={styles.ctaSection}>
                <div className="container text-center">
                    <h2 style={styles.ctaTitle}>Ready to Get Started?</h2>
                    <p style={styles.ctaText}>
                        Find and book your perfect gym today
                    </p>
                    <Link to="/explore" className="btn btn-primary btn-lg">
                        Start Exploring
                    </Link>
                </div>
            </section>
        </div>
    );
}

const styles = {
    hero: {
        background: 'var(--gradient-hero)',
        color: 'white',
        padding: '4rem 0',
        textAlign: 'center',
    },
    heroContent: {
        maxWidth: '800px',
    },
    heroTitle: {
        fontSize: '3rem',
        fontWeight: 800,
        marginBottom: '1rem',
    },
    heroSubtitle: {
        fontSize: '1.25rem',
        opacity: 0.9,
    },
    stepsSection: {
        padding: '4rem 0',
    },
    steps: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '3rem',
    },
    step: {
        textAlign: 'center',
        position: 'relative',
    },
    stepNumber: {
        position: 'absolute',
        top: '-1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'var(--gradient-primary)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: '1.25rem',
    },
    stepIcon: {
        width: '100px',
        height: '100px',
        margin: '2rem auto 1.5rem',
        background: 'var(--bg-secondary)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--primary)',
    },
    stepTitle: {
        fontSize: '1.5rem',
        fontWeight: 600,
        marginBottom: '0.75rem',
    },
    stepDescription: {
        color: 'var(--text-secondary)',
        lineHeight: 1.6,
    },
    featuresSection: {
        background: 'var(--bg-secondary)',
        padding: '4rem 0',
    },
    sectionTitle: {
        fontSize: '2rem',
        fontWeight: 700,
        textAlign: 'center',
    },
    featureCard: {
        padding: '2rem',
        textAlign: 'center',
    },
    featureTitle: {
        fontSize: '1.25rem',
        fontWeight: 600,
        margin: '1rem 0 0.5rem',
    },
    featureText: {
        color: 'var(--text-secondary)',
    },
    ctaSection: {
        padding: '6rem 0',
        background: 'var(--gradient-primary)',
        color: 'white',
    },
    ctaTitle: {
        fontSize: '2.5rem',
        fontWeight: 700,
        marginBottom: '1rem',
    },
    ctaText: {
        fontSize: '1.25rem',
        marginBottom: '2rem',
        opacity: 0.9,
    },
};
