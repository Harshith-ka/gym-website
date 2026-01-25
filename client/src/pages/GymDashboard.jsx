import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, Plus, Clock, Users, X, Check, Building2, Dumbbell, UserCheck, ScanLine, Upload, Sparkles, QrCode, LocateFixed, Loader2 } from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../services/api';
import ImageUpload from '../components/ImageUpload';
import MultiImageUpload from '../components/MultiImageUpload';

export default function GymDashboard() {
    const { getToken } = useAuth();
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [slots, setSlots] = useState([]);
    const [showSlotModal, setShowSlotModal] = useState(false);

    // State for new features
    const [services, setServices] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [gymProfile, setGymProfile] = useState({});
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [showTrainerModal, setShowTrainerModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [verifyResult, setVerifyResult] = useState(null);
    const [scannerActive, setScannerActive] = useState(false);

    // Trainer Availability State
    const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
    const [selectedTrainer, setSelectedTrainer] = useState(null);
    const [trainerAvailability, setTrainerAvailability] = useState([]);
    const [newAvailability, setNewAvailability] = useState({
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00'
    });

    useEffect(() => {
        let scanner = null;
        if (scannerActive) {
            scanner = new Html5QrcodeScanner("reader", {
                fps: 10,
                qrbox: { width: 250, height: 250 },
            }, false);

            scanner.render(onScanSuccess, onScanFailure);
        }

        return () => {
            if (scanner) {
                scanner.clear().catch(e => console.error("Scanner clear error", e));
            }
        };
    }, [scannerActive]);

    function onScanSuccess(decodedText) {
        setQrCode(decodedText);
        setScannerActive(false);
        // Direct call to verify
        handleVerifyDirect(decodedText);
    }

    function onScanFailure(error) {
        // console.warn(`Code scan error = ${error}`);
    }

    // New Service State
    const [newService, setNewService] = useState({
        name: '',
        description: '',
        price: '',
        service_type: 'session', // 'session', 'pass', 'membership'
        duration_value: 1,
        duration_unit: 'hour' // 'hour', 'day', 'month'
    });

    // New Trainer State
    const [newTrainer, setNewTrainer] = useState({
        name: '',
        specializations: '',
        bio: '',
        experience_years: '',
        certifications: '',
        hourly_rate: '',
    });
    const [trainerFiles, setTrainerFiles] = useState({
        profileImage: '',
        introVideo: null
    });

    // Slot form state
    const [newSlot, setNewSlot] = useState({
        dayOfWeek: 1, // Monday
        startTime: '06:00',
        endTime: '07:00',
        maxCapacity: 20
    });

    useEffect(() => {
        fetchDashboardData();
    }, [activeTab]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const headers = { Authorization: `Bearer ${token}` };

            // Always fetch gym profile for approval status banner
            try {
                const profileResponse = await api.get('/admin/gym/profile', { headers });
                if (profileResponse.data.gym) {
                    setGymProfile(profileResponse.data.gym);
                }
            } catch (e) {
                console.error('Error fetching gym profile:', e);
            }

            if (activeTab === 'overview') {
                const response = await api.get('/admin/gym/stats', { headers });
                setStats(response.data);
            } else if (activeTab === 'bookings') {
                const response = await api.get('/admin/gym/bookings', { headers });
                setBookings(response.data.bookings || []);
            } else if (activeTab === 'slots') {
                const response = await api.get('/admin/gym/slots', { headers });
                setSlots(response.data.slots || []);
            } else if (activeTab === 'services') {
                const response = await api.get('/admin/gym/services', { headers });
                setServices(response.data.services || []);
            } else if (activeTab === 'trainers') {
                const response = await api.get('/admin/gym/trainers', { headers });
                setTrainers(response.data.trainers || []);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSlot = async () => {
        try {
            const token = await getToken();
            await api.post('/admin/gym/slots', {
                action: 'create',
                slotData: newSlot
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowSlotModal(false);
            fetchDashboardData();
        } catch (error) {
            console.error('Error adding slot:', error);
            alert(error.response?.data?.error || 'Failed to add slot');
        }
    };

    const handleDeleteSlot = async (slotId) => {
        if (!confirm('Are you sure you want to delete this slot?')) return;
        try {
            const token = await getToken();
            await api.post('/admin/gym/slots', {
                action: 'delete',
                slotId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchDashboardData();
        } catch (error) {
            console.error('Error deleting slot:', error);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const token = await getToken();
            await api.put('/admin/gym/profile', gymProfile, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Profile updated successfully!');
            fetchDashboardData();
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        }
    };

    const [locating, setLocating] = useState(false);
    const detectLocation = () => {
        if (!("geolocation" in navigator)) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setGymProfile(prev => ({
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

    const handleAddService = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            await api.post('/admin/gym/services', {
                action: 'create',
                serviceData: newService
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowServiceModal(false);
            setNewService({
                name: '',
                description: '',
                price: '',
                service_type: 'session',
                duration_value: 1,
                duration_unit: 'hour'
            });
            fetchDashboardData();
        } catch (error) {
            console.error('Error adding service:', error);
            alert(error.response?.data?.error || 'Failed to add service');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyBooking = async () => {
        if (!qrCode) return;
        await handleVerifyDirect(qrCode);
    };

    const handleVerifyDirect = async (inputCode) => {
        try {
            setLoading(true);
            setVerifyResult(null);
            const token = await getToken();

            // Handle full URLs from hardware scanners
            let code = inputCode.trim();
            if (code.includes('/verify/')) {
                code = code.split('/verify/').pop();
            }

            // Payload now just sends the code (can be UUID, shortCode, or QR token)
            const response = await api.post('/bookings/validate-qr', { code }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVerifyResult({ success: true, ...response.data });
        } catch (error) {
            console.error('Verification error:', error);
            setVerifyResult({
                success: false,
                error: error.response?.data?.error || 'Verification failed'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteBooking = async (bookingId) => {
        try {
            setLoading(true);
            const token = await getToken();
            await api.put(`/bookings/${bookingId}/complete`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Refresh result to show it's used
            if (verifyResult && verifyResult.booking.id === bookingId) {
                setVerifyResult({
                    ...verifyResult,
                    booking: { ...verifyResult.booking, status: 'used' }
                });
            }
            fetchDashboardData();
            alert('Booking marked as completed!');
        } catch (error) {
            console.error('Completion error:', error);
            alert(error.response?.data?.error || 'Failed to complete booking');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteService = async (serviceId) => {
        if (!confirm('Delete this service?')) return;
        try {
            const token = await getToken();
            await api.post('/admin/gym/services', {
                action: 'delete',
                serviceId
            }, { headers: { Authorization: `Bearer ${token}` } });
            fetchDashboardData();
        } catch (error) {
            console.error('Error deleting service:', error);
        }
    };

    const handleAddTrainer = async () => {
        try {
            setLoading(true);
            const token = await getToken();

            const formData = new FormData();
            formData.append('action', 'create');
            formData.append('trainerData', JSON.stringify({
                ...newTrainer,
                profile_image: trainerFiles.profileImage
            }));

            if (trainerFiles.introVideo) {
                formData.append('introVideo', trainerFiles.introVideo);
            }

            await api.post('/admin/gym/trainers', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setShowTrainerModal(false);
            setNewTrainer({
                name: '',
                specializations: '',
                bio: '',
                experience_years: '',
                certifications: '',
                hourly_rate: '',
            });
            setTrainerFiles({ profileImage: '', introVideo: null });
            fetchDashboardData();
        } catch (error) {
            console.error('Error adding trainer:', error);
            alert('Failed to add trainer');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTrainer = async (trainerId) => {
        if (!confirm('Remove this trainer?')) return;
        try {
            const token = await getToken();
            await api.post('/admin/gym/trainers', {
                action: 'delete',
                trainerId
            }, { headers: { Authorization: `Bearer ${token}` } });
            fetchDashboardData();
        } catch (error) {
            console.error('Error removing trainer:', error);
        }
    };

    const handleManageAvailability = async (trainer) => {
        setSelectedTrainer(trainer);
        setShowAvailabilityModal(true);
        fetchTrainerAvailability(trainer.id);
    };

    const fetchTrainerAvailability = async (trainerId) => {
        try {
            const token = await getToken();
            const response = await api.get(`/admin/gym/trainers/${trainerId}/availability`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTrainerAvailability(response.data.availability || []);
        } catch (error) {
            console.error('Error fetching availability:', error);
        }
    };

    const handleAddAvailability = async () => {
        try {
            const token = await getToken();
            await api.post('/admin/gym/trainers/availability', {
                action: 'create',
                availabilityData: { ...newAvailability, trainerId: selectedTrainer.id }
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTrainerAvailability(selectedTrainer.id);
        } catch (error) {
            console.error('Error adding availability:', error);
            alert(error.response?.data?.error || 'Failed to add availability');
        }
    };

    const handleDeleteAvailability = async (id) => {
        if (!confirm('Remove this slot?')) return;
        try {
            const token = await getToken();
            await api.post('/admin/gym/trainers/availability', {
                action: 'delete',
                id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTrainerAvailability(selectedTrainer.id);
        } catch (error) {
            console.error('Error deleting availability:', error);
        }
    };

    const handlePromote = async (days) => {
        try {
            const token = await getToken();

            // 1. Create Order
            if (!stats?.gymId) {
                alert("Loading gym data...");
                return;
            }

            const orderRes = await api.post('/monetization/featured/order', {
                gymId: stats.gymId,
                days: days
            }, { headers: { Authorization: `Bearer ${token}` } });

            const { orderId, amount, keyId } = orderRes.data;

            // 2. Open Razorpay
            const options = {
                key: keyId,
                amount: amount,
                currency: "INR",
                name: "Gym Booking Platform",
                description: `Featured Listing - ${days} Days`,
                order_id: orderId,
                handler: async function (response) {
                    try {
                        await api.post('/monetization/featured/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            gymId: stats.gymId,
                            days: days
                        }, { headers: { Authorization: `Bearer ${token}` } });

                        alert("Promotion Activated! 🎉");
                        fetchDashboardData(); // Refresh to show status
                    } catch (verifyError) {
                        console.error(verifyError);
                        const errorMsg = verifyError.response?.data?.error || "Payment verification failed";
                        alert(`${errorMsg}\n\nNote: If you are using an international card, please ensure "International Payments" is enabled in your Razorpay dashboard.`);
                    }
                },
                prefill: {
                    ...(user?.fullName || user?.firstName ? { name: user.fullName || user.firstName } : {}),
                    ...(user?.primaryEmailAddress?.emailAddress ? { email: user.primaryEmailAddress.emailAddress } : {}),
                    ...(user?.primaryPhoneNumber?.phoneNumber ? { contact: user.primaryPhoneNumber.phoneNumber } : {})
                },
                theme: { color: "#ffffff" }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.open();

        } catch (error) {
            console.error('Promotion error:', error);
            alert("Failed to initiate promotion");
        }
    };

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            style={activeTab === id ? styles.tabActive : styles.tab}
        >
            <Icon size={18} /> {label}
        </button>
    );

    return (
        <div style={styles.container}>
            <div className="container">
                <header className="dashboard-header gym-dashboard-header" style={styles.header}>
                    <div>
                        <h1 style={styles.title}>Partner Dashboard</h1>
                        <p style={styles.subtitle}>Manage your facility, bookings, and slots.</p>
                    </div>
                    <div className="dashboard-header-actions">
                        {activeTab === 'slots' && (
                            <button style={styles.primaryBtn} onClick={() => setShowSlotModal(true)}>
                                <Plus size={18} /> Add Slot
                            </button>
                        )}
                        {activeTab === 'trainers' && (
                            <button style={styles.primaryBtn} onClick={() => setShowTrainerModal(true)}>
                                <Plus size={18} /> Add Trainer
                            </button>
                        )}
                    </div>
                </header>

                {/* Approval Status Banner */}
                {gymProfile && (
                    <>
                        {!gymProfile.is_approved && (
                            <div style={styles.approvalBanner}>
                                <div style={styles.bannerContent}>
                                    <div style={styles.bannerIcon}>⏳</div>
                                    <div>
                                        <h3 style={styles.bannerTitle}>Pending Approval</h3>
                                        <p style={styles.bannerText}>
                                            Your gym is currently under review. You can set up services, trainers, and slots while waiting.
                                            Your gym will be visible to users once approved by our team.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {gymProfile.is_approved && gymProfile.is_featured && (
                            <div style={styles.featuredBanner}>
                                <div style={styles.bannerContent}>
                                    <div style={styles.bannerIcon}>⭐</div>
                                    <div>
                                        <h3 style={styles.bannerTitle}>Featured Gym</h3>
                                        <p style={styles.bannerText}>
                                            Your gym is currently featured! It will appear at the top of search results.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                <div className="dashboard-layout" style={styles.sidebarLayout}>
                    {/* Sidebar / Tabs */}
                    <aside className="dashboard-sidebar" style={styles.sidebar}>
                        <div className="dashboard-tab-list" style={styles.tabList}>
                            <TabButton id="overview" label="Overview" icon={BarChart3} />
                            <TabButton id="bookings" label="Bookings" icon={Calendar} />
                            <TabButton id="slots" label="Time Slots" icon={Clock} />
                            <TabButton id="profile" label="Profile" icon={Building2} />
                            <TabButton id="services" label="Services" icon={Dumbbell} />
                            <TabButton id="trainers" label="Trainers" icon={Users} />
                            <TabButton id="promote" label="Promote" icon={Sparkles} />
                            <TabButton id="verify" label="Verify Booking" icon={ScanLine} />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="dashboard-main" style={styles.mainContent}>
                        {loading ? (
                            <div style={styles.loading}>
                                <div className="spinner" />
                            </div>
                        ) : (
                            <>
                                {activeTab === 'overview' && stats && (
                                    <div className="grid grid-3">
                                        <StatCard
                                            label="Total Bookings"
                                            value={stats.totalBookings || 0}
                                            icon={<Calendar size={24} color="#8B5CF6" />}
                                        />
                                        <StatCard
                                            label="Active Slots"
                                            value={stats.activeSlots || 0}
                                            icon={<Clock size={24} color="#06B6D4" />}
                                        />
                                        <StatCard
                                            label="Total Revenue"
                                            value={`₹${stats.totalRevenue || 0}`}
                                            icon={<BarChart3 size={24} color="#10B981" />}
                                        />
                                    </div>
                                )}

                                {activeTab === 'bookings' && (
                                    <div style={styles.card}>
                                        <h2 style={styles.cardTitle}>All Bookings</h2>
                                        {bookings.length === 0 ? (
                                            <div style={styles.emptyList}>No bookings found.</div>
                                        ) : (
                                            <div style={{ display: 'grid', gap: '1rem' }}>
                                                {bookings.map((booking) => (
                                                    <div key={booking.id} style={styles.bookingCard}>
                                                        <div style={styles.bookingHeader}>
                                                            <div>
                                                                <div style={styles.bookingType}>
                                                                    {booking.type === 'trainer' ? '👤 Trainer Session' : '🏋️ Gym Service'}
                                                                </div>
                                                                <div style={styles.bookingUser}>{booking.user_name}</div>
                                                                <div style={styles.bookingContact}>
                                                                    📞 {booking.user_phone || 'N/A'}
                                                                </div>
                                                            </div>
                                                            <span style={{
                                                                ...styles.badge,
                                                                background: booking.status === 'confirmed' ? '#DCFCE7' :
                                                                    booking.status === 'used' ? '#E0E7FF' :
                                                                        booking.status === 'cancelled' ? '#FEE2E2' : '#FEF3C7',
                                                                color: booking.status === 'confirmed' ? '#166534' :
                                                                    booking.status === 'used' ? '#3730A3' :
                                                                        booking.status === 'cancelled' ? '#991B1B' : '#92400E'
                                                            }}>
                                                                {booking.status.toUpperCase()}
                                                            </span>
                                                        </div>

                                                        <div style={styles.bookingDetails}>
                                                            <div style={styles.detailRow}>
                                                                <span style={styles.detailLabel}>Service:</span>
                                                                <span style={styles.detailValue}>{booking.service_name}</span>
                                                            </div>

                                                            {booking.type === 'trainer' && (
                                                                <div style={styles.detailRow}>
                                                                    <span style={styles.detailLabel}>Trainer:</span>
                                                                    <span style={{ ...styles.detailValue, color: 'var(--primary)', fontWeight: 600 }}>
                                                                        {booking.service_name}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            <div style={styles.detailRow}>
                                                                <span style={styles.detailLabel}>Date:</span>
                                                                <span style={styles.detailValue}>
                                                                    {new Date(booking.booking_date).toLocaleDateString('en-US', {
                                                                        weekday: 'short',
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric'
                                                                    })}
                                                                </span>
                                                            </div>

                                                            {booking.start_time && (
                                                                <div style={styles.detailRow}>
                                                                    <span style={styles.detailLabel}>Time:</span>
                                                                    <span style={styles.detailValue}>
                                                                        {booking.start_time?.slice(0, 5)} - {booking.end_time?.slice(0, 5)}
                                                                        {booking.duration_hours && ` (${booking.duration_hours}h)`}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            <div style={styles.detailRow}>
                                                                <span style={styles.detailLabel}>Amount:</span>
                                                                <span style={{ ...styles.detailValue, fontWeight: 700, color: '#10B981' }}>
                                                                    ₹{booking.total_amount || booking.amount || 0}
                                                                </span>
                                                            </div>

                                                            {booking.remaining_sessions !== null && booking.remaining_sessions !== undefined && (
                                                                <div style={styles.detailRow}>
                                                                    <span style={styles.detailLabel}>Sessions:</span>
                                                                    <span style={styles.detailValue}>
                                                                        {booking.remaining_sessions} remaining
                                                                    </span>
                                                                </div>
                                                            )}

                                                            <div style={styles.detailRow}>
                                                                <span style={styles.detailLabel}>Booked:</span>
                                                                <span style={styles.detailValue}>
                                                                    {new Date(booking.created_at).toLocaleDateString('en-US', {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'slots' && (
                                    <div className="grid grid-2">
                                        {slots.map((slot) => (
                                            <div key={slot.id} style={styles.slotCard}>
                                                <div style={styles.slotHeader}>
                                                    <span style={styles.slotDay}>{dayNames[slot.day_of_week]}</span>
                                                    <button
                                                        onClick={() => handleDeleteSlot(slot.id)}
                                                        style={styles.deleteBtn}
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                                <div style={styles.slotTime}>
                                                    {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                                                </div>
                                                <div style={styles.slotDetails}>
                                                    <Users size={14} /> Capacity: {slot.max_capacity}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'profile' && (
                                    <div style={styles.card}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                            <h2 style={{ ...styles.cardTitle, marginBottom: 0 }}>Gym Profile</h2>
                                            <button
                                                type="button"
                                                onClick={detectLocation}
                                                disabled={locating}
                                                style={styles.detectBtn}
                                            >
                                                {locating ? <Loader2 size={16} className="spinner" /> : <LocateFixed size={16} />}
                                                {locating ? ' Detecting...' : ' Update My Coordinates'}
                                            </button>
                                        </div>
                                        <form onSubmit={handleUpdateProfile}>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Gym Name</label>
                                                <input
                                                    style={styles.input}
                                                    value={gymProfile?.name || ''}
                                                    onChange={e => setGymProfile({ ...gymProfile, name: e.target.value })}
                                                />
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Description</label>
                                                <textarea
                                                    style={{ ...styles.input, minHeight: '100px' }}
                                                    value={gymProfile?.description || ''}
                                                    onChange={e => setGymProfile({ ...gymProfile, description: e.target.value })}
                                                />
                                            </div>
                                            <div style={styles.row}>
                                                <div style={styles.formGroup}>
                                                    <label style={styles.label}>City</label>
                                                    <input
                                                        style={styles.input}
                                                        value={gymProfile?.city || ''}
                                                        onChange={e => setGymProfile({ ...gymProfile, city: e.target.value })}
                                                    />
                                                </div>
                                                <div style={styles.formGroup}>
                                                    <label style={styles.label}>Address</label>
                                                    <input
                                                        style={styles.input}
                                                        value={gymProfile?.address || ''}
                                                        onChange={e => setGymProfile({ ...gymProfile, address: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div style={styles.row}>
                                                <div style={styles.formGroup}>
                                                    <label style={styles.label}>Latitude</label>
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        style={styles.input}
                                                        value={gymProfile?.latitude || ''}
                                                        onChange={e => setGymProfile({ ...gymProfile, latitude: e.target.value })}
                                                        placeholder="Auto-detected or enter manually"
                                                    />
                                                </div>
                                                <div style={styles.formGroup}>
                                                    <label style={styles.label}>Longitude</label>
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        style={styles.input}
                                                        value={gymProfile?.longitude || ''}
                                                        onChange={e => setGymProfile({ ...gymProfile, longitude: e.target.value })}
                                                        placeholder="Auto-detected or enter manually"
                                                    />
                                                </div>
                                            </div>
                                            <div style={styles.formGroup}>
                                                <MultiImageUpload
                                                    label="Gym Photos"
                                                    currentImages={gymProfile?.images || []}
                                                    onImagesChange={(images) => setGymProfile({ ...gymProfile, images })}
                                                    maxImages={8}
                                                />
                                            </div>
                                            <button type="submit" style={styles.primaryBtn}>Save Changes</button>
                                        </form>
                                    </div>
                                )}

                                {activeTab === 'services' && (
                                    <div style={styles.card}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                            <h2 style={styles.cardTitle}>Services & Packages</h2>
                                            <button style={styles.primaryBtn} onClick={() => setShowServiceModal(true)}>
                                                <Plus size={18} /> Add Service
                                            </button>
                                        </div>
                                        {services.length === 0 ? (
                                            <div style={styles.emptyList}>No services added yet. Add your first service!</div>
                                        ) : (
                                            <div className="grid grid-3" style={{ gap: '1.5rem' }}>
                                                {services.map(service => (
                                                    <div key={service.id} style={styles.serviceCard}>
                                                        <div style={styles.serviceHeader}>
                                                            <div style={styles.serviceIcon}>
                                                                <Dumbbell size={24} color="#8B5CF6" />
                                                            </div>
                                                            <button onClick={() => handleDeleteService(service.id)} style={styles.deleteBtn}>
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                        <h3 style={styles.serviceTitle}>{service.name}</h3>
                                                        <p style={styles.serviceDescription}>{service.description || 'No description'}</p>
                                                        <div style={styles.serviceFooter}>
                                                            <div style={styles.servicePrice}>₹{service.price}</div>
                                                            <div style={styles.serviceType}>
                                                                {service.service_type === 'session' && '🎯 Session'}
                                                                {service.service_type === 'pass' && '🎫 Pass'}
                                                                {service.service_type === 'membership' && '⭐ Membership'}
                                                            </div>
                                                        </div>
                                                        {service.duration_hours && (
                                                            <div style={styles.serviceDuration}>
                                                                <Clock size={14} /> {service.duration_hours}h duration
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'trainers' && (
                                    <div style={styles.card}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                            <h2 style={styles.cardTitle}>Trainers</h2>
                                            {/* Logic to open modal for adding trainer */}
                                        </div>
                                        {trainers.length === 0 ? (
                                            <div style={styles.emptyList}>No trainers added yet.</div>
                                        ) : (
                                            <div className="grid grid-3">
                                                {trainers.map(trainer => (
                                                    <div key={trainer.id} style={{ ...styles.slotCard, textAlign: 'center' }}>
                                                        <img
                                                            src={trainer.profile_image || 'https://via.placeholder.com/100'}
                                                            alt={trainer.name}
                                                            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1rem' }}
                                                        />
                                                        <h3 style={styles.itemTitle}>{trainer.name}</h3>
                                                        <p style={styles.itemSubtitle}>{trainer.specializations?.join(', ')}</p>
                                                        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                                                            {trainer.experience_years} Years Exp • ₹{trainer.hourly_rate}/hr
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
                                                            <button
                                                                onClick={() => handleManageAvailability(trainer)}
                                                                style={{ ...styles.secondaryBtn, fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                                                            >
                                                                <Clock size={14} style={{ marginRight: '4px' }} /> Availability
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteTrainer(trainer.id)}
                                                                style={{ ...styles.deleteBtn, display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem 1rem', borderRadius: '999px' }}
                                                            >
                                                                <X size={14} /> Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'promote' && (
                                    <div style={styles.card}>
                                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                            <h2 style={styles.cardTitle}>Boost Your Visibility 🚀</h2>
                                            <p style={{ color: '#a1a1aa' }}>Get featured on the home page and top of search results.</p>
                                        </div>

                                        <div className="grid grid-3" style={{ gap: '2rem' }}>
                                            {[3, 7, 30].map(days => (
                                                <div key={days} style={{
                                                    ...styles.slotCard,
                                                    border: days === 7 ? '1px solid #eab308' : '1px solid #333',
                                                    background: days === 7 ? '#1a1a1a' : '#111',
                                                    position: 'relative'
                                                }}>
                                                    {days === 7 && <div style={{ position: 'absolute', top: '-10px', right: '10px', background: '#eab308', color: 'black', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>POPULAR</div>}
                                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>{days} Days</h3>
                                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: 'white' }}>
                                                        ₹{days * 499}
                                                    </div>
                                                    <p style={{ color: '#a1a1aa', marginBottom: '1.5rem' }}>Full featured benefits</p>
                                                    <button
                                                        onClick={() => handlePromote(days)}
                                                        style={{
                                                            ...styles.primaryBtn,
                                                            width: '100%',
                                                            justifyContent: 'center',
                                                            background: days === 7 ? '#eab308' : 'white'
                                                        }}
                                                    >
                                                        Get Featured
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'verify' && (
                                    <div style={{ ...styles.card, maxWidth: '600px', margin: '0 auto' }}>
                                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                            <h2 style={styles.cardTitle}>Entry Validation</h2>
                                            <p style={{ color: '#a1a1aa' }}>Scan QR Code or enter Booking ID manually.</p>
                                        </div>

                                        <div style={{ marginBottom: '2rem' }}>
                                            {!scannerActive ? (
                                                <button
                                                    onClick={() => setScannerActive(true)}
                                                    style={{ ...styles.primaryBtn, width: '100%', justifyContent: 'center', height: '120px', flexDirection: 'column', gap: '1rem' }}
                                                >
                                                    <ScanLine size={48} />
                                                    <span>Open Camera Scanner</span>
                                                </button>
                                            ) : (
                                                <div>
                                                    <div id="reader" style={{ border: 'none', borderRadius: '0.5rem', overflow: 'hidden' }}></div>
                                                    <button
                                                        onClick={() => setScannerActive(false)}
                                                        style={{ ...styles.secondaryBtn, width: '100%', marginTop: '1rem' }}
                                                    >
                                                        Close Scanner
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ height: '1px', background: '#333', flex: 1 }}></div>
                                                <span style={{ color: '#555', fontSize: '0.8rem', fontWeight: 'bold' }}>OR MANUAL ENTRY</span>
                                                <div style={{ height: '1px', background: '#333', flex: 1 }}></div>
                                            </div>
                                        </div>

                                        <div style={styles.formGroup}>
                                            <input
                                                id="manual-verify"
                                                name="manual-verify"
                                                style={{ ...styles.input, textAlign: 'center', fontSize: '1.2rem', letterSpacing: '4px', textTransform: 'uppercase' }}
                                                placeholder="ENTER 6-DIGIT CODE OR UUID"
                                                value={qrCode}
                                                onChange={e => setQrCode(e.target.value.toUpperCase())}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleVerifyBooking();
                                                }}
                                            />
                                        </div>
                                        <button onClick={handleVerifyBooking} style={{ ...styles.primaryBtn, width: '100%', justifyContent: 'center' }}>Verify Manually</button>

                                        {verifyResult && (
                                            <div style={{
                                                marginTop: '2rem',
                                                padding: '1.5rem',
                                                borderRadius: '0.75rem',
                                                background: !verifyResult.success ? '#450a0a' : (verifyResult.booking.status === 'used' ? '#111' : '#052e16'),
                                                border: `1px solid ${!verifyResult.success ? '#7f1d1d' : (verifyResult.booking.status === 'used' ? '#333' : '#065f46')}`,
                                                animation: 'fadeIn 0.3s ease-out'
                                            }}>
                                                {!verifyResult.success ? (
                                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                        <div style={{ color: '#fca5a5' }}><X size={32} /></div>
                                                        <div>
                                                            <div style={{ color: '#fca5a5', fontWeight: 'bold', fontSize: '1.1rem' }}>Validation Failed</div>
                                                            <div style={{ color: '#f87171', fontSize: '0.9rem' }}>{verifyResult.error}</div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                                                            <div style={{ color: verifyResult.booking.status === 'used' ? '#666' : '#86efac' }}>
                                                                {verifyResult.booking.status === 'used' ? <Clock size={32} /> : <Check size={32} />}
                                                            </div>
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ color: verifyResult.booking.status === 'used' ? '#666' : '#86efac', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                                                    {verifyResult.booking.status === 'used' ? 'Booking Already Completed' : 'Booking Found'}
                                                                </div>
                                                                <div style={{ color: '#fff', fontSize: '1rem', fontWeight: 600 }}>{verifyResult.booking.user_name}</div>
                                                                <div style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>{verifyResult.booking.service_name} • {verifyResult.booking.booking_type?.toUpperCase()}</div>
                                                            </div>
                                                        </div>

                                                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                                <span style={{ color: '#555', fontSize: '0.8rem' }}>DATE</span>
                                                                <span style={{ color: '#fff' }}>{new Date(verifyResult.booking.booking_date).toLocaleDateString()}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <span style={{ color: '#555', fontSize: '0.8rem' }}>SLOT</span>
                                                                <span style={{ color: '#fff' }}>{verifyResult.booking.start_time?.slice(0, 5)} - {verifyResult.booking.end_time?.slice(0, 5)}</span>
                                                            </div>
                                                        </div>

                                                        {verifyResult.booking.status === 'confirmed' && (
                                                            <button
                                                                onClick={() => handleCompleteBooking(verifyResult.booking.id)}
                                                                style={{ ...styles.primaryBtn, width: '100%', justifyContent: 'center', background: '#10B981', color: '#000' }}
                                                            >
                                                                Confirm Entry & Mark Completed
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>

            {/* Modals */}
            {
                showSlotModal && (
                    <div style={styles.modalOverlay}>
                        <div style={styles.modal}>
                            <h2 style={styles.modalTitle}>Add New Slot</h2>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Day</label>
                                <select
                                    value={newSlot.dayOfWeek}
                                    onChange={(e) => setNewSlot({ ...newSlot, dayOfWeek: parseInt(e.target.value) })}
                                    style={styles.input}
                                >
                                    {dayNames.map((day, idx) => (
                                        <option key={idx} value={idx}>{day}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={styles.row}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Start</label>
                                    <input
                                        type="time"
                                        id="slotStartTime"
                                        name="slotStartTime"
                                        value={newSlot.startTime}
                                        onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>End</label>
                                    <input
                                        type="time"
                                        id="slotEndTime"
                                        name="slotEndTime"
                                        value={newSlot.endTime}
                                        onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                                        style={styles.input}
                                    />
                                </div>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Max Capacity</label>
                                <input
                                    type="number"
                                    value={newSlot.maxCapacity}
                                    onChange={(e) => setNewSlot({ ...newSlot, maxCapacity: parseInt(e.target.value) })}
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.modalActions}>
                                <button style={styles.secondaryBtn} onClick={() => setShowSlotModal(false)}>Cancel</button>
                                <button style={styles.primaryBtn} onClick={handleAddSlot}>Save Slot</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showServiceModal && (
                    <div style={styles.modalOverlay}>
                        <div style={styles.modal}>
                            <h2 style={styles.modalTitle}>Add New Service</h2>
                            <div style={{ ...styles.modalBody, maxHeight: 'none' }}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Service Name</label>
                                    <input
                                        id="serviceName"
                                        name="serviceName"
                                        style={styles.input}
                                        placeholder="e.g., Per Session, Monthly Pass"
                                        value={newService.name}
                                        onChange={e => setNewService({ ...newService, name: e.target.value })}
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Price (₹)</label>
                                    <input
                                        type="number"
                                        id="servicePrice"
                                        name="servicePrice"
                                        style={styles.input}
                                        placeholder="500"
                                        value={newService.price}
                                        onChange={e => setNewService({ ...newService, price: e.target.value })}
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Service Type</label>
                                    <select
                                        id="serviceType"
                                        name="serviceType"
                                        style={styles.input}
                                        value={newService.service_type}
                                        onChange={e => setNewService({ ...newService, service_type: e.target.value })}
                                    >
                                        <option value="session">Session-Based</option>
                                        <option value="pass">Passes</option>
                                        <option value="membership">Memberships</option>
                                    </select>
                                </div>
                                <div style={styles.row}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Duration Value</label>
                                        <input
                                            type="number"
                                            style={styles.input}
                                            value={newService.duration_value}
                                            onChange={e => setNewService({ ...newService, duration_value: e.target.value })}
                                        />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Unit</label>
                                        <select
                                            style={styles.input}
                                            value={newService.duration_unit}
                                            onChange={e => setNewService({ ...newService, duration_unit: e.target.value })}
                                        >
                                            <option value="hour">Hours</option>
                                            <option value="day">Days</option>
                                            <option value="month">Months</option>
                                            <option value="year">Years</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Description</label>
                                    <textarea
                                        style={{ ...styles.input, minHeight: '80px' }}
                                        placeholder="Briefly describe what's included..."
                                        value={newService.description}
                                        onChange={e => setNewService({ ...newService, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div style={styles.modalActions}>
                                <button style={styles.secondaryBtn} onClick={() => setShowServiceModal(false)}>Cancel</button>
                                <button style={styles.primaryBtn} onClick={handleAddService}>Create Service</button>
                            </div>
                        </div>
                    </div>
                )
            }
            {
                showAvailabilityModal && selectedTrainer && (
                    <div style={styles.modalOverlay}>
                        <div style={styles.modal}>
                            <h2 style={styles.modalTitle}>Manage Availability</h2>
                            <p style={{ color: '#a1a1aa', marginBottom: '1.5rem' }}>
                                Set weekly recurring slots for {selectedTrainer.name}.
                            </p>

                            <div style={styles.modalBody}>
                                {/* Add New Slot Form */}
                                <div style={{ background: '#27272a', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid #333' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Add New Slot</h3>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Day</label>
                                        <select
                                            value={newAvailability.dayOfWeek}
                                            onChange={(e) => setNewAvailability({ ...newAvailability, dayOfWeek: parseInt(e.target.value) })}
                                            style={styles.input}
                                        >
                                            {dayNames.map((day, idx) => (
                                                <option key={idx} value={idx}>{day}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={styles.row}>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Start</label>
                                            <input
                                                type="time"
                                                value={newAvailability.startTime}
                                                onChange={(e) => setNewAvailability({ ...newAvailability, startTime: e.target.value })}
                                                style={styles.input}
                                            />
                                        </div>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>End</label>
                                            <input
                                                type="time"
                                                value={newAvailability.endTime}
                                                onChange={(e) => setNewAvailability({ ...newAvailability, endTime: e.target.value })}
                                                style={styles.input}
                                            />
                                        </div>
                                    </div>
                                    <button onClick={handleAddAvailability} style={{ ...styles.primaryBtn, width: '100%', justifyContent: 'center' }}>
                                        <Plus size={16} /> Add Slot
                                    </button>
                                </div>

                                {/* Existing Slots List */}
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Current Slots</h3>
                                {trainerAvailability.length === 0 ? (
                                    <div style={{ color: '#666', textAlign: 'center', padding: '1rem' }}>No slots configured</div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {trainerAvailability.map((slot) => (
                                            <div key={slot.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#27272a', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #333' }}>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{dayNames[slot.day_of_week]}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>
                                                        {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                                                    </div>
                                                </div>
                                                <button onClick={() => handleDeleteAvailability(slot.id)} style={styles.deleteBtn}>
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={styles.modalActions}>
                                <button style={styles.secondaryBtn} onClick={() => setShowAvailabilityModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Close Modals */}
            {
                showTrainerModal && (
                    <div style={styles.modalOverlay}>
                        <div style={styles.modal}>
                            <div style={styles.modalBody}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Full Name</label>
                                    <input
                                        id="trainerName"
                                        name="trainerName"
                                        style={styles.input}
                                        placeholder="John Doe"
                                        value={newTrainer.name}
                                        onChange={(e) => setNewTrainer({ ...newTrainer, name: e.target.value })}
                                    />
                                </div>
                                <div style={styles.row}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Specializations (comma separated)</label>
                                        <input
                                            style={styles.input}
                                            placeholder="HIIT, Yoga, Strength"
                                            value={newTrainer.specializations}
                                            onChange={(e) => setNewTrainer({ ...newTrainer, specializations: e.target.value })}
                                        />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Hourly Rate (₹)</label>
                                        <input
                                            type="number"
                                            style={styles.input}
                                            placeholder="500"
                                            value={newTrainer.hourly_rate}
                                            onChange={(e) => setNewTrainer({ ...newTrainer, hourly_rate: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div style={styles.row}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Experience (Years)</label>
                                        <input
                                            type="number"
                                            style={styles.input}
                                            placeholder="5"
                                            value={newTrainer.experience_years}
                                            onChange={(e) => setNewTrainer({ ...newTrainer, experience_years: e.target.value })}
                                        />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Certifications (comma separated)</label>
                                        <input
                                            style={styles.input}
                                            placeholder="ACE, NASM"
                                            value={newTrainer.certifications}
                                            onChange={(e) => setNewTrainer({ ...newTrainer, certifications: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div style={styles.formGroup}>
                                    <ImageUpload
                                        label="Profile Image"
                                        onUploadSuccess={(url) => setTrainerFiles({ ...trainerFiles, profileImage: url })}
                                        currentImage={trainerFiles.profileImage}
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Intro Video</label>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        style={styles.input}
                                        onChange={(e) => setTrainerFiles({ ...trainerFiles, introVideo: e.target.files[0] })}
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Bio</label>
                                    <textarea
                                        id="trainerBio"
                                        name="trainerBio"
                                        style={{ ...styles.input, minHeight: '80px' }}
                                        placeholder="Tell us about the trainer..."
                                        value={newTrainer.bio}
                                        onChange={(e) => setNewTrainer({ ...newTrainer, bio: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div style={styles.modalActions}>
                                <button style={styles.secondaryBtn} onClick={() => setShowTrainerModal(false)}>Cancel</button>
                                <button style={styles.primaryBtn} onClick={handleAddTrainer} disabled={loading}>
                                    {loading ? 'Adding...' : 'Add Trainer'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}

const StatCard = ({ label, value, icon }) => (
    <div style={styles.statCard}>
        <div style={styles.statIconWrapper}>{icon}</div>
        <div>
            <div style={styles.statLabel}>{label}</div>
            <div style={styles.statValue}>{value}</div>
        </div>
    </div>
);

const styles = {
    container: {
        background: '#111',
        minHeight: '100vh',
        padding: '3rem 0',
        color: 'white',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'end',
        marginBottom: '3rem',
        paddingBottom: '2rem',
        borderBottom: '1px solid #222',
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: 700,
        marginBottom: '0.5rem',
        letterSpacing: '-1px',
    },
    subtitle: {
        color: '#a1a1aa',
        fontSize: '1.1rem',
    },
    sidebarLayout: {
        display: 'grid',
        gridTemplateColumns: '250px 1fr',
        gap: '3rem',
    },
    tabList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    tab: {
        background: 'transparent',
        border: 'none',
        color: '#a1a1aa',
        padding: '1rem',
        textAlign: 'left',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        borderRadius: '0.5rem',
        transition: 'all 0.2s',
    },
    tabActive: {
        background: '#1a1a1a',
        color: 'white',
        border: '1px solid #333',
        padding: '1rem',
        textAlign: 'left',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        borderRadius: '0.5rem',
    },
    statCard: {
        background: '#1a1a1a',
        padding: '1.5rem',
        borderRadius: '1rem',
        border: '1px solid #333',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    statIconWrapper: {
        width: '48px',
        height: '48px',
        borderRadius: '0.75rem',
        background: '#111',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #333',
    },
    statLabel: {
        color: '#a1a1aa',
        fontSize: '0.875rem',
        marginBottom: '0.25rem',
    },
    statValue: {
        fontSize: '1.5rem',
        fontWeight: 700,
    },
    card: {
        background: '#1a1a1a',
        padding: '2rem',
        borderRadius: '1rem',
        border: '1px solid #333',
    },
    cardTitle: {
        fontSize: '1.25rem',
        fontWeight: 600,
        marginBottom: '1.5rem',
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
    },
    listItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 0',
        borderBottom: '1px solid #222',
        ':last-child': {
            borderBottom: 'none',
        }
    },
    itemTitle: {
        fontWeight: 600,
        marginBottom: '0.25rem',
    },
    itemSubtitle: {
        color: '#a1a1aa',
        fontSize: '0.875rem',
    },
    badge: {
        padding: '0.25rem 0.5rem',
        borderRadius: '0.25rem',
        fontSize: '0.75rem',
        fontWeight: 700,
        textTransform: 'uppercase',
    },
    slotCard: {
        background: '#1a1a1a',
        padding: '1.5rem',
        borderRadius: '1rem',
        border: '1px solid #333',
    },
    slotHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
    },
    slotDay: {
        fontWeight: 600,
        fontSize: '1.1rem',
    },
    deleteBtn: {
        background: 'transparent',
        border: 'none',
        color: '#ef4444',
        cursor: 'pointer',
        padding: '0.25rem',
    },
    slotTime: {
        fontSize: '1.5rem',
        fontWeight: 700,
        marginBottom: '0.5rem',
        color: 'white',
    },
    slotDetails: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: '#a1a1aa',
        fontSize: '0.875rem',
    },
    detectBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.6rem 1.25rem',
        background: 'rgba(139, 92, 246, 0.1)',
        border: '1px solid #8B5CF6',
        borderRadius: '999px',
        color: '#8B5CF6',
        fontSize: '0.875rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    primaryBtn: {
        background: 'white',
        color: 'black',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '999px',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    secondaryBtn: {
        background: 'transparent',
        color: '#a1a1aa',
        border: '1px solid #333',
        padding: '0.75rem 1.5rem',
        borderRadius: '999px',
        fontWeight: 600,
        cursor: 'pointer',
    },
    modalOverlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    },
    modal: {
        background: '#1a1a1a',
        padding: '2rem',
        borderRadius: '1rem',
        border: '1px solid #333',
        width: '100%',
        maxWidth: '450px',
    },
    modalTitle: {
        fontSize: '1.5rem',
        fontWeight: 700,
        marginBottom: '1.5rem',
    },
    modalBody: {
        maxHeight: '60vh',
        overflowY: 'auto',
        paddingRight: '0.5rem',
    },
    formGroup: {
        marginBottom: '1.25rem',
    },
    label: {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: 600,
        marginBottom: '0.5rem',
        color: '#d4d4d8',
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        background: '#27272a',
        border: '1px solid #333',
        borderRadius: '0.5rem',
        color: 'white',
        fontSize: '1rem',
        outline: 'none',
    },
    row: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
    },
    modalActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '1rem',
        marginTop: '2rem',
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        padding: '4rem',
    },
    emptyList: {
        color: '#666',
        textAlign: 'center',
        padding: '2rem',
    },
    approvalBanner: {
        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1))',
        border: '1px solid rgba(251, 191, 36, 0.3)',
        borderRadius: '1rem',
        padding: '1.5rem',
        marginBottom: '2rem',
    },
    featuredBanner: {
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.1))',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '1rem',
        padding: '1.5rem',
        marginBottom: '2rem',
    },
    bannerContent: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-start',
    },
    bannerIcon: {
        fontSize: '2rem',
        lineHeight: 1,
    },
    bannerTitle: {
        fontSize: '1.125rem',
        fontWeight: 700,
        color: 'white',
        marginBottom: '0.5rem',
    },
    bannerText: {
        fontSize: '0.875rem',
        color: '#a1a1aa',
        lineHeight: 1.6,
        margin: 0,
    },
};
