import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
    const [search, setSearch] = useState('');
    const [location, setLocation] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (location) params.append('city', location);
        navigate(`/explore?${params.toString()}`);
    };

    return (
        <form onSubmit={handleSearch} style={styles.searchBar}>
            <div style={styles.inputGroup}>
                <Search size={20} color="var(--text-tertiary)" />
                <input
                    type="text"
                    placeholder="Search gyms, trainers, activities..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={styles.input}
                />
            </div>

            <div style={styles.divider} />

            <div style={styles.inputGroup}>
                <MapPin size={20} color="var(--text-tertiary)" />
                <input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={styles.input}
                />
            </div>

            <button type="submit" className="btn btn-primary" style={styles.button}>
                Search
            </button>
        </form>
    );
}

const styles = {
    searchBar: {
        display: 'flex',
        alignItems: 'center',
        background: 'white',
        borderRadius: 'var(--radius-xl)',
        padding: '0.5rem',
        boxShadow: 'var(--shadow-xl)',
        maxWidth: '800px',
        margin: '0 auto',
    },
    inputGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flex: 1,
        padding: '0.5rem 1rem',
    },
    input: {
        border: 'none',
        outline: 'none',
        fontSize: '1rem',
        width: '100%',
        background: 'transparent',
    },
    divider: {
        width: '1px',
        height: '40px',
        background: 'var(--border)',
    },
    button: {
        whiteSpace: 'nowrap',
    },
};
