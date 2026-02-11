# Gym Booking Platform - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (Local or Neon)
- Firebase Account (for authentication)
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

# Database (Local)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gym_booking
DB_USER=postgres
DB_PASSWORD=your_password

# Database (Production/Neon)
# DATABASE_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require

# Firebase Authentication (Admin SDK)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Other
CLIENT_URL=http://localhost:5173
```

3. **Setup Database**
```bash
# Create database (If using local PostgreSQL)
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
npm install
```

2. **Configure Environment Variables**
Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000/api
# Add Firebase config if needed for client SDK
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

3. **Start Development Server**
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🔑 Getting API Keys

### Firebase (Authentication)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Email/Password** and **Google** sign-in in Authentication
4. Go to Project Settings -> Service Accounts -> Generate New Private Key
5. Copy project details to your backend `.env`

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
│   ├── config/          # Database, payment, firebase configs
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth, upload, validation
│   ├── routes/          # API routes
│   └── server.js        # Entry point
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API calls
│   │   └── App.jsx      # Main app
│   └── index.html
└── database/            # SQL schemas & seeds
```

## 🎯 Features Implemented

✅ **Authentication** - Firebase (Email, Google OAuth)
✅ **User Management** - Profiles, Wishlist, Booking History
✅ **Gym Search** - Advanced Filters, Nearby Detection, Categories
✅ **Booking System** - QR Codes, Razorpay Payment Integration
✅ **Trainer Booking** - Session booking with payments
✅ **Reviews & Ratings** - Verified reviews system
✅ **Admin Dashboard** - Gym Approval, User Management, Analytics
✅ **Monetization** - Featured Listings, System Settings

## 🔧 Development

- Backend runs on port 5000
- Frontend runs on port 5173
- Database uses PostgreSQL (Neon for Production)
- All authentication handled by Firebase Admin SDK
- Payments processed through Razorpay

## 📝 Notes

- Ensure PostgreSQL is running (or `DATABASE_URL` is set) before starting the server
- Use Razorpay test mode for development
- QR codes are generated for each booking for entry validation
- Deployment instructions can be found in [DEPLOYMENT.md](DEPLOYMENT.md)
