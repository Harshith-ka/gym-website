import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn, useUser, useAuth } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
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
import './index.css';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

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
    return (
        <div className="protected-route">
            <SignedIn>{children}</SignedIn>
            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>
        </div>
    );
}

// Role-based Protected Route
function RoleProtectedRoute({ children, allowedRoles }) {
    const { user, isLoaded, isSignedIn } = useUser();
    const { getToken } = useAuth();
    const [fetchedRole, setFetchedRole] = useState(null);
    const [isChecking, setIsChecking] = useState(false);

    const clerkRole = user?.publicMetadata?.role || 'user';
    const currentRole = fetchedRole || clerkRole;

    useEffect(() => {
        if (isLoaded && isSignedIn && !allowedRoles.includes(clerkRole) && !fetchedRole && !isChecking) {
            console.log(`🛡️ [RoleProtectedRoute] Metadata role "${clerkRole}" not sufficient, checking API...`);
            setIsChecking(true);

            const checkRole = async () => {
                try {
                    const token = await getToken();
                    const response = await api.get('/auth/me', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const dbRole = response.data.user?.role || 'user';
                    const isApproved = response.data.user?.gym_approved;

                    console.log(`🛡️ [RoleProtectedRoute] API returned role: ${dbRole}, Approved: ${isApproved}`);

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
    }, [isLoaded, isSignedIn, clerkRole, allowedRoles, fetchedRole, isChecking, getToken]);

    if (!isLoaded || isChecking) return <LoadingScreen status="Checking permissions..." />;

    if (!isSignedIn) return <Navigate to="/" replace />;

    console.log(`🛡️ [RoleProtectedRoute] Path: ${window.location.pathname}, Role: ${currentRole}`);

    if (!allowedRoles.includes(currentRole)) {
        if (currentRole === 'pending_gym_owner') return <Navigate to="/pending-approval" replace />;
        if (currentRole === 'admin') return <Navigate to="/admin" replace />;
        if (currentRole === 'gym_owner') return <Navigate to="/gym-dashboard" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

// Global Redirector for post-login
function DashboardRedirect() {
    const { user: clerkUser, isLoaded, isSignedIn } = useUser();
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const [role, setRole] = useState(null);
    const [isFetching, setIsFetching] = useState(false);

    // Log state changes for debugging
    useEffect(() => {
        console.log(`🔄 [AuthRedirect] State update:`, {
            isLoaded,
            isSignedIn,
            hasUser: !!clerkUser,
            role,
            isFetching,
            clerkRole: clerkUser?.publicMetadata?.role
        });
    }, [isLoaded, isSignedIn, clerkUser, role, isFetching]);

    useEffect(() => {
        if (!isLoaded) {
            console.log(`🔄 [AuthRedirect] Waiting for Clerk to load...`);
            return;
        }

        if (!isSignedIn) {
            console.log(`🔄 [AuthRedirect] Not signed in, redirecting to home`);
            navigate('/', { replace: true });
            return;
        }

        // If we already have a role, don't fetch again
        if (role) {
            console.log(`🔄 [AuthRedirect] Already have role: ${role}`);
            return;
        }

        // If already fetching, don't start another fetch
        if (isFetching) {
            console.log(`🔄 [AuthRedirect] Already fetching role...`);
            return;
        }

        // Try to get role from Clerk publicMetadata first
        const clerkRole = clerkUser?.publicMetadata?.role;
        if (clerkRole) {
            console.log(`🔄 [AuthRedirect] ✅ Role from Clerk metadata: ${clerkRole}`);
            setRole(clerkRole);
            return;
        }

        // If not in metadata, fetch from API
        console.log(`🔄 [AuthRedirect] Role not in Clerk metadata, fetching from API...`);
        setIsFetching(true);

        const fetchRole = async () => {
            try {
                console.log(`🔄 [AuthRedirect] Requesting token...`);
                const token = await getToken();
                console.log(`🔄 [AuthRedirect] Token received, calling API...`);

                const response = await api.get('/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                console.log(`🔄 [AuthRedirect] API response:`, response.data);
                const dbRole = response.data.user?.role || 'user';
                const isApproved = response.data.user?.gym_approved;
                console.log(`🔄 [AuthRedirect] ✅ Role from API: ${dbRole}, Approved: ${isApproved}`);

                if (dbRole === 'gym_owner' && isApproved === false) {
                    setRole('pending_gym_owner');
                } else {
                    setRole(dbRole);
                }
            } catch (error) {
                console.error(`🔄 [AuthRedirect] ❌ Error fetching role:`, error);
                console.error(`🔄 [AuthRedirect] Error details:`, {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status
                });
                console.warn(`🔄 [AuthRedirect] Defaulting to 'user' role`);
                setRole('user');
            } finally {
                setIsFetching(false);
            }
        };

        fetchRole();
    }, [isLoaded, isSignedIn, clerkUser, getToken, role, isFetching]);

    // Redirect once we have the role
    useEffect(() => {
        if (!role) {
            console.log(`🔄 [AuthRedirect] Waiting for role...`);
            return;
        }

        let redirectPath = '/dashboard';
        if (role === 'admin') {
            redirectPath = '/admin';
        } else if (role === 'gym_owner') {
            redirectPath = '/gym-dashboard';
        } else if (role === 'pending_gym_owner') {
            redirectPath = '/pending-approval';
        }

        console.log(`🔄 [AuthRedirect] 🚀 Redirecting to: ${redirectPath} (role: ${role})`);
        console.log(`🔄 [AuthRedirect] Current path: ${window.location.pathname}`);

        // Use window.location for reliable redirect
        if (window.location.pathname !== redirectPath) {
            window.location.replace(redirectPath);
        }
    }, [role]);

    // Show loading while checking authentication or fetching role
    if (!isLoaded) {
        return <LoadingScreen status="Loading authentication..." />;
    }

    if (!isSignedIn) {
        return <LoadingScreen status="Redirecting to home..." />;
    }

    if (!role) {
        return <LoadingScreen status={isFetching ? "Fetching your role..." : "Identifying your role..."} />;
    }

    // This shouldn't be reached, but just in case
    return <LoadingScreen status="Preparing your dashboard..." />;
}

function App() {
    return (
        <ClerkProvider
            publishableKey={clerkPubKey}
            afterSignInUrl="/auth-redirect"
            afterSignUpUrl="/auth-redirect"
            appearance={{
                baseTheme: dark,
                variables: {
                    colorPrimary: '#ffffff',
                    colorBackground: '#111111',
                    colorText: '#ffffff',
                    colorInputBackground: '#1a1a1a',
                    colorInputText: '#ffffff',
                    borderRadius: '0.75rem',
                },
                elements: {
                    card: {
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        border: '1px solid #333',
                    },
                    formButtonPrimary: {
                        color: 'black',
                        fontWeight: 600,
                    }
                }
            }}
        >
            <Router>
                <div className="app" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#111', color: 'white' }}>
                    <Navbar />
                    <main className="page-pushdown" style={{ flex: 1 }}>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Home />} />
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
        </ClerkProvider>
    );
}

export default App;
