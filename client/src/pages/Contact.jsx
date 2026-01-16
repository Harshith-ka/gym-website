import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Implement actual contact form submission
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setFormData({ name: '', email: '', subject: '', message: '' });
        }, 3000);
    };

    return (
        <div className="container" style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Contact Us</h1>
                <p style={styles.subtitle}>
                    Have questions? We'd love to hear from you.
                </p>
            </div>

            <div style={styles.content}>
                {/* Contact Form */}
                <div className="card" style={styles.formCard}>
                    <h2 style={styles.formTitle}>Send us a Message</h2>

                    {submitted ? (
                        <div style={styles.success}>
                            <Send size={48} color="var(--success)" />
                            <h3>Message Sent!</h3>
                            <p>We'll get back to you soon.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input"
                                    required
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input"
                                    required
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Subject</label>
                                <input
                                    type="text"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="input"
                                    required
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Message</label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="input"
                                    rows="6"
                                    required
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                Send Message
                            </button>
                        </form>
                    )}
                </div>

                {/* Contact Info */}
                <div style={styles.infoSection}>
                    <div className="card" style={styles.infoCard}>
                        <div style={styles.infoIcon}>
                            <Mail size={24} />
                        </div>
                        <h3 style={styles.infoTitle}>Email</h3>
                        <p style={styles.infoText}>support@fitbook.com</p>
                    </div>

                    <div className="card" style={styles.infoCard}>
                        <div style={styles.infoIcon}>
                            <Phone size={24} />
                        </div>
                        <h3 style={styles.infoTitle}>Phone</h3>
                        <p style={styles.infoText}>+91 1234567890</p>
                    </div>

                    <div className="card" style={styles.infoCard}>
                        <div style={styles.infoIcon}>
                            <MapPin size={24} />
                        </div>
                        <h3 style={styles.infoTitle}>Address</h3>
                        <p style={styles.infoText}>
                            123 Fitness Street<br />
                            Mumbai, India 400001
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        paddingTop: '3rem',
        paddingBottom: '4rem',
    },
    header: {
        textAlign: 'center',
        marginBottom: '3rem',
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: 700,
        marginBottom: '0.5rem',
    },
    subtitle: {
        fontSize: '1.125rem',
        color: 'var(--text-secondary)',
    },
    content: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '2rem',
    },
    formCard: {
        padding: '2rem',
    },
    formTitle: {
        fontSize: '1.5rem',
        fontWeight: 600,
        marginBottom: '2rem',
    },
    inputGroup: {
        marginBottom: '1.5rem',
    },
    label: {
        display: 'block',
        fontWeight: 600,
        marginBottom: '0.5rem',
        fontSize: '0.875rem',
    },
    success: {
        textAlign: 'center',
        padding: '3rem 0',
    },
    infoSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    infoCard: {
        padding: '1.5rem',
        textAlign: 'center',
    },
    infoIcon: {
        width: '60px',
        height: '60px',
        margin: '0 auto 1rem',
        background: 'var(--gradient-primary)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
    },
    infoTitle: {
        fontSize: '1.125rem',
        fontWeight: 600,
        marginBottom: '0.5rem',
    },
    infoText: {
        color: 'var(--text-secondary)',
        lineHeight: 1.6,
    },
};
