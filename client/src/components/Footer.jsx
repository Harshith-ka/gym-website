import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Instagram, Twitter, Facebook, Mail, MapPin, Phone, ChevronRight } from 'lucide-react';

export default function Footer() {
    return (
        <footer style={styles.footer} className="hero-gradient">
            <div className="container" style={styles.container}>
                <div style={styles.grid}>
                    {/* Brand Card */}
                    <div className="section-glass" style={styles.brandCard}>
                        <Link to="/" style={styles.logo}>
                            <Sparkles size={24} color="var(--primary)" />
                            <span style={styles.logoText}>Purpul Hue</span>
                        </Link>
                        <p style={styles.description}>
                            Your dedicated space to grow, transform, and thrive. Join a community of peak performers.
                        </p>
                        <div style={styles.socials}>
                            <a href="#" style={styles.socialLink}><Instagram size={18} /></a>
                            <a href="#" style={styles.socialLink}><Twitter size={18} /></a>
                            <a href="#" style={styles.socialLink}><Facebook size={18} /></a>
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div style={styles.navSection}>
                        <div style={styles.navCol}>
                            <h3 style={styles.title}>Explore</h3>
                            <div style={styles.links}>
                                <Link to="/explore" style={styles.link}>All Gyms</Link>
                                <Link to="/trainers" style={styles.link}>Coaches</Link>
                                <Link to="/programs" style={styles.link}>Programs</Link>
                                <Link to="/blog" style={styles.link}>Fitness Blog</Link>
                            </div>
                        </div>

                        <div style={styles.navCol}>
                            <h3 style={styles.title}>Company</h3>
                            <div style={styles.links}>
                                <Link to="/about" style={styles.link}>Our Story</Link>
                                <Link to="/contact" style={styles.link}>Get in Touch</Link>
                                <Link to="/terms" style={styles.link}>Safe Training</Link>
                                <Link to="/privacy" style={styles.link}>Data Privacy</Link>
                            </div>
                        </div>

                        <div style={styles.navCol}>
                            <h3 style={styles.title}>Support</h3>
                            <div style={styles.links}>
                                <a href="mailto:hello@purpulhue.com" style={styles.link}>Help Center</a>
                                <Link to="/how-it-works" style={styles.link}>Member FAQ</Link>
                                <a href="#" style={styles.link}>Trainer Portal</a>
                                <a href="#" style={styles.link}>Gym Partnership</a>
                            </div>
                        </div>
                    </div>

                    {/* Contact & Newsletter */}
                    <div style={styles.contactSection}>
                        <h3 style={styles.title}>Stay in the Loop</h3>
                        <p style={styles.subText}>Get the latest gym drops and training tips.</p>
                        <div style={styles.newsletter}>
                            <input type="email" placeholder="Your email" style={styles.newsInput} />
                            <button style={styles.newsBtn}><ChevronRight size={18} /></button>
                        </div>
                        <div style={styles.visitUs}>
                            <div style={styles.visitItem}>
                                <MapPin size={16} />
                                <span>123 Fitness Street, Mumbai</span>
                            </div>
                            <div style={styles.visitItem}>
                                <Phone size={16} />
                                <span>+91 123 456 7890</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={styles.bottom}>
                    <div style={styles.bottomContent}>
                        <p>&copy; {new Date().getFullYear()} Purpul Hue. Built for Athletes.</p>
                        <div style={styles.legalLinks}>
                            <Link to="/terms" style={styles.legalLink}>Terms</Link>
                            <Link to="/privacy" style={styles.legalLink}>Privacy</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

const styles = {
    footer: {
        background: '#0a0a0a',
        paddingTop: '6rem',
        marginTop: 'auto',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        color: 'white',
        overflow: 'hidden',
    },
    container: {
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 2rem',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1.2fr 2fr 1fr',
        gap: '4rem',
        marginBottom: '4rem',
    },
    brandCard: {
        padding: '2.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        textDecoration: 'none',
    },
    logoText: {
        color: 'white',
        fontSize: '1.5rem',
        fontWeight: 800,
        letterSpacing: '-1px',
    },
    description: {
        color: '#a1a1aa',
        lineHeight: 1.6,
        fontSize: '0.95rem',
    },
    socials: {
        display: 'flex',
        gap: '1rem',
        marginTop: '0.5rem',
    },
    socialLink: {
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#a1a1aa',
        transition: 'all 0.3s ease',
        textDecoration: 'none',
    },
    navSection: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '2rem',
    },
    navCol: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    title: {
        fontSize: '0.8rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '2px',
        color: 'var(--primary)',
        marginBottom: '0.5rem',
    },
    links: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    link: {
        color: '#a1a1aa',
        textDecoration: 'none',
        fontSize: '0.95rem',
        transition: 'all 0.2s ease',
    },
    contactSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    subText: {
        color: '#71717a',
        fontSize: '0.9rem',
    },
    newsletter: {
        display: 'flex',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '0.75rem',
        padding: '0.25rem',
    },
    newsInput: {
        flex: 1,
        background: 'transparent',
        border: 'none',
        padding: '0.75rem 1rem',
        color: 'white',
        fontSize: '0.9rem',
        outline: 'none',
    },
    newsBtn: {
        background: 'var(--primary)',
        color: 'black',
        border: 'none',
        borderRadius: '0.6rem',
        width: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
    },
    visitUs: {
        marginTop: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    visitItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        color: '#a1a1aa',
        fontSize: '0.9rem',
    },
    bottom: {
        padding: '2.5rem 0',
        borderTop: '1px solid rgba(255,255,255,0.05)',
    },
    bottomContent: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#52525b',
        fontSize: '0.85rem',
    },
    legalLinks: {
        display: 'flex',
        gap: '2rem',
    },
    legalLink: {
        color: '#52525b',
        textDecoration: 'none',
        transition: 'color 0.2s',
    },
};

