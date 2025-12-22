import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  username: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  picture: { type: String, default: "" },
  provider: { type: String, default: "" },
  providerId: { type: String, default: "" },
  oauth: { type: Boolean, default: false },
  gender: { type: String, enum: ["male", "female", "other"], default: "other" },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model("User", userSchema);