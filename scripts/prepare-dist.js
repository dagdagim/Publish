import fs from 'fs';
import path from 'path';

const DIST_UPLOADS = 'dist/uploads';
const UPLOADS_IMAGES = 'uploads/images';
const UPLOADS_APKS = 'uploads/apks';

// Ensure target directories exist
fs.mkdirSync(path.join(DIST_UPLOADS, 'images'), { recursive: true });
fs.mkdirSync(path.join(DIST_UPLOADS, 'apks'), { recursive: true });

// Copy all images (icons, banners, screenshots)
if (fs.existsSync(UPLOADS_IMAGES)) {
  fs.cpSync(UPLOADS_IMAGES, path.join(DIST_UPLOADS, 'images'), { recursive: true });
  console.log('[Build] Copied uploaded images to dist/uploads/images');
}

// Copy lightweight APKs (< 5 MB) to avoid exceeding Vercel 100 MB static deployment limit.
// For large APKs in production, host on external storage (GitHub Releases, AWS S3, Firebase, Supabase)
const MAX_APK_BYTES = 5 * 1024 * 1024;
if (fs.existsSync(UPLOADS_APKS)) {
  const files = fs.readdirSync(UPLOADS_APKS);
  let copiedCount = 0;
  for (const file of files) {
    const srcPath = path.join(UPLOADS_APKS, file);
    try {
      const stat = fs.statSync(srcPath);
      if (stat.isFile() && stat.size <= MAX_APK_BYTES) {
        fs.copyFileSync(srcPath, path.join(DIST_UPLOADS, 'apks', file));
        copiedCount++;
      }
    } catch (e) {
      // Ignore read errors
    }
  }
  console.log(`[Build] Copied ${copiedCount} files to dist/uploads/apks`);
}
