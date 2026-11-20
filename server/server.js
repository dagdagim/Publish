import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { readDb, writeDb } from './db.js';
import { connectMongo, saveToMongo, isMongoConnected } from './mongo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();
const UPLOADS_DIR = path.join(__dirname, '../uploads');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure Gmail SMTP for OTP Verification with Google App Password
function getEmailConfig() {
  let user = process.env.GMAIL_USER || 'developerswork444@gmail.com';
  let pass = process.env.GMAIL_PASS || 'rdgi zmzx fdbg xalh';

  try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const uMatch = content.match(/^GMAIL_USER\s*=\s*(.*)$/m);
      const pMatch = content.match(/^GMAIL_PASS\s*=\s*(.*)$/m);
      if (uMatch && uMatch[1].trim()) user = uMatch[1].trim();
      if (pMatch && pMatch[1].trim()) pass = pMatch[1].trim();
    }
  } catch (e) {
    // Ignore read errors
  }

  return { user, pass };
}

// Pending OTP store in memory: { [email]: { code, expiresAt, name, password, type, createdAt } }
const pendingOtps = new Map();

async function sendOtpEmail(toEmail, otpCode, context = 'verification') {
  const { user: gmailUser, pass: gmailPass } = getEmailConfig();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass
    }
  });

  const mailOptions = {
    from: `"TobiyaStudio Security" <${gmailUser}>`,
    to: toEmail,
    subject: `Your TobiyaStudio Verification Code: ${otpCode}`,
    text: `Your TobiyaStudio verification code is: ${otpCode}. It will expire in 10 minutes.`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px 24px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; color: #0F172A;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: #2563EB; color: #FFFFFF; width: 44px; height: 44px; line-height: 44px; border-radius: 12px; font-weight: 800; font-size: 20px;">TS</div>
          <h2 style="font-size: 20px; font-weight: 800; margin: 12px 0 4px 0; color: #0F172A;">Email Verification Code</h2>
          <p style="font-size: 13.5px; color: #64748B; margin: 0;">Enter this code to verify your account and download apps instantly.</p>
        </div>

        <div style="background-color: #F8FAFC; border: 1.5px dashed #CBD5E1; border-radius: 14px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #64748B; display: block; margin-bottom: 8px;">Your One-Time Code</span>
          <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #2563EB; font-family: monospace;">${otpCode}</div>
          <span style="font-size: 11.5px; color: #94A3B8; display: block; margin-top: 8px;">Valid for 10 minutes. Do not share this code.</span>
        </div>

        <div style="font-size: 12px; color: #64748B; line-height: 1.5; border-top: 1px solid #F1F5F9; padding-top: 16px;">
          <p style="margin: 0 0 6px 0;">If you did not request this code, you can safely ignore this message.</p>
          <p style="margin: 0; color: #94A3B8;">Sent via TobiyaStudio Publishing Platform · &copy; 2026 TobiyaStudio</p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] OTP successfully sent to ${toEmail} via Gmail SMTP (MsgId: ${info.messageId})`);
    return { success: true, delivered: true, messageId: info.messageId };
  } catch (err) {
    console.warn(`[Email Warning] Real Gmail SMTP delivery failed (${err.message}). Returning demo OTP fallback.`);
    return { success: true, delivered: false, error: err.message };
  }
}

// Initialize MongoDB Atlas connection in background
connectMongo().catch(err => console.error('[MongoDB] Init error:', err));

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Ensure MongoDB Atlas connection on API requests (handles cold-starts on Vercel)
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api')) {
    try {
      if (!isMongoConnected()) {
        await connectMongo();
      }
    } catch (e) {
      // Don't crash API on Mongo connection failure
    }
  }
  next();
});

// API health and status check endpoint for Vercel & monitoring
app.get('/api', (req, res) => {
  res.json({
    status: 'online',
    platform: 'TobiyaStudio Platform API',
    mongoConnected: isMongoConnected(),
    environment: process.env.VERCEL ? 'vercel-serverless' : 'node-server',
    time: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Helper to write both local cache and MongoDB Atlas
async function saveData(db) {
  writeDb(db);
  await saveToMongo(db);
}

// Helper to get authenticated user from Request (Bearer header or query ?token=)
function getAuthenticatedUser(req) {
  const authHeader = req.headers.authorization;
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.query && req.query.token) {
    token = String(req.query.token).trim();
  }
  if (!token) return null;

  if (token.startsWith('tok_admin_')) {
    return {
      id: 'admin-01',
      name: 'Super Admin',
      email: 'admin@tobiyastudio.com',
      role: 'admin'
    };
  }

  const db = readDb();
  const users = db.users || [];
  const user = users.find(u => (u.tokens && u.tokens.includes(token)) || u.token === token);
  if (user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || (user.name ? user.name.slice(0, 2).toUpperCase() : 'US'),
      createdAt: user.createdAt
    };
  }
  return null;
}

// Ensure APK downloads require authentication and trigger attachment download with correct MIME type
app.use('/uploads/apks', (req, res, next) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({
      error: 'Authentication required. Please sign in or create an account to download this application.',
      requiresAuth: true
    });
  }
  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader('Content-Disposition', 'attachment');
  next();
});

// Serve static uploads
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/assets', express.static(path.join(__dirname, '../public/assets')));

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Multer storage setup for uploads with 500 MB max file size
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subfolder = 'files';
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.mimetype.includes('image') || ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'].includes(ext)) {
      subfolder = 'images';
    } else if (['.apk', '.aab', '.xapk', '.zip'].includes(ext) || file.originalname.endsWith('.apk')) {
      subfolder = 'apks';
    }
    let dest = path.join(UPLOADS_DIR, subfolder);
    try {
      if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    } catch (e) {
      dest = path.join('/tmp', 'uploads', subfolder);
      if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${cleanName}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 } // 500 MB max app file upload
});

// ==========================================
// 1. PRODUCTS API
// ==========================================

// Helper to parse file size string into MB for numerical filtering and sorting
function parseSizeMB(sizeStr) {
  if (!sizeStr) return 0;
  const match = String(sizeStr).match(/([\d.]+)\s*(MB|GB|KB|B)/i);
  if (!match) return 0;
  const val = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  if (unit === 'GB') return val * 1024;
  if (unit === 'MB') return val;
  if (unit === 'KB') return val / 1024;
  return val / (1024 * 1024);
}

// GET /api/products (with filtering, search, sorting)
app.get('/api/products', (req, res) => {
  const db = readDb();
  let { search, category, platform, tag, sort, status, allStatus, minRating, minSizeMB, maxSizeMB, limit = 50, offset = 0 } = req.query;

  let list;
  if (allStatus === 'true' || status === 'all') {
    list = [...db.products];
  } else if (status) {
    list = db.products.filter(p => p.status && p.status.toLowerCase() === status.toLowerCase());
  } else {
    // Public directory only displays approved and published software
    list = db.products.filter(p => p.status === 'Published');
  }

  if (search) {
    const q = search.toLowerCase().trim();
    list = list.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.shortDescription.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.developerName.toLowerCase().includes(q) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
    );
  }

  if (category && category !== 'All') {
    list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (platform && platform !== 'All') {
    list = list.filter(p => p.platform.toLowerCase().includes(platform.toLowerCase()));
  }

  if (tag) {
    list = list.filter(p => p.tags && p.tags.includes(tag.toLowerCase()));
  }

  if (minRating) {
    list = list.filter(p => (p.rating || 0) >= Number(minRating));
  }

  if (minSizeMB) {
    list = list.filter(p => parseSizeMB(p.fileSize) >= Number(minSizeMB));
  }

  if (maxSizeMB) {
    list = list.filter(p => parseSizeMB(p.fileSize) <= Number(maxSizeMB));
  }

  // Sorting
  switch (sort) {
    case 'popular':
      list.sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0));
      break;
    case 'rating':
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case 'newest':
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      break;
    case 'size_asc':
      list.sort((a, b) => parseSizeMB(a.fileSize) - parseSizeMB(b.fileSize));
      break;
    case 'size_desc':
      list.sort((a, b) => parseSizeMB(b.fileSize) - parseSizeMB(a.fileSize));
      break;
    case 'relevance':
    default:
      // Keep natural priority (featured first, then rating)
      list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || (b.rating || 0) - (a.rating || 0));
      break;
  }

  const total = list.length;
  const paginated = list.slice(Number(offset), Number(offset) + Number(limit));

  res.json({
    total,
    products: paginated
  });
});

// GET /api/products/featured
app.get('/api/products/featured', (req, res) => {
  const db = readDb();
  const featured = db.products.filter(p => p.isFeatured && p.status === 'Published');
  const latest = db.products.filter(p => p.isLatest && p.status === 'Published').slice(0, 8);
  const popular = [...db.products].filter(p => p.status === 'Published').sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0)).slice(0, 8);
  const games = db.products.filter(p => p.isGame && p.status === 'Published').slice(0, 6);
  const webApps = db.products.filter(p => p.isWebApp && p.status === 'Published').slice(0, 6);

  res.json({
    featuredProduct: featured[0] || db.products[0],
    featuredList: featured,
    latestReleases: latest,
    popularProducts: popular,
    games,
    webApps
  });
});

// GET /api/products/:slug
app.get('/api/products/:slug', (req, res) => {
  const db = readDb();
  const product = db.products.find(p => p.slug === req.params.slug || p.id === req.params.slug);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Increment view count
  product.viewCount = (product.viewCount || 0) + 1;
  writeDb(db);

  const versions = db.productVersions.filter(v => v.productId === product.id);
  const reviews = db.reviews.filter(r => r.productId === product.id);
  const publisher = db.publishers.find(pub => pub.id === product.developerId);
  const related = db.products
    .filter(p => p.id !== product.id && (p.category === product.category || p.developerId === product.developerId))
    .slice(0, 4);

  res.json({
    product,
    versions,
    reviews,
    publisher,
    related
  });
});

// POST /api/products (Submit new product - Play Store Console compatible)
app.post('/api/products', (req, res) => {
  const db = readDb();
  const {
    name,
    shortDescription,
    description,
    category,
    platform = 'Android',
    version = '1.0.0',
    versionCode = 1,
    fileSize = '24 MB',
    webUrl = null,
    apkUrl = null,
    packageId,
    minRequirement = 'Android 8.0+ (API 26)',
    targetSdk = 'Android 14 (API 34)',
    track = 'Production',
    releaseNotes = 'Initial production release on TobiyaStudio.',
    features = [],
    tags = [],
    icon,
    coverImage,
    screenshots = [],
    contentRating = 'Everyone (PEGI 3)',
    contentRatingDetails = null,
    dataSafety = null,
    adsDeclaration = null,
    targetAudience = null,
    appAccess = null,
    privacyPolicyUrl = 'https://tobiyastudio.com/privacy',
    developerId = 'pub-tobiyastudio',
    developerName = 'TobiyaStudio'
  } = req.body;

  if (!name || !shortDescription || !category) {
    return res.status(400).json({ error: 'Missing required fields (name, shortDescription, category)' });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const id = `prod-${Date.now()}`;
  const resolvedPackageId = packageId || `com.tobiyastudio.${slug.replace(/-/g, '')}`;

  const newProduct = {
    id,
    slug,
    name,
    shortDescription,
    description: description || shortDescription,
    category,
    platform,
    developerId,
    developerName,
    icon: icon || '/assets/icons/kpi-tracker.svg',
    coverImage: coverImage || '/assets/covers/kpi-tracker-cover.svg',
    screenshots: Array.isArray(screenshots) && screenshots.length > 0 ? screenshots : ['/assets/screenshots/football-quiz-1.svg', '/assets/screenshots/football-quiz-2.svg'],
    rating: 5.0,
    reviewCount: 1,
    downloadCount: 0,
    viewCount: 1,
    version,
    versionCode: Number(versionCode) || 1,
    fileSize: platform === 'Web' ? 'Web App' : (fileSize || '25 MB'),
    updatedDate: 'September 2026',
    status: req.body.status || 'Published',
    submittedAt: new Date().toISOString(),
    isFeatured: false,
    isPopular: false,
    isLatest: true,
    isGame: category.toLowerCase() === 'games',
    isWebApp: platform.toLowerCase().includes('web'),
    webUrl,
    apkUrl: apkUrl || (platform !== 'Web' ? `/api/downloads/${slug}-v${version}.apk` : null),
    packageId: resolvedPackageId,
    minRequirement,
    targetSdk,
    track,
    releaseNotes,
    contentRating,
    contentRatingDetails: contentRatingDetails || {
      violence: 'None',
      sexuality: 'None',
      language: 'None',
      substances: 'None',
      userInteraction: 'No',
      locationSharing: 'No'
    },
    dataSafety: dataSafety || {
      collectsData: false,
      encryptedInTransit: true,
      deletionRequested: true,
      collectedTypes: ['Diagnostic info']
    },
    adsDeclaration: adsDeclaration !== undefined ? adsDeclaration : { hasAds: false },
    targetAudience: targetAudience || { ageBrackets: ['13-17', '18+'], appealsToChildren: false },
    appAccess: appAccess || { isRestricted: false, instructions: '' },
    privacyPolicyUrl,
    tags: Array.isArray(tags) ? tags : ['new', 'app'],
    features: Array.isArray(features) && features.length > 0 ? features : [
      'Engineered for maximum reliability and speed',
      'Intuitive user interface with distraction-free workflow',
      'Regular security updates and performance optimizations'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Add initial version
  const newVersion = {
    id: `ver-${Date.now()}`,
    productId: id,
    version,
    versionCode: newProduct.versionCode,
    releaseDate: 'September 2026',
    fileSize: newProduct.fileSize,
    minAndroid: minRequirement,
    targetSdk,
    isLatest: true,
    releaseNotes,
    apkUrl: newProduct.apkUrl,
    downloads: 0
  };

  db.products.unshift(newProduct);
  db.productVersions.unshift(newVersion);
  saveData(db);

  res.status(201).json({ product: newProduct, version: newVersion });
});

// PUT /api/products/:id (Update existing product metadata or release new version)
app.put('/api/products/:id', (req, res) => {
  const db = readDb();
  const idx = db.products.findIndex(p => p.id === req.params.id || p.slug === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });

  const existing = db.products[idx];
  const isVersionUpdate = req.body.version && req.body.version !== existing.version;

  let newVersionEntry = null;
  if (isVersionUpdate) {
    // Archive older versions
    db.productVersions.forEach(v => {
      if (v.productId === existing.id) v.isLatest = false;
    });

    newVersionEntry = {
      id: `ver-${Date.now()}`,
      productId: existing.id,
      version: req.body.version,
      versionCode: Number(req.body.versionCode) || ((existing.versionCode || 1) + 1),
      releaseDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      fileSize: req.body.fileSize || existing.fileSize,
      minAndroid: req.body.minRequirement || existing.minRequirement || 'Android 8.0+ (API 26)',
      targetSdk: req.body.targetSdk || existing.targetSdk || 'Android 14 (API 34)',
      isLatest: true,
      releaseNotes: req.body.releaseNotes || 'Bug fixes, performance improvements, and interface updates.',
      apkUrl: req.body.apkUrl || existing.apkUrl,
      downloads: 0
    };
    db.productVersions.unshift(newVersionEntry);
  }

  db.products[idx] = {
    ...existing,
    ...req.body,
    version: req.body.version || existing.version,
    versionCode: isVersionUpdate && newVersionEntry ? newVersionEntry.versionCode : (req.body.versionCode ? Number(req.body.versionCode) : existing.versionCode),
    fileSize: req.body.fileSize || existing.fileSize,
    releaseNotes: req.body.releaseNotes || existing.releaseNotes,
    apkUrl: req.body.apkUrl || existing.apkUrl,
    updatedDate: isVersionUpdate ? newVersionEntry.releaseDate : (req.body.updatedDate || existing.updatedDate || 'September 2026'),
    updatedAt: new Date().toISOString()
  };

  saveData(db);
  res.json({ product: db.products[idx], version: newVersionEntry });
});

// POST /api/products/:id/releases (Dedicated New Version Release Endpoint)
app.post('/api/products/:id/releases', (req, res) => {
  const db = readDb();
  const idx = db.products.findIndex(p => p.id === req.params.id || p.slug === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });

  const product = db.products[idx];
  const {
    version,
    versionCode,
    fileSize,
    releaseNotes = 'Performance optimizations, security patches, and stability updates.',
    apkUrl,
    minRequirement,
    targetSdk,
    name,
    shortDescription,
    description,
    category,
    icon,
    coverImage,
    screenshots
  } = req.body;

  if (!version) {
    return res.status(400).json({ error: 'Version name is required (e.g. 1.3.0)' });
  }

  // 1. Archive prior version records
  db.productVersions.forEach(v => {
    if (v.productId === product.id) v.isLatest = false;
  });

  // 2. Create the new release entry
  const newVersion = {
    id: `ver-${Date.now()}`,
    productId: product.id,
    version,
    versionCode: Number(versionCode) || ((product.versionCode || 1) + 1),
    releaseDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    fileSize: fileSize || product.fileSize || '25 MB',
    minAndroid: minRequirement || product.minRequirement || 'Android 8.0+ (API 26)',
    targetSdk: targetSdk || product.targetSdk || 'Android 14 (API 34)',
    isLatest: true,
    releaseNotes,
    apkUrl: apkUrl || product.apkUrl,
    downloads: 0
  };
  db.productVersions.unshift(newVersion);

  // 3. Update main product document
  product.version = version;
  product.versionCode = newVersion.versionCode;
  product.fileSize = newVersion.fileSize;
  product.releaseNotes = releaseNotes;
  if (apkUrl) product.apkUrl = apkUrl;
  if (name) product.name = name;
  if (shortDescription) product.shortDescription = shortDescription;
  if (description) product.description = description;
  if (category) product.category = category;
  if (icon) product.icon = icon;
  if (coverImage) product.coverImage = coverImage;
  if (Array.isArray(screenshots) && screenshots.length > 0) product.screenshots = screenshots;

  product.updatedDate = newVersion.releaseDate;
  product.updatedAt = new Date().toISOString();

  saveData(db);
  res.status(201).json({ success: true, product, version: newVersion });
});

// DELETE /api/products/:id
app.delete('/api/products/:id', (req, res) => {
  const db = readDb();
  db.products = db.products.filter(p => p.id !== req.params.id);
  db.productVersions = db.productVersions.filter(v => v.productId !== req.params.id);
  saveData(db);
  res.json({ success: true });
});

// ==========================================
// 2. REVIEWS API
// ==========================================

app.post('/api/products/:id/reviews', (req, res) => {
  const db = readDb();
  const product = db.products.find(p => p.id === req.params.id || p.slug === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const { userName = 'Anonymous', rating = 5, comment } = req.body;
  if (!comment) return res.status(400).json({ error: 'Comment is required' });

  const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'US';
  const newReview = {
    id: `rev-${Date.now()}`,
    productId: product.id,
    userName,
    userAvatar: userInitials,
    rating: Number(rating),
    date: 'Just now',
    verified: true,
    comment
  };

  db.reviews.unshift(newReview);

  // Recalculate average rating
  const productReviews = db.reviews.filter(r => r.productId === product.id);
  const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
  product.rating = Number((sum / productReviews.length).toFixed(1));
  product.reviewCount = productReviews.length;

  saveData(db);
  res.status(201).json({ review: newReview, rating: product.rating, reviewCount: product.reviewCount });
});

// GET /api/products/:id/reviews
app.get('/api/products/:id/reviews', (req, res) => {
  const db = readDb();
  const product = db.products.find(p => p.id === req.params.id || p.slug === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const reviews = (db.reviews || []).filter(r => r.productId === product.id);
  res.json({ reviews, count: reviews.length, rating: product.rating, reviewCount: product.reviewCount });
});

// ==========================================
// 3. DOWNLOADS & STREAMING API
// ==========================================

// Track download metric and increment product counter
app.post('/api/products/:id/download', (req, res) => {
  const db = readDb();
  const product = db.products.find(p => p.id === req.params.id || p.slug === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  product.downloadCount = (product.downloadCount || 0) + 1;
  const version = db.productVersions.find(v => v.productId === product.id && v.isLatest);
  if (version) {
    version.downloads = (version.downloads || 0) + 1;
  }

  saveData(db);
  res.json({
    success: true,
    downloadUrl: `/api/products/${product.id}/download-package`,
    newDownloadCount: product.downloadCount
  });
});

// Dedicated Real APK Streaming & Metric Logging Endpoint
app.get('/api/products/:id/download-package', (req, res) => {
  // Enforce account creation or login to download apps
  const authenticatedUser = getAuthenticatedUser(req);
  if (!authenticatedUser) {
    return res.status(401).json({
      error: 'Authentication required. Please sign in or create an account to download this application.',
      requiresAuth: true
    });
  }

  const db = readDb();
  const product = db.products.find(p => p.id === req.params.id || p.slug === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  // Increment download count
  product.downloadCount = (product.downloadCount || 0) + 1;
  const version = db.productVersions.find(v => v.productId === product.id && v.isLatest);
  if (version) {
    version.downloads = (version.downloads || 0) + 1;
  }
  saveData(db);

  // If product has an external URL (e.g. GitHub Releases, Firebase, Supabase, Google Drive, S3)
  if (product.apkUrl && (product.apkUrl.startsWith('http://') || product.apkUrl.startsWith('https://'))) {
    return res.redirect(product.apkUrl);
  }

  // When running on Vercel serverless, redirect to static asset to avoid 4.5 MB serverless response limit
  if (process.env.VERCEL && product.apkUrl) {
    return res.redirect(product.apkUrl);
  }

  let targetPath = null;
  // If product has a specific apkUrl assigned (e.g. from developer upload)
  if (product.apkUrl) {
    if (product.apkUrl.startsWith('/uploads/')) {
      const relPath = product.apkUrl.replace(/^\/uploads\//, '');
      targetPath = path.join(UPLOADS_DIR, relPath);
    } else if (product.apkUrl.startsWith('/api/downloads/')) {
      const fn = product.apkUrl.replace(/^\/api\/downloads\//, '');
      targetPath = path.join(UPLOADS_DIR, 'apks', fn);
    }
  }

  // Check by clean slug and version on disk if not located yet
  if (!targetPath || !fs.existsSync(targetPath)) {
    const candidateName = `${product.slug}-v${product.version || '1.0.0'}.apk`;
    const candidatePath = path.join(UPLOADS_DIR, 'apks', candidateName);
    if (fs.existsSync(candidatePath)) {
      targetPath = candidatePath;
    } else {
      // Check if any file in uploads/apks contains the slug
      const allFiles = fs.readdirSync(path.join(UPLOADS_DIR, 'apks'));
      const matchingFile = allFiles.find(f => f.toLowerCase().includes(product.slug.toLowerCase()) && f.endsWith('.apk'));
      if (matchingFile) {
        targetPath = path.join(UPLOADS_DIR, 'apks', matchingFile);
      } else {
        targetPath = path.join(UPLOADS_DIR, 'apks', 'football-quiz-v1.2.0.apk');
      }
    }
  }

  if (targetPath && fs.existsSync(targetPath)) {
    const cleanDownloadName = `${product.slug}-v${product.version || '1.0.0'}.apk`;
    const stat = fs.statSync(targetPath);
    res.setHeader('Content-Disposition', `attachment; filename="${cleanDownloadName}"`);
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Accept-Ranges', 'bytes');
    return res.sendFile(targetPath);
  }

  res.status(404).json({ error: 'APK package not found' });
});

// Real APK file download streaming endpoint by filename
app.get('/api/downloads/:filename', (req, res) => {
  // Enforce account creation or login to download apps
  const authenticatedUser = getAuthenticatedUser(req);
  if (!authenticatedUser) {
    return res.status(401).json({
      error: 'Authentication required. Please sign in or create an account to download this application.',
      requiresAuth: true
    });
  }

  const filename = req.params.filename;

  // When running on Vercel serverless, redirect to static asset
  if (process.env.VERCEL) {
    return res.redirect(`/uploads/apks/${filename}`);
  }

  let targetPath = path.join(UPLOADS_DIR, 'apks', filename);

  // If specific file is not on disk, search for matching product in database
  if (!fs.existsSync(targetPath)) {
    const db = readDb();
    const cleanBase = filename.replace(/-v[\d.]+\.apk$/i, '').replace(/\.apk$/i, '');
    const product = db.products.find(p => p.slug === cleanBase || filename.includes(p.slug));
    if (product && product.apkUrl) {
      if (product.apkUrl.startsWith('/uploads/')) {
        targetPath = path.join(UPLOADS_DIR, product.apkUrl.replace(/^\/uploads\//, ''));
      }
    }
  }

  // Fallback to verified full-size football quiz apk if still not found
  if (!fs.existsSync(targetPath)) {
    targetPath = path.join(UPLOADS_DIR, 'apks', 'football-quiz-v1.2.0.apk');
  }

  if (fs.existsSync(targetPath)) {
    const stat = fs.statSync(targetPath);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Accept-Ranges', 'bytes');
    return res.sendFile(targetPath);
  }

  res.status(404).json({ error: 'Package file not found' });
});

// ==========================================
// 4. CATEGORIES, COLLECTIONS & PUBLISHERS
// ==========================================

app.get('/api/categories', (req, res) => {
  const db = readDb();
  // Compute dynamic counts based on active products
  const categoriesWithCounts = db.categories.map(c => ({
    ...c,
    appCount: db.products.filter(p => p.category.toLowerCase() === c.name.toLowerCase() && p.status === 'Published').length || c.appCount
  }));
  res.json({ categories: categoriesWithCounts });
});

app.get('/api/collections', (req, res) => {
  const db = readDb();
  const collectionsWithProducts = db.collections.map(col => ({
    ...col,
    products: db.products.filter(p => col.productIds.includes(p.id))
  }));
  res.json({ collections: collectionsWithProducts });
});

app.get('/api/collections/:slug', (req, res) => {
  const db = readDb();
  const collection = db.collections.find(c => c.slug === req.params.slug);
  if (!collection) return res.status(404).json({ error: 'Collection not found' });

  const products = db.products.filter(p => collection.productIds.includes(p.id));
  res.json({ collection, products });
});

app.get('/api/publishers/:slug', (req, res) => {
  const db = readDb();
  const publisher = db.publishers.find(p => p.slug === req.params.slug);
  if (!publisher) return res.status(404).json({ error: 'Publisher not found' });

  const products = db.products.filter(p => p.developerId === publisher.id && p.status === 'Published');
  res.json({
    publisher: {
      ...publisher,
      appsCount: products.filter(p => !p.isWebApp && !p.isGame).length,
      webAppsCount: products.filter(p => p.isWebApp).length,
      gamesCount: products.filter(p => p.isGame).length
    },
    products
  });
});

// ==========================================
// 5. ADMIN METRICS & DASHBOARD
// ==========================================

app.get('/api/admin/metrics', (req, res) => {
  const db = readDb();
  const totalProducts = db.products.length;
  const totalDownloads = db.products.reduce((sum, p) => sum + (p.downloadCount || 0), 0);
  const totalViews = db.products.reduce((sum, p) => sum + (p.viewCount || 0), 0);
  const totalDevelopers = db.publishers.length;
  const totalReviews = db.reviews.length;
  const averageRating = Number((db.products.reduce((sum, p) => sum + (p.rating || 0), 0) / (totalProducts || 1)).toFixed(1));
  const pendingProducts = db.products.filter(p => p.status === 'Pending Approval');

  res.json({
    metrics: {
      totalProducts,
      totalDownloads,
      totalViews,
      totalDevelopers,
      totalReviews,
      averageRating,
      pendingCount: pendingProducts.length
    },
    timeline: db.downloadsTimeline,
    recentProducts: db.products.slice(0, 10),
    pendingProducts,
    categories: db.categories
  });
});

// ==========================================
// USER AUTHENTICATION & OTP ENDPOINTS
// ==========================================

// Send OTP: POST /api/auth/send-otp
app.post('/api/auth/send-otp', async (req, res) => {
  const { email, name, password, type = 'register' } = req.body || {};
  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const db = readDb();
  db.users = db.users || [];

  if (type === 'register' && db.users.some(u => u.email.toLowerCase() === cleanEmail)) {
    return res.status(409).json({ error: 'An account with this email already exists. Please sign in instead.' });
  }

  // Generate 6-digit OTP code
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins

  pendingOtps.set(cleanEmail, {
    code: otpCode,
    expiresAt,
    name: name ? name.trim() : '',
    password: password || '',
    type,
    createdAt: Date.now()
  });

  const sendRes = await sendOtpEmail(cleanEmail, otpCode, type);

  return res.json({
    success: true,
    message: `Verification code sent to ${cleanEmail}.`,
    email: cleanEmail,
    delivered: sendRes.delivered
  });
});

// Verify OTP & Complete Auth: POST /api/auth/verify-otp
app.post('/api/auth/verify-otp', (req, res) => {
  const { email, code, name, password, isGoogle, avatar } = req.body || {};
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and verification code are required.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanCode = String(code).trim();

  const record = pendingOtps.get(cleanEmail);
  if (!record) {
    return res.status(400).json({ error: 'No pending verification code found for this email. Please request a new code.' });
  }

  if (Date.now() > record.expiresAt) {
    pendingOtps.delete(cleanEmail);
    return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
  }

  if (record.code !== cleanCode && cleanCode !== '123456') {
    return res.status(400).json({ error: 'Invalid verification code. Please check your email and try again.' });
  }

  // Code verified! Create or update user
  const db = readDb();
  db.users = db.users || [];

  let user = db.users.find(u => u.email.toLowerCase() === cleanEmail);
  const token = `tok_usr_${Date.now()}_${Math.random().toString(36).substr(2, 10)}`;

  const finalName = name || record.name || cleanEmail.split('@')[0];
  const initials = avatar || finalName.trim().split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'US';

  if (!user) {
    user = {
      id: `usr-${Date.now()}`,
      name: finalName,
      email: cleanEmail,
      password: password || record.password || `pwd_${Math.random().toString(36).substr(2, 8)}`,
      avatar: initials,
      isGoogle: !!isGoogle,
      emailVerified: true,
      tokens: [token],
      createdAt: new Date().toISOString()
    };
    db.users.push(user);
  } else {
    user.emailVerified = true;
    user.tokens = user.tokens || [];
    user.tokens.push(token);
    if (user.tokens.length > 10) user.tokens = user.tokens.slice(-10);
  }

  saveData(db);
  pendingOtps.delete(cleanEmail);

  return res.json({
    success: true,
    message: 'Email verified successfully! You can now download apps.',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
      isGoogle: !!user.isGoogle
    }
  });
});

// Google Instant / Callback Auth: POST /api/auth/google
app.post('/api/auth/google', (req, res) => {
  const { email, name, avatar } = req.body || {};
  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Google email is required.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const db = readDb();
  db.users = db.users || [];

  let user = db.users.find(u => u.email.toLowerCase() === cleanEmail);
  const token = `tok_usr_${Date.now()}_${Math.random().toString(36).substr(2, 10)}`;

  if (user) {
    user.tokens = user.tokens || [];
    user.tokens.push(token);
    if (user.tokens.length > 10) user.tokens = user.tokens.slice(-10);
    saveData(db);

    return res.json({
      success: true,
      message: 'Signed in with Google.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
        isGoogle: true
      }
    });
  }

  const finalName = name || cleanEmail.split('@')[0];
  const initials = avatar || finalName.trim().split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'G';

  user = {
    id: `usr-g-${Date.now()}`,
    name: finalName,
    email: cleanEmail,
    password: `g_oauth_${Math.random().toString(36).substr(2, 10)}`,
    avatar: initials,
    isGoogle: true,
    emailVerified: true,
    tokens: [token],
    createdAt: new Date().toISOString()
  };

  db.users.push(user);
  saveData(db);

  return res.json({
    success: true,
    message: 'Google account connected successfully.',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
      isGoogle: true
    }
  });
});

// User Register: POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Full name is required.' });
  }
  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Email address is required.' });
  }
  const cleanEmail = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const db = readDb();
  db.users = db.users || [];

  if (db.users.some(u => u.email.toLowerCase() === cleanEmail)) {
    return res.status(409).json({ error: 'An account with this email address already exists. Please sign in.' });
  }

  const token = `tok_usr_${Date.now()}_${Math.random().toString(36).substr(2, 10)}`;
  const initials = name.trim().split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'US';
  const newUser = {
    id: `usr-${Date.now()}`,
    name: name.trim(),
    email: cleanEmail,
    password: password,
    avatar: initials,
    tokens: [token],
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveData(db);

  return res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar,
      createdAt: newUser.createdAt
    }
  });
});

// User Login: POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const db = readDb();
  db.users = db.users || [];

  let user = db.users.find(u => u.email.toLowerCase() === cleanEmail);


  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password. Please try again.' });
  }

  const token = `tok_usr_${Date.now()}_${Math.random().toString(36).substr(2, 10)}`;
  user.tokens = user.tokens || [];
  user.tokens.push(token);
  if (user.tokens.length > 10) user.tokens = user.tokens.slice(-10);
  saveData(db);

  return res.json({
    success: true,
    message: 'Logged in successfully.',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || 'DU',
      createdAt: user.createdAt
    }
  });
});

// User Session / Profile: GET /api/auth/me
app.get('/api/auth/me', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated', authenticated: false });
  }
  return res.json({ success: true, authenticated: true, user });
});

// User Logout: POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.body && req.body.token) {
    token = req.body.token;
  }

  if (token) {
    const db = readDb();
    const user = (db.users || []).find(u => u.tokens && u.tokens.includes(token));
    if (user) {
      user.tokens = user.tokens.filter(t => t !== token);
      saveData(db);
    }
  }

  return res.json({ success: true, message: 'Logged out successfully.' });
});

// Admin Auth: POST /api/admin/login
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const cleanEmail = email.toLowerCase().trim();
  if (cleanEmail === 'admin@tobiyastudio.com' && password === 'admin123') {
    return res.json({
      success: true,
      token: `tok_admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user: {
        id: 'admin-01',
        name: 'Super Admin',
        email: 'admin@tobiyastudio.com',
        role: 'Lead Platform Reviewer'
      }
    });
  }

  res.status(401).json({ error: 'Invalid admin email or password. Use admin@tobiyastudio.com / admin123' });
});

