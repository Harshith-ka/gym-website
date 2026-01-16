-- Migration script for CMS and Admin features

-- 1. System Settings
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed basic settings
INSERT INTO system_settings (key, value, description) VALUES
('platform_commission', '10', 'Percentage of fee taken by platform'),
('contact_email', 'support@gymbooking.com', 'Official support email'),
('contact_phone', '+91 9876543210', 'Official support phone'),
('contact_address', '123 Fitness Street, Bangalore, India', 'Official business address')
ON CONFLICT (key) DO NOTHING;

-- 2. Home Banners
CREATE TABLE IF NOT EXISTS home_banners (
    id SERIAL PRIMARY KEY,
    image_url TEXT NOT NULL,
    title VARCHAR(100),
    subtitle TEXT,
    link_url TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Static Pages
CREATE TABLE IF NOT EXISTS static_pages (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL, -- 'about', 'faq', 'terms', 'privacy'
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed static pages
INSERT INTO static_pages (slug, title, content) VALUES
('about', 'About Us', 'Welcome to our Gym Booking Platform. We connect fitness enthusiasts with the best gyms and trainers...'),
('faq', 'Frequently Asked Questions', 'How do I book a session? Just click on a gym and select a time slot...'),
('terms', 'Terms and Conditions', 'By using our service, you agree to comply with our policies...'),
('privacy', 'Privacy Policy', 'We value your privacy and protect your personal data...')
ON CONFLICT (slug) DO NOTHING;

-- 4. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL means broadcast to all
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'system', -- 'system', 'booking', 'promotion'
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Ads & Promotions
CREATE TABLE IF NOT EXISTS ads_promotions (
    id SERIAL PRIMARY KEY,
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'sponsored', 'homepage_banner', 'location_promo'
    pricing DECIMAL(10, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'expired', 'paused'
    views_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update featured_listings to link better with ads if needed
ALTER TABLE featured_listings ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- 6. User Health Metrics (BMI Stats)
CREATE TABLE IF NOT EXISTS user_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    weight DECIMAL(10, 2) NOT NULL,
    height DECIMAL(10, 2) NOT NULL,
    bmi DECIMAL(10, 2) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Add short_code to bookings for manual verification
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS short_code VARCHAR(6);
