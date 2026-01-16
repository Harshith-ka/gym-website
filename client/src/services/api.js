import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add Clerk session token to requests
api.interceptors.request.use(async (config) => {
    // Token will be added by Clerk's useAuth hook when making requests
    // This is handled in the component level
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clerk handles redirects
            console.error('Unauthorized request');
        }
        return Promise.reject(error);
    }
);

export default api;
