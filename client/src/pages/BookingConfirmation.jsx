import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Download, Calendar, MapPin } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@clerk/clerk-react';
import api from '../services/api';

export default function BookingConfirmation() {
    const { id } = useParams();
    const { getToken } = useAuth();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBooking();
    }, [id]);

    const fetchBooking = async () => {
        try {
            const token = await getToken();
            const response = await api.get(`/bookings/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBooking(response.data.booking);
        } catch (error) {
            console.error('Error fetching booking:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadQR = () => {
        const canvas = document.getElementById('qr-code');
        const pngUrl = canvas
            .toDataURL('image/png')
            .replace('image/png', 'image/octet-stream');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `booking-${id}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    if (loading) {
        return (
            <div style={styles.loading}>
                <div className="spinner" />
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="container" style={styles.error}>
                <h2>Booking not found</h2>
                <Link to="/dashboard" className="btn btn-primary">
                    Go to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="container" style={styles.container}>
            <div style={styles.success}>
                <CheckCircle size={64} color="#10B981" />
                <h1 style={styles.title}>Booking Confirmed!</h1>
                <p style={styles.subtitle}>
                    Your booking has been successfully confirmed. Show this QR code at the gym entrance.
                </p>
            </div>

            <div style={styles.content}>
                {/* QR Code */}
                <div className="card" style={styles.qrCard}>
                    <h2 style={styles.sectionTitle}>Your Entry Pass</h2>
                    <div style={{ ...styles.qrContainer, position: 'relative' }}>
                        <QRCodeSVG
                            id="qr-code"
                            value={booking.qr_code}
                            size={250}
                            level="H"
                            includeMargin={true}
                        />
                        {booking.status === 'used' && (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0,0,0,0.7)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 'var(--radius-lg)',
                                backdropFilter: 'blur(2px)'
                            }}>
                                <div style={{
                                    border: '4px solid #F87171',
                                    color: '#F87171',
                                    padding: '1rem 2rem',
                                    borderRadius: '0.5rem',
                                    fontSize: '2rem',
                                    fontWeight: 'bold',
                                    transform: 'rotate(-15deg)',
                                    textTransform: 'uppercase'
                                }}>
                                    Used
                                </div>
                            </div>
                        )}
                    </div>
                    <button onClick={downloadQR} className="btn btn-outline" style={{ width: '100%' }}>
                        <Download size={18} />
                        Download QR Code
                    </button>
                </div>

                {/* Booking Details */}
                <div className="card" style={styles.detailsCard}>
                    <h2 style={styles.sectionTitle}>Booking Details</h2>

                    <div style={styles.detail}>
                        <span style={styles.label}>Booking ID</span>
                        <span style={styles.value}>{booking.id.substring(0, 8).toUpperCase()}</span>
                    </div>

                    <div style={styles.detail}>
                        <span style={styles.label}>Gym</span>
                        <span style={styles.value}>{booking.gym_name}</span>
                    </div>

                    <div style={styles.detail}>
                        <span style={styles.label}>Service</span>
                        <span style={styles.value}>{booking.service_name}</span>
                    </div>

                    <div style={styles.detail}>
                        <span style={styles.label}>
                            <Calendar size={16} />
                            Date
                        </span>
                        <span style={styles.value}>
                            {new Date(booking.booking_date).toLocaleDateString('en-IN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </span>
                    </div>

                    {booking.start_time && (
                        <>
                            <div style={styles.detail}>
                                <span style={styles.label}>Time</span>
                                <span style={styles.value}>
                                    {booking.start_time} - {booking.end_time}
                                </span>
                            </div>
                            <div style={styles.detail}>
                                <span style={styles.label}>Duration</span>
                                <span style={styles.value}>
                                    {booking.duration_hours} Hour{booking.duration_hours > 1 ? 's' : ''}
                                </span>
                            </div>
                        </>
                    )}

                    {booking.trainer_name && (
                        <div style={styles.detail}>
                            <span style={styles.label}>Trainer</span>
                            <span style={styles.value}>{booking.trainer_name}</span>
                        </div>
                    )}

                    <div style={styles.detail}>
                        <span style={styles.label}>
                            <MapPin size={16} />
                            Location
                        </span>
                        <span style={styles.value}>{booking.address}</span>
                    </div>

                    <div style={styles.divider} />

                    <div style={styles.detail}>
                        <span style={styles.label}>Amount Paid</span>
                        <span style={{ ...styles.value, color: 'var(--primary)', fontWeight: 700 }}>
                            ₹{booking.total_amount}
                        </span>
                    </div>

                    <div style={styles.detail}>
                        <span style={styles.label}>Payment Status</span>
                        <span className="badge badge-success">
                            {booking.payment_status === 'completed' ? 'Paid' : booking.payment_status}
                        </span>
                    </div>

                    <div style={styles.detail}>
                        <span style={styles.label}>Booking Status</span>
                        <span className="badge badge-primary">
                            {booking.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Important Notes */}
            <div className="card" style={styles.notesCard}>
                <h3 style={styles.notesTitle}>Important Information</h3>
                <ul style={styles.notesList}>
                    <li>Please arrive 10 minutes before your scheduled time</li>
                    <li>Show this QR code at the gym entrance for verification</li>
                    <li>Carry a valid ID proof for verification</li>
                    <li>This QR code is valid only for the booked date and time</li>
                    <li>Cancellations must be made at least 24 hours in advance</li>
                </ul>
            </div>

            {/* Actions */}
            <div style={styles.actions}>
                <Link to="/dashboard" className="btn btn-secondary">
                    View All Bookings
                </Link>
                <Link to="/explore" className="btn btn-primary">
                    Book Another Gym
                </Link>
            </div>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '900px',
        paddingTop: '2rem',
        paddingBottom: '4rem',
    },
    success: {
        textAlign: 'center',
        marginBottom: '3rem',
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: 700,
        marginTop: '1rem',
        marginBottom: '0.5rem',
    },
    subtitle: {
        fontSize: '1.125rem',
        color: 'var(--text-secondary)',
    },
    content: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
        marginBottom: '2rem',
    },
    qrCard: {
        padding: '2rem',
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: '1.25rem',
        fontWeight: 600,
        marginBottom: '1.5rem',
    },
    qrContainer: {
        display: 'flex',
        justifyContent: 'center',
        padding: '2rem',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '1.5rem',
    },
    detailsCard: {
        padding: '2rem',
    },
    detail: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
    },
    label: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: 'var(--text-secondary)',
        fontSize: '0.875rem',
    },
    value: {
        fontWeight: 600,
        textAlign: 'right',
    },
    divider: {
        height: '1px',
        background: 'var(--border)',
        margin: '1.5rem 0',
    },
    notesCard: {
        padding: '2rem',
        background: 'var(--bg-secondary)',
        marginBottom: '2rem',
    },
    notesTitle: {
        fontSize: '1.125rem',
        fontWeight: 600,
        marginBottom: '1rem',
    },
    notesList: {
        listStyle: 'disc',
        paddingLeft: '1.5rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.8,
    },
    actions: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
    },
    error: {
        textAlign: 'center',
        padding: '4rem 0',
    },
};
