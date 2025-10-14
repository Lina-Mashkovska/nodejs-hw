import mongoose from "mongoose";

export async function connectMongoDB() {
  const { MONGO_URL } = process.env;
  if (!MONGO_URL) throw new Error("MONGO_URL is not set");

  mongoose.set("strictQuery", true);
  await mongoose.connect(MONGO_URL);


  console.log("✅ MongoDB connection established successfully");
}
