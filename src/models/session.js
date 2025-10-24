import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const sessionSchema = new Schema(
  {
    
    userId: { type: Types.ObjectId, required: true, ref: "User" },

    accessToken: { type: String, required: true, index: true },
    refreshToken: { type: String, required: true, index: true },
    accessTokenValidUntil: { type: Date, required: true, index: true },
    refreshTokenValidUntil: { type: Date, required: true, index: true },
  },
  { timestamps: true },
);

export const Session = model("Session", sessionSchema);

