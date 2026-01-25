-- Migration: Fix qr_code_image column length
-- The qr_code_image column stores base64 encoded QR codes which can be very long
-- Changing from VARCHAR(500) to TEXT to accommodate full base64 data URLs

ALTER TABLE bookings 
ALTER COLUMN qr_code_image TYPE TEXT;
