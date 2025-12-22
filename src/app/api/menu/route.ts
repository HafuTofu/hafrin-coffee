import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Menu, type IMenu } from "@/models/menu";
import mongoose from "mongoose";

interface LeanMenuDocument extends Omit<IMenu, '_id'> {
  _id: mongoose.Types.ObjectId | string;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const menus = await Menu.find({}).lean() as unknown as LeanMenuDocument[];
    
    // Transform the data to match our frontend format
    const transformedMenus = menus.map(menu => ({
      id: menu._id.toString(),
      title: menu.name,
      description: menu.description || "",
      price: menu.price,
      imageQuery: menu.pic || menu.name.toLowerCase().replace(" ", "-"),
    }));

    return NextResponse.json({ success: true, menus: transformedMenus });
  } catch (error) {
    console.error("Failed to fetch menus:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch menus" },
      { status: 500 }
    );
  }
}