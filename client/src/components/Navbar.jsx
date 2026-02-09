import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Menu, X, Heart, Home, Dumbbell, Users, Activity, Newspaper, Phone, Crown, Info, LogOut, User } from 'lucide-react';
import api from '../services/api';

export default function Navbar() {
    const { user, logout, loading } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const location = useLocation();

    useEffect(() => {
        if (loading || !user) {
            setUserRole(null);
            return;
        }

        const fetchRole = async () => {
            try {
                const idToken = await user.getIdToken();
                const response = await api.get('/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    }
                });
                const dbRole = response.data.user?.role || 'user';
                setUserRole(dbRole);
            } catch (error) {
                console.error('Error fetching user role in Navbar:', error);
                setUserRole('user');
            }
        };

        fetchRole();
    }, [loading, user]);

    const getDashboardLink = () => {
        const role = userRole || 'user';
        if (role === 'admin') return '/admin';
        if (role === 'gym_owner') return '/gym-dashboard';
        if (role === 'trainer') return '/trainer-dashboard';
        return '/dashboard';
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    const navLinks = [
        { name: 'Services', path: '/explore', icon: <Dumbbell size={20} /> },
        { name: 'Programs', path: '/programs', icon: <Activity size={20} /> },
        { name: 'Wellness', path: '/category/yoga', icon: <Sparkles size={20} /> },
        { name: 'Trainers', path: '/trainers', icon: <Users size={20} /> },
        { name: 'Blog', path: '/blog', icon: <Newspaper size={20} /> },
        { name: 'About', path: '/about', icon: <Info size={20} /> },
        { name: 'Contact', path: '/contact', icon: <Phone size={20} /> },
    ];

    return (
        <nav
            className={`navbar-glass ${isScrolled ? 'scrolled' : ''}`}
            style={{
                padding: '1rem 0',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
        >
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                    <span className="brand-typography">
                        GYMATO
                    </span>
                </Link>

                <div className="mobile-hide" style={{ display: 'flex', gap: '2.5rem' }}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className="nav-link-modern"
                            style={location.pathname === link.path ? { color: 'var(--primary)' } : {}}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    {!loading && user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <Link
                                to={getDashboardLink()}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    color: 'white',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.9rem'
                                }}
                            >
                                <Heart size={18} color="var(--primary)" fill="var(--primary)" />
                                <span className="mobile-hide">Dashboard</span>
                            </Link>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt="profile" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--primary)' }} />
                                ) : (
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <User size={18} color="#888" />
                                    </div>
                                )}
                                <button onClick={() => logout()} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <LogOut size={18} />
                                    <span className="mobile-hide">Logout</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mobile-hide" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <Link to="/login" style={{ color: 'white', fontWeight: 600, textDecoration: 'none' }}>
                                Login
                            </Link>
                            <Link to="/explore" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', fontSize: '0.9rem' }}>
                                Start Free Trial
                            </Link>
                        </div>
                    )}

                    <button
                        className="navbar-mobile-toggle"
                        style={{
                            display: 'flex',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            padding: '0.6rem',
                            cursor: 'pointer'
                        }}
                        onClick={() => setIsMenuOpen(true)}
                    >
                        <Menu size={24} color="white" />
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <div className="mobile-menu-overlay">
                    <button className="mobile-menu-close" onClick={() => setIsMenuOpen(false)}>
                        <X size={24} />
                    </button>

                    <div style={{ marginBottom: '2rem' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>
                            Explore Gymato
                        </span>
                    </div>

                    <div className="mobile-nav-list">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className="mobile-nav-item"
                                style={location.pathname === link.path ? { color: 'var(--primary)' } : {}}
                            >
                                <span style={{ opacity: 0.6 }}>{link.icon}</span>
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="mobile-nav-footer">
                        {user ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <Link to={getDashboardLink()} className="btn btn-primary" style={{ padding: '1.25rem', borderRadius: '16px', textAlign: 'center' }}>
                                    View My Dashboard
                                </Link>
                                <button onClick={() => logout()} style={{ background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.2)', color: '#ff4d4d', padding: '1.25rem', borderRadius: '16px', fontWeight: 600 }}>
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link to="/explore" className="btn btn-primary" style={{ padding: '1.25rem', borderRadius: '16px', textAlign: 'center' }}>
                                    Book Free Trial
                                </Link>
                                <Link to="/login" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '1.25rem', borderRadius: '16px', fontWeight: 600, textAlign: 'center', textDecoration: 'none' }}>
                                    Member Login
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