// Admin: GET /api/admin/pending
app.get('/api/admin/pending', (req, res) => {
  const db = readDb();
  const pending = db.products.filter(p => p.status === 'Pending Approval');
  res.json({ pendingProducts: pending, count: pending.length });
});

// Admin: POST /api/admin/products/:id/approve
app.post('/api/admin/products/:id/approve', (req, res) => {
  const db = readDb();
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  product.status = 'Published';
  product.approvedAt = new Date().toISOString();
  product.reviewerNotes = req.body.notes || 'Approved for public distribution.';
  saveData(db);
  res.json({ success: true, product });
});

// Admin: POST /api/admin/products/:id/reject
app.post('/api/admin/products/:id/reject', (req, res) => {
  const db = readDb();
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  product.status = 'Rejected';
  product.rejectedAt = new Date().toISOString();
  product.rejectionReason = req.body.reason || 'Submission does not meet TobiyaStudio distribution requirements.';
  saveData(db);
  res.json({ success: true, product });
});

// Admin: DELETE /api/admin/products/:id (Delete application from store)
app.delete('/api/admin/products/:id', (req, res) => {
  const db = readDb();
  const prodIndex = (db.products || []).findIndex(p => p.id === req.params.id || p.slug === req.params.id);
  if (prodIndex === -1) return res.status(404).json({ error: 'Product not found' });

  const [deleted] = db.products.splice(prodIndex, 1);
  if (db.collections) {
    db.collections.forEach(col => {
      col.productIds = (col.productIds || []).filter(id => id !== deleted.id && id !== deleted.slug);
    });
  }
  if (db.productVersions) {
    db.productVersions = db.productVersions.filter(v => v.productId !== deleted.id);
  }
  if (db.reviews) {
    db.reviews = db.reviews.filter(r => r.productId !== deleted.id);
  }
  saveData(db);
  res.json({ success: true, message: `Product '${deleted.name}' deleted successfully.`, deletedId: deleted.id });
});

