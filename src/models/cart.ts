import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema({
  idProduct: { type: mongoose.Schema.Types.ObjectId, ref: "Menu", required: true },
  quantity: { type: Number, required: true },
  sugar: { type: String, default: "normal" },
  ice: { type: String, default: "normal" },
  additions: { type: [String], default: [] },
  pic: { type: String }
}, { _id: false });

const CartSchema = new mongoose.Schema(
  {
    idUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [CartItemSchema],
    createdAt: { type: Date, default: Date.now },
  },
  { 
    collection: "carts",
    timestamps: true 
  }
);

export const Cart = mongoose.models.Cart || mongoose.model("Cart", CartSchema);