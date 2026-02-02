import React, { useState, useRef } from 'react';
import { Upload, X, Check, Loader2, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function ImageUpload({ onUploadSuccess, currentImage, label = "Upload Image", folder = "general" }) {
    const { user } = useAuth();
    const getToken = async () => {
        if (!user) return null;
        return await user.getIdToken();
    };
    const [preview, setPreview] = useState(currentImage || null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation
        if (!file.mimetype && !file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        setError(null);
        setUploading(true);

        // Show local preview immediately
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);

        try {
            const token = await getToken();
            const formData = new FormData();
            formData.append('image', file);

            const response = await api.post('/uploads/image', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            const uploadedUrl = response.data.url;
            setPreview(uploadedUrl);
            onUploadSuccess(uploadedUrl);
            setUploading(false);
        } catch (err) {
            console.error('Upload error:', err);
            setError('Failed to upload image. Please try again.');
            setUploading(false);
            setPreview(currentImage || null);
        }
    };

    const triggerUpload = () => {
        fileInputRef.current?.click();
    };

    const clearImage = (e) => {
        e.stopPropagation();
        setPreview(null);
        onUploadSuccess('');
        setError(null);
    };

    return (
        <div style={styles.container}>
            <label style={styles.label}>{label}</label>
            <div
                style={{
                    ...styles.uploadBox,
                    borderColor: error ? '#ef4444' : (preview ? '#ef4444' : '#333')
                }}
                onClick={triggerUpload}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                />

                {uploading ? (
                    <div style={styles.statusBox}>
                        <Loader2 className="spinner" size={24} color="#ef4444" />
                        <span style={styles.statusText}>Uploading...</span>
                    </div>
                ) : preview ? (
                    <div style={styles.previewContainer}>
                        <img src={preview} alt="Preview" style={styles.previewImage} />
                        <div style={styles.overlay}>
                            <div style={styles.overlayIcons}>
                                <div style={styles.iconBtn} onClick={triggerUpload} title="Change Image">
                                    <Upload size={16} />
                                </div>
                                <div style={{ ...styles.iconBtn, background: '#ef4444' }} onClick={clearImage} title="Remove Image">
                                    <X size={16} />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={styles.placeholderBox}>
                        <div style={styles.iconCircle}>
                            <ImageIcon size={24} color="#666" />
                        </div>
                        <span style={styles.placeholderText}>Click to select image</span>
                        <span style={styles.placeholderSub}>JPG, PNG or WEBP (Max 5MB)</span>
                    </div>
                )}
            </div>
            {error && <p style={styles.errorText}>{error}</p>}
        </div>
    );
}

const styles = {
    container: {
        width: '100%',
        marginBottom: '1rem',
    },
    label: {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#a1a1aa',
        marginBottom: '0.5rem',
    },
    uploadBox: {
        width: '100%',
        minHeight: '140px',
        background: '#111',
        border: '2px dashed #333',
        borderRadius: '0.75rem',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
    },
    statusBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
    },
    statusText: {
        fontSize: '0.875rem',
        color: '#ef4444',
        fontWeight: 500,
    },
    previewContainer: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    previewImage: {
        width: '100%',
        height: '140px',
        objectFit: 'cover',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0,
        transition: 'opacity 0.2s',
        ':hover': { opacity: 1 }
    },
    overlayIcons: {
        display: 'flex',
        gap: '1rem',
    },
    iconBtn: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: '#ef4444',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.1s',
        ':hover': { transform: 'scale(1.1)' }
    },
    placeholderBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '1rem',
    },
    iconCircle: {
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: '#1a1a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '0.75rem',
    },
    placeholderText: {
        fontSize: '0.9rem',
        color: '#bbb',
        fontWeight: 500,
        marginBottom: '0.25rem',
    },
    placeholderSub: {
        fontSize: '0.75rem',
        color: '#666',
    },
    errorText: {
        color: '#ef4444',
        fontSize: '0.75rem',
        marginTop: '0.5rem',
    }
};
