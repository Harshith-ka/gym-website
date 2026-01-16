import React from 'react';

export default function Privacy() {
    return (
        <div className="container" style={styles.container}>
            <h1 style={styles.title}>Privacy Policy</h1>
            <div className="card" style={styles.content}>
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>1. Information We Collect</h2>
                    <p style={styles.text}>
                        We collect information you provide directly to us, including name, email, phone number, and payment information.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>2. How We Use Your Information</h2>
                    <p style={styles.text}>
                        We use the information we collect to provide, maintain, and improve our services, process bookings, and communicate with you.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>3. Information Sharing</h2>
                    <p style={styles.text}>
                        We do not share your personal information with third parties except as necessary to provide our services or as required by law.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>4. Data Security</h2>
                    <p style={styles.text}>
                        We implement appropriate security measures to protect your personal information from unauthorized access and disclosure.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>5. Cookies</h2>
                    <p style={styles.text}>
                        We use cookies and similar tracking technologies to track activity on our service and hold certain information.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>6. Your Rights</h2>
                    <p style={styles.text}>
                        You have the right to access, update, or delete your personal information at any time through your account settings.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>7. Contact Us</h2>
                    <p style={styles.text}>
                        If you have any questions about this Privacy Policy, please contact us at privacy@fitbook.com
                    </p>
                </section>
            </div>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '900px',
        paddingTop: '3rem',
        paddingBottom: '4rem',
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: 700,
        marginBottom: '2rem',
        textAlign: 'center',
    },
    content: {
        padding: '3rem',
    },
    section: {
        marginBottom: '2.5rem',
    },
    sectionTitle: {
        fontSize: '1.25rem',
        fontWeight: 600,
        marginBottom: '1rem',
    },
    text: {
        lineHeight: 1.8,
        color: 'var(--text-secondary)',
    },
};
