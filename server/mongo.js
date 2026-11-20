import mongoose from 'mongoose';
import { readDb, writeDb } from './db.js';

const MONGODB_URI = process.env.MONGODB_URL || 'mongodb+srv://dagimbekele_db_user:J3frKUQIkaTH65El@cluster0.rgez5oi.mongodb.net/tobiyastudio?retryWrites=true&w=majority&appName=Cluster0';

// Define schema for single-collection full platform sync
const PlatformDataSchema = new mongoose.Schema({
  key: { type: String, default: 'main_store', unique: true },
  data: { type: Object, required: true },
  updatedAt: { type: Date, default: Date.now }
}, { strict: false });

export const PlatformData = mongoose.models.PlatformData || mongoose.model('PlatformData', PlatformDataSchema);

let isConnected = false;

export async function connectMongo() {
  if (isConnected && mongoose.connection.readyState === 1) return true;
  try {
    console.log('[MongoDB] Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000
    });
    isConnected = true;
    console.log('[MongoDB] Successfully connected to MongoDB Atlas!');

    // Check if MongoDB has existing data
    const existing = await PlatformData.findOne({ key: 'main_store' });
    if (!existing) {
      console.log('[MongoDB] Initializing MongoDB with current database seed...');
      const localData = readDb();
      await PlatformData.create({ key: 'main_store', data: localData });
      console.log('[MongoDB] Initial seed stored in MongoDB.');
    } else if (existing.data && existing.data.products && existing.data.products.length > 0) {
      console.log(`[MongoDB] Synced ${existing.data.products.length} products from MongoDB Atlas.`);
      // Sync from MongoDB to local db / memory cache
      writeDb(existing.data);
    }
    return true;
  } catch (err) {
    console.error('[MongoDB] Connection warning (running in hybrid local-cache mode):', err.message);
    isConnected = false;
    return false;
  }
}

export async function saveToMongo(dbData) {
  try {
    if (!isConnected || mongoose.connection.readyState !== 1) {
      await connectMongo();
    }
    await PlatformData.findOneAndUpdate(
      { key: 'main_store' },
      { data: dbData, updatedAt: new Date() },
      { upsert: true }
    );
  } catch (err) {
    console.error('[MongoDB] Failed to persist update:', err.message);
  }
}

export function isMongoConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}
