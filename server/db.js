import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists safely (read-only filesystem on serverless)
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  // Ignore in serverless environments like Vercel
}

// Initial Database Schema and Seed Data
const initialData = {
  publishers: [
    {
      id: 'pub-tobiyastudio',
      slug: 'tobiyastudio',
      name: 'TobiyaStudio',
      verified: true,
      tagline: 'Building useful digital products.',
      bio: 'TobiyaStudio is an independent software studio committed to engineering fast, trustworthy, and distraction-free mobile apps, web applications, and interactive experiences.',
      avatar: '/assets/publishers/tobiyastudio.svg',
      website: 'https://tobiyastudio.com',
      twitter: '@tobiyastudio',
      github: 'tobiyastudio',
      email: 'contact@tobiyastudio.com',
      appsCount: 12,
      webAppsCount: 6,
      gamesCount: 3
    },
    {
      id: 'pub-apex',
      slug: 'apex-labs',
      name: 'Apex Labs',
      verified: true,
      tagline: 'High-performance engineering & tooling.',
      bio: 'Apex Labs designs enterprise-grade developer utilities, fast web platforms, and mobile interactive experiences.',
      avatar: '/assets/publishers/apex.svg',
      website: 'https://apexlabs.example.com',
      twitter: '@apexlabs',
      github: 'apexlabs',
      email: 'team@apexlabs.example.com',
      appsCount: 4,
      webAppsCount: 2,
      gamesCount: 1
    },
    {
      id: 'pub-mindforge',
      slug: 'mindforge',
      name: 'MindForge',
      verified: true,
      tagline: 'Next-generation educational & financial intelligence.',
      bio: 'MindForge crafts intelligent web systems and interactive learning environments for lifelong learners.',
      avatar: '/assets/publishers/mindforge.svg',
      website: 'https://mindforge.example.com',
      twitter: '@mindforge_ai',
      github: 'mindforge',
      email: 'hello@mindforge.example.com',
      appsCount: 3,
      webAppsCount: 3,
      gamesCount: 0
    }
  ],
  categories: [
    { id: 'cat-productivity', slug: 'productivity', name: 'Productivity', icon: 'CheckSquare', appCount: 12, description: 'Tools and applications to optimize workflows, time, and team output.' },
    { id: 'cat-education', slug: 'education', name: 'Education', icon: 'GraduationCap', appCount: 8, description: 'Interactive learning platforms, tutorials, and knowledge resources.' },
    { id: 'cat-business', slug: 'business', name: 'Business', icon: 'Briefcase', appCount: 15, description: 'Enterprise software, KPI dashboards, inventory, and accounting.' },
    { id: 'cat-health', slug: 'health-fitness', name: 'Health & Fitness', icon: 'Heart', appCount: 10, description: 'Workout trackers, wellness companions, and nutritional calculators.' },
    { id: 'cat-finance', slug: 'finance', name: 'Finance', icon: 'Coins', appCount: 7, description: 'Ledgers, expense loggers, portfolio managers, and tax tools.' },
    { id: 'cat-agriculture', slug: 'agriculture', name: 'Agriculture', icon: 'Sprout', appCount: 6, description: 'Farm management, agronomy advisory, and market linkages.' },
    { id: 'cat-games', slug: 'games', name: 'Games', icon: 'Gamepad2', appCount: 9, description: 'Engaging trivia, action, strategy, and casual games.' },
    { id: 'cat-entertainment', slug: 'entertainment', name: 'Entertainment', icon: 'Film', appCount: 8, description: 'Media players, streaming utilities, and creative tools.' },
    { id: 'cat-utilities', slug: 'utilities', name: 'Utilities', icon: 'Wrench', appCount: 11, description: 'Essential system utilities, converters, and device helpers.' },
    { id: 'cat-ai', slug: 'ai-technology', name: 'AI & Technology', icon: 'Cpu', appCount: 14, description: 'Machine learning tools, voice advisors, and automation platforms.' }
  ],
  collections: [
    {
      id: 'col-featured',
      slug: 'featured-projects',
      name: 'Featured Projects',
      description: 'Hand-picked flagship mobile applications and web services.',
      icon: 'Star',
      badge: 'Editorial Choice',
      productIds: []
    },
    {
      id: 'col-productivity',
      slug: 'best-productivity-apps',
      name: 'Best Productivity Apps',
      description: 'Tools engineered to streamline your day-to-day focus and goals.',
      icon: 'TrendingUp',
      badge: 'Popular',
      productIds: []
    },
    {
      id: 'col-new-releases',
      slug: 'new-releases',
      name: 'New Releases',
      description: 'Fresh software and updates published this month.',
      icon: 'Sparkles',
      badge: 'Just In',
      productIds: []
    },
    {
      id: 'col-games',
      slug: 'games',
      name: 'Games',
      description: 'Fun and competitive games to test your reflexes and trivia prowess.',
      icon: 'Gamepad2',
      badge: 'Play Now',
      productIds: []
    },
    {
      id: 'col-business',
      slug: 'business-tools',
      name: 'Business Tools',
      description: 'Enterprise-tested platforms for management, revenue, and scaling.',
      icon: 'Briefcase',
      badge: 'Enterprise',
      productIds: []
    },
    {
      id: 'col-developer-picks',
      slug: 'developer-picks',
      name: 'Developer Picks',
      description: 'Remarkable open software selected directly by our engineering core.',
      icon: 'Code2',
      badge: 'Editor Curated',
      productIds: []
    }
  ],
  products: [],
  productVersions: [],
  reviews: [],
  downloadsTimeline: [
    { label: 'Jan', downloads: 100 },
    { label: 'Feb', downloads: 250 },
    { label: 'Mar', downloads: 500 }
  ],
  users: []
};

let memoryDb = null;

// Database read and write helpers
export function readDb() {
  if (memoryDb) {
    return memoryDb;
  }
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDb(initialData);
      return initialData;
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(data);
    if (!parsed.users || !Array.isArray(parsed.users)) {
      parsed.users = [];
      writeDb(parsed);
    }
    memoryDb = parsed;
    return parsed;
  } catch (err) {
    console.error('Error reading db.json:', err.message);
    memoryDb = JSON.parse(JSON.stringify(initialData));
    return memoryDb;
  }
}

export function writeDb(data) {
  memoryDb = data;
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (err) {
    // In serverless environments like Vercel, the local disk is read-only.
    // In-memory update succeeded; MongoDB Atlas persists it across invocations.
    return false;
  }
}

export function setMemoryDb(data) {
  memoryDb = data;
}

export function getDb() {
  return readDb();
}
