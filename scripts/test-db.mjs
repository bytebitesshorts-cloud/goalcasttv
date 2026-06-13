import mongoose from 'mongoose';
console.log("URI:", process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => { console.log('Connected!'); process.exit(0); })
  .catch(err => { console.error('Error:', err); process.exit(1); });
