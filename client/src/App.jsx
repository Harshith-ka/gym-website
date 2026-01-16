import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import Navbar from './components/Navbar';
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
import Categories from './pages/Categories';
import GymRegistration from './pages/GymRegistration';
import Privacy from './pages/Privacy';
import VerifyBooking from './pages/VerifyBooking';
import './index.css';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Protected Route Component
function ProtectedRoute({ children }) {
    return (
        <>
            <SignedIn>{children}</SignedIn>
            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>
        </>
    );
}

function App() {
    return (
        <ClerkProvider
            publishableKey={clerkPubKey}
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
                    <main style={{ flex: 1 }}>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Home />} />
                            <Route path="/explore" element={<ExploreGyms />} />
                            <Route path="/gym/:id" element={<GymDetail />} />
                            <Route path="/trainers" element={<Trainers />} />
                            <Route path="/trainer/:id" element={<TrainerDetail />} />
                            <Route path="/categories" element={<Categories />} />
                            <Route path="/category/:category" element={<ExploreGyms />} />
                            <Route path="/how-it-works" element={<HowItWorks />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/terms" element={<Terms />} />
                            <Route path="/privacy" element={<Privacy />} />
                            <Route path="/verify/:token" element={<VerifyBooking />} />

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
                                        <UserDashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/gym-dashboard"
                                element={
                                    <ProtectedRoute>
                                        <GymDashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin"
                                element={
                                    <ProtectedRoute>
                                        <AdminDashboard />
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
