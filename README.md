# TobiyaStudio Publishing Platform

A modern, production-grade application publishing and discovery platform for Android apps, games, and web applications.

## Features

- **Store & Discovery**: Browse, filter, search, and explore curated apps, games, and web apps.
- **Secure Download Protection**: Requires user authentication and email OTP verification before downloading APKs.
- **Gmail SMTP OTP Verification**: Automated 6-digit verification codes sent directly to user inboxes.
- **Admin Management Dashboard**: Manage products, categories, metrics, and uploads.
- **Mobile Responsive Design**: Clean and dynamic modern web interface.

## Tech Stack

- **Frontend**: React, Vite, Lucide Icons, Vanilla CSS Design System
- **Backend**: Node.js, Express, Nodemailer, Multer
- **Database / Storage**: JSON DB / MongoDB Atlas integration

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` in `server/` to `server/.env` and provide your credentials:
```bash
cp server/.env.example server/.env
```

Set your Gmail App Password:
```env
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_16_letter_app_password
PORT=5000
```

### 3. Run Development Server
```bash
npm run dev
```

- Frontend runs at: `http://localhost:3000`
- Backend runs at: `http://localhost:5000`
