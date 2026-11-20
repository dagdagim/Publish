import fs from 'fs';
import path from 'path';

const DIST_UPLOADS = 'dist/uploads';
const UPLOADS_IMAGES = 'uploads/images';
const UPLOADS_APKS = 'uploads/apks';
const DB_PATH = 'data/db.json';

// Ensure target directories exist
fs.mkdirSync(path.join(DIST_UPLOADS, 'images'), { recursive: true });
fs.mkdirSync(path.join(DIST_UPLOADS, 'apks'), { recursive: true });

// 1. Copy all uploaded images (icons, banners, screenshots)
if (fs.existsSync(UPLOADS_IMAGES)) {
  fs.cpSync(UPLOADS_IMAGES, path.join(DIST_UPLOADS, 'images'), { recursive: true });
  console.log('[Build] Copied uploaded images to dist/uploads/images');
}

// 2. Identify required APK files referenced by active products in db.json
const requiredApks = new Set();
try {
  if (fs.existsSync(DB_PATH)) {
    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    if (Array.isArray(db.products)) {
      db.products.forEach(p => {
        if (p.apkUrl && p.apkUrl.startsWith('/uploads/apks/')) {
          requiredApks.add(p.apkUrl.replace('/uploads/apks/', ''));
        }
      });
    }
  }
} catch (e) {
  console.warn('[Build] Warning reading db.json:', e.message);
}

// 3. Copy required active product APKs and lightweight test APKs (< 5 MB)
if (fs.existsSync(UPLOADS_APKS)) {
  const files = fs.readdirSync(UPLOADS_APKS);
  let copiedCount = 0;
  for (const file of files) {
    const srcPath = path.join(UPLOADS_APKS, file);
    const destPath = path.join(DIST_UPLOADS, 'apks', file);
    try {
      const stat = fs.statSync(srcPath);
      // Copy only active product APKs or small test APKs (< 5 MB) to stay strictly within Vercel's 100 MB limit
      if (stat.isFile() && (requiredApks.has(file) || stat.size <= 5 * 1024 * 1024)) {
        fs.copyFileSync(srcPath, destPath);
        copiedCount++;
        console.log(`[Build] Bundled active APK: ${file} (${(stat.size / (1024 * 1024)).toFixed(1)} MB)`);
      }
    } catch (e) {
      console.warn(`[Build] Warning copying ${file}:`, e.message);
    }
  }
  console.log(`[Build] Successfully bundled ${copiedCount} APK files into dist/uploads/apks`);
}
