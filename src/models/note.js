import mongoose from "mongoose";
import { Note } from "../models/note.js"; 

export async function connectMongoDB() {
  const { MONGO_URL } = process.env;
  if (!MONGO_URL) throw new Error("MONGO_URL is not set");

  mongoose.set("strictQuery", true);
  mongoose.set("autoIndex", true); 

  await mongoose.connect(MONGO_URL);


  await Note.syncIndexes();

  console.log("✅ MongoDB connection established successfully");
}

