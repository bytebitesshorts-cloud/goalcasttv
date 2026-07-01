import mongoose from 'mongoose';

const ChannelSchema = new mongoose.Schema({
  // Custom string ID (e.g. "ch_1719849600000") — NOT the Mongo _id
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  code: { type: String, default: '' },
  category: { type: String, default: 'Sports', index: true },
  country: { type: String, required: true, index: true },
  countryCode: { type: String, default: '' },
  logo: { type: String, default: '' },
  stream: { type: String, default: '' },
  embedCode: { type: String, default: '' },
  languages: { type: [String], default: [] },
  active: { type: Boolean, default: true, index: true },
  is_nsfw: { type: Boolean, default: false },
  quality: { type: String, default: '' },
  // Validation tracking
  lastValidated: { type: Date, default: null },
  lastValidatedStatus: { type: String, enum: ['ok', 'broken', null], default: null },
}, {
  timestamps: true, // adds createdAt, updatedAt
});

// Compound indexes for common queries
ChannelSchema.index({ active: 1, category: 1 });
ChannelSchema.index({ active: 1, country: 1 });
ChannelSchema.index({ name: 1 });

export const Channel = mongoose.models.Channel || mongoose.model('Channel', ChannelSchema);