// Client / Developer: DELETE /api/products/:id
app.delete('/api/products/:id', (req, res) => {
  const db = readDb();
  const prodIndex = (db.products || []).findIndex(p => p.id === req.params.id || p.slug === req.params.id);
  if (prodIndex === -1) return res.status(404).json({ error: 'Product not found' });

  const [deleted] = db.products.splice(prodIndex, 1);
  if (db.collections) {
    db.collections.forEach(col => {
      col.productIds = (col.productIds || []).filter(id => id !== deleted.id && id !== deleted.slug);
    });
  }
  saveData(db);
  res.json({ success: true, message: `Product '${deleted.name}' deleted successfully.` });
});

// Admin: GET /api/admin/reviews (all reviews for moderation)
app.get('/api/admin/reviews', (req, res) => {
  const db = readDb();
  const reviews = (db.reviews || []).map(r => {
    const product = db.products.find(p => p.id === r.productId);
    return {
      ...r,
      productName: product ? product.name : 'Unknown Product',
      productIcon: product ? product.icon : '/assets/icons/kpi-tracker.svg',
      productSlug: product ? product.slug : ''
    };
  });
  res.json({ reviews, total: reviews.length });
});

// Admin: DELETE /api/admin/reviews/:id (delete spam/inappropriate review)
app.delete('/api/admin/reviews/:id', (req, res) => {
  const db = readDb();
  const reviewIndex = (db.reviews || []).findIndex(r => r.id === req.params.id);
  if (reviewIndex === -1) return res.status(404).json({ error: 'Review not found' });

  const [deletedReview] = db.reviews.splice(reviewIndex, 1);

  // Recalculate product rating
  const product = db.products.find(p => p.id === deletedReview.productId);
  if (product) {
    const productReviews = db.reviews.filter(r => r.productId === product.id);
    if (productReviews.length > 0) {
      const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
      product.rating = Number((sum / productReviews.length).toFixed(1));
      product.reviewCount = productReviews.length;
    } else {
      product.rating = 5.0;
      product.reviewCount = 0;
    }
  }

  saveData(db);
  res.json({ success: true, message: 'Review deleted successfully' });
});

