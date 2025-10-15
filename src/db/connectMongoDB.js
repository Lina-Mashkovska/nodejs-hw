// src/db/connectMongoDB.js
import mongoose from "mongoose";

export async function connectMongoDB() {
  const uri = process.env.MONGO_URL;
  if (!uri) {
    console.error("MONGO_URL is not defined");
    process.exit(1); 
  }

  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connection established successfully"); 
  } catch (err) {
    console.error("MongoDB connection failed:", err?.message || err);
    process.exit(1); 
  }
}

