import React from 'react';
import { Shield, Eye, Database, Share2, Cookie, UserCheck, Mail } from 'lucide-react';

export default function Privacy() {
    const sections = [
        {
            icon: <Database size={20} />,
            title: "1. Information We Collect",
            content: "We collect information you provide directly to us, including your name, email address, phone number, and payment preferences. This data allows us to personalize your training journey and match you with the right facilities."
        },
        {
            icon: <Eye size={20} />,
            title: "2. How We Use Information",
            content: "Your data is used to facilitate bookings, maintain your fitness progress history, and provide you with personalized gym recommendations. We analyze aggregate behavior to improve our platform's performance for all athletes."
        },
        {
            icon: <Share2 size={20} />,
            title: "3. Information Sharing",
            content: "We never sell your personal data. We only share information with gyms and trainers you explicitly book with, ensuring they have the necessary details to provide you with a safe and effective workout."
        },
        {
            icon: <Shield size={20} />,
            title: "4. Data Security",
            content: "We implement military-grade encryption to protect your personal and payment information. Our security protocols are regularly audited to ensure your digital safety matches your physical safety."
        },
        {
            icon: <Cookie size={20} />,
            title: "5. Cookies & Tracking",
            content: "We use cookies to remember your preferences and keep you logged into your dashboard. This technology helps us understand which gym categories are trending and which features need optimization."
        },
        {
            icon: <UserCheck size={20} />,
            title: "6. Your Rights",
            content: "You have complete control over your data. You can access, update, or request the deletion of your personal information at any time through your account settings or by contacting our support team."
        }
    ];

    return (
        <div style={styles.container} className="hero-gradient">
            <div className="container" style={styles.header}>
                <h1 className="text-gradient" style={styles.title}>Data Protection</h1>
                <p style={styles.subtitle}>
                    Your privacy is the foundation of our community. Learn how we handle your information with absolute transparency.
                </p>
            </div>

            <div className="container" style={styles.grid}>
                {/* Sidebar Nav */}
                <aside style={styles.sidebar} className="support-nav-sidebar">
                    <h4 style={styles.sidebarTitle}>Privacy Navigation</h4>
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
                        <div style={styles.contactEmail}>
                            <Mail size={18} color="var(--primary)" />
                            <span>Questions? Email <a href="mailto:privacy@gymato.com" style={{ color: 'white', fontWeight: 600 }}>privacy@gymato.com</a></span>
                        </div>
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
        padding: '2.5rem',
        textAlign: 'center',
    },
    contactEmail: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        color: '#71717a',
        fontSize: '1rem',
    }
};
