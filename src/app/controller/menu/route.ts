import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Menu } from "@/models/menu";

export async function GET() {
  try {
    console.log("GET /controller/menu - Connecting to database");
    const connected = await connectDB();
    if (!connected) {
      console.error("GET /controller/menu - Database connection failed");
      return NextResponse.json({ 
        success: false, 
        error: "Database connection failed" 
      }, { status: 503 });
    }
    
    console.log("GET /controller/menu - Querying menus");
    const menus = await Menu.find({}, { name: 1, price: 1, description: 1, pic: 1 }).lean();
    
    console.log("GET /controller/menu - Found", menus.length, "menus");
    const transformedMenus = menus.map((menu: any) => ({
      id: String(menu._id),
      title: menu.name,
      description: menu.description || "",
      price: menu.price,
      imageQuery: menu.pic || menu.name.toLowerCase().replace(/\s+/g, "-"),
    }));
    
    const response = NextResponse.json({ success: true, menus: transformedMenus });
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');
    response.headers.set('Content-Type', 'application/json');
    return response;
  } catch (error) {
    console.error("GET /controller/menu error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch menus",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}