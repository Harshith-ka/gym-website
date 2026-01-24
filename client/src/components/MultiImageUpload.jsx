import React, { useState } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Plus } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import api from '../services/api';

export default function MultiImageUpload({ onImagesChange, currentImages = [], label = "Upload Images", maxImages = 5 }) {
    const { getToken } = useAuth();
    const [images, setImages] = useState(currentImages);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Check if adding these files would exceed the limit
        if (images.length + files.length > maxImages) {
            setError(`Maximum ${maxImages} images allowed`);
            return;
        }

        setError(null);
        setUploading(true);

        try {
            const token = await getToken();
            const uploadPromises = files.map(async (file) => {
                // Validation
                if (!file.type.startsWith('image/')) {
                    throw new Error('Only image files are allowed');
                }

                if (file.size > 5 * 1024 * 1024) {
                    throw new Error('File size must be less than 5MB');
                }

                const formData = new FormData();
                formData.append('image', file);

                const response = await api.post('/uploads/image', formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });

                return response.data.url;
            });

            const uploadedUrls = await Promise.all(uploadPromises);
            const newImages = [...images, ...uploadedUrls];
            setImages(newImages);
            onImagesChange(newImages);
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.message || 'Failed to upload images. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (indexToRemove) => {
        const newImages = images.filter((_, index) => index !== indexToRemove);
        setImages(newImages);
        onImagesChange(newImages);
    };

    return (
        <div style={styles.container}>
            <label style={styles.label}>{label} ({images.length}/{maxImages})</label>

            <div style={styles.gallery}>
                {images.map((url, index) => (
                    <div key={index} style={styles.imageCard}>
                        <img src={url} alt={`Upload ${index + 1}`} style={styles.image} />
                        <button
                            onClick={() => removeImage(index)}
                            style={styles.removeBtn}
                            type="button"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}

                {images.length < maxImages && (
                    <label style={styles.uploadCard}>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                            disabled={uploading}
                        />
                        {uploading ? (
                            <div style={styles.uploadContent}>
                                <Loader2 className="spinner" size={24} color="#8B5CF6" />
                                <span style={styles.uploadText}>Uploading...</span>
                            </div>
                        ) : (
                            <div style={styles.uploadContent}>
                                <div style={styles.iconCircle}>
                                    <Plus size={24} color="#666" />
                                </div>
                                <span style={styles.uploadText}>Add Photos</span>
                            </div>
                        )}
                    </label>
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
        marginBottom: '0.75rem',
    },
    gallery: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '1rem',
    },
    imageCard: {
        position: 'relative',
        aspectRatio: '1',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        border: '2px solid #333',
        background: '#111',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    removeBtn: {
        position: 'absolute',
        top: '0.5rem',
        right: '0.5rem',
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: 'rgba(239, 68, 68, 0.9)',
        color: 'white',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'transform 0.1s',
        ':hover': { transform: 'scale(1.1)' }
    },
    uploadCard: {
        aspectRatio: '1',
        border: '2px dashed #333',
        borderRadius: '0.75rem',
        background: '#111',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        ':hover': { borderColor: '#8B5CF6', background: '#1a1a1a' }
    },
    uploadContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
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
    },
    uploadText: {
        fontSize: '0.875rem',
        color: '#bbb',
        fontWeight: 500,
        textAlign: 'center',
    },
    errorText: {
        color: '#ef4444',
        fontSize: '0.75rem',
        marginTop: '0.5rem',
    }
};
