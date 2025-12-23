import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/order";

// GET: Fetch all orders for admin dashboard
export async function GET() {
  try {
    await connectDB();

    const orders = await Order.find({})
      .populate("idUser", "name email")
      .populate("items.idProduct", "name price")
      .sort({ createdAt: -1 })
      .lean();

    const transformedOrders = orders.map((order: any) => ({
      id: order._id.toString(),
      customer: order.idUser?.name || order.deliveryInfo?.name || "Unknown Customer",
      email: order.idUser?.email || "",
      total: order.totalAmount,
      status: mapDeliveryStatus(order.deliveryStatus),
      paymentStatus: order.paymentStatus,
      deliveryStatus: order.deliveryStatus,
      date: formatDate(order.createdAt),
      items: order.items?.map((item: any) => ({
        name: item.idProduct?.name || "Unknown Product",
        quantity: item.quantity,
        price: item.idProduct?.price || 0,
        sugar: item.sugar,
        ice: item.ice,
        additions: item.additions
      })) || [],
      deliveryInfo: order.deliveryInfo
    }));

    return NextResponse.json({ success: true, orders: transformedOrders });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// PUT: Update order status
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json() as { orderId?: string; status?: string };
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: "Order ID and status are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Map frontend status to database deliveryStatus
    const deliveryStatusMap: Record<string, string> = {
      "Pending": "pending",
      "Processing": "preparing",
      "Completed": "delivered",
      "Cancelled": "canceled"
    };

    const deliveryStatus = deliveryStatusMap[status] || status.toLowerCase();

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        deliveryStatus,
        $push: {
          statusHistory: {
            status: deliveryStatus,
            timestamp: new Date()
          }
        },
        updatedAt: new Date()
      },
      { new: true }
    )
      .populate("idUser", "name email")
      .lean();

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const transformed = {
      id: (updatedOrder as any)._id.toString(),
      customer: (updatedOrder as any).idUser?.name || (updatedOrder as any).deliveryInfo?.name || "Unknown Customer",
      total: (updatedOrder as any).totalAmount,
      status: mapDeliveryStatus((updatedOrder as any).deliveryStatus),
      paymentStatus: (updatedOrder as any).paymentStatus,
      deliveryStatus: (updatedOrder as any).deliveryStatus,
      date: formatDate((updatedOrder as any).createdAt)
    };

    return NextResponse.json({ success: true, order: transformed });
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// Helper function to map delivery status to frontend status
function mapDeliveryStatus(deliveryStatus: string): string {
  const statusMap: Record<string, string> = {
    "pending": "Pending",
    "preparing": "Processing",
    "delivering": "Processing",
    "delivered": "Completed",
    "canceled": "Cancelled"
  };
  return statusMap[deliveryStatus] || "Pending";
}

// Helper function to format date
function formatDate(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffTime = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[d.getDay()];
  }
  
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}
