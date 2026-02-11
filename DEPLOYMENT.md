# Comprehensive Deployment Guide for Hostinger VPS
Project: Gym Website (React/Vite + Node.js/Express + PostgreSQL)

This guide provides a complete, step-by-step process to deploy your application on a Hostinger VPS running **Ubuntu 24.04/25.04/25.10**.

## Prerequisites
1.  **Hostinger VPS Plan** (active).
2.  **Domain Name** pointed to your VPS IP address (A Record).
    -   `@` -> `YOUR_VPS_IP`
    -   `www` -> `YOUR_VPS_IP`
3.  **SSH Client** (Terminal on Mac/Linux, PowerShell or PuTTY on Windows).

---

## Connecting Your GoDaddy Domain (Optional)
If you purchased your domain from GoDaddy, follow these steps to point it to your Hostinger VPS:

1.  **Get Your VPS IP Address**:
    -   Login to your Hostinger VPS dashboard and note your VPS IP address.

2.  **Login to GoDaddy**:
    -   Go to [GoDaddy.com](https://www.godaddy.com) and login to your account.
    -   Navigate to **My Products** → **Domains** → Click **DNS** next to your domain.

3.  **Update DNS Records**:
    -   **Delete existing A records** (if any) that point to other IPs.
    -   **Add new A records**:
        
        | Type | Name | Value | TTL |
        |------|------|-------|-----|
        | A    | @    | YOUR_VPS_IP | 600 seconds |
        | A    | www  | YOUR_VPS_IP | 600 seconds |
    
    -   Click **Save** to apply changes.

4.  **Wait for DNS Propagation**:
    -   DNS changes can take **15 minutes to 48 hours** to propagate globally.
    -   You can check propagation status at [whatsmydns.net](https://www.whatsmydns.net).

5.  **Verify Connection**:
    -   Once propagated, you can proceed with the deployment steps below.
    -   Your domain will be ready to use when configuring Nginx and SSL certificates.

---

## Step 1: Accessing Your VPS
1.  **Login via SSH**:
    Open your terminal/PowerShell and run:
    ```bash
    ssh root@YOUR_VPS_IP
    ```
    *(Replace `YOUR_VPS_IP` with your actual IP address. Enter the root password when prompted.)*

2.  **Update System Packages**:
    ```bash
    apt update && apt upgrade -y
    ```

---

## Step 2: Install Required Software
We will install Node.js (v20), Nginx (Web Server), Git, and PM2 (Process Manager).

> **Note:** This project uses **Neon Database** (serverless PostgreSQL), so you don't need to install PostgreSQL on your VPS.

1.  **Install Node.js 20**:
    ```bash
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    ```
    *Verify with `node -v` and `npm -v`.*

2.  **Install Nginx**:
    ```bash
    apt install -y nginx
    ```

3.  **Install Git & PM2**:
    ```bash
    apt install -y git
    npm install -g pm2
    ```

---

## Step 3: Neon Database Setup
Since this project uses **Neon Database** (serverless PostgreSQL), you'll configure it through their web dashboard:

1.  **Create Neon Account** (if you haven't already):
    -   Go to [neon.tech](https://neon.tech) and sign up for a free account.

2.  **Create a New Project**:
    -   Click **"New Project"** in the Neon dashboard.
    -   Choose a name (e.g., "gym-website-production").
    -   Select your preferred region (choose closest to your VPS for best performance).

3.  **Get Connection String**:
    -   After creating the project, Neon will show you a **Connection String**.
    -   It looks like: `postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`
    -   **Copy this connection string** - you'll need it in Step 5.

4.  **Run Database Schema** (Optional - if starting fresh):
    -   You can run your schema setup later from your VPS after deploying the code.
    -   Neon provides a SQL Editor in their dashboard if you want to run migrations manually.

---

## Step 4: Project Code Setup
1.  **Navigate to Web Directory**:
    ```bash
    cd /var/www
    ```

2.  **Clone Your Repository**:
    *(Replace with your actual GitHub repo URL)*
    ```bash
    git clone https://github.com/yourusername/gym-website.git
    cd gym-website
    ```
    *If it's a private repo, you may need to set up an SSH key or use a Personal Access Token.*

---

## Step 5: Backend Deployment
1.  **Navigate to Server Directory**:
    ```bash
    cd server
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a `.env` file:
    ```bash
    nano .env
    ```
    Paste your production variables:
    ```env
    PORT=5000
    NODE_ENV=production
    CLIENT_URL=https://yourdomain.com
    
    # Neon Database (Paste your connection string from Step 3)
    DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
    
    # Firebase Authentication
    FIREBASE_PROJECT_ID=your-project-id
    FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
    FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
    
    # Cloudinary (Image Storage)
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    
    # Razorpay (Payment Gateway)
    RAZORPAY_KEY_ID=your_key_id
    RAZORPAY_KEY_SECRET=your_key_secret
    ```
    *Note: For `FIREBASE_PRIVATE_KEY`, ensure you copy the entire key including newlines, or use the single line format if your system supports it. The server code handles `\n` replacement.*
    *Press `Ctrl+X`, then `Y`, then `Enter` to save.*

4.  **Seed Database (Optional)**:
    If you have a seed script:
    ```bash
    npm run setup-db
    npm run seed
    ```

5.  **Start with PM2**:
    ```bash
    pm2 start server.js --name "gym-backend"
    pm2 save
    pm2 startup
    ```
    *(Run the command output by `pm2 startup` if requested)*

---

## Step 6: Frontend Deployment
1.  **Navigate to Client Directory**:
    ```bash
    cd ../client
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Build Validation**:
    Create a `.env.production` file to point to your live API:
    ```bash
    nano .env.production
    ```
    Add:
    ```env
    VITE_API_URL=https://yourdomain.com/api
    ```
    *Save and exit.*

4.  **Build the Project**:
    ```bash
    npm run build
    ```
    This will create a `dist` folder containing your static website.

---

## Step 7: Nginx Configuration
We will configure Nginx to serve the frontend files and proxy API requests to the backend.

1.  **Create Nginx Config**:
    ```bash
    nano /etc/nginx/sites-available/gym-website
    ```

2.  **Paste Configuration**:
    *(Replace `yourdomain.com` with your actual domain)*
    ```nginx
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;

        root /var/www/gym-website/client/dist;
        index index.html;

        # Frontend - Serve React App
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Backend - Reverse Proxy
        location /api/ {
            proxy_pass http://localhost:5000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

3.  **Enable Site & Restart Nginx**:
    ```bash
    ln -s /etc/nginx/sites-available/gym-website /etc/nginx/sites-enabled/
    rm /etc/nginx/sites-enabled/default  # Remove default config if present
    nginx -t                             # Test configuration
    systemctl restart nginx
    ```

---

## Step 8: SSL Certification (HTTPS)
Secure your site with a free Let's Encrypt certificate.

1.  **Install Certbot**:
    ```bash
    apt install -y certbot python3-certbot-nginx
    ```

2.  **Obtain Certificate**:
    ```bash
    certbot --nginx -d yourdomain.com -d www.yourdomain.com
    ```
    *Follow the prompts (enter email, agree to terms). Select "2" to redirect HTTP to HTTPS if asked.*

---

## Step 9: Final Verification
1.  Visit `https://yourdomain.com` in your browser.
2.  Test the functionality (Login, Bookings, etc.) to ensure the API connection works.

## Troubleshooting
-   **Check Backend Logs**: `pm2 logs gym-backend`
-   **Check Nginx Logs**: `tail -f /var/log/nginx/error.log`
-   **Check Backend Status**: `pm2 status`
-   **Restart Backend**: `pm2 restart gym-backend`
-   **Restart Nginx**: `systemctl restart nginx`
