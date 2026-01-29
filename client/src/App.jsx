import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AuthProvider, { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import api from './services/api';
import Footer from './components/Footer';
import Home from './pages/Home';
import ExploreGyms from './pages/ExploreGyms';
import GymDetail from './pages/GymDetail';
import Trainers from './pages/Trainers';
import TrainerDetail from './pages/TrainerDetail';
import Booking from './pages/Booking';
import BookingConfirmation from './pages/BookingConfirmation';
import UserDashboard from './pages/UserDashboard';
import GymDashboard from './pages/GymDashboard';
import TrainerDashboard from './pages/TrainerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import VerifyBooking from './pages/VerifyBooking';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import About from './pages/About';
import Programs from './pages/Programs';
import Categories from './pages/Categories';
import HowItWorks from './pages/HowItWorks';
import Contact from './pages/Contact';
import Membership from './pages/Membership';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import GymRegistration from './pages/GymRegistration';
import Partnership from './pages/Partnership';
import PendingApproval from './pages/PendingApproval';
import Auth from './pages/Auth';
import './index.css';

// Loading Screen
const LoadingScreen = ({ status }) => (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#111', color: 'white' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '1rem', color: '#888' }}>{status || 'Loading application...'}</p>
        <button onClick={() => window.location.reload()} style={{ marginTop: '2rem', padding: '0.5rem 1rem', background: '#333', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>
            Force Refresh
        </button>
    </div>
);

// Protected Route Component
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <LoadingScreen status="Checking authentication..." />;
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

// Role-based Protected Route
function RoleProtectedRoute({ children, allowedRoles }) {
    const { user, loading: authLoading } = useAuth();
    const [fetchedRole, setFetchedRole] = useState(null);
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        if (!authLoading && user && !fetchedRole && !isChecking) {
            setIsChecking(true);
            const checkRole = async () => {
                try {
                    const idToken = await user.getIdToken();
                    const response = await api.get('/auth/me', {
                        headers: { 'Authorization': `Bearer ${idToken}` }
                    });
                    const dbRole = response.data.user?.role || 'user';
                    const isApproved = response.data.user?.gym_approved;

                    if (dbRole === 'gym_owner' && isApproved === false) {
                        setFetchedRole('pending_gym_owner');
                    } else {
                        setFetchedRole(dbRole);
                    }
                } catch (error) {
                    console.error('🛡️ [RoleProtectedRoute] Error checking role:', error);
                    setFetchedRole('user');
                } finally {
                    setIsChecking(false);
                }
            };
            checkRole();
        }
    }, [authLoading, user, fetchedRole, isChecking]);

    if (authLoading || isChecking) return <LoadingScreen status="Checking permissions..." />;
    if (!user) return <Navigate to="/login" replace />;

    if (!allowedRoles.includes(fetchedRole)) {
        if (fetchedRole === 'pending_gym_owner') return <Navigate to="/pending-approval" replace />;
        if (fetchedRole === 'admin') return <Navigate to="/admin" replace />;
        if (fetchedRole === 'gym_owner') return <Navigate to="/gym-dashboard" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

// Global Redirector for post-login
function DashboardRedirect() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [role, setRole] = useState(null);
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            navigate('/login', { replace: true });
            return;
        }

        if (role || isFetching) return;

        setIsFetching(true);
        const fetchRole = async () => {
            try {
                const idToken = await user.getIdToken();
                const response = await api.get('/auth/me', {
                    headers: { 'Authorization': `Bearer ${idToken}` }
                });

                const dbRole = response.data.user?.role || 'user';
                const isApproved = response.data.user?.gym_approved;

                if (dbRole === 'gym_owner' && isApproved === false) {
                    setRole('pending_gym_owner');
                } else {
                    setRole(dbRole);
                }
            } catch (error) {
                console.error(`🔄 [AuthRedirect] ❌ Error fetching role:`, error);
                setRole('user');
            } finally {
                setIsFetching(false);
            }
        };

        fetchRole();
    }, [authLoading, user, role, isFetching]);

    useEffect(() => {
        if (!role) return;

        let redirectPath = '/dashboard';
        if (role === 'admin') {
            redirectPath = '/admin';
        } else if (role === 'gym_owner') {
            redirectPath = '/gym-dashboard';
        } else if (role === 'trainer') {
            redirectPath = '/trainer-dashboard';
        } else if (role === 'pending_gym_owner') {
            redirectPath = '/pending-approval';
        }

        if (window.location.pathname !== redirectPath) {
            window.location.replace(redirectPath);
        }
    }, [role]);

    if (authLoading || isFetching || !role) {
        return <LoadingScreen status="Identifying your role..." />;
    }

    return null;
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="app" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#111', color: 'white' }}>
                    <Navbar />
                    <main className="page-pushdown" style={{ flex: 1 }}>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Auth />} />
                            <Route path="/explore" element={<ExploreGyms />} />
                            <Route path="/gym/:id" element={<GymDetail />} />
                            <Route path="/trainers" element={<Trainers />} />
                            <Route path="/trainer/:id" element={<TrainerDetail />} />
                            <Route path="/categories" element={<Categories />} />
                            <Route path="/category/:category" element={<ExploreGyms />} />
                            <Route path="/blog" element={<Blog />} />
                            <Route path="/blog/:id" element={<BlogDetail />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/programs" element={<Programs />} />
                            <Route path="/how-it-works" element={<HowItWorks />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/membership" element={<Membership />} />
                            <Route path="/partnership" element={<Partnership />} />
                            <Route path="/terms" element={<Terms />} />
                            <Route path="/privacy" element={<Privacy />} />
                            <Route path="/verify/:token" element={<VerifyBooking />} />

                            {/* Redirect route after login */}
                            <Route path="/auth-redirect" element={<DashboardRedirect />} />
                            <Route path="/pending-approval" element={<PendingApproval />} />

                            {/* Protected Routes */}
                            <Route
                                path="/booking/:gymId"
                                element={
                                    <ProtectedRoute>
                                        <Booking />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/booking-confirmation/:id"
                                element={
                                    <ProtectedRoute>
                                        <BookingConfirmation />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <RoleProtectedRoute allowedRoles={['user']}>
                                            <UserDashboard />
                                        </RoleProtectedRoute>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/gym-dashboard"
                                element={
                                    <ProtectedRoute>
                                        <RoleProtectedRoute allowedRoles={['gym_owner', 'admin']}>
                                            <GymDashboard />
                                        </RoleProtectedRoute>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/trainer-dashboard"
                                element={
                                    <ProtectedRoute>
                                        <RoleProtectedRoute allowedRoles={['trainer', 'admin']}>
                                            <TrainerDashboard />
                                        </RoleProtectedRoute>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin"
                                element={
                                    <ProtectedRoute>
                                        <RoleProtectedRoute allowedRoles={['admin']}>
                                            <AdminDashboard />
                                        </RoleProtectedRoute>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/register-gym"
                                element={
                                    <ProtectedRoute>
                                        <GymRegistration />
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
