# Gym Booking Platform - Quick Start Guide

## 🚀 Getting Started

### 1. Setup Environment Variables

**Backend** (`server/.env`):
```env
PORT=5000
NODE_ENV=development

# Database (Local)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gym_booking
DB_USER=postgres
DB_PASSWORD=your_password

# Firebase Authentication (Admin SDK)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_secret

CLIENT_URL=http://localhost:5173
```

**Frontend** (`client/.env`):
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
npm install
npm run dev
```

## 📝 Get API Keys

1. **Firebase**: [console.firebase.google.com](https://console.firebase.google.com/) - Enable Email/Password & Google Auth
2. **Razorpay**: [razorpay.com](https://razorpay.com) - Get test keys
3. **Cloudinary**: [cloudinary.com](https://cloudinary.com) - Free account

## ✅ What's Implemented

### Backend (100%)
- ✅ Firebase Authentication
- ✅ All API endpoints (40+)
- ✅ Payment integration
- ✅ QR code system
- ✅ Database schema & seeding

### Frontend (95%)
- ✅ Modern UI / Home page
- ✅ Gym search & filters
- ✅ Gym details & maps
- ✅ Booking flow & QR codes
- ✅ User & Admin dashboards
- ✅ Trainer system
- ✅ Monetization flow

## 🎯 Next Steps

1. Configure your API keys in `.env` files
2. Run the database setup
3. Start both servers
4. Visit http://localhost:5173
5. Sign up with Firebase
6. Start exploring!

## 📚 Documentation

See [README.md](README.md) for detailed setup or [DEPLOYMENT.md](DEPLOYMENT.md) for production.
