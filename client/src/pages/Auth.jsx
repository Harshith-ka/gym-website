import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';

export default function Auth() {
    const navigate = useNavigate();

    const handleSuccess = () => {
        navigate('/auth-redirect');
    };

    return (
        <div style={styles.page}>
            <AuthForm onSuccess={handleSuccess} />
        </div>
    );
}

const styles = {
    page: {
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: '#111'
    }
};
