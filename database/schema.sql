-- Gym Booking Platform Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table (synced with Clerk)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id VARCHAR(255) UNIQUE NOT NULL, -- Clerk user ID
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    name VARCHAR(255) NOT NULL,
    age INTEGER,
    profile_image VARCHAR(500),
    role VARCHAR(20) NOT NULL DEFAULT 'user', -- 'user', 'gym_owner', 'trainer', 'admin'
    fitness_interests TEXT[], -- Array of interests
    is_verified BOOLEAN DEFAULT true, -- Clerk handles verification
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gyms Table
CREATE TABLE IF NOT EXISTS gyms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    pincode VARCHAR(10),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(20),
    email VARCHAR(255),
    images TEXT[], -- Array of image URLs
    videos TEXT[], -- Array of video URLs
    facilities TEXT[], -- Array of facilities
    categories TEXT[], -- Array: 'workout', 'dance', 'zumba', 'yoga', 'badminton', 'crossfit'
    is_approved BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false, -- Paid promotion
    featured_until TIMESTAMP, -- Featured listing expiry
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gym Services (Sessions, Passes, Memberships)
CREATE TABLE IF NOT EXISTS gym_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    service_type VARCHAR(20) NOT NULL, -- 'session', 'pass', 'membership'
    name VARCHAR(255) NOT NULL, -- e.g., 'Single Session', 'Daily Pass', 'Monthly Membership'
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration_hours INTEGER, -- For sessions (e.g., 2 hours)
    duration_days INTEGER, -- For passes/memberships (e.g., 1 day, 30 days)
    session_count INTEGER, -- For multi-pass bundles (e.g., 10, 20, 30)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Time Slots for Gyms
CREATE TABLE IF NOT EXISTS gym_time_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, ..., 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_capacity INTEGER DEFAULT 50,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trainers Table
CREATE TABLE IF NOT EXISTS trainers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    gym_id UUID REFERENCES gyms(id) ON DELETE SET NULL,
    bio TEXT,
    specializations TEXT[], -- Array: 'weight_loss', 'muscle_gain', 'yoga', 'cardio', etc.
    experience_years INTEGER,
    certifications TEXT[], -- Array of certification names
    intro_video VARCHAR(500), -- Video URL
    profile_images TEXT[], -- Array of image URLs
    hourly_rate DECIMAL(10, 2),
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_premium BOOLEAN DEFAULT false, -- Paid premium profile
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trainer Availability
CREATE TABLE IF NOT EXISTS trainer_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    service_id UUID REFERENCES gym_services(id) ON DELETE SET NULL,
    booking_type VARCHAR(20) NOT NULL, -- 'session', 'pass', 'membership'
    booking_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    qr_code TEXT NOT NULL, -- QR code data
    qr_code_image VARCHAR(500), -- QR code image URL
    status VARCHAR(20) DEFAULT 'confirmed', -- 'confirmed', 'used', 'cancelled', 'expired'
    trainer_id UUID REFERENCES trainers(id) ON DELETE SET NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    platform_commission DECIMAL(10, 2) NOT NULL,
    gym_earnings DECIMAL(10, 2) NOT NULL,
    trainer_earnings DECIMAL(10, 2) DEFAULT 0.00,
    payment_id VARCHAR(255),
    payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    used_at TIMESTAMP,
    expires_at TIMESTAMP,
    total_sessions INTEGER, -- For multi-pass bundles
    remaining_sessions INTEGER, -- For multi-pass bundles
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trainer Bookings
CREATE TABLE IF NOT EXISTS trainer_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_hours DECIMAL(4, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    platform_commission DECIMAL(10, 2) NOT NULL,
    trainer_earnings DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmed', -- 'confirmed', 'completed', 'cancelled'
    payment_id VARCHAR(255),
    payment_status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews Table (for both gyms and trainers)
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    trainer_booking_id UUID REFERENCES trainer_bookings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified BOOLEAN DEFAULT false, -- Only verified bookings can review
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT review_target CHECK (
        (gym_id IS NOT NULL AND trainer_id IS NULL) OR
        (gym_id IS NULL AND trainer_id IS NOT NULL)
    )
);

-- Wishlist Table
CREATE TABLE IF NOT EXISTS wishlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, gym_id)
);

-- Featured Listings (Paid Promotions)
CREATE TABLE IF NOT EXISTS featured_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    package_type VARCHAR(20) NOT NULL, -- 'basic', 'premium', 'platinum'
    amount_paid DECIMAL(10, 2) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    position INTEGER, -- Display position (lower = higher priority)
    payment_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gym Subscriptions (Monthly plans for gym owners)
CREATE TABLE IF NOT EXISTS gym_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    plan_type VARCHAR(20) NOT NULL, -- 'basic', 'pro', 'enterprise'
    amount DECIMAL(10, 2) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    payment_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    auto_renew BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    gym_id UUID REFERENCES gyms(id) ON DELETE SET NULL,
    transaction_type VARCHAR(30) NOT NULL, -- 'booking', 'trainer_booking', 'featured_listing', 'subscription'
    amount DECIMAL(10, 2) NOT NULL,
    platform_commission DECIMAL(10, 2) DEFAULT 0.00,
    payment_gateway VARCHAR(20), -- 'razorpay', 'stripe'
    payment_id VARCHAR(255),
    payment_status VARCHAR(20) DEFAULT 'pending',
    metadata JSONB, -- Additional data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payouts (Gym Withdrawals)
CREATE TABLE IF NOT EXISTS payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processed', 'rejected'
    transaction_id VARCHAR(255), -- Bank transaction ID manually entered by admin
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    CONSTRAINT payout_target CHECK (
        (gym_id IS NOT NULL AND trainer_id IS NULL) OR
        (gym_id IS NULL AND trainer_id IS NOT NULL)
    )
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30), -- 'booking', 'payment', 'review', 'promotion'
    is_read BOOLEAN DEFAULT false,
    link VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System Settings (Global Config)
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Settings
INSERT INTO system_settings (key, value, description) VALUES 
('platform_commission', '10', 'Percentage taken from each booking'),
('maintenance_mode', 'false', 'If true, blocks standard user access'),
('support_email', 'support@fitbook.com', 'Contact email for support'),
('featured_listing_price', '499', 'Daily price for featured gym listing');

-- Create Indexes for Performance
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_gyms_city ON gyms(city);
CREATE INDEX idx_gyms_categories ON gyms USING GIN(categories);
CREATE INDEX idx_gyms_location ON gyms(latitude, longitude);
CREATE INDEX idx_gyms_featured ON gyms(is_featured, featured_until);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_gym ON bookings(gym_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_reviews_gym ON reviews(gym_id);
CREATE INDEX idx_reviews_trainer ON reviews(trainer_id);
CREATE INDEX idx_trainers_gym ON trainers(gym_id);
CREATE INDEX idx_trainers_specializations ON trainers USING GIN(specializations);

-- Create Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply Updated At Triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gyms_updated_at BEFORE UPDATE ON gyms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gym_services_updated_at BEFORE UPDATE ON gym_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trainers_updated_at BEFORE UPDATE ON trainers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trainer_bookings_updated_at BEFORE UPDATE ON trainer_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
