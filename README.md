# TobiyaStudio Publishing Platform (DagiApps)

[![Production](https://img.shields.io/badge/Production-Live-success?style=flat-square&logo=vercel)](https://dagiapps.pro.et)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/atlas)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

A modern, production-grade application publishing console and software discovery marketplace engineered for Android applications, mobile games, and Progressive Web Applications (PWAs).

🌐 **Live Website**: [https://dagiapps.pro.et](https://dagiapps.pro.et)

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
  - [1. Android App & Game Store](#1-android-app--game-store)
  - [2. Web Application Ecosystem](#2-web-application-ecosystem)
  - [3. Developer Console & Publishing Suite](#3-developer-console--publishing-suite)
  - [4. Security & OTP Email Verification](#4-security--otp-email-verification)
  - [5. Serverless & Performance Optimizations](#5-serverless--performance-optimizations)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Running Locally](#running-locally)
- [Available Scripts](#-available-scripts)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
  - [Products](#products-api)
  - [Authentication & OTP](#authentication--otp-api)
  - [Uploads](#uploads-api)
  - [Admin](#admin-api)
- [Deployment Guide (Vercel + Custom Domain)](#-deployment-guide-vercel--custom-domain)
  - [Handling Large APK Builds (> 4.5 MB)](#handling-large-apk-builds--45-mb)
- [Contributing & License](#-contributing--license)

---

## 🌟 Overview

**TobiyaStudio / DagiApps** provides an end-to-end software delivery pipeline designed to emulate and expand upon the Google Play Store experience. It unifies:

1. **A Public App Store**: Fast search, curated categories, ratings & reviews, screenshots carousel, and secure direct-to-device APK downloads.
2. **A Web App Directory**: First-class support for Progressive Web Apps (PWAs) and cloud-hosted web platforms with one-click direct launching.
3. **A Developer Publishing Console (`/publish`)**: A guided 4-step release pipeline modeled after Google Play Console with real-time metadata validation, automatic APK inspection, IARC rating computation, and pre-launch checklists.
4. **An Admin Operations Center (`/admin`)**: Metric tracking, catalog management, application status controls, and update release distribution.

---

## 🚀 Key Features

### 1. Android App & Game Store
- **Automated Package Inspection**: Client-side inspection of `.apk`, `.aab`, and `.zip` packages to detect file size, package ID, and release version numbers.
- **Direct APK Downloads**: Download packages directly or through authenticated secure tokens.
- **Mobile Phone QR Code Scanner**: Scan to download directly to any Android smartphone or tablet without manual cable transfers.
- **Wishlist & Library**: Local and authenticated saved-software library synced across sessions.

### 2. Web Application Ecosystem
- **Zero-Friction Web Publishing**: Dynamically adjusts the release workflow when "Web Application Only" is chosen—completely omitting APK dropzones and package constraints.
- **Live URL Verification**: Test and validate production URLs (Vercel, Netlify, Cloudflare Pages, custom domains).
- **Adapted Presentation**: Web app listings automatically replace APK download widgets with **"Launch Web App ↗"** buttons and display PWA/cloud badges instead of offline package notices.
- **Hybrid Support**: Support for `Android • Web` releases offering both APK downloads and live web app links.

### 3. Developer Console & Publishing Suite (`/publish`)
Guided 4-Step Release Wizard:
1. **Store Listing & Graphic Assets**: App name, short tagline, full description, category selection, platform selector, 512×512 icon, 1024×500 feature graphic, and responsive screenshots (minimum 2).
2. **App Releases / Web Deployment**:
   - *For Android*: Drag-and-drop package analyzer, architecture detection, release track selection (Production, Beta, QA), and direct binary links.
   - *For Web*: Live production URL, cloud hosting provider, architecture type (PWA, SPA, SSR), and rollout notes.
3. **Policy & Content Questionnaires**:
   - Mandatory Privacy Policy link.
   - Dynamic IARC-compliant content rating calculator (violence, sexuality, language, substances, user chat).
   - Data Safety disclosure (collection types, data encryption, deletion requests).
4. **Review & Rollout**: Pre-launch readiness checklist assessing 8 verification points before unlocking production rollout.
5. **App Version Updates (`/publish?update=<slug>`)**: Dedicated flow to push new version codes, changelogs, and updated binaries to existing apps.

### 4. Security & OTP Email Verification
- **Gmail SMTP OTP Engine**: Automatically delivers 6-digit one-time passcodes to users requesting verification.
- **Download Protection**: Protects APK packages from automated scraping by requiring email confirmation or account login.
- **Graceful Fallback**: Built-in fallback OTP mechanism for testing and development environments when SMTP services are restricted.

### 5. Serverless & Performance Optimizations
- **Client-Side Canvas Compression (`imageCompressor.js`)**: Downscales high-resolution camera screenshots and graphics before transmission to strictly comply with Vercel's 4.5 MB serverless payload ceiling.
- **Serverless In-Memory Multer (`multer.memoryStorage()`)**: Stores uploads cleanly in MongoDB Atlas without local disk write (`EROFS`) errors on Vercel Lambda.
- **Dual-Layer Database**: Seamlessly pairs MongoDB Atlas with a zero-configuration local JSON database fallback for offline local development.

---

## 🛠 Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18.3 | Core UI library |
| **Routing** | React Router DOM 6.29 | Client-side routing and deep linking |
| **Bundler** | Vite 6.2 | Lightning-fast HMR and production bundling |
| **Icons** | Lucide React | Modern, consistent SVG iconography |
| **QR Engine** | qrcode | Client-side canvas QR code generation |
| **Backend** | Node.js 18+ & Express 4.21 | RESTful API server |
| **Database** | MongoDB Atlas / Mongoose 9.9 | Cloud NoSQL persistence with JSON DB fallback |
| **File Handling** | Multer 1.4 | Memory storage (serverless) & disk storage (local) |
| **Email / OTP** | Nodemailer 10.0 | Gmail SMTP OTP delivery |
| **Hosting** | Vercel Edge & Serverless | Global CDN frontend and Node.js serverless functions |
| **DNS & SSL** | Yegara ClouDNS | Production custom domain routing (`dagiapps.pro.et`) |

---

## 📂 Project Architecture

```
Publish/
├── api/
│   └── index.js                 # Vercel serverless entry point (exports Express app)
├── data/
│   └── db.json                  # Local seed & fallback database
├── public/
│   ├── assets/                  # Public icons, covers, and illustrations
│   └── favicon.svg
├── scripts/
│   └── prepare-dist.js          # Post-build script copying active APKs & media to dist/
├── server/
│   ├── .env.example             # Example environment variables
│   ├── db.js                    # MongoDB Atlas connector & JSON DB sync engine
│   └── server.js                # Express REST API, auth routes, and upload endpoints
├── src/
│   ├── components/
│   │   ├── DeviceMockup.jsx     # Responsive phone and laptop frames
│   │   ├── DownloadModal.jsx    # APK download options and OTP prompt
│   │   ├── Navbar.jsx           # Global navigation with search and user controls
│   │   ├── ProductCard.jsx      # Catalog item card with rating and badges
│   │   ├── QRCodeWidget.jsx     # Direct phone scanner (hidden for web-only apps)
│   │   ├── ReviewSection.jsx    # Star ratings and customer testimonials
│   │   └── UpdateAppSection.jsx # Update existing app versions
│   ├── context/
│   │   └── AuthContext.jsx      # Global authentication state & OTP modal handler
│   ├── pages/
│   │   ├── AdminDashboard.jsx   # Metrics, analytics, and software approval table
│   │   ├── AppsPage.jsx         # Android applications directory
│   │   ├── DeveloperPortal.jsx  # 4-Step Google Play Console publishing wizard
│   │   ├── GamesPage.jsx        # Games directory with genre filtering
│   │   ├── HomePage.jsx         # Spotlight banners, top charts, and featured apps
│   │   ├── ProductDetailPage.jsx# Detailed editorial page, screenshots, and reviews
│   │   └── WebAppsPage.jsx      # Progressive Web Applications showcase
│   ├── utils/
│   │   └── imageCompressor.js   # Browser canvas downscaler (resolves Vercel 4.5 MB limit)
│   ├── App.jsx                  # Main application routes
│   ├── index.css                # TobiyaStudio Design System styles
│   └── main.jsx                 # React root mount point
├── index.html                   # HTML entry point with metadata and fonts
├── package.json                 # Project dependencies and build scripts
├── vercel.json                  # Serverless function configuration and rewrites
└── vite.config.js               # Vite bundler configuration with dev proxy
```

---

## 💻 Getting Started

### Prerequisites

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- *(Optional)* **MongoDB Atlas URI** for cloud data persistence
- *(Optional)* **Gmail App Password** for real OTP email dispatch

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/dagdagim/Publish.git
   cd Publish
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Setup

Create a `.env` file in the `server/` directory:
```bash
cp server/.env.example server/.env
```

Populate the configuration variables in `server/.env`:
```env
PORT=5000
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_16_character_app_password
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/tobiyastudio?retryWrites=true&w=majority
```

> **Note on Gmail App Passwords**: If using real Gmail OTPs, generate a 16-character App Password via your [Google Account Security Settings](https://myaccount.google.com/apppasswords).

### Running Locally

Run both backend and frontend concurrently in development mode:
```bash
npm run dev
```

- **Frontend Client**: `http://localhost:3000` (or `http://localhost:5173`)
- **Backend API Server**: `http://localhost:5000`

---

## 📜 Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs Express server and Vite frontend concurrently with auto-reload |
| `npm run client` | Starts Vite frontend dev server only |
| `npm run server` | Starts Express backend server with Node `--watch` mode |
| `npm run build` | Compiles Vite production bundle and bundles active APKs via `scripts/prepare-dist.js` |
| `npm run preview` | Locally previews the compiled production build from `dist/` |
| `npm start` | Boots the Express server in production mode |

---

## 🔑 Environment Variables

| Variable | Scope | Required | Description | Default Fallback |
| :--- | :--- | :---: | :--- | :--- |
| `PORT` | Backend | No | Port for the Express server to listen on | `5000` |
| `GMAIL_USER` | Backend / Vercel | No | Gmail address used for sending 6-digit OTP codes | Demo fallback |
| `GMAIL_PASS` | Backend / Vercel | No | 16-character Google App Password for SMTP | Demo fallback |
| `MONGODB_URI` | Backend / Vercel | No | MongoDB Atlas connection string | Falls back to `data/db.json` |
| `VERCEL` | System | Auto | Set automatically by Vercel in serverless execution | `undefined` |

---

## 📡 API Reference

### Products API

- `GET /api/products` — Retrieve all published products with filtering (`search`, `category`, `platform`, `minRating`, `sort`, `limit`, `offset`).
- `GET /api/products/featured` — Get featured spotlight applications, top popular apps, latest releases, and web apps.
- `GET /api/products/:slug` — Retrieve full product details, release versions, customer reviews, and related apps.
- `POST /api/products` — Submit and publish a new product (handles Android packages, Web apps, ratings, screenshots, and metadata).
- `PUT /api/products/:id` — Update existing product listing or publish a new version.
- `DELETE /api/products/:id` — Remove a product from the catalog.
- `POST /api/products/:id/reviews` — Submit a user review and star rating.
- `GET /api/products/:id/download-package` — Download APK package with optional OTP token verification.

### Authentication & OTP API

- `POST /api/auth/send-otp` — Generate and send a 6-digit OTP to the requested email.
- `POST /api/auth/verify-otp` — Verify 6-digit OTP code and issue authentication token.
- `POST /api/auth/register` — Create a new developer or consumer account.
- `POST /api/auth/login` — Sign in with email and password.
- `GET /api/auth/me` — Retrieve current authenticated user profile.

### Uploads API

- `POST /api/upload` — Upload APK / binary packages (auto-switches to memory storage on Vercel).
- `POST /api/upload/image` — Upload and process app icons, feature graphics, and screenshots.

### Admin API

- `GET /api/admin/stats` — Platform analytics (total downloads, active products, user counts, category breakdown).
- `GET /api/admin/products` — List all products across all statuses (`Published`, `Draft`, `Pending`, `Rejected`).
- `PATCH /api/admin/products/:id/status` — Modify publication status of an application.

---

## 🚢 Deployment Guide (Vercel + Custom Domain)

The application is fully configured for deployment on Vercel with zero configuration required.

### Deploying to Vercel

1. Push your code to your GitHub repository:
   ```bash
   git push origin main
   ```
2. Import the repository into the **Vercel Dashboard**.
3. In your Vercel Project Settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add the following Environment Variables in Vercel:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `GMAIL_USER`: Your Gmail address.
   - `GMAIL_PASS`: Your 16-letter Google App Password.
5. Deploy! Vercel handles both the static frontend (`dist/`) and the serverless API (`api/index.js`).

### Custom Domain Setup (`dagiapps.pro.et`)

In your DNS manager (e.g. Yegara ClouDNS), configure the following DNS records pointing to Vercel:

| Type | Name / Host | Target / Value | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `@` (or `dagiapps.pro.et`) | `76.76.21.21` | 3600 |
| **CNAME** | `www` | `cname.vercel-dns.com` | 3600 |

### Handling Large APK Builds (> 4.5 MB)

Vercel Serverless Functions enforce a strict **4.5 MB request body limit**. To distribute large APKs (e.g. 20 MB – 100+ MB):

1. **Option A (GitHub Releases - Recommended)**:
   - Create a release in your GitHub repository and attach your compiled `.apk`.
   - Copy the direct binary URL (e.g. `https://github.com/username/repo/releases/download/v1.0.0/app-release.apk` or `https://raw.githubusercontent.com/...`).
   - Paste the URL into the **APK Package Direct Download URL** field in Step 2 of the Developer Portal.
2. **Option B (Cloud Storage)**:
   - Host your APK on Google Drive, Firebase Storage, AWS S3, or Cloudflare R2 and paste the direct public download link into the portal.

---

## 📄 Contributing & License

Contributions are welcome! Please follow these steps:

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

Distributed under the **MIT License**. See `LICENSE` for more information.

---

Developed with ❤️ by **TobiyaStudio** · [https://dagiapps.pro.et](https://dagiapps.pro.et)
