import { Link } from 'react-router-dom';

export default function Categories() {
    const categories = [
        { name: 'Workout', icon: '💪', color: '#8B5CF6', description: 'Strength training and bodybuilding' },
        { name: 'Yoga', icon: '🧘', color: '#06B6D4', description: 'Mind and body wellness' },
        { name: 'Dance', icon: '💃', color: '#EC4899', description: 'Dance fitness and choreography' },
        { name: 'Zumba', icon: '🎵', color: '#F59E0B', description: 'High-energy dance workouts' },
        { name: 'CrossFit', icon: '🏋️', color: '#10B981', description: 'High-intensity functional training' },
        { name: 'Badminton', icon: '🏸', color: '#EF4444', description: 'Indoor sports and games' },
    ];

    return (
        <div className="container" style={styles.container}>
            <h1 style={styles.title}>Browse by Category</h1>
            <p style={styles.subtitle}>Find gyms that match your fitness goals</p>

            <div className="grid grid-3" style={{ marginTop: '3rem' }}>
                {categories.map((cat) => (
                    <Link
                        key={cat.name}
                        to={`/category/${cat.name.toLowerCase()}`}
                        className="card"
                        style={{ ...styles.categoryCard, borderTopColor: cat.color }}
                    >
                        <div style={{ ...styles.categoryIcon, background: cat.color }}>
                            <span style={styles.icon}>{cat.icon}</span>
                        </div>
                        <h3 style={styles.categoryName}>{cat.name}</h3>
                        <p style={styles.categoryDesc}>{cat.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}

const styles = {
    container: {
        paddingTop: '3rem',
        paddingBottom: '4rem',
        textAlign: 'center',
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
    categoryCard: {
        padding: '2rem',
        textAlign: 'center',
        borderTop: '4px solid',
        textDecoration: 'none',
        color: 'inherit',
    },
    categoryIcon: {
        width: '100px',
        height: '100px',
        margin: '0 auto 1.5rem',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: '3rem',
    },
    categoryName: {
        fontSize: '1.5rem',
        fontWeight: 600,
        marginBottom: '0.5rem',
    },
    categoryDesc: {
        color: 'var(--text-secondary)',
    },
};
