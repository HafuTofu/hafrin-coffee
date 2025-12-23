import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/order";
import { Cart } from "@/models/cart";

// PUT: Update payment status from Midtrans redirect
export async function PUT(req: Request) {
  try {
    const body = await req.json() as any;
    const { orderId, paymentStatus, transactionStatus } = body || {};

    if (!orderId || !paymentStatus) {
      return NextResponse.json(
        { success: false, error: "orderId and paymentStatus are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Only update if not already paid (to prevent overwriting)
    if (order.paymentStatus !== 'paid') {
      order.paymentStatus = paymentStatus;
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({
        status: `redirect:${transactionStatus || paymentStatus}`,
        timestamp: new Date()
      });
      order.updatedAt = new Date();
      
      // If payment is successful, update delivery status to preparing
      if (paymentStatus === 'paid') {
        order.deliveryStatus = 'preparing';
        order.statusHistory.push({
          status: 'preparing',
          timestamp: new Date()
        });

        // Clear cart items for this user
        try {
          await Cart.deleteMany({ idUser: order.idUser });
          console.log('✅ Cart cleared for user:', order.idUser);
        } catch (cartErr) {
          console.warn('Failed to clear cart:', cartErr);
        }
      }

      await order.save();
      console.log('✅ Payment status updated:', { orderId, paymentStatus, transactionStatus });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order._id.toString(),
        paymentStatus: order.paymentStatus,
        deliveryStatus: order.deliveryStatus
      }
    });
  } catch (error) {
    console.error("Failed to update payment status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update payment status" },
      { status: 500 }
    );
  }
}
