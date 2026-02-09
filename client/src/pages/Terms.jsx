import React from 'react';
import { ShieldCheck, Scale, FileText, Lock, AlertCircle, Info } from 'lucide-react';

export default function Terms() {
    const sections = [
        {
            icon: <ShieldCheck size={20} />,
            title: "1. Acceptance of Terms",
            content: "By accessing and using Gymato, you accept and agree to be bound by the terms and provision of this agreement. Our platform is designed for peak performance, and by joining, you become part of an elite fitness community."
        },
        {
            icon: <FileText size={20} />,
            title: "2. Use License",
            content: "Permission is granted to temporarily use Gymato for personal, non-commercial purposes only. This includes accessing gym directories, booking training sessions, and viewing expert content. Any unauthorized reproduction of our data is strictly prohibited."
        },
        {
            icon: <Scale size={20} />,
            title: "3. Booking & Cancellation Policy",
            content: "All bookings are subject to availability. To ensure respect for our trainers' time, cancellations must be made at least 24 hours in advance for a full credit refund. Late cancellations may be subject to a fee."
        },
        {
            icon: <Lock size={20} />,
            title: "4. Payment Terms",
            content: "All payments are processed securely through our verified partners. Prices are subject to change based on gym facility upgrades and trainer certifications. You will always be notified of price changes prior to booking."
        },
        {
            icon: <AlertCircle size={20} />,
            title: "5. User Conduct",
            content: "We maintain a zero-tolerance policy for harassment. Users must respect the rules of the individual gym facilities they visit. Failure to comply with gym safety protocols may lead to account suspension."
        },
        {
            icon: <Info size={20} />,
            title: "6. Limitation of Liability",
            content: "While we partner with the best, Gymato is a platform connecting users with third-party facilities. We are not liable for personal injury sustained during training; users should always consult with the on-site professionals."
        }
    ];

    return (
        <div style={styles.container} className="hero-gradient">
            <div className="container" style={styles.header}>
                <h1 className="text-gradient" style={styles.title}>Terms of Performance</h1>
                <p style={styles.subtitle}>
                    Last updated: January 18, 2026. Please read our guidelines for safe and effective community engagement.
                </p>
            </div>

            <div className="container" style={styles.grid}>
                {/* Sidebar Nav */}
                <aside style={styles.sidebar} className="support-nav-sidebar">
                    <h4 style={styles.sidebarTitle}>Navigation</h4>
                    {sections.map((s, i) => (
                        <a key={i} href={`#section-${i}`} className="support-nav-item">
                            {s.title.split('. ')[1]}
                        </a>
                    ))}
                </aside>

                {/* Content */}
                <div style={styles.content}>
                    {sections.map((section, index) => (
                        <section
                            key={index}
                            id={`section-${index}`}
                            className="section-glass"
                            style={styles.section}
                        >
                            <div style={styles.sectionHeader}>
                                <div style={styles.sectionIcon}>{section.icon}</div>
                                <h2 style={styles.sectionTitle}>{section.title}</h2>
                            </div>
                            <p style={styles.text}>{section.content}</p>
                        </section>
                    ))}

                    <div style={styles.footerNote} className="section-glass">
                        <p>Questions about our terms? Contact our <a href="mailto:legal@gymato.com" style={{ color: 'var(--primary)' }}>Legal Team</a>.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        paddingTop: '8rem',
        paddingBottom: '8rem',
        minHeight: '100vh',
    },
    header: {
        textAlign: 'center',
        marginBottom: '5rem',
        maxWidth: '800px',
    },
    title: {
        fontSize: '3.5rem',
        fontWeight: 800,
        marginBottom: '1.5rem',
        lineHeight: 1.1,
    },
    subtitle: {
        fontSize: '1.1rem',
        color: '#a1a1aa',
        lineHeight: 1.6,
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '250px 1fr',
        gap: '4rem',
        alignItems: 'start',
    },
    sidebar: {
        position: 'sticky',
        top: '120px',
    },
    sidebarTitle: {
        fontSize: '0.75rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '1px',
        color: '#71717a',
        marginBottom: '1rem',
        paddingLeft: '1rem',
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
    },
    section: {
        padding: '3rem',
    },
    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        marginBottom: '1.5rem',
    },
    sectionIcon: {
        width: '44px',
        height: '44px',
        borderRadius: '10px',
        background: 'rgba(239, 68, 68, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--primary)',
    },
    sectionTitle: {
        fontSize: '1.5rem',
        fontWeight: 700,
    },
    text: {
        fontSize: '1.05rem',
        lineHeight: 1.8,
        color: '#a1a1aa',
    },
    footerNote: {
        padding: '2rem',
        textAlign: 'center',
        color: '#71717a',
        fontSize: '0.95rem',
    }
};
