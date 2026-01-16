import { Link } from 'react-router-dom';
import { Sparkles, Instagram, Twitter, Facebook, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
    return (
        <footer style={styles.footer}>
            <div className="container">
                <div style={styles.grid}>
                    {/* Brand */}
                    <div>
                        <Link to="/" style={styles.logo}>
                            <Sparkles size={24} color="white" />
                            <span style={styles.logoText}>Purpul Hue</span>
                        </Link>
                        <p style={styles.description}>
                            Your dedicated space to grow, transform, and thrive. Join the movement today.
                        </p>
                        <div style={styles.socials}>
                            <a href="#" style={styles.socialLink}><Instagram size={18} /></a>
                            <a href="#" style={styles.socialLink}><Twitter size={18} /></a>
                            <a href="#" style={styles.socialLink}><Facebook size={18} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 style={styles.title}>Explore</h3>
                        <div style={styles.links}>
                            <Link to="/explore" style={styles.link}>Services</Link>
                            <Link to="/trainers" style={styles.link}>Trainers</Link>
                            <Link to="/categories" style={styles.link}>Programs</Link>
                            <Link to="/how-it-works" style={styles.link}>How It Works</Link>
                        </div>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 style={styles.title}>Company</h3>
                        <div style={styles.links}>
                            <Link to="/about" style={styles.link}>About Us</Link>
                            <Link to="/contact" style={styles.link}>Contact</Link>
                            <Link to="/terms" style={styles.link}>Terms</Link>
                            <Link to="/privacy" style={styles.link}>Privacy</Link>
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 style={styles.title}>Visit Us</h3>
                        <div style={styles.contactInfo}>
                            <div style={styles.contactItem}>
                                <MapPin size={16} style={{ flexShrink: 0 }} />
                                <span>123 Fitness Street, Mumbai</span>
                            </div>
                            <div style={styles.contactItem}>
                                <Phone size={16} style={{ flexShrink: 0 }} />
                                <span>+91 1234567890</span>
                            </div>
                            <div style={styles.contactItem}>
                                <Mail size={16} style={{ flexShrink: 0 }} />
                                <span>hello@purpulhue.com</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={styles.bottom}>
                    <p>&copy; {new Date().getFullYear()} Purpul Hue. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}

const styles = {
    footer: {
        background: '#000',
        paddingTop: '5rem',
        marginTop: 'auto',
        borderTop: '1px solid #222',
        color: 'white',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '4rem',
        marginBottom: '4rem',
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 2rem',
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        textDecoration: 'none',
    },
    logoText: {
        color: 'white',
        fontSize: '1.25rem',
        fontWeight: 600,
        letterSpacing: '-0.5px',
    },
    description: {
        color: '#a1a1aa',
        lineHeight: 1.6,
        marginBottom: '2rem',
        fontSize: '0.9rem',
        maxWidth: '250px',
    },
    socials: {
        display: 'flex',
        gap: '1rem',
    },
    socialLink: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: '#1a1a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        transition: 'all 0.2s',
        border: '1px solid #333',
        textDecoration: 'none',
    },
    title: {
        fontSize: '0.9rem',
        fontWeight: 600,
        marginBottom: '1.5rem',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        color: 'white',
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
        transition: 'color 0.2s',
        fontWeight: 400,
    },
    contactInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
    },
    contactItem: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        color: '#a1a1aa',
        fontSize: '0.95rem',
        lineHeight: 1.4,
    },
    bottom: {
        padding: '2rem 0',
        borderTop: '1px solid #222',
        textAlign: 'center',
        color: '#52525b',
        fontSize: '0.875rem',
        maxWidth: '1280px',
        margin: '0 auto',
    },
};
