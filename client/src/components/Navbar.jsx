import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton, SignInButton, useUser, useAuth } from '@clerk/clerk-react';
import { Sparkles, Menu, X, Heart, Home, Dumbbell, Users, Activity, Newspaper, Phone, Crown, Info } from 'lucide-react';
import api from '../services/api';

export default function Navbar() {
    const { isSignedIn, user, isLoaded } = useUser();
    const { getToken } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const location = useLocation();

    // Fetch role from API if not in Clerk metadata
    useEffect(() => {
        if (!isLoaded || !isSignedIn) {
            setUserRole(null);
            return;
        }

        // Try to get role from Clerk metadata first
        const clerkRole = user?.publicMetadata?.role;
        if (clerkRole) {
            setUserRole(clerkRole);
            return;
        }

        // If not in metadata, fetch from API
        const fetchRole = async () => {
            try {
                const token = await getToken();
                const response = await api.get('/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const dbRole = response.data.user?.role || 'user';
                setUserRole(dbRole);
            } catch (error) {
                console.error('Error fetching user role in Navbar:', error);
                setUserRole('user'); // Default fallback
            }
        };

        fetchRole();
    }, [isLoaded, isSignedIn, user, getToken]);

    // Get role-based dashboard link
    const getDashboardLink = () => {
        const role = userRole || user?.publicMetadata?.role || 'user';
        if (role === 'admin') return '/admin';
        if (role === 'gym_owner') return '/gym-dashboard';
        return '/dashboard';
    };

    // Handle scroll for navbar background
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menu on route change
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
                {/* Logo */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                    <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '12px', display: 'flex' }}>
                        <Sparkles size={22} color="white" />
                    </div>
                    <span style={{ color: 'white', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-1px' }}>
                        Purpul Hue
                    </span>
                </Link>

                {/* Desktop Links */}
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

                {/* Right Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    {isLoaded && isSignedIn ? (
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
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    ) : (
                        <div className="mobile-hide" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <SignInButton mode="modal" afterSignInUrl="/auth-redirect" afterSignUpUrl="/auth-redirect">
                                <button style={{ background: 'transparent', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                                    Login
                                </button>
                            </SignInButton>
                            <Link to="/explore" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', fontSize: '0.9rem' }}>
                                Start Free Trial
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
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

            {/* Modern Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="mobile-menu-overlay">
                    <button className="mobile-menu-close" onClick={() => setIsMenuOpen(false)}>
                        <X size={24} />
                    </button>

                    <div style={{ marginBottom: '2rem' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>
                            Explore Purpul Hue
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
                        {isLoaded && isSignedIn ? (
                            <Link to={getDashboardLink()} className="btn btn-primary" style={{ padding: '1.25rem', borderRadius: '16px', textAlign: 'center' }}>
                                View My Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link to="/explore" className="btn btn-primary" style={{ padding: '1.25rem', borderRadius: '16px', textAlign: 'center' }}>
                                    Book Free Trial
                                </Link>
                                <SignInButton mode="modal" afterSignInUrl="/auth-redirect" afterSignUpUrl="/auth-redirect">
                                    <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '1.25rem', borderRadius: '16px', fontWeight: 600 }}>
                                        Member Login
                                    </button>
                                </SignInButton>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
