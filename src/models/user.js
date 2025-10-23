import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    username: { type: String, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, minlength: 8 },
  },
  { timestamps: true }
);


userSchema.method("toJSON", function () {
  const obj = this.toObject({ versionKey: false });
  delete obj.password;
  return obj;
});


userSchema.pre("save", function (next) {
  if (this.isNew && !this.username) this.username = this.email;
  next();
});

export const User = model("user", userSchema);
