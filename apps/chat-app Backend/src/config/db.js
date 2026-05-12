import mongoose from "mongoose";
import dotenv from "dotenv";

export const connectDB = async () => {
  try {
    dotenv.config();

    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};
