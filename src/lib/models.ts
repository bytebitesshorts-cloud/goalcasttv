import mongoose from 'mongoose';

const StoreSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
});

export const Store = mongoose.models.Store || mongoose.model('Store', StoreSchema);
