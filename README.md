# Gym Booking Platform - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database
- Clerk account (for authentication)
- Razorpay account (for payments)
- Cloudinary account (for media storage)

### Backend Setup

1. **Install Dependencies**
```bash
cd server
npm install
```

2. **Configure Environment Variables**
Create a `.env` file in the `server` directory:
```env
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gym_booking
DB_USER=postgres
DB_PASSWORD=your_password

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Other
CLIENT_URL=http://localhost:5173
PLATFORM_COMMISSION=10
```

3. **Setup Database**
```bash
# Create database
createdb gym_booking

# Run schema
psql -d gym_booking -f ../database/schema.sql
```

4. **Start Server**
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. **Install Dependencies**
```bash
cd client
npm install --legacy-peer-deps
```

2. **Configure Environment Variables**
Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

3. **Start Development Server**
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🔑 Getting API Keys

### Clerk (Authentication)
1. Go to [clerk.com](https://clerk.com)
2. Create a new application
3. Enable Email, Phone, and Google OAuth
4. Copy your Publishable Key and Secret Key

### Razorpay (Payments)
1. Go to [razorpay.com](https://razorpay.com)
2. Create an account
3. Get your Test/Live API keys from Dashboard

### Cloudinary (Media Storage)
1. Go to [cloudinary.com](https://cloudinary.com)
2. Create a free account
3. Get your Cloud Name, API Key, and API Secret

## 📁 Project Structure

```
gym-website/
├── server/               # Backend API
│   ├── config/          # Database, payment configs
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth, validation
│   ├── routes/          # API routes
│   └── server.js        # Entry point
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API calls
│   │   └── App.jsx      # Main app
│   └── index.html
└── database/            # SQL schemas
```

## 🎯 Features Implemented

✅ **Authentication** - Clerk (Email, Phone, Google OAuth)
✅ **User Management** - Profiles, wishlist, booking history
✅ **Gym Search** - Advanced filters, nearby detection, categories
✅ **Booking System** - QR codes, payment integration
✅ **Trainer Booking** - Session booking with payments
✅ **Reviews & Ratings** - Verified reviews
✅ **Admin Dashboard** - Gym approval, analytics
✅ **Monetization** - Featured listings, commissions

## 🔧 Development

- Backend runs on port 5000
- Frontend runs on port 5173
- Database uses PostgreSQL
- All authentication handled by Clerk
- Payments processed through Razorpay

## 📝 Notes

- Make sure PostgreSQL is running before starting the server
- Update Clerk settings to allow your localhost URL
- Use Razorpay test mode for development
- QR codes are generated for each booking for entry validation
