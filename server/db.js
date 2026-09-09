import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
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
      productIds: ['prod-football-quiz', 'prod-agribusiness', 'prod-kpi-tracker', 'prod-fitness']
    },
    {
      id: 'col-productivity',
      slug: 'best-productivity-apps',
      name: 'Best Productivity Apps',
      description: 'Tools engineered to streamline your day-to-day focus and goals.',
      icon: 'TrendingUp',
      badge: 'Popular',
      productIds: ['prod-kpi-tracker', 'prod-taskflow', 'prod-crypto-ledger']
    },
    {
      id: 'col-new-releases',
      slug: 'new-releases',
      name: 'New Releases',
      description: 'Fresh software and updates published this month.',
      icon: 'Sparkles',
      badge: 'Just In',
      productIds: ['prod-football-quiz', 'prod-agrivoice', 'prod-speed-dash', 'prod-edulearn']
    },
    {
      id: 'col-games',
      slug: 'games',
      name: 'Games',
      description: 'Fun and competitive games to test your reflexes and trivia prowess.',
      icon: 'Gamepad2',
      badge: 'Play Now',
      productIds: ['prod-football-quiz', 'prod-speed-dash']
    },
    {
      id: 'col-business',
      slug: 'business-tools',
      name: 'Business Tools',
      description: 'Enterprise-tested platforms for management, revenue, and scaling.',
      icon: 'Briefcase',
      badge: 'Enterprise',
      productIds: ['prod-agribusiness', 'prod-kpi-tracker', 'prod-taskflow']
    },
    {
      id: 'col-developer-picks',
      slug: 'developer-picks',
      name: 'Developer Picks',
      description: 'Remarkable open software selected directly by our engineering core.',
      icon: 'Code2',
      badge: 'Editor Curated',
      productIds: ['prod-agrivoice', 'prod-media-player', 'prod-edulearn']
    }
  ],
  products: [
    {
      id: 'prod-football-quiz',
      slug: 'football-quiz',
      name: 'Football Quiz',
      shortDescription: 'Test your football knowledge with exciting quizzes and global challenges.',
      description: 'Football Quiz is a premier football trivia application designed for true football fans worldwide. Challenge your knowledge across historic World Cup milestones, legendary players, iconic leagues, clubs, and tactical records. Featuring clean responsive animations, real-time timer countdowns, and global leaderboards, Football Quiz lets you prove your football acumen online or completely offline.',
      category: 'Games',
      platform: 'Android',
      developerId: 'pub-tobiyastudio',
      developerName: 'TobiyaStudio',
      icon: '/assets/icons/football-quiz.svg',
      coverImage: '/assets/covers/football-quiz-cover.svg',
      screenshots: [
        '/assets/screenshots/football-quiz-1.svg',
        '/assets/screenshots/football-quiz-2.svg',
        '/assets/screenshots/football-quiz-3.svg'
      ],
      rating: 4.8,
      reviewCount: 124,
      downloadCount: 8420,
      viewCount: 19500,
      version: '1.2.0',
      fileSize: '32 MB',
      updatedDate: 'September 2026',
      status: 'Published',
      isFeatured: true,
      isPopular: true,
      isLatest: true,
      isGame: true,
      isWebApp: false,
      webUrl: null,
      apkUrl: '/api/downloads/football-quiz-v1.2.0.apk',
      packageId: 'com.tobiyastudio.footballquiz',
      minRequirement: 'Android 8.0 (Oreo) or higher',
      contentRating: 'Everyone 3+',
      privacyPolicyUrl: 'https://tobiyastudio.com/privacy',
      tags: ['football', 'quiz', 'trivia', 'game', 'sports', 'offline', 'world cup'],
      features: [
        'Over 2,500 curated football trivia questions across 15 tournament categories',
        'Multiple difficulty levels: Amateur, Semi-Pro, World Class, and Legend',
        'Timed sudden-death challenge modes with streak multipliers',
        'Global and regional leaderboards updated in real time',
        'Comprehensive personal stats and badge unlock progression',
        '100% offline gameplay support with no mandatory accounts'
      ],
      createdAt: '2026-06-15T10:00:00Z',
      updatedAt: '2026-09-02T14:30:00Z'
    },
    {
      id: 'prod-kpi-tracker',
      slug: 'kpi-tracker',
      name: 'KPI Tracker',
      shortDescription: 'Track your business metrics and personal goals with real-time analytics.',
      description: 'KPI Tracker provides executive clarity for founders, team leads, and managers. Set custom North Star metrics, track milestone completion, and receive automated progress forecasting with zero complicated spreadsheets. Seamlessly syncs between mobile devices and web workspaces.',
      category: 'Productivity',
      platform: 'Android • Web',
      developerId: 'pub-tobiyastudio',
      developerName: 'TobiyaStudio',
      icon: '/assets/icons/kpi-tracker.svg',
      coverImage: '/assets/covers/kpi-tracker-cover.svg',
      screenshots: [
        '/assets/screenshots/kpi-tracker-1.svg',
        '/assets/screenshots/kpi-tracker-2.svg'
      ],
      rating: 4.6,
      reviewCount: 98,
      downloadCount: 5120,
      viewCount: 12400,
      version: '1.0.0',
      fileSize: '24 MB',
      updatedDate: 'August 2026',
      status: 'Published',
      isFeatured: false,
      isPopular: true,
      isLatest: true,
      isGame: false,
      isWebApp: true,
      webUrl: 'https://kpi.softhub.example.com',
      apkUrl: '/api/downloads/kpi-tracker-v1.0.0.apk',
      packageId: 'com.tobiyastudio.kpitracker',
      minRequirement: 'Android 9.0+ or modern web browser',
      contentRating: 'Everyone',
      privacyPolicyUrl: 'https://tobiyastudio.com/privacy',
      tags: ['productivity', 'kpi', 'analytics', 'dashboard', 'business', 'goals'],
      features: [
        'Real-time KPI dashboard with interactive chart visualizations',
        'Automated progress tracking and trajectory milestone forecasts',
        'Custom alerts when indicators dip below target thresholds',
        'Cloud synchronization between Android and desktop browser',
        'CSV/PDF automated monthly metric report export'
      ],
      createdAt: '2026-07-10T12:00:00Z',
      updatedAt: '2026-08-28T09:15:00Z'
    },
    {
      id: 'prod-agribusiness',
      slug: 'agribusiness-platform',
      name: 'Agribusiness Platform',
      shortDescription: 'Complete farm management system and digital marketplace.',
      description: 'Agribusiness Platform connects agricultural producers, agronomists, and commodity buyers into a unified digital workspace. Manage seasonal crop cycles, monitor soil sensor metrics, track harvest yields, and list verified produce directly on the wholesale marketplace.',
      category: 'Business',
      platform: 'Web',
      developerId: 'pub-tobiyastudio',
      developerName: 'TobiyaStudio',
      icon: '/assets/icons/agribusiness.svg',
      coverImage: '/assets/covers/agribusiness-cover.svg',
      screenshots: [
        '/assets/screenshots/agribusiness-1.svg',
        '/assets/screenshots/agribusiness-2.svg'
      ],
      rating: 4.7,
      reviewCount: 89,
      downloadCount: 3900,
      viewCount: 14100,
      version: '1.0.0',
      fileSize: 'Web Cloud',
      updatedDate: 'August 2026',
      status: 'Published',
      isFeatured: false,
      isPopular: true,
      isLatest: true,
      isGame: false,
      isWebApp: true,
      webUrl: 'https://agri.softhub.example.com',
      apkUrl: null,
      packageId: 'org.tobiyastudio.agribusiness',
      minRequirement: 'Chrome, Firefox, Safari, Edge',
      contentRating: 'Everyone',
      privacyPolicyUrl: 'https://tobiyastudio.com/privacy',
      tags: ['agriculture', 'business', 'farming', 'marketplace', 'crop management'],
      features: [
        'Complete farm record keeping: planting dates, fertilizers, and projected harvest',
        'Direct farmer-to-buyer wholesale marketplace with verified listings',
        'Weather risk index and localized micro-climate alerts',
        'Inventory reconciliation for seeds, machinery, and crop storage',
        'Multi-currency invoicing and transaction ledger'
      ],
      createdAt: '2026-05-18T08:00:00Z',
      updatedAt: '2026-08-20T16:00:00Z'
    },
    {
      id: 'prod-fitness',
      slug: 'fitness-app',
      name: 'Fitness App',
      shortDescription: 'Your personal fitness companion with guided workouts and nutrition.',
      description: 'Fitness App delivers adaptive, science-backed workout plans tailored to your goals—whether building strength, improving cardiovascular endurance, or maintaining joint mobility. Includes step-by-step video exercise guides and smart macro tracking.',
      category: 'Health & Fitness',
      platform: 'Android • iOS',
      developerId: 'pub-tobiyastudio',
      developerName: 'TobiyaStudio',
      icon: '/assets/icons/fitness.svg',
      coverImage: '/assets/covers/fitness-cover.svg',
      screenshots: [
        '/assets/screenshots/fitness-1.svg',
        '/assets/screenshots/fitness-2.svg'
      ],
      rating: 4.5,
      reviewCount: 64,
      downloadCount: 4200,
      viewCount: 9800,
      version: '1.0.0',
      fileSize: '38 MB',
      updatedDate: 'July 2026',
      status: 'Published',
      isFeatured: false,
      isPopular: true,
      isLatest: true,
      isGame: false,
      isWebApp: false,
      webUrl: null,
      apkUrl: '/api/downloads/fitness-app-v1.0.0.apk',
      packageId: 'com.tobiyastudio.fitnessapp',
      minRequirement: 'Android 8.0+ / iOS 15.0+',
      contentRating: 'Everyone',
      privacyPolicyUrl: 'https://tobiyastudio.com/privacy',
      tags: ['fitness', 'workout', 'health', 'exercise', 'nutrition', 'gym'],
      features: [
        'Personalized 4-week to 12-week workout progression programs',
        'Over 300 animated exercise demonstration guides with form tips',
        'Integrated rest-timer, set counter, and superset tracker',
        'Daily caloric and macronutrient nutrient calculator',
        'Offline exercise logging with background music support'
      ],
      createdAt: '2026-06-01T11:00:00Z',
      updatedAt: '2026-07-29T13:45:00Z'
    },
    {
      id: 'prod-media-player',
      slug: 'media-player',
      name: 'Media Player',
      shortDescription: 'Enjoy your favorite offline music and videos with high-definition audio.',
      description: 'A lightweight, privacy-focused media player engineered to decode all major audio and video formats without ads or background battery drain. Features custom 10-band graphic equalizer, gesture playback controls, and subtitle synchronization.',
      category: 'Entertainment',
      platform: 'Android',
      developerId: 'pub-tobiyastudio',
      developerName: 'TobiyaStudio',
      icon: '/assets/icons/media-player.svg',
      coverImage: '/assets/covers/media-player-cover.svg',
      screenshots: [
        '/assets/screenshots/media-player-1.svg'
      ],
      rating: 4.4,
      reviewCount: 52,
      downloadCount: 3150,
      viewCount: 7600,
      version: '1.1.0',
      fileSize: '18 MB',
      updatedDate: 'June 2026',
      status: 'Published',
      isFeatured: false,
      isPopular: false,
      isLatest: true,
      isGame: false,
      isWebApp: false,
      webUrl: null,
      apkUrl: '/api/downloads/media-player-v1.1.0.apk',
      packageId: 'com.tobiyastudio.mediaplayer',
      minRequirement: 'Android 7.0 or higher',
      contentRating: 'Everyone',
      privacyPolicyUrl: 'https://tobiyastudio.com/privacy',
      tags: ['media', 'player', 'video', 'audio', 'music', 'offline'],
      features: [
        'Hardware-accelerated playback for MP4, MKV, FLAC, and MP3',
        '10-band equalizer with bass boost and vocal clarity presets',
        'Swipe brightness and volume gesture controls',
        'Picture-in-Picture (PiP) multitasking mode',
        'Auto-indexing of SD cards and external USB OTG storage'
      ],
      createdAt: '2026-04-12T09:00:00Z',
      updatedAt: '2026-06-18T10:30:00Z'
    },
    {
      id: 'prod-agrivoice',
      slug: 'agrivoice-ethiopia',
      name: 'AgriVoice Ethiopia',
      shortDescription: 'Voice-first agronomy advisory and disease diagnosis in local languages.',
      description: 'AgriVoice Ethiopia empowers rural farmers and agricultural extension officers through hands-free, natural voice interactions. Farmers can speak symptoms in Amharic, Oromo, or English, receive instantaneous diagnosis for coffee, teff, maize, and wheat pests, and hear localized micro-weather advisory.',
      category: 'Agriculture',
      platform: 'Web',
      developerId: 'pub-tobiyastudio',
      developerName: 'TobiyaStudio',
      icon: '/assets/icons/agrivoice.svg',
      coverImage: '/assets/covers/agrivoice-cover.svg',
      screenshots: [
        '/assets/screenshots/agrivoice-1.svg',
        '/assets/screenshots/agrivoice-2.svg'
      ],
      rating: 4.9,
      reviewCount: 112,
      downloadCount: 4600,
      viewCount: 16800,
      version: '1.0.0',
      fileSize: 'Web Voice App',
      updatedDate: 'September 2026',
      status: 'Published',
      isFeatured: true,
      isPopular: true,
      isLatest: true,
      isGame: false,
      isWebApp: true,
      webUrl: 'http://127.0.0.1:8085',
      apkUrl: null,
      packageId: 'org.tobiyastudio.agrivoice',
      minRequirement: 'Any modern browser with microphone support',
      contentRating: 'Everyone',
      privacyPolicyUrl: 'https://tobiyastudio.com/privacy',
      tags: ['agrivoice', 'ethiopia', 'agriculture', 'voice', 'ai', 'crops', 'weather'],
      features: [
        'Natural speech recognition in local languages (Amharic, Afaan Oromoo, English)',
        'Computer vision & symptom-based diagnosis for 40+ regional crop diseases',
        'Daily 7-day micro-weather advisory with hyper-local precipitation forecasts',
        'Interactive audio playbacks designed for high-sunlight outdoor usage',
        'Works seamlessly on low-bandwidth mobile connections'
      ],
      createdAt: '2026-08-01T07:30:00Z',
      updatedAt: '2026-09-04T12:00:00Z'
    },
    {
      id: 'prod-taskflow',
      slug: 'taskflow-pro',
      name: 'TaskFlow Pro',
      shortDescription: 'Streamlined project management, kanban boards, and automated sprint reports.',
      description: 'Designed for fast-moving engineering teams, TaskFlow Pro cuts out unnecessary Jira bloat. Features markdown documentation, sub-second search, keyboard-first navigation, and real-time pull request status sync.',
      category: 'Productivity',
      platform: 'Web',
      developerId: 'pub-apex',
      developerName: 'Apex Labs',
      icon: '/assets/icons/taskflow.svg',
      coverImage: '/assets/covers/taskflow-cover.svg',
      screenshots: [
        '/assets/screenshots/taskflow-1.svg'
      ],
      rating: 4.8,
      reviewCount: 78,
      downloadCount: 6200,
      viewCount: 15400,
      version: '3.0.0',
      fileSize: 'Web Cloud',
      updatedDate: 'August 2026',
      status: 'Published',
      isFeatured: false,
      isPopular: true,
      isLatest: false,
      isGame: false,
      isWebApp: true,
      webUrl: 'https://taskflow.example.com',
      apkUrl: null,
      packageId: 'com.apexlabs.taskflow',
      minRequirement: 'Modern browser',
      contentRating: 'Everyone',
      privacyPolicyUrl: 'https://apexlabs.example.com/privacy',
      tags: ['productivity', 'kanban', 'project management', 'agile', 'tasks'],
      features: [
        'Blazing fast Kanban boards with instant optimistic updates',
        'Full keyboard navigation and command palette shortcuts',
        'Automated release changelog generator from linked tickets',
        'Time tracking with team velocity reporting',
        'GitHub and GitLab pull request integration'
      ],
      createdAt: '2026-03-10T14:00:00Z',
      updatedAt: '2026-08-15T16:20:00Z'
    },
    {
      id: 'prod-speed-dash',
      slug: 'speed-dash-3d',
      name: 'Speed Dash 3D',
      shortDescription: 'Fast-paced arcade racing with competitive global multiplayer circuits.',
      description: 'Experience adrenaline-fueled street racing with realistic vehicle physics, high-fidelity sound, and customizable performance parts. Race across neon city nightscapes and canyon mountain passes.',
      category: 'Games',
      platform: 'Android',
      developerId: 'pub-apex',
      developerName: 'Apex Labs',
      icon: '/assets/icons/speed-dash.svg',
      coverImage: '/assets/covers/speed-dash-cover.svg',
      screenshots: [
        '/assets/screenshots/speed-dash-1.svg'
      ],
      rating: 4.7,
      reviewCount: 140,
      downloadCount: 9300,
      viewCount: 22000,
      version: '2.0.1',
      fileSize: '45 MB',
      updatedDate: 'August 2026',
      status: 'Published',
      isFeatured: false,
      isPopular: true,
      isLatest: true,
      isGame: true,
      isWebApp: false,
      webUrl: null,
      apkUrl: '/api/downloads/speed-dash-v2.0.1.apk',
      packageId: 'com.apexlabs.speeddash',
      minRequirement: 'Android 9.0+, 3GB RAM',
      contentRating: 'Teen 12+',
      privacyPolicyUrl: 'https://apexlabs.example.com/privacy',
      tags: ['racing', 'arcade', '3d', 'game', 'action', 'multiplayer'],
      features: [
        '18 high-performance sports cars with custom engine tuning',
        'Dynamic day-to-night transitions and rainy weather effects',
        'Real-time 8-player ghost asynchronous challenges',
        'Customizable touch steering, tilt sensor, and gamepad support'
      ],
      createdAt: '2026-05-20T10:00:00Z',
      updatedAt: '2026-08-10T11:00:00Z'
    },
    {
      id: 'prod-crypto-ledger',
      slug: 'crypto-ledger',
      name: 'CryptoLedger',
      shortDescription: 'Secure portfolio tracking, tax estimations, and multi-chain sync.',
      description: 'CryptoLedger lets investors monitor cross-chain assets, liquidity pools, and transaction fees in one consolidated privacy-first interface. Your API keys and wallet addresses are encrypted locally and never transmitted to third parties.',
      category: 'Finance',
      platform: 'Web',
      developerId: 'pub-mindforge',
      developerName: 'MindForge',
      icon: '/assets/icons/crypto-ledger.svg',
      coverImage: '/assets/covers/crypto-ledger-cover.svg',
      screenshots: [
        '/assets/screenshots/crypto-ledger-1.svg'
      ],
      rating: 4.6,
      reviewCount: 43,
      downloadCount: 2800,
      viewCount: 8400,
      version: '1.3.0',
      fileSize: 'Web App',
      updatedDate: 'September 2026',
      status: 'Published',
      isFeatured: false,
      isPopular: false,
      isLatest: true,
      isGame: false,
      isWebApp: true,
      webUrl: 'https://cryptoledger.example.com',
      apkUrl: null,
      packageId: 'com.mindforge.cryptoledger',
      minRequirement: 'Any modern browser',
      contentRating: 'Everyone',
      privacyPolicyUrl: 'https://mindforge.example.com/privacy',
      tags: ['crypto', 'finance', 'ledger', 'portfolio', 'taxes', 'web3'],
      features: [
        'Supports 25+ EVM and non-EVM blockchains',
        'Automated FIFO/LIFO capital gains tax report generation',
        'Real-time token pricing feeds with historical ROI charts',
        'Zero custodial access: Read-only public address tracking'
      ],
      createdAt: '2026-07-01T15:00:00Z',
      updatedAt: '2026-09-01T17:00:00Z'
    },
    {
      id: 'prod-edulearn',
      slug: 'edulearn-kids',
      name: 'EduLearn Kids',
      shortDescription: 'Interactive gamified learning for mathematics, science, and languages.',
      description: 'EduLearn Kids transforms elementary curriculum into engaging quests. Designed with child psychologists to foster problem-solving confidence without ads, dark patterns, or microtransactions.',
      category: 'Education',
      platform: 'Android',
      developerId: 'pub-tobiyastudio',
      developerName: 'TobiyaStudio',
      icon: '/assets/icons/edulearn.svg',
      coverImage: '/assets/covers/edulearn-cover.svg',
      screenshots: [
        '/assets/screenshots/edulearn-1.svg'
      ],
      rating: 4.8,
      reviewCount: 115,
      downloadCount: 7800,
      viewCount: 18200,
      version: '1.2.5',
      fileSize: '42 MB',
      updatedDate: 'September 2026',
      status: 'Published',
      isFeatured: false,
      isPopular: true,
      isLatest: true,
      isGame: true,
      isWebApp: false,
      webUrl: null,
      apkUrl: '/api/downloads/edulearn-kids-v1.2.5.apk',
      packageId: 'com.tobiyastudio.edulearn',
      minRequirement: 'Android 8.0 or higher',
      contentRating: 'Everyone (Ages 5-11)',
      privacyPolicyUrl: 'https://tobiyastudio.com/privacy',
      tags: ['education', 'kids', 'learning', 'math', 'science', 'interactive'],
      features: [
        'Over 120 gamified mathematics and logic puzzle quests',
        'Parental control dashboard with daily screen-time limits',
        'Audio narration in clear friendly accents',
        'Zero third-party advertising or in-app purchases'
      ],
      createdAt: '2026-06-25T13:00:00Z',
      updatedAt: '2026-09-03T09:00:00Z'
    }
  ],
  productVersions: [
    {
      id: 'ver-fq-120',
      productId: 'prod-football-quiz',
      version: '1.2.0',
      releaseDate: 'September 2026',
      fileSize: '32 MB',
      minAndroid: 'Android 8.0+',
      isLatest: true,
      releaseNotes: 'Added new international tournament categories; Improved animation fluidity; Fixed intermittent sound bug on older hardware.',
      apkUrl: '/api/downloads/football-quiz-v1.2.0.apk',
      downloads: 4120
    },
    {
      id: 'ver-fq-110',
      productId: 'prod-football-quiz',
      version: '1.1.0',
      releaseDate: 'August 2026',
      fileSize: '31 MB',
      minAndroid: 'Android 8.0+',
      isLatest: false,
      releaseNotes: 'Introduced timed challenge mode and streak bonuses; Added 500 new player questions.',
      apkUrl: '/api/downloads/football-quiz-v1.1.0.apk',
      downloads: 2890
    },
    {
      id: 'ver-fq-100',
      productId: 'prod-football-quiz',
      version: '1.0.0',
      releaseDate: 'June 2026',
      fileSize: '29 MB',
      minAndroid: 'Android 8.0+',
      isLatest: false,
      releaseNotes: 'Initial production release of Football Quiz.',
      apkUrl: '/api/downloads/football-quiz-v1.0.0.apk',
      downloads: 1410
    },
    {
      id: 'ver-kpi-100',
      productId: 'prod-kpi-tracker',
      version: '1.0.0',
      releaseDate: 'August 2026',
      fileSize: '24 MB',
      minAndroid: 'Android 9.0+',
      isLatest: true,
      releaseNotes: 'First official launch of KPI Tracker for Android and Web.',
      apkUrl: '/api/downloads/kpi-tracker-v1.0.0.apk',
      downloads: 5120
    },
    {
      id: 'ver-fit-100',
      productId: 'prod-fitness',
      version: '1.0.0',
      releaseDate: 'July 2026',
      fileSize: '38 MB',
      minAndroid: 'Android 8.0+',
      isLatest: true,
      releaseNotes: 'Initial release with 300+ workout exercises and meal planner.',
      apkUrl: '/api/downloads/fitness-app-v1.0.0.apk',
      downloads: 4200
    },
    {
      id: 'ver-mp-110',
      productId: 'prod-media-player',
      version: '1.1.0',
      releaseDate: 'June 2026',
      fileSize: '18 MB',
      minAndroid: 'Android 7.0+',
      isLatest: true,
      releaseNotes: 'Added 10-band audio equalizer and subtitle track switcher.',
      apkUrl: '/api/downloads/media-player-v1.1.0.apk',
      downloads: 3150
    },
    {
      id: 'ver-sd-201',
      productId: 'prod-speed-dash',
      version: '2.0.1',
      releaseDate: 'August 2026',
      fileSize: '45 MB',
      minAndroid: 'Android 9.0+',
      isLatest: true,
      releaseNotes: 'Multiplayer connection stability fixes and 2 new canyon circuits.',
      apkUrl: '/api/downloads/speed-dash-v2.0.1.apk',
      downloads: 9300
    },
    {
      id: 'ver-edu-125',
      productId: 'prod-edulearn',
      version: '1.2.5',
      releaseDate: 'September 2026',
      fileSize: '42 MB',
      minAndroid: 'Android 8.0+',
      isLatest: true,
      releaseNotes: 'Added new Space Mathematics quest world.',
      apkUrl: '/api/downloads/edulearn-kids-v1.2.5.apk',
      downloads: 7800
    }
  ],
  reviews: [
    {
      id: 'rev-1',
      productId: 'prod-football-quiz',
      userName: 'Marcus Sterling',
      userAvatar: 'MS',
      rating: 5,
      date: 'September 3, 2026',
      verified: true,
      comment: 'Easily the cleanest football trivia app on Android. No annoying intrusive ads popping up mid-question, and the World Cup questions are genuinely challenging.'
    },
    {
      id: 'rev-2',
      productId: 'prod-football-quiz',
      userName: 'Elena Rostova',
      userAvatar: 'ER',
      rating: 5,
      date: 'August 29, 2026',
      verified: true,
      comment: 'Super snappy UI and the offline mode is fantastic when traveling. 10/10 recommend.'
    },
    {
      id: 'rev-3',
      productId: 'prod-football-quiz',
      userName: 'David K.',
      userAvatar: 'DK',
      rating: 4,
      date: 'August 20, 2026',
      verified: true,
      comment: 'Great game! Would love to see more obscure historical questions from the 70s and 80s Copa Libertadores.'
    },
    {
      id: 'rev-4',
      productId: 'prod-agribusiness',
      userName: 'Tadesse Bekele',
      userAvatar: 'TB',
      rating: 5,
      date: 'August 25, 2026',
      verified: true,
      comment: 'Game changer for tracking harvest cycles and comparing input prices across districts.'
    },
    {
      id: 'rev-5',
      productId: 'prod-kpi-tracker',
      userName: 'Sarah Jenkins',
      userAvatar: 'SJ',
      rating: 5,
      date: 'August 14, 2026',
      verified: true,
      comment: 'Replaced our team’s clunky spreadsheets in 10 minutes. Clean and focused.'
    },
    {
      id: 'rev-6',
      productId: 'prod-agrivoice',
      userName: 'Abebe Molla',
      userAvatar: 'AM',
      rating: 5,
      date: 'September 5, 2026',
      verified: true,
      comment: 'The Amharic speech recognition is remarkably accurate even with tractor background noise. Extremely helpful advisory.'
    }
  ],
  downloadsTimeline: [
    { label: 'Jan', downloads: 1200 },
    { label: 'Feb', downloads: 2100 },
    { label: 'Mar', downloads: 3400 },
    { label: 'Apr', downloads: 4900 },
    { label: 'May', downloads: 7200 },
    { label: 'Jun', downloads: 10400 },
    { label: 'Jul', downloads: 13800 },
    { label: 'Aug', downloads: 16900 },
    { label: 'Sep', downloads: 18420 }
  ],
  users: [
    {
      id: 'usr-demo-01',
      name: 'Demo User',
      email: 'user@tobiyastudio.com',
      password: 'user123',
      avatar: 'DU',
      createdAt: '2026-09-01T10:00:00.000Z'
    }
  ]
};

// Database read and write helpers
export function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDb(initialData);
      return initialData;
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(data);
    if (!parsed.users || !Array.isArray(parsed.users)) {
      parsed.users = [
        {
          id: 'usr-demo-01',
          name: 'Demo User',
          email: 'user@tobiyastudio.com',
          password: 'user123',
          avatar: 'DU',
          createdAt: '2026-09-01T10:00:00.000Z'
        }
      ];
      writeDb(parsed);
    }
    return parsed;
  } catch (err) {
    console.error('Error reading db.json:', err);
    return initialData;
  }
}

export function writeDb(data) {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (err) {
    console.error('Error writing to db.json:', err);
    return false;
  }
}

export function getDb() {
  return readDb();
}
