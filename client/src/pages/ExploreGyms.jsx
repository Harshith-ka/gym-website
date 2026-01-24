import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { Search, MapPin, Star, SlidersHorizontal, X, LocateFixed, AlertCircle } from 'lucide-react';
import api from '../services/api';
import GymCard from '../components/GymCard';
import SearchBar from '../components/SearchBar';

export default function ExploreGyms() {
    const [searchParams] = useSearchParams();
    const { category: pathCategory } = useParams();
    const navigate = useNavigate();
    const [gyms, setGyms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false); // Mobile toggle
    const [searchExpanded, setSearchExpanded] = useState(false);
    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        city: searchParams.get('city') || '',
        category: pathCategory || searchParams.get('category') || '',
        minPrice: '',
        maxPrice: '',
        minRating: '',
        latitude: searchParams.get('latitude') || '',
        longitude: searchParams.get('longitude') || '',
        radius: searchParams.get('radius') || 10,
        isOpen: '',
        hasSingleSession: '',
        matchTime: '',
    });

    useEffect(() => {
        const initialCategory = pathCategory || searchParams.get('category') || '';
        const initialFilters = { ...filters, category: initialCategory };
        setFilters(initialFilters);
        fetchGyms(initialFilters);
    }, [pathCategory, searchParams]);

    const fetchGyms = async (activeFilters = filters) => {
        try {
            setLoading(true);
            const params = new URLSearchParams();

            if (activeFilters.search) params.append('search', activeFilters.search);
            if (activeFilters.city) params.append('city', activeFilters.city);
            if (activeFilters.category) params.append('category', activeFilters.category);
            if (activeFilters.minPrice) params.append('minPrice', activeFilters.minPrice);
            if (activeFilters.maxPrice) params.append('maxPrice', activeFilters.maxPrice);
            if (activeFilters.minRating) params.append('minRating', activeFilters.minRating);
            if (activeFilters.isOpen) params.append('isOpen', activeFilters.isOpen);
            if (activeFilters.hasSingleSession) params.append('hasSingleSession', activeFilters.hasSingleSession);
            if (activeFilters.matchTime) params.append('matchTime', activeFilters.matchTime);

            if (activeFilters.latitude && activeFilters.longitude) {
                params.append('latitude', activeFilters.latitude);
                params.append('longitude', activeFilters.longitude);
                params.append('radius', activeFilters.radius);
            }

            const response = await api.get(`/gyms/search?${params.toString()}`);
            setGyms(response.data.gyms);
            setSearchExpanded(response.data.searchExpanded || false);
        } catch (error) {
            console.error('Error fetching gyms:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
    };

    const applyFilters = () => {
        fetchGyms();
        setShowFilters(false);
    };

    const clearFilters = () => {
        const resetFilters = {
            minPrice: '',
            maxPrice: '',
            minRating: '',
            category: '',
            serviceType: '',
            isOpen: '',
            latitude: '',
            longitude: '',
            radius: 10
        };
        setFilters(resetFilters);
        fetchGyms(resetFilters);
    };

    const handleNearMe = () => {
        if ("geolocation" in navigator) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newFilters = {
                        ...filters,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        radius: 10
                    };
                    setFilters(newFilters);
                    fetchGyms(newFilters);
                },
                (error) => {
                    console.error("Error getting location", error);
                    setLoading(false);
                    alert("Could not access your location. Please check your browser settings.");
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    };

    const categories = [
        { id: 'workout', label: 'Workout / Strength Training' },
        { id: 'dance', label: 'Dance' },
        { id: 'zumba', label: 'Zumba' },
        { id: 'yoga', label: 'Yoga' },
        { id: 'badminton', label: 'Badminton / Indoor Sports' },
        { id: 'crossfit', label: 'CrossFit / Functional Training' }
    ];

    return (
        <div className="container" style={styles.container}>
            {/* Header */}
            <header className="explore-header" style={styles.header}>
                <div>
                    <h1 style={styles.title}>Explore Gyms</h1>
                    <p style={styles.subtitle}>
                        <span style={{ color: '#fff', fontWeight: 600 }}>{gyms.length}</span> premium spaces pending for you
                    </p>
                </div>
                {/* Mobile Filter Toggle */}
                <button
                    onClick={() => setShowFilters(true)}
                    className="mobile-filter-btn"
                    style={styles.mobileFilterBtn}
                >
                    <SlidersHorizontal size={18} /> Filters
                </button>
            </header>

            {/* Search Bar */}
            <div style={styles.searchSection}>
                <SearchBar />
            </div>

            <div className="explore-content" style={styles.content}>
                {/* Filters Sidebar */}
                <aside className={`explore-sidebar filter-sidebar-glass ${showFilters ? 'open' : ''}`} style={styles.sidebar}>
                    <div style={styles.sidebarHeader}>
                        <h3 style={styles.filterTitle}>
                            <SlidersHorizontal size={18} />
                            Filters
                        </h3>
                        {showFilters && (
                            <button
                                onClick={() => setShowFilters(false)}
                                style={styles.closeBtn}
                                className="close-btn"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    <div className="filter-groups-container" style={{ ...styles.filterGroups, paddingBottom: showFilters ? '80px' : '0' }}>
                        {/* Location Group */}
                        <div className="filter-group-card">
                            <label style={styles.label}>Location</label>
                            <button
                                onClick={handleNearMe}
                                className={`near-me-pulse ${filters.latitude ? 'active' : ''}`}
                                style={{
                                    ...styles.nearMeBtn,
                                    background: filters.latitude ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                    color: filters.latitude ? 'black' : 'white',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    marginBottom: 0
                                }}
                            >
                                <LocateFixed size={18} />
                                {filters.latitude ? 'Current Location' : 'Search Near Me'}
                            </button>
                        </div>

                        {/* Availability Group */}
                        <div className="filter-group-card">
                            <label style={styles.label}>Availability</label>
                            <div style={styles.checkboxGroup}>
                                <label className="custom-toggle">
                                    <span style={styles.checkboxLabel}>Open Now</span>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="checkbox"
                                            checked={filters.isOpen === 'true'}
                                            onChange={(e) => handleFilterChange('isOpen', e.target.checked ? 'true' : '')}
                                            style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer', zIndex: 1 }}
                                        />
                                        <div className="toggle-switch"></div>
                                    </div>
                                </label>
                                <label className="custom-toggle">
                                    <span style={styles.checkboxLabel}>Single Session</span>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="checkbox"
                                            checked={filters.hasSingleSession === 'true'}
                                            onChange={(e) => handleFilterChange('hasSingleSession', e.target.checked ? 'true' : '')}
                                            style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer', zIndex: 1 }}
                                        />
                                        <div className="toggle-switch"></div>
                                    </div>
                                </label>
                            </div>

                            {/* Time Match */}
                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <label style={{ ...styles.label, fontSize: '0.8rem', marginBottom: '0.5rem' }}>Check specific time:</label>
                                <input
                                    type="time"
                                    value={filters.matchTime || ''}
                                    onChange={(e) => handleFilterChange('matchTime', e.target.value)}
                                    style={{ ...styles.input, background: 'rgba(255,255,255,0.05)' }}
                                />
                            </div>
                        </div>

                        {/* Categories Group */}
                        <div className="filter-group-card">
                            <label style={styles.label}>Categories</label>
                            <div className="chip-group">
                                {categories.map(cat => {
                                    const isActive = filters.category.split(',').includes(cat.id);
                                    return (
                                        <button
                                            key={cat.id}
                                            className={`chip ${isActive ? 'active' : ''}`}
                                            onClick={() => {
                                                const current = filters.category ? filters.category.split(',') : [];
                                                let newCats;
                                                if (!isActive) {
                                                    newCats = [...current, cat.id];
                                                } else {
                                                    newCats = current.filter(c => c !== cat.id);
                                                }
                                                handleFilterChange('category', newCats.join(','));
                                            }}
                                        >
                                            {cat.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Pricing & Rating Group */}
                        <div className="filter-group-card">
                            <label style={styles.label}>Price Range (₹)</label>
                            <div style={styles.priceInputs}>
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.minPrice}
                                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                    style={{ ...styles.input, background: 'rgba(255,255,255,0.05)' }}
                                />
                                <span style={{ color: '#666' }}>-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.maxPrice}
                                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                    style={{ ...styles.input, background: 'rgba(255,255,255,0.05)' }}
                                />
                            </div>

                            <div style={{ marginTop: '1.5rem' }}>
                                <label style={styles.label}>Minimum Rating</label>
                                <div style={styles.selectWrapper}>
                                    <select
                                        value={filters.minRating}
                                        onChange={(e) => handleFilterChange('minRating', e.target.value)}
                                        style={{ ...styles.select, background: 'rgba(255,255,255,0.05)' }}
                                    >
                                        <option value="">Any Rating</option>
                                        <option value="4">4.0+ Stars</option>
                                        <option value="3">3.0+ Stars</option>
                                        <option value="2">2.0+ Stars</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className={showFilters ? "filter-footer-sticky" : "filter-actions"} style={styles.filterActions}>
                        <button onClick={applyFilters} style={styles.applyBtn}>Apply Filters</button>
                        <button onClick={clearFilters} style={styles.clearBtn}>Clear All</button>
                    </div>
                </aside>

                {showFilters && <div style={styles.overlay} onClick={() => setShowFilters(false)} />
                }

                <main style={styles.main}>
                    {loading ? (
                        <div style={styles.loading}>
                            <div className="spinner" />
                        </div>
                    ) : (
                        <>
                            {searchExpanded && gyms.length > 0 && (
                                <div style={styles.expandedNotice}>
                                    <AlertCircle size={20} />
                                    <span>No gyms found within {filters.radius}km. Showing closest available gyms.</span>
                                </div>
                            )}

                            {gyms.length === 0 ? (
                                <div style={styles.empty}>
                                    <div style={styles.emptyIcon}><Search size={48} /></div>
                                    <h3>No gyms found</h3>
                                    <p>Try adjusting your search or filters to find what you're looking for.</p>
                                    <button onClick={() => { clearFilters(); setSearchExpanded(false); }} style={styles.resetBtn}>Reset Filters</button>
                                </div>
                            ) : (
                                <div className="grid grid-3">
                                    {gyms.map((gym) => (
                                        <GymCard key={gym.id} gym={gym} />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div >
        </div >
    );
}

const styles = {
    container: {
        paddingTop: '2rem',
        paddingBottom: '4rem',
        minHeight: '100vh',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'end',
        marginBottom: '2rem',
        borderBottom: '1px solid #222',
        paddingBottom: '2rem',
    },
    title: {
        fontSize: '3rem',
        fontWeight: 700,
        marginBottom: '0.5rem',
        color: 'white',
        letterSpacing: '-1px',
    },
    subtitle: {
        color: '#a1a1aa',
        fontSize: '1.1rem',
    },
    mobileFilterBtn: {
        display: 'none',
        background: '#1a1a1a',
        color: 'white',
        border: '1px solid #333',
        padding: '0.75rem 1.25rem',
        borderRadius: '0.5rem',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        '@media (max-width: 768px)': {
            display: 'flex',
        }
    },
    searchSection: {
        marginBottom: '2rem',
    },
    content: {
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        gap: '3rem',
    },
    sidebar: {
        position: 'sticky',
        top: '100px',
        height: 'fit-content',
        background: '#1a1a1a',
        padding: '1.5rem',
        borderRadius: '1rem',
        border: '1px solid #333',
        zIndex: 50,
    },
    mobileSidebarOpen: {
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: '80%',
        maxWidth: '320px',
        overflowY: 'auto',
        borderRadius: 0,
        border: 'none',
        borderRight: '1px solid #333',
        display: 'block',
    },
    mobileSidebarClosed: {},
    sidebarHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #333',
    },
    filterTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '1.1rem',
        fontWeight: 600,
        color: 'white',
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: '#a1a1aa',
        cursor: 'pointer',
        display: 'none',
    },
    filterGroups: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
    },
    filterGroup: {},
    label: {
        display: 'block',
        fontWeight: 600,
        marginBottom: '1rem',
        fontSize: '0.85rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: '#71717a',
    },
    input: {
        background: '#27272a',
        border: '1px solid #333',
        color: 'white',
        padding: '0.75rem',
        borderRadius: '0.5rem',
        width: '100%',
        fontSize: '0.9rem',
        outline: 'none',
    },
    selectWrapper: {
        position: 'relative',
    },
    select: {
        background: '#27272a',
        border: '1px solid #333',
        color: 'white',
        padding: '0.75rem',
        borderRadius: '0.5rem',
        width: '100%',
        fontSize: '0.9rem',
        outline: 'none',
        appearance: 'none',
        cursor: 'pointer',
    },
    priceInputs: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    categoryList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    checkbox: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        cursor: 'pointer',
    },
    checkboxInput: {
        accentColor: '#fff',
        width: '16px',
        height: '16px',
        cursor: 'pointer',
    },
    radioInput: {
        accentColor: '#fff',
        width: '16px',
        height: '16px',
        cursor: 'pointer',
    },
    checkboxLabel: {
        fontSize: '0.95rem',
        color: '#d4d4d8',
    },
    filterActions: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        marginTop: '1rem',
    },
    applyBtn: {
        width: '100%',
        justifyContent: 'center',
        background: 'white',
        color: 'black',
    },
    clearBtn: {
        background: 'transparent',
        border: '1px solid #333',
        color: '#a1a1aa',
        padding: '0.75rem',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        fontSize: '0.9rem',
        transition: 'all 0.2s',
    },
    nearMeBtn: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: 600,
        marginBottom: '1rem',
        transition: 'all 0.2s',
    },
    overlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(4px)',
        zIndex: 40,
    },
    main: {
        minHeight: '600px',
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        padding: '4rem',
    },
    empty: {
        textAlign: 'center',
        padding: '6rem 2rem',
        color: '#a1a1aa',
        border: '1px dashed #333',
        borderRadius: '1rem',
        background: '#111',
    },
    emptyIcon: {
        marginBottom: '1.5rem',
        color: '#333',
    },
    resetBtn: {
        marginTop: '1.5rem',
        background: 'white',
        color: 'black',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '999px',
        fontWeight: 600,
        cursor: 'pointer',
    },
    expandedNotice: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1rem 1.25rem',
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid #3b82f6',
        borderRadius: '0.75rem',
        color: '#60a5fa',
        fontSize: '0.95rem',
        marginBottom: '2rem',
    },
};
