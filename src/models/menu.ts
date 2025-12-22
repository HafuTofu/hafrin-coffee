import mongoose, { Document, Model } from "mongoose";

export interface IMenu {
  name: string;
  price: number;
  description?: string;
  pic?: string;
}

export interface MenuDocument extends IMenu, Document {
  _id: mongoose.Types.ObjectId;
}

export interface MenuModel extends Model<MenuDocument> {}

const MenuSchema = new mongoose.Schema<MenuDocument, MenuModel>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    pic: { type: String },
  },
  { collection: "menus" }
);

export const Menu = (mongoose.models.Menu || mongoose.model<MenuDocument, MenuModel>("Menu", MenuSchema)) as MenuModel;