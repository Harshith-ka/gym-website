import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Target, Heart, Award } from 'lucide-react';

const programs = [
    {
        id: 'workout',
        title: "Strength & Muscle",
        description: "Build lean muscle and increase your functional strength with our power-focused programs.",
        icon: <Zap size={32} color="#DC2626" />,
        image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1470&auto=format&fit=crop",
        features: ["Hypertrophy training", "Powerlifting basics", "Compound movements"],
        color: "#DC2626"
    },
    {
        id: 'cardio',
        title: "Weight Loss & Cardio",
        description: "High-intensity sessions designed to blast calories and improve cardiovascular endurance.",
        icon: <Target size={32} color="#EF4444" />,
        image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1469&auto=format&fit=crop",
        features: ["HIIT circuits", "Endurance running", "Metabolic conditioning"],
        color: "#EF4444"
    },
    {
        id: 'yoga',
        title: "Mind & Mobility",
        description: "Balance, flexibility, and mental clarity through yoga and functional mobility work.",
        icon: <Heart size={32} color="#10B981" />,
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1440&auto=format&fit=crop",
        features: ["Vinyasa flow", "Mobility drills", "Meditation techniques"],
        color: "#10B981"
    },
    {
        id: 'crossfit',
        title: "Functional Fitness",
        description: "Versatile training that prepares you for any physical challenge life throws at you.",
        icon: <Award size={32} color="#F59E0B" />,
        image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop",
        features: ["Functional moves", "Agility work", "Strength endurance"],
        color: "#F59E0B"
    }
];

export default function Programs() {
    return (
        <div className="container" style={styles.container}>
            <header style={styles.header}>
                <span style={styles.badge}>Our Expertise</span>
                <h1 style={styles.title}>Results-Driven Programs</h1>
                <p style={styles.subtitle}>Choose a path that aligns with your specific fitness journey and goals.</p>
            </header>

            <div style={styles.programList}>
                {programs.map((program, idx) => (
                    <div key={program.id} style={{
                        ...styles.programCard,
                        flexDirection: idx % 2 === 0 ? 'row' : 'row-reverse'
                    }}>
                        <div style={styles.imageSection}>
                            <img src={program.image} alt={program.title} style={styles.image} />
                            <div style={{ ...styles.accentBar, background: program.color }}></div>
                        </div>
                        <div style={styles.contentSection}>
                            <div style={styles.iconWrapper}>{program.icon}</div>
                            <h2 style={styles.programTitle}>{program.title}</h2>
                            <p style={styles.programDesc}>{program.description}</p>

                            <div style={styles.features}>
                                {program.features.map(f => (
                                    <div key={f} style={styles.featureItem}>
                                        <div style={{ ...styles.dot, background: program.color }}></div>
                                        <span>{f}</span>
                                    </div>
                                ))}
                            </div>

                            <Link to={`/category/${program.id}`} className="btn btn-primary" style={{
                                ...styles.btn,
                                background: program.color
                            }}>
                                View Gyms Offering This <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* Personalized Section */}
            <section style={styles.ctaSection}>
                <div style={styles.ctaContent}>
                    <h2 style={styles.ctaTitle}>Not sure where to start?</h2>
                    <p style={styles.ctaSub}>Schedule a free consultation with one of our expert trainers to find your perfect path.</p>
                    <Link to="/trainers" className="btn btn-primary" style={styles.ctaBtn}>
                        Find a Personal Trainer
                    </Link>
                </div>
            </section>
        </div>
    );
}

const styles = {
    container: {
        paddingTop: '6rem',
        paddingBottom: '8rem',
    },
    header: {
        textAlign: 'center',
        marginBottom: '6rem',
    },
    badge: {
        color: '#ef4444',
        fontWeight: 700,
        fontSize: '0.8rem',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        marginBottom: '1rem',
        display: 'block',
    },
    title: {
        fontSize: '3.5rem',
        fontWeight: 900,
        marginBottom: '1rem',
    },
    subtitle: {
        fontSize: '1.2rem',
        color: '#a1a1aa',
        maxWidth: '600px',
        margin: '0 auto',
    },
    programList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8rem',
    },
    programCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '4rem',
        minHeight: '400px',
    },
    imageSection: {
        flex: 1.2,
        position: 'relative',
        height: '450px',
        borderRadius: '2rem',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    accentBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '6px',
        height: '100%',
    },
    contentSection: {
        flex: 1,
    },
    iconWrapper: {
        marginBottom: '1.5rem',
    },
    programTitle: {
        fontSize: '2.5rem',
        fontWeight: 800,
        marginBottom: '1.5rem',
    },
    programDesc: {
        fontSize: '1.1rem',
        color: '#a1a1aa',
        marginBottom: '2rem',
        lineHeight: 1.7,
    },
    features: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginBottom: '2.5rem',
    },
    featureItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '1rem',
        color: '#e4e4e7',
    },
    dot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
    },
    btn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1rem 2rem',
    },
    ctaSection: {
        marginTop: '10rem',
        background: 'linear-gradient(45deg, #1a1a1a 0%, #0a0a0a 100%)',
        borderRadius: '3rem',
        padding: '5rem',
        textAlign: 'center',
        border: '1px solid #222',
        position: 'relative',
        overflow: 'hidden',
    },
    ctaTitle: {
        fontSize: '2.5rem',
        fontWeight: 800,
        marginBottom: '1rem',
    },
    ctaSub: {
        color: '#a1a1aa',
        fontSize: '1.1rem',
        marginBottom: '2.5rem',
        maxWidth: '500px',
        margin: '0 auto 2.5rem',
    },
    ctaBtn: {
        padding: '1rem 2.5rem',
        fontSize: '1.1rem',
    }
};
