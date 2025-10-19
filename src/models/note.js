import { Schema, model } from "mongoose";
import { TAGS } from "../constants/tags.js";

const noteSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, default: "" },
    tag: { type: String, enum: TAGS, required: true },
  },
  { timestamps: true }
);


noteSchema.index({ title: "text", content: "text" });

export const Note = model("Note", noteSchema);



