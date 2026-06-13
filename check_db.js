import connectDB from './src/lib/db.js';
import { Store } from './src/lib/models.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const channelsStore = await Store.findOne({ key: 'channels' });
  const raw = channelsStore?.data || {};
  let flat = Object.entries(raw).flatMap(([countryName, channels]) => {
    return channels.map(ch => ({ ...ch, country: countryName }));
  });
  const fighters = flat.filter(c => c.name === 'FIGHTER TV');
  console.log(JSON.stringify(fighters, null, 2));
  process.exit(0);
}
check();