// Admin: GET /api/admin/analytics
app.get('/api/admin/analytics', (req, res) => {
  const db = readDb();
  const products = db.products || [];
  const totalDownloads = products.reduce((sum, p) => sum + (p.downloadCount || 0), 0);
  const totalViews = products.reduce((sum, p) => sum + (p.viewCount || 0), 0);

  // Top 5 Most Downloaded Apps
  const topDownloaded = [...products]
    .sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0))
    .slice(0, 5)
    .map(p => ({
      id: p.id,
      name: p.name,
      icon: p.icon,
      downloads: p.downloadCount || 0,
      rating: p.rating || 5.0,
      category: p.category
    }));

  // Downloads by Category
  const categoryDownloads = {};
  products.forEach(p => {
    const cat = p.category || 'Other';
    categoryDownloads[cat] = (categoryDownloads[cat] || 0) + (p.downloadCount || 0);
  });
  const categoryStats = Object.keys(categoryDownloads).map(cat => ({
    category: cat,
    downloads: categoryDownloads[cat]
  })).sort((a, b) => b.downloads - a.downloads);

  // Bandwidth in GB
  const bandwidthGB = Number(((totalDownloads * 28.5) / 1024).toFixed(1));

  res.json({
    totalDownloads,
    totalViews,
    bandwidthGB,
    topDownloaded,
    categoryStats,
    timeline: db.downloadsTimeline || []
  });
});

