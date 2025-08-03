import mongoose from 'mongoose';

const connectDB = async () => {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI not set');
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
};

export default connectDB;
