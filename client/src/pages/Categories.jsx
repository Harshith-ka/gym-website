import React from 'react';
import { Link } from 'react-router-dom';

export default function Categories() {
    const categories = [
        { name: 'Workout', icon: '💪', color: '#8B5CF6', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop', description: 'Strength training and bodybuilding' },
        { name: 'Yoga', icon: '🧘', color: '#06B6D4', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop', description: 'Mind and body wellness' },
        { name: 'Dance', icon: '💃', color: '#EC4899', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop', description: 'Dance fitness and choreography' },
        { name: 'Zumba', icon: '🎵', color: '#F59E0B', image: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?q=80&w=600&auto=format&fit=crop', description: 'High-energy dance workouts' },
        { name: 'CrossFit', icon: '🏋️', color: '#10B981', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600&auto=format&fit=crop', description: 'High-intensity functional training' },
        { name: 'Badminton', icon: '🏸', color: '#EF4444', image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=600&auto=format&fit=crop', description: 'Indoor sports and games' },
    ];

    return (
        <div style={{ background: '#000', color: 'white', minHeight: '100vh' }}>
            <div className="container" style={styles.container}>
                <h1 style={styles.title}>Browse by Category</h1>
                <p style={styles.subtitle}>Find premium fitness spaces that match your goals</p>

                <div className="grid grid-3" style={{ marginTop: '4rem' }}>
                    {categories.map((cat) => (
                        <Link
                            key={cat.name}
                            to={`/category/${cat.name.toLowerCase()}`}
                            style={styles.categoryCard}
                        >
                            <div style={styles.imageContainer}>
                                <img src={cat.image} alt={cat.name} style={styles.image} />
                                <div style={styles.overlay}>
                                    <div style={{ ...styles.content, borderLeft: `4px solid ${cat.color}` }}>
                                        <div style={styles.header}>
                                            <span style={styles.icon}>{cat.icon}</span>
                                            <h3 style={styles.categoryName}>{cat.name}</h3>
                                        </div>
                                        <p style={styles.categoryDesc}>{cat.description}</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        paddingTop: '5rem',
        paddingBottom: '8rem',
        textAlign: 'center',
    },
    title: {
        fontSize: '3.5rem',
        fontWeight: 800,
        marginBottom: '1rem',
        letterSpacing: '-1px',
    },
    subtitle: {
        fontSize: '1.25rem',
        color: '#a1a1aa',
        maxWidth: '600px',
        margin: '0 auto',
    },
    categoryCard: {
        height: '320px',
        borderRadius: '2rem',
        overflow: 'hidden',
        position: 'relative',
        textDecoration: 'none',
        transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        cursor: 'pointer',
    },
    imageContainer: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    overlay: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '2rem',
    },
    content: {
        textAlign: 'left',
        paddingLeft: '1.5rem',
        background: 'rgba(0,0,0,0.2)',
        backdropFilter: 'blur(10px)',
        padding: '1.5rem',
        borderRadius: '1rem',
        border: '1px solid rgba(255,255,255,0.1)',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '0.75rem',
    },
    icon: {
        fontSize: '2rem',
    },
    categoryName: {
        fontSize: '1.5rem',
        fontWeight: 700,
        color: 'white',
        margin: 0,
    },
    categoryDesc: {
        color: '#d4d4d8',
        fontSize: '0.95rem',
        lineHeight: 1.5,
        margin: 0,
    },
};
