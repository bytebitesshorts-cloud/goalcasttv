import mongoose from 'mongoose';

const StoreSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  // New field for admin-configurable slider items
  // Each slide contains an image URL, a target link, and an optional title
  slider: {
    type: [
      new mongoose.Schema({
        image: { type: String, required: true },
        link: { type: String, required: true },
        title: { type: String },
      })
    ],
    default: [],
  },
});

export const Store = mongoose.models.Store || mongoose.model('Store', StoreSchema);
