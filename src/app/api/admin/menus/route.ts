import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Menu } from "@/models/menu";
import mongoose from "mongoose";

// GET: Fetch all menus for admin dashboard
export async function GET() {
  try {
    await connectDB();
    const menus = await Menu.find({}).lean();
    
    const transformedMenus = menus.map((menu: any) => ({
      id: menu._id.toString(),
      name: menu.name,
      category: menu.category || "Coffee",
      price: menu.price,
      status: menu.status || "Active",
      sales: menu.sales || 0,
      description: menu.description || "",
      image: menu.pic || ""
    }));

    return NextResponse.json({ success: true, products: transformedMenus });
  } catch (error) {
    console.error("Failed to fetch menus:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch menus" },
      { status: 500 }
    );
  }
}

// POST: Create a new menu item
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, category, price, status, description, image } = body;

    if (!name || !price) {
      return NextResponse.json(
        { success: false, error: "Name and price are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const newMenu = await Menu.create({
      name,
      category: category || "Coffee",
      price,
      status: status || "Active",
      description: description || "",
      pic: image || "",
      sales: 0
    });

    const transformed = {
      id: newMenu._id.toString(),
      name: newMenu.name,
      category: newMenu.category || "Coffee",
      price: newMenu.price,
      status: newMenu.status || "Active",
      sales: newMenu.sales || 0,
      description: newMenu.description || "",
      image: newMenu.pic || ""
    };

    return NextResponse.json({ success: true, product: transformed }, { status: 201 });
  } catch (error) {
    console.error("Failed to create menu:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create menu" },
      { status: 500 }
    );
  }
}

// PUT: Update an existing menu item
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, category, price, status, description, image } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Menu ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (price !== undefined) updateData.price = price;
    if (status !== undefined) updateData.status = status;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.pic = image;

    const updatedMenu = await Menu.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).lean();

    if (!updatedMenu) {
      return NextResponse.json(
        { success: false, error: "Menu not found" },
        { status: 404 }
      );
    }

    const transformed = {
      id: (updatedMenu as any)._id.toString(),
      name: (updatedMenu as any).name,
      category: (updatedMenu as any).category || "Coffee",
      price: (updatedMenu as any).price,
      status: (updatedMenu as any).status || "Active",
      sales: (updatedMenu as any).sales || 0,
      description: (updatedMenu as any).description || "",
      image: (updatedMenu as any).pic || ""
    };

    return NextResponse.json({ success: true, product: transformed });
  } catch (error) {
    console.error("Failed to update menu:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update menu" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a menu item
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Menu ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const deletedMenu = await Menu.findByIdAndDelete(id);

    if (!deletedMenu) {
      return NextResponse.json(
        { success: false, error: "Menu not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Menu deleted successfully" });
  } catch (error) {
    console.error("Failed to delete menu:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete menu" },
      { status: 500 }
    );
  }
}
