# Gym Booking Platform - Quick Start Guide

## 🚀 Getting Started

### 1. Setup Environment Variables

**Backend** (`server/.env`):
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
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_secret

CLIENT_URL=http://localhost:5173
PLATFORM_COMMISSION=10
```

**Frontend** (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### 2. Setup Database

```bash
# Create database
createdb gym_booking

# Run schema
psql -d gym_booking -f database/schema.sql
```

### 3. Install & Run

**Terminal 1 - Backend:**
```bash
cd server
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm install --legacy-peer-deps
npm run dev
```

## 📝 Get API Keys

1. **Clerk**: [clerk.com](https://clerk.com) - Enable Email, Phone, Google OAuth
2. **Razorpay**: [razorpay.com](https://razorpay.com) - Get test keys
3. **Cloudinary**: [cloudinary.com](https://cloudinary.com) - Free account

## ✅ What's Implemented

### Backend (100%)
- ✅ Clerk authentication
- ✅ All API endpoints (40+)
- ✅ Payment integration
- ✅ QR code system
- ✅ Database schema

### Frontend (80%)
- ✅ Home page
- ✅ Gym search & filters
- ✅ Gym details
- ✅ Booking flow
- ✅ QR code display
- ✅ User dashboard
- ⏳ Trainer pages (placeholder)
- ⏳ Gym dashboard (placeholder)

## 🎯 Next Steps

1. Configure your API keys
2. Run the database setup
3. Start both servers
4. Visit http://localhost:5173
5. Sign up with Clerk
6. Start exploring!

## 📚 Documentation

See [README.md](file:///c:/Users/harsh/OneDrive/Desktop/Proj/gym-website/README.md) for detailed setup instructions.
