import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, User, MessageSquare } from 'lucide-react';

export default function Contact() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: '',
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setFormData({ firstName: '', lastName: '', email: '', phone: '', message: '' });
        }, 3000);
    };

    return (
        <div style={styles.pageWrapper}>
            {/* Hero Section */}
            <section className="contact-orange-hero">
                <div className="container" style={styles.heroContent}>
                    <h1 style={styles.heroTitle}>Contact</h1>
                    <p style={styles.heroSub}>
                        Let's start something great together. Get in touch with one of the team today!
                    </p>
                </div>

                {/* Floating Avatars */}
                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop" style={{ ...styles.avatar, top: '25%', left: '15%', width: '80px', height: '80px' }} className="floating-avatar" alt="" />
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop" style={{ ...styles.avatar, top: '60%', left: '25%', width: '100px', height: '100px' }} className="floating-avatar" alt="" />
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop" style={{ ...styles.avatar, top: '30%', right: '20%', width: '120px', height: '120px' }} className="floating-avatar" alt="" />
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop" style={{ ...styles.avatar, top: '70%', right: '15%', width: '90px', height: '90px' }} className="floating-avatar" alt="" />

                {/* Wavy Divider */}
                <div className="wavy-divider">
                    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
                    </svg>
                </div>
            </section>

            {/* Dark Content Section */}
            <section className="contact-dark-section">
                <div className="container" style={styles.contentGrid}>
                    {/* Left Side: Info */}
                    <div className="contact-info-list" style={styles.infoCol}>
                        <div style={styles.infoGroup}>
                            <h2 style={styles.groupMainTitle}>Get in touch</h2>
                        </div>

                        <div className="contact-info-item">
                            <h3>Phone</h3>
                            <p>Due to current health guidelines, our full team is working remotely. Please email us or request a callback.</p>
                            <div className="office-links">
                                <a href="tel:+911234567890">+91 123 456 7890</a>
                            </div>
                        </div>

                        <div className="contact-info-item">
                            <h3>Email</h3>
                            <div className="office-links">
                                <a href="mailto:hello@gymato.com">hello@gymato.com</a>
                                <a href="mailto:business@gymato.com">business@gymato.com</a>
                                <a href="mailto:support@gymato.com">support@gymato.com</a>
                            </div>
                        </div>

                        <div className="contact-info-item">
                            <h3>London Office</h3>
                            <p>789, Strata Building, Walworth Road, London, SE1 6EG</p>
                        </div>

                        <div className="contact-info-item">
                            <h3>Bournemouth Office</h3>
                            <p>46 Throopside Avenue, Bournemouth, BH9 3NR</p>
                        </div>
                    </div>

                    {/* Right Side: Form */}
                    <div className="contact-card-dark" style={styles.formCard}>
                        {submitted ? (
                            <div style={styles.success}>
                                <div style={styles.successIcon}><Send size={48} color="#ef4444" /></div>
                                <h2 style={{ color: 'white', fontSize: '2rem', fontWeight: 800 }}>Transmission Received</h2>
                                <p style={{ color: '#a1a1aa', marginTop: '1rem' }}>An expert will coordinate with you shortly.</p>
                                <button onClick={() => setSubmitted(false)} className="contact-submit-btn" style={{ marginTop: '2.5rem', maxWidth: '200px' }}>
                                    Send Another
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} style={styles.form}>
                                <div style={styles.row}>
                                    <div style={styles.inputGroup}>
                                        <label className="label">First name</label>
                                        <div style={styles.inputWrapper}>
                                            <User size={18} color="#64748b" style={styles.inputIcon} />
                                            <input
                                                type="text"
                                                id="firstName"
                                                name="firstName"
                                                className="input"
                                                placeholder="Mike"
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label className="label">Last name</label>
                                        <div style={styles.inputWrapper}>
                                            <input
                                                type="text"
                                                id="lastName"
                                                name="lastName"
                                                className="input"
                                                placeholder="Doe"
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div style={styles.inputGroup}>
                                    <label className="label">Email</label>
                                    <div style={styles.inputWrapper}>
                                        <Mail size={18} color="#64748b" style={styles.inputIcon} />
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            className="input"
                                            placeholder="Type email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div style={styles.inputGroup}>
                                    <label className="label">Phone number</label>
                                    <div style={styles.inputWrapper}>
                                        <Phone size={18} color="#64748b" style={styles.inputIcon} />
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            className="input"
                                            placeholder="Type phone number"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div style={styles.inputGroup}>
                                    <label className="label">Message</label>
                                    <div style={styles.inputWrapper}>
                                        <MessageSquare size={18} color="#64748b" style={{ ...styles.inputIcon, top: '24px' }} />
                                        <textarea
                                            id="message"
                                            name="message"
                                            className="input"
                                            style={{ minHeight: '130px', paddingTop: '1rem' }}
                                            placeholder="Type message"
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="contact-submit-btn">
                                    Send
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <div className="map-container-dark">
                <iframe
                    title="office-location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d120713.41160351051!2d72.7410977823377!3d19.006450537482!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7ce40ffcf3ad3%3A0x8690e3ef29302633!2sWorli%2C%20Mumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1705600000000!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0, filter: 'grayscale(1) invert(0.9) contrast(1.2)' }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </div>
        </div>
    );
}

const styles = {
    pageWrapper: {
        background: '#0a0a0a',
        minHeight: '100vh',
    },
    heroContent: {
        textAlign: 'center',
        padding: '0 1rem',
        position: 'relative',
        zIndex: 10,
    },
    heroTitle: {
        fontSize: '4.5rem',
        fontWeight: 900,
        marginBottom: '1rem',
        color: 'white',
        textShadow: '0 4px 15px rgba(0,0,0,0.1)',
        letterSpacing: '-2px',
    },
    heroSub: {
        fontSize: '1.25rem',
        maxWidth: '500px',
        margin: '0 auto',
        color: 'rgba(255, 255, 255, 0.9)',
        lineHeight: 1.6,
        fontWeight: 500,
    },
    avatar: {
        zIndex: 5,
    },
    contentGrid: {
        display: 'grid',
        gridTemplateColumns: 'minmax(300px, 1fr) 1.5fr',
        gap: '6rem',
        alignItems: 'start',
    },
    infoCol: {
        paddingTop: '2rem',
    },
    groupMainTitle: {
        fontSize: '2.5rem',
        fontWeight: 800,
        color: 'white',
        marginBottom: '2rem',
    },
    formCard: {
        marginTop: '-12rem',
        position: 'relative',
        zIndex: 20,
    },
    row: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.5rem',
    },
    inputGroup: {
        marginBottom: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
    },
    inputWrapper: {
        position: 'relative',
    },
    inputIcon: {
        position: 'absolute',
        top: '50%',
        left: '1.25rem',
        transform: 'translateY(-50%)',
        zIndex: 5,
    },
    success: {
        textAlign: 'center',
        padding: '2rem 0',
    },
    successIcon: {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: 'rgba(239, 68, 68, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 2rem',
        border: '1px solid rgba(239, 68, 68, 0.1)',
    }
};
