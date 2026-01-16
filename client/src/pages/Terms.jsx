export default function Terms() {
    return (
        <div className="container" style={styles.container}>
            <h1 style={styles.title}>Terms & Conditions</h1>
            <div className="card" style={styles.content}>
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>1. Acceptance of Terms</h2>
                    <p style={styles.text}>
                        By accessing and using FitBook, you accept and agree to be bound by the terms and provision of this agreement.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>2. Use License</h2>
                    <p style={styles.text}>
                        Permission is granted to temporarily use FitBook for personal, non-commercial purposes only.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>3. Booking Policy</h2>
                    <p style={styles.text}>
                        All bookings are subject to availability. Cancellations must be made at least 24 hours in advance for a full refund.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>4. Payment Terms</h2>
                    <p style={styles.text}>
                        All payments are processed securely through Razorpay. Prices are subject to change without notice.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>5. User Conduct</h2>
                    <p style={styles.text}>
                        Users must not misuse the platform or attempt to gain unauthorized access to any part of the service.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>6. Limitation of Liability</h2>
                    <p style={styles.text}>
                        FitBook shall not be liable for any indirect, incidental, special, consequential or punitive damages.
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
