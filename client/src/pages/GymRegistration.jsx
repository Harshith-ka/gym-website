import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Phone, Mail, Image, LocateFixed, Loader2 } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import api from '../services/api';

export default function GymRegistration() {
    const navigate = useNavigate();
    const { getToken } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        email: '',
        categories: [],
        facilities: '',
        latitude: '',
        longitude: '',
    });
    const [locating, setLocating] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const categories = [
        { id: 'workout', label: 'Workout / Strength Training' },
        { id: 'dance', label: 'Dance' },
        { id: 'zumba', label: 'Zumba' },
        { id: 'yoga', label: 'Yoga' },
        { id: 'badminton', label: 'Badminton / Indoor Sports' },
        { id: 'crossfit', label: 'CrossFit / Functional Training' }
    ];

    const handleCategoryToggle = (categoryId) => {
        setFormData({
            ...formData,
            categories: formData.categories.includes(categoryId)
                ? formData.categories.filter(c => c !== categoryId)
                : [...formData.categories, categoryId],
        });
    };

    const detectLocation = () => {
        if (!("geolocation" in navigator)) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData(prev => ({
                    ...prev,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }));
                setLocating(false);
            },
            (error) => {
                console.error("Error detecting location:", error);
                setLocating(false);
                alert("Unable to retrieve your location. Please ensure location access is granted.");
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.categories.length === 0) {
            alert('Please select at least one category');
            return;
        }

        try {
            setSubmitting(true);
            const token = await getToken();

            // First update user role to gym_owner
            await api.post('/auth/update-role', { role: 'gym_owner' }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Then register gym
            const facilitiesArray = formData.facilities
                .split(',')
                .map(f => f.trim())
                .filter(f => f);

            await api.post('/gyms', {
                ...formData,
                facilities: facilitiesArray,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Gym registration submitted! Awaiting admin approval.');
            navigate('/gym-dashboard');
        } catch (error) {
            console.error('Registration error:', error);
            alert('Failed to register gym');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container" style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Register Your Gym</h1>
                <p style={styles.subtitle}>
                    Join our platform and reach thousands of fitness enthusiasts
                </p>
            </div>

            <form onSubmit={handleSubmit} className="card" style={styles.form}>
                {/* Basic Information */}
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>
                        <Building2 size={24} />
                        Basic Information
                    </h2>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Gym Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input"
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="input"
                            rows="4"
                            placeholder="Tell us about your gym..."
                        />
                    </div>
                </section>

                {/* Location */}
                <section style={styles.section}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ ...styles.sectionTitle, marginBottom: 0 }}>
                            <MapPin size={24} />
                            Location
                        </h2>
                        <button
                            type="button"
                            onClick={detectLocation}
                            disabled={locating}
                            style={styles.detectBtn}
                        >
                            {locating ? <Loader2 size={16} className="spinner" /> : <LocateFixed size={16} />}
                            {locating ? ' Detecting...' : ' Detect My Coordinates'}
                        </button>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Address *</label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="input"
                            required
                        />
                    </div>

                    <div style={styles.row}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>City *</label>
                            <input
                                type="text"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="input"
                                required
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Latitude</label>
                            <input
                                type="number"
                                step="any"
                                value={formData.latitude}
                                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                className="input"
                                placeholder="Auto-detected or enter manually"
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Longitude</label>
                            <input
                                type="number"
                                step="any"
                                value={formData.longitude}
                                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                className="input"
                                placeholder="Auto-detected or enter manually"
                            />
                        </div>
                    </div>
                </section>

                {/* Contact */}
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>
                        <Phone size={24} />
                        Contact Information
                    </h2>

                    <div style={styles.row}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Phone *</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                            />
                        </div>
                    </div>
                </section>

                {/* Categories */}
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>Categories *</h2>
                    <div style={styles.categories}>
                        {categories.map((cat) => (
                            <label key={cat.id} style={styles.categoryLabel}>
                                <input
                                    type="checkbox"
                                    checked={formData.categories.includes(cat.id)}
                                    onChange={() => handleCategoryToggle(cat.id)}
                                />
                                <span style={styles.categoryText}>
                                    {cat.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </section>

                {/* Facilities */}
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>Facilities</h2>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>
                            List your facilities (comma-separated)
                        </label>
                        <input
                            type="text"
                            value={formData.facilities}
                            onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                            className="input"
                            placeholder="e.g., Locker rooms, Showers, Parking, WiFi"
                        />
                    </div>
                </section>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%' }}
                >
                    {submitting ? 'Submitting...' : 'Submit for Approval'}
                </button>

                <p style={styles.note}>
                    * Your gym will be reviewed by our team and activated within 24-48 hours
                </p>
            </form>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '800px',
        paddingTop: '2rem',
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
    form: {
        padding: '2rem',
    },
    section: {
        marginBottom: '2.5rem',
        paddingBottom: '2.5rem',
        borderBottom: '1px solid var(--border)',
    },
    sectionTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '1.25rem',
        fontWeight: 600,
        marginBottom: '1.5rem',
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
    row: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
    },
    categories: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
    },
    categoryLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
    },
    categoryText: {
        fontSize: '0.875rem',
        fontWeight: 500,
    },
    note: {
        textAlign: 'center',
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
        marginTop: '1rem',
    },
    detectBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        background: 'rgba(139, 92, 246, 0.1)',
        border: '1px solid var(--primary)',
        borderRadius: '999px',
        color: 'var(--primary)',
        fontSize: '0.875rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
        ':hover': {
            background: 'var(--primary)',
            color: 'white',
        }
    },
};
