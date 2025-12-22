import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  idProduct: { type: mongoose.Schema.Types.ObjectId, ref: "Menu", required: true },
  quantity: { type: Number, required: true },
  sugar: { type: String },
  ice: { type: String },
  additions: [{ type: String }]
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  idUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: { type: [OrderItemSchema], required: true },
  totalAmount: { type: Number, required: true },
  deliveryInfo: {
    name: { type: String },
    phone: { type: String },
    address: { type: String },
    time: { type: String }
  },
  paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  deliveryStatus: { type: String, enum: ["pending", "preparing", "delivering", "delivered", "canceled"], default: "pending" },
  statusHistory: [{
    status: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: "orders", timestamps: true });

export const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);