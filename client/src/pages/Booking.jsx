import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight, Check, ArrowRight } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import api from '../services/api';

export default function Booking() {
    const { gymId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { getToken } = useAuth();

    const [gym, setGym] = useState(null);
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [bookingDate, setBookingDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [loading, setLoading] = useState(true);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [duration, setDuration] = useState(1); // Default 1 hour
    const [trainers, setTrainers] = useState([]);
    const [selectedTrainer, setSelectedTrainer] = useState(null);

    useEffect(() => {
        if (bookingDate && gymId && selectedService?.service_type === 'session') {
            fetchSlots();
        }
    }, [bookingDate, gymId, selectedService]);

    const fetchSlots = async () => {
        setLoadingSlots(true);
        try {
            const response = await api.get(`/gyms/${gymId}/slots`, {
                params: { date: bookingDate }
            });
            setAvailableSlots(response.data.slots || []);
        } catch (error) {
            console.error('Error fetching slots:', error);
        } finally {
            setLoadingSlots(false);
        }
    };

    useEffect(() => {
        fetchGymData();
    }, [gymId]);

    useEffect(() => {
        const serviceId = searchParams.get('service');
        if (serviceId && services.length > 0) {
            const service = services.find(s => s.id === serviceId);
            if (service) setSelectedService(service);
        }
    }, [searchParams, services]);

    const fetchGymData = async () => {
        try {
            const response = await api.get(`/gyms/${gymId}`);
            setGym(response.data.gym);
            setServices(response.data.services || []);
            setTrainers(response.data.trainers || []);
            // Default select first session service if none selected
            if (!selectedService) {
                const firstSession = response.data.services?.find(s => s.service_type === 'session');
                const firstService = firstSession || response.data.services?.[0];
                if (firstService) setSelectedService(firstService);
            }
        } catch (error) {
            console.error('Error fetching gym:', error);
        } finally {
            setLoading(false);
        }
    };

    const addHours = (time, hours) => {
        const [h, m] = time.split(':');
        const newHour = (parseInt(h) + hours) % 24;
        return `${newHour.toString().padStart(2, '0')}:${m}`;
    };

    // Calculate total price dynamically
    const totalPrice = selectedService ? (
        selectedService.service_type === 'session'
            ? (parseFloat(selectedService.price) + parseFloat(selectedTrainer?.hourly_rate || 0)) * duration
            : selectedService.price
    ) : 0;

    const handleBooking = async () => {
        const isSession = selectedService?.service_type === 'session';
        if (!selectedService || !bookingDate) {
            alert('Please select a service and date');
            return;
        }

        if (isSession && !startTime) {
            alert('Please select a time slot');
            return;
        }

        try {
            setProcessing(true);
            const token = await getToken();

            const response = await api.post('/bookings', {
                gymId,
                serviceId: selectedService.id,
                bookingDate,
                startTime: isSession ? (startTime || '09:00') : null,
                endTime: isSession ? addHours(startTime || '09:00', duration) : null,
                durationHours: isSession ? duration : null,
                trainerId: isSession ? selectedTrainer?.id : null
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Initialize Razorpay payment
            const options = {
                key: response.data.razorpayKeyId,
                amount: totalPrice * 100,
                currency: 'INR',
                name: gym.name,
                description: `${selectedService.name} (${duration} hrs)`,
                order_id: response.data.razorpayOrderId,
                handler: async function (paymentResponse) {
                    await api.post('/bookings/verify-payment', {
                        razorpayOrderId: response.data.razorpayOrderId,
                        razorpayPaymentId: paymentResponse.razorpay_payment_id,
                        razorpaySignature: paymentResponse.razorpay_signature,
                        bookingId: response.data.booking.id,
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    navigate(`/booking-confirmation/${response.data.booking.id}`);
                },
                prefill: { name: '', email: '' },
                theme: { color: '#13ec5b' },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error('Booking error:', error);
            alert('Failed to create booking. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    // Helper: Generate next 14 days
    const generateDates = () => {
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const formatDateDisplay = (date) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return {
            day: days[date.getDay()],
            date: date.getDate(),
            full: date.toISOString().split('T')[0]
        };
    };

    const categorizeSlots = (slots) => {
        const morning = [];
        const afternoon = [];
        const evening = [];
        slots.forEach(slot => {
            const hour = parseInt(slot.start_time.split(':')[0]);
            if (hour < 12) morning.push(slot);
            else if (hour < 17) afternoon.push(slot);
            else evening.push(slot);
        });
        return { morning, afternoon, evening };
    };

    if (loading) {
        return (
            <div style={styles.loading}>
                <div className="spinner" />
            </div>
        );
    }

    const dates = generateDates();
    const groupedSlots = categorizeSlots(availableSlots);

    // Current Month Name
    const currentMonth = new Date(bookingDate || new Date()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div style={styles.pageContainer}>
            {/* Header / Breadcrumbs */}
            <div style={styles.container}>
                <div style={styles.breadcrumbs}>
                    <Link to="/" style={styles.crumbLink}>Home</Link>
                    <span style={styles.crumbSep}>/</span>
                    <Link to={`/gym/${gymId}`} style={styles.crumbLink}>Select Service</Link>
                    <span style={styles.crumbSep}>/</span>
                    <span style={styles.crumbActive}>Select Date & Time</span>
                </div>

                <div style={styles.grid}>
                    {/* Left Column: Calendar & Times */}
                    <div style={styles.leftCol}>
                        <div style={{ marginBottom: '2rem' }}>
                            <h1 style={styles.pageTitle}>Complete Your Booking</h1>
                            <p style={styles.pageSubtitle}>Select your preferred plan and schedule your visit.</p>
                        </div>

                        {/* Service Switcher */}
                        <div style={styles.serviceSwitcher}>
                            {services.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => {
                                        setSelectedService(s);
                                        setStartTime('');
                                        setSelectedTrainer(null);
                                    }}
                                    style={{
                                        ...styles.switchBtn,
                                        background: selectedService?.id === s.id ? 'var(--primary)' : 'var(--surface)',
                                        color: selectedService?.id === s.id ? 'black' : 'var(--text-main)',
                                        borderColor: selectedService?.id === s.id ? 'var(--primary)' : 'var(--border)',
                                    }}
                                >
                                    <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{s.name}</span>
                                    <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>₹{s.price}</span>
                                </button>
                            ))}
                        </div>

                        {/* Calendar Card */}
                        <div style={styles.calendarCard}>
                            <div style={styles.calendarHeader}>
                                <h3 style={styles.calendarMonth}>{currentMonth}</h3>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button style={styles.navBtn}><ChevronLeft size={20} /></button>
                                    <button style={styles.navBtn}><ChevronRight size={20} /></button>
                                </div>
                            </div>

                            {/* Date Scroller (Horizontal) */}
                            <div style={styles.dateScroller}>
                                {dates.map((dateObj, idx) => {
                                    const { day, date, full } = formatDateDisplay(dateObj);
                                    const isSelected = bookingDate === full;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setBookingDate(full);
                                                setStartTime('');
                                            }}
                                            style={{
                                                ...styles.dateBtn,
                                                background: isSelected ? 'var(--primary)' : 'transparent',
                                                color: isSelected ? 'black' : 'var(--text-secondary)',
                                                border: isSelected ? 'none' : '1px solid transparent',
                                            }}
                                        >
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{day}</span>
                                            <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>{date}</span>
                                            {isSelected && <div style={styles.activeDot} />}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Legend */}
                            <div style={styles.legend}>
                                <div style={styles.legendItem}>
                                    <span style={{ ...styles.legendDot, background: 'var(--primary)' }}></span>
                                    <span>Available</span>
                                </div>
                                <div style={styles.legendItem}>
                                    <span style={{ ...styles.legendDot, background: 'var(--border)' }}></span>
                                    <span>Booked</span>
                                </div>
                            </div>
                        </div>

                        {/* Available Times Section */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={styles.sectionTitle}>
                                    {selectedService?.service_type === 'session' ? 'Available Times' : 'Select Start Date'}
                                </h2>
                                {bookingDate && (
                                    <div style={styles.dateBadge}>
                                        {new Date(bookingDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                    </div>
                                )}
                            </div>

                            {/* DURATION SELECTOR */}
                            {selectedService?.service_type === 'session' && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <h3 style={styles.subTitle}>Select Duration</h3>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                        {[1, 2, 3].map(hrs => (
                                            <button
                                                key={hrs}
                                                onClick={() => setDuration(hrs)}
                                                style={{
                                                    ...styles.durationPill,
                                                    background: duration === hrs ? 'var(--primary)' : 'var(--surface)',
                                                    color: duration === hrs ? 'black' : 'var(--text-main)',
                                                    borderColor: duration === hrs ? 'var(--primary)' : 'var(--border)',
                                                }}
                                            >
                                                {hrs} Hour{hrs > 1 ? 's' : ''}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* TRAINER SELECTOR */}
                            {selectedService?.service_type === 'session' && trainers.length > 0 && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <h3 style={styles.subTitle}>Select Your Trainer (Optional)</h3>
                                    <div style={styles.trainerGrid}>
                                        <button
                                            onClick={() => setSelectedTrainer(null)}
                                            style={{
                                                ...styles.trainerCard,
                                                borderColor: !selectedTrainer ? 'var(--primary)' : 'var(--border)',
                                                background: !selectedTrainer ? 'rgba(19, 236, 91, 0.05)' : 'var(--surface)'
                                            }}
                                        >
                                            <div style={styles.noTrainerCircle}>None</div>
                                            <span style={styles.trainerNameSmall}>No Trainer</span>
                                            <span style={styles.trainerPriceSmall}>Just Session</span>
                                        </button>
                                        {trainers.map(trainer => (
                                            <button
                                                key={trainer.id}
                                                onClick={() => setSelectedTrainer(trainer)}
                                                style={{
                                                    ...styles.trainerCard,
                                                    borderColor: selectedTrainer?.id === trainer.id ? 'var(--primary)' : 'var(--border)',
                                                    background: selectedTrainer?.id === trainer.id ? 'rgba(19, 236, 91, 0.05)' : 'var(--surface)'
                                                }}
                                            >
                                                <img src={trainer.profile_image || 'https://via.placeholder.com/50'} alt={trainer.name} style={styles.trainerAvatarSmall} />
                                                <span style={styles.trainerNameSmall}>{trainer.name}</span>
                                                <span style={styles.trainerPriceSmall}>+₹{trainer.hourly_rate}/hr</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedService?.service_type === 'session' && bookingDate ? (
                                loadingSlots ? (
                                    <div style={{ padding: '2rem', textAlign: 'center' }}>Loading slots...</div>
                                ) : availableSlots.length === 0 ? (
                                    <div style={styles.emptyState}>No slots available.</div>
                                ) : (
                                    <>
                                        {/* Morning */}
                                        {groupedSlots.morning.length > 0 && (
                                            <div>
                                                <h3 style={styles.timeCategory}>Morning</h3>
                                                <div style={styles.timeGrid}>
                                                    {groupedSlots.morning.map(slot => (
                                                        <TimeSlot
                                                            key={slot.id}
                                                            slot={slot}
                                                            selected={startTime === slot.start_time}
                                                            onSelect={() => !slot.isFull && setStartTime(slot.start_time)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {/* Afternoon */}
                                        {groupedSlots.afternoon.length > 0 && (
                                            <div>
                                                <h3 style={styles.timeCategory}>Afternoon</h3>
                                                <div style={styles.timeGrid}>
                                                    {groupedSlots.afternoon.map(slot => (
                                                        <TimeSlot
                                                            key={slot.id}
                                                            slot={slot}
                                                            selected={startTime === slot.start_time}
                                                            onSelect={() => !slot.isFull && setStartTime(slot.start_time)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {/* Evening */}
                                        {groupedSlots.evening.length > 0 && (
                                            <div>
                                                <h3 style={styles.timeCategory}>Evening</h3>
                                                <div style={styles.timeGrid}>
                                                    {groupedSlots.evening.map(slot => (
                                                        <TimeSlot
                                                            key={slot.id}
                                                            slot={slot}
                                                            selected={startTime === slot.start_time}
                                                            onSelect={() => !slot.isFull && setStartTime(slot.start_time)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )
                            ) : selectedService?.service_type !== 'session' && bookingDate ? (
                                <div style={styles.successBox}>
                                    <Check size={20} color="var(--primary)" />
                                    <span>Start Date Selected: {new Date(bookingDate).toLocaleDateString()}</span>
                                </div>
                            ) : (
                                <div style={styles.emptyState}>Select a date to continue</div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Sticky Summary */}
                    <div style={styles.rightCol}>
                        <div style={styles.stickyWidget}>
                            <div style={styles.summaryCard}>
                                {/* Hero Image */}
                                <div style={styles.summaryHero}>
                                    <div style={styles.summaryOverlay} />
                                    <div style={styles.summaryHeroContent}>
                                        <span style={styles.serviceTag}>{selectedService?.service_type?.toUpperCase() || 'PLAN'}</span>
                                        <h3 style={styles.summaryTitle}>{selectedService?.name || 'Selected Plan'}</h3>
                                    </div>
                                </div>

                                <div style={styles.summaryContent}>
                                    <div style={styles.infoRow}>
                                        <MapPin size={20} color="var(--text-secondary)" />
                                        <div>
                                            <p style={styles.infoMain}>{gym?.name}</p>
                                            <p style={styles.infoSub}>{gym?.city || 'Location'}</p>
                                        </div>
                                    </div>
                                    <div style={styles.infoRow}>
                                        <Clock size={20} color="var(--text-secondary)" />
                                        <div>
                                            <p style={styles.infoMain}>
                                                {selectedService?.service_type === 'session'
                                                    ? `${duration} Hour${duration > 1 ? 's' : ''}`
                                                    : `${selectedService?.duration_days || 1} Days`}
                                            </p>
                                            <p style={styles.infoSub}>Validity</p>
                                        </div>
                                    </div>

                                    <div style={styles.divider} />

                                    <h4 style={styles.selectionHeader}>YOUR SELECTION</h4>
                                    <div style={styles.summaryRow}>
                                        <span style={{ color: 'var(--text-secondary)' }}>{selectedService?.service_type === 'session' ? 'Date' : 'Start Date'}</span>
                                        <span style={{ fontWeight: 600 }}>{bookingDate ? new Date(bookingDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '-'}</span>
                                    </div>
                                    {selectedService?.service_type === 'session' && (
                                        <div style={styles.summaryRow}>
                                            <span style={{ color: 'var(--text-secondary)' }}>Time</span>
                                            <span style={{ fontWeight: 600 }}>{startTime ? startTime.slice(0, 5) : '-'}</span>
                                        </div>
                                    )}
                                    {selectedTrainer && (
                                        <div style={styles.summaryRow}>
                                            <span style={{ color: 'var(--text-secondary)' }}>Trainer</span>
                                            <span style={{ fontWeight: 600 }}>{selectedTrainer.name}</span>
                                        </div>
                                    )}
                                </div>
                                <div style={styles.detailedPrice}>
                                    <div style={styles.priceRow}>
                                        <span>Plan Price</span>
                                        <span>₹{selectedService?.price || 0}</span>
                                    </div>
                                    {selectedTrainer && (
                                        <div style={styles.priceRow}>
                                            <span>Trainer ({selectedTrainer.name})</span>
                                            <span>+₹{selectedTrainer.hourly_rate * duration}</span>
                                        </div>
                                    )}
                                    {duration > 1 && selectedService?.service_type === 'session' && (
                                        <div style={{ ...styles.priceRow, color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                                            <span>Session Multiplier</span>
                                            <span>x{duration}</span>
                                        </div>
                                    )}
                                    <div style={styles.dividerSmall} />
                                    <div style={styles.totalRowFinal}>
                                        <span>Total</span>
                                        <span style={styles.totalAmount}>₹{totalPrice}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleBooking}
                                disabled={!bookingDate || (selectedService?.service_type === 'session' && !startTime) || processing}
                                style={{
                                    ...styles.confirmBtn,
                                    opacity: (!bookingDate || (selectedService?.service_type === 'session' && !startTime) || processing) ? 0.7 : 1,
                                    cursor: (!bookingDate || (selectedService?.service_type === 'session' && !startTime) || processing) ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {processing ? 'Processing...' : 'Confirm & Pay'}
                                {!processing && <ArrowRight size={20} />}
                            </button>

                            <p style={styles.disclaimer}>Free cancellation up to 24h before.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const TimeSlot = ({ slot, selected, onSelect }) => (
    <button
        onClick={onSelect}
        disabled={slot.isFull}
        style={{
            ...styles.slotBtn,
            background: selected ? 'var(--primary)' : 'var(--surface)',
            border: selected ? '2px solid var(--primary)' : '1px solid var(--border)',
            opacity: slot.isFull ? 0.6 : 1,
            cursor: slot.isFull ? 'not-allowed' : 'pointer',
            position: 'relative',
        }}
    >
        {selected && (
            <div style={styles.checkIcon}>
                <Check size={12} color="white" />
            </div>
        )}
        <span style={{ fontSize: '1rem', fontWeight: 700, color: selected ? 'black' : 'var(--text-main)' }}>
            {slot.start_time.slice(0, 5)}
        </span>
        <span style={{
            fontSize: '0.75rem',
            color: selected ? 'rgba(0,0,0,0.7)' : (slot.isFull ? 'var(--text-secondary)' : 'var(--primary)'),
            marginTop: '4px'
        }}>
            {selected ? 'Selected' : (slot.isFull ? 'Full' : 'Available')}
        </span>
    </button>
);

const styles = {
    loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' },
    pageContainer: { minHeight: '100vh', background: 'var(--background)', color: 'var(--text-main)', paddingBottom: '4rem' },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem' }, // matched max-w-[1200px]
    breadcrumbs: { display: 'flex', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' },
    crumbLink: { textDecoration: 'none', color: 'var(--text-secondary)' },
    crumbSep: { color: 'var(--text-tertiary)' },
    crumbActive: { fontWeight: 500, color: 'var(--text-main)' },

    grid: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '2rem' }, // lg:grid-cols-12 like
    leftCol: { display: 'flex', flexDirection: 'column', gap: '2rem' },

    pageTitle: { fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem', lineHeight: 1.1 },
    pageSubtitle: { color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '2rem' },

    serviceSwitcher: {
        display: 'flex',
        gap: '0.75rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
        marginBottom: '2rem'
    },
    switchBtn: {
        flex: '0 0 auto',
        padding: '0.75rem 1.25rem',
        borderRadius: '0.75rem',
        border: '1px solid',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.25rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        minWidth: '120px'
    },

    // Calendar
    calendarCard: {
        background: 'var(--surface)',
        borderRadius: '1rem',
        border: '1px solid var(--border)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-sm)',
    },
    calendarHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
    calendarMonth: { fontSize: '1.25rem', fontWeight: 700 },
    navBtn: { width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-main)' },

    dateScroller: { display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1rem' },
    dateBtn: {
        flex: '0 0 70px', height: '90px', borderRadius: '0.75rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', position: 'relative', transition: 'all 0.2s', gap: '0.25rem'
    },
    activeDot: { width: '4px', height: '4px', borderRadius: '50%', background: 'black', position: 'absolute', bottom: '10px' },

    legend: { display: 'flex', gap: '1rem', marginTop: '1rem' },
    legendItem: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' },
    legendDot: { width: '8px', height: '8px', borderRadius: '50%' },

    // Time Section
    sectionTitle: { fontSize: '1.5rem', fontWeight: 700 },
    dateBadge: { background: 'rgba(19, 236, 91, 0.1)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 600 },

    subTitle: { fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' },
    durationPill: {
        padding: '0.5rem 1.25rem', borderRadius: '999px', border: '1px solid',
        fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s'
    },

    timeCategory: { fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem', marginTop: '1rem' },
    timeGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem' },
    slotBtn: {
        padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)'
    },
    checkIcon: { position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', background: 'black', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },

    emptyState: { padding: '3rem', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '1rem', color: 'var(--text-secondary)' },

    // Trainer Select UI
    trainerGrid: {
        display: 'flex',
        gap: '0.75rem',
        overflowX: 'auto',
        padding: '0.5rem 0',
        marginBottom: '0.5rem'
    },
    trainerCard: {
        flex: '0 0 100px',
        padding: '0.75rem',
        borderRadius: '0.75rem',
        border: '1px solid',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        textAlign: 'center'
    },
    trainerAvatarSmall: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        objectFit: 'cover'
    },
    noTrainerCircle: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'var(--background)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.7rem',
        fontWeight: 700,
        color: 'var(--text-secondary)'
    },
    trainerNameSmall: {
        fontSize: '0.75rem',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        width: '100%'
    },
    trainerPriceSmall: {
        fontSize: '0.65rem',
        color: 'var(--primary)',
        fontWeight: 700
    },

    // Right Sticky Summary
    rightCol: { position: 'relative' },
    stickyWidget: { position: 'sticky', top: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    summaryCard: {
        background: 'var(--surface)', borderRadius: '1rem', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)'
    },
    summaryHero: {
        height: '140px', position: 'relative',
        backgroundImage: 'url("https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2670&auto=format&fit=crop")',
        backgroundSize: 'cover', backgroundPosition: 'center'
    },
    summaryOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' },
    summaryHeroContent: { position: 'absolute', bottom: '1rem', left: '1rem', color: 'white' },
    serviceTag: { background: 'var(--primary)', color: 'black', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.5rem', borderRadius: '0.25rem', marginBottom: '0.25rem', display: 'inline-block' },
    summaryTitle: { fontSize: '1.125rem', fontWeight: 700 },

    summaryContent: { padding: '1.5rem' },
    infoRow: { display: 'flex', gap: '0.75rem', marginBottom: '1rem' },
    infoMain: { fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' },
    infoSub: { fontSize: '0.75rem', color: 'var(--text-secondary)' },

    divider: { height: '1px', background: 'var(--border)', margin: '1rem 0' },

    selectionHeader: { fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem' },
    summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' },

    totalRow: { background: 'var(--background)', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)' },
    totalAmount: { fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' },

    confirmBtn: {
        width: '100%', padding: '1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '0.5rem',
        fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
    },
    disclaimer: { textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' },

    detailedPrice: { background: 'var(--background)', padding: '1rem 1.5rem', borderTop: '1px solid var(--border)' },
    priceRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' },
    dividerSmall: { height: '1px', background: 'var(--border)', margin: '0.75rem 0' },
    totalRowFinal: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },

    successBox: {
        padding: '2rem',
        background: 'rgba(19, 236, 91, 0.05)',
        border: '1px solid var(--primary)',
        borderRadius: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        color: 'var(--primary)',
        fontWeight: 600
    }
};