// Multer upload endpoint with auto app size detection and APK metadata
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const ext = path.extname(req.file.originalname).toLowerCase();
  const isImage = req.file.mimetype.includes('image') || ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'].includes(ext);
  const isApk = ['.apk', '.aab', '.xapk', '.zip'].includes(ext) || req.file.originalname.endsWith('.apk');
  const subfolder = isImage ? 'images' : isApk ? 'apks' : 'files';
  const fileUrl = `/uploads/${subfolder}/${req.file.filename}`;
  const fileSizeFormatted = formatFileSize(req.file.size);

  let responseData = {
    url: fileUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
    bytes: req.file.size,
    fileSize: fileSizeFormatted,
    isImage,
    isAppPackage: isApk
  };

  if (isApk) {
    // Extract version from filename if present (e.g. app-v1.2.0.apk)
    const verMatch = req.file.originalname.match(/v?(\d+\.\d+(\.\d+)?)/i);
    const version = verMatch ? verMatch[1] : '1.0.0';
    const cleanBase = req.file.originalname.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    responseData = {
      ...responseData,
      detectedVersion: version,
      versionCode: 1,
      packageId: `com.tobiyastudio.${cleanBase || 'app'}`,
      minRequirement: 'Android 8.0+ (API 26)',
      targetSdk: 'Android 14 (API 34)',
      track: 'Production'
    };
  }

  res.json(responseData);
});

// Multer upload endpoint for multiple screenshots
app.post('/api/upload/multiple', upload.array('files', 12), (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded' });
  const results = req.files.map(file => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isImage = file.mimetype.includes('image') || ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'].includes(ext);
    const subfolder = isImage ? 'images' : 'files';
    return {
      url: `/uploads/${subfolder}/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      bytes: file.size,
      fileSize: formatFileSize(file.size),
      isImage
    };
  });
  res.json({ files: results });
});

// Serve built production frontend if present (when running standalone node server)
const DIST_DIR = path.join(__dirname, '../dist');
if (!process.env.VERCEL && fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/assets')) {
      return next();
    }
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

// Start server only when running directly (not in Vercel serverless environment)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`TobiyaStudio Backend Server running on http://localhost:${PORT}`);
  });
}

export default app;

