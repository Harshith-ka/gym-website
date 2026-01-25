-- Add transactions table for payment tracking
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    gym_id UUID REFERENCES gyms(id) ON DELETE SET NULL,
    transaction_type VARCHAR(30) NOT NULL, -- 'booking', 'trainer_booking', 'featured_listing', 'subscription', 'trainer_premium'
    amount DECIMAL(10, 2) NOT NULL,
    platform_commission DECIMAL(10, 2) DEFAULT 0.00,
    payment_gateway VARCHAR(20), -- 'razorpay', 'stripe'
    payment_id VARCHAR(255),
    payment_status VARCHAR(20) DEFAULT 'pending',
    metadata JSONB, -- Additional data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_gym ON transactions(gym_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_id ON transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(payment_status);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at);
