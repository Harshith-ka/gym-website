import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom SVG Icon for a more beautiful, premium look
const customMarkerIcon = L.divIcon({
    className: 'custom-gym-marker',
    html: `
        <div style="
            position: relative;
            width: 40px;
            height: 40px;
            background: #ef4444;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(239, 68, 68, 0.5);
            border: 2px solid white;
        ">
            <div style="
                transform: rotate(45deg);
                color: white;
            ">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m6.5 6.5 11 11"/><path d="m11.5 7.5 5 5"/><path d="m7.5 11.5 5 5"/><path d="M2.1 21.9a1.6 1.6 0 0 1 0-2.3l16.1-16.1a1.6 1.6 0 0 1 2.3 0l1.5 1.5a1.6 1.6 0 0 1 0 2.3L5.9 23.4a1.6 1.6 0 0 1-2.3 0l-1.5-1.5Z"/>
                </svg>
            </div>
        </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
});

const GymMap = ({ latitude, longitude, name }) => {
    const position = [parseFloat(latitude), parseFloat(longitude)];

    return (
        <div style={styles.mapWrapper} className="premium-map-container">
            <MapContainer
                center={position}
                zoom={15}
                scrollWheelZoom={false}
                style={styles.container}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <Marker position={position} icon={customMarkerIcon}>
                    <Popup className="premium-popup">
                        <div style={styles.popupContent}>
                            <h3 style={styles.popupTitle}>{name}</h3>
                            <div style={styles.popupDesc}>
                                <span style={styles.statusBadge}>Premium Location</span>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>

            <style>{`
                /* Premium Glassmorphic Popup Styling */
                .leaflet-popup-content-wrapper {
                    background: rgba(15, 15, 15, 0.8) !important;
                    backdrop-filter: blur(12px) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    border-radius: 12px !important;
                    color: white !important;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.5) !important;
                }
                
                .leaflet-popup-tip {
                    background: rgba(15, 15, 15, 0.8) !important;
                    backdrop-filter: blur(12px) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                }

                .leaflet-popup-close-button {
                    color: #fff !important;
                    padding: 8px !important;
                }

                .premium-popup .leaflet-popup-content {
                    margin: 12px 16px !important;
                    min-width: 150px;
                }

                /* Custom Marker Animation */
                .custom-gym-marker {
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                
                .custom-gym-marker:hover {
                    transform: scale(1.1) translateY(-5px);
                    filter: brightness(1.2);
                }

                /* Dark map color enhancement */
                .premium-map-container .leaflet-tile-pane {
                    filter: saturate(1.2) brightness(0.8) contrast(1.1);
                }
            `}</style>
        </div>
    );
};

const styles = {
    mapWrapper: {
        width: '100%',
        height: '100%',
        borderRadius: '1.5rem',
        overflow: 'hidden',
        border: '3px solid #000',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
    },
    container: {
        width: '100%',
        height: '100%',
    },
    popupContent: {
        padding: '2px 0',
    },
    popupTitle: {
        fontSize: '1.1rem',
        fontWeight: 800,
        color: '#fff',
        margin: '0 0 6px',
        letterSpacing: '-0.5px',
    },
    popupDesc: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    statusBadge: {
        background: 'rgba(239, 68, 68, 0.2)',
        color: '#ef4444',
        fontSize: '0.65rem',
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: '999px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        border: '1px solid rgba(239, 68, 68, 0.3)',
    }
};

export default React.memo(GymMap);
