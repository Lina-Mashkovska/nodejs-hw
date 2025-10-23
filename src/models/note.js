// src/models/note.js
import mongoose from "mongoose";
import { TAGS } from "../constants/tags.js";

const { Schema, model, Types } = mongoose;

const noteSchema = new Schema(
  {
    title:   { type: String, required: true, trim: true },
    content: { type: String, default: "", trim: true },
    tag:     { type: String, enum: TAGS, default: "Todo" },

  
    userId:  { type: Types.ObjectId, ref: "user", required: true },
  },
  { timestamps: true }
);

noteSchema.index({ title: "text", content: "text" });

export const Note = model("note", noteSchema);





