import React, { useState } from 'react';
import { Search, MapPin, LocateFixed, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
    const [search, setSearch] = useState('');
    const [location, setLocation] = useState('');
    const [coords, setCoords] = useState(null);
    const [locating, setLocating] = useState(false);
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (coords) {
            params.append('latitude', coords.latitude);
            params.append('longitude', coords.longitude);
            params.append('radius', 10);
        } else if (location) {
            params.append('city', location);
        }
        navigate(`/explore?${params.toString()}`);
    };

    const detectLocation = () => {
        if (!("geolocation" in navigator)) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoords({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
                setLocation('Current Location');
                setLocating(false);
            },
            (error) => {
                console.error("Error detecting location:", error);
                setLocating(false);
                alert("Unable to retrieve your location");
            }
        );
    };

    return (
        <form onSubmit={handleSearch} style={styles.searchBar}>
            <div style={styles.inputGroup}>
                <Search size={20} color="var(--text-secondary)" />
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
                <MapPin size={20} color="var(--text-secondary)" />
                <input
                    type="text"
                    placeholder="Location or City"
                    value={location}
                    onChange={(e) => {
                        setLocation(e.target.value);
                        if (coords) setCoords(null); // Reset coords if user types manually
                    }}
                    style={styles.input}
                />
                <button
                    type="button"
                    onClick={detectLocation}
                    disabled={locating}
                    style={styles.detectBtn}
                    title="Detect current location"
                >
                    {locating ? <Loader2 size={18} className="spinner" /> : <LocateFixed size={18} />}
                </button>
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
        background: '#1a1a1a',
        borderRadius: '999px',
        padding: '0.5rem',
        border: '1px solid #333',
        maxWidth: '900px',
        margin: '0 auto',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    },
    inputGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flex: 1,
        padding: '0.5rem 1.25rem',
    },
    input: {
        border: 'none',
        outline: 'none',
        fontSize: '1rem',
        width: '100%',
        background: 'transparent',
        color: 'white',
    },
    detectBtn: {
        background: 'transparent',
        border: 'none',
        color: 'var(--primary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.25rem',
        borderRadius: '50%',
        transition: 'background 0.2s',
        ':hover': {
            background: 'rgba(255,255,255,0.1)',
        }
    },
    divider: {
        width: '1px',
        height: '30px',
        background: '#333',
    },
    button: {
        whiteSpace: 'nowrap',
        borderRadius: '999px',
        padding: '0.75rem 2rem',
        fontWeight: 700,
    },
};
