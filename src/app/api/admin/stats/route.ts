import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/order";
import { Menu } from "@/models/menu";
import { User } from "@/models/user";

// GET: Fetch dashboard statistics
export async function GET() {
  try {
    await connectDB();

    // Get total revenue (sum of all paid orders)
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Get active orders count (pending or preparing)
    const activeOrdersCount = await Order.countDocuments({
      deliveryStatus: { $in: ["pending", "preparing", "delivering"] }
    });

    // Get total products count
    const totalProducts = await Menu.countDocuments({});

    // Get total customers count
    const totalCustomers = await User.countDocuments({});

    // Get monthly orders data for the chart
    const currentYear = new Date().getFullYear();
    const monthlyOrders = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lt: new Date(`${currentYear + 1}-01-01`)
          }
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyOrdersData = months.map((name, index) => {
      const found = monthlyOrders.find((m: any) => m._id === index + 1);
      return { name, total: found?.total || 0 };
    });

    // Calculate revenue trend (compare with previous month)
    const now = new Date();
    const thisMonth = now.getMonth();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const thisYear = now.getFullYear();
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    const thisMonthRevenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: {
            $gte: new Date(thisYear, thisMonth, 1),
            $lt: new Date(thisYear, thisMonth + 1, 1)
          }
        }
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    const lastMonthRevenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: {
            $gte: new Date(lastMonthYear, lastMonth, 1),
            $lt: new Date(lastMonthYear, lastMonth + 1, 1)
          }
        }
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    const thisMonthTotal = thisMonthRevenue[0]?.total || 0;
    const lastMonthTotal = lastMonthRevenue[0]?.total || 1; // Avoid division by zero
    const revenueTrend = ((thisMonthTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(1);

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue,
        activeOrders: activeOrdersCount,
        totalProducts,
        totalCustomers,
        revenueTrend: `${Number(revenueTrend) >= 0 ? '+' : ''}${revenueTrend}%`,
        monthlyOrdersData
      }
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
