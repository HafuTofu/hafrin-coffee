import { NextResponse } from "next/server";
import { connectDB } from '@/lib/mongodb'
import { Order } from '@/models/order'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get('orderId');

    if (!orderId) return NextResponse.json({ success: false, error: 'Missing orderId' }, { status: 400 });

    await connectDB();

    const order = await Order.findById(orderId);
    if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });

    // If already marked paid in DB, return immediately
    if (order.paymentStatus === 'paid') {
      return NextResponse.json({ success: true, verified: true, paymentStatus: 'paid', order: order.toObject() });
    }

    // Try to verify with Midtrans as a fallback (server-side)
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const baseUrl = process.env.MIDTRANS_BASE_URL || 'https://api.midtrans.com';

    if (!serverKey) {
      console.info('Midtrans verify: server key not configured, returning unverified');
      return NextResponse.json({ success: true, verified: false, paymentStatus: order.paymentStatus || 'pending', reason: 'no_server_key', order: order.toObject() });
    }

    const auth = Buffer.from(`${serverKey}:`).toString('base64');
    const statusUrl = `${baseUrl.replace(/\/$/, '')}/v2/${orderId}/status`;

    try {
      const res = await fetch(statusUrl, { headers: { 'Authorization': `Basic ${auth}`, 'Accept': 'application/json' } });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.warn('Midtrans verify: status endpoint returned non-OK', res.status, data);
        return NextResponse.json({ success: false, error: 'Midtrans status fetch failed', details: data }, { status: 502 });
      }

      const statusMap: Record<string, string> = {
        'capture': 'paid',
        'settlement': 'paid',
        'pending': 'pending',
        'deny': 'failed',
        'expire': 'failed',
        'cancel': 'canceled'
      };

      const transaction_status = (data.transaction_status || data.transactionStatus || '').toString();
      const paymentStatus = statusMap[transaction_status] || transaction_status || (order.paymentStatus || 'pending');

      // Update DB if status changed
      if (paymentStatus !== order.paymentStatus) {
        order.paymentStatus = paymentStatus;
        order.statusHistory = order.statusHistory || [];
        order.statusHistory.push({ status: `midtrans:verified:${transaction_status}`, timestamp: new Date() });
        await order.save();
      }

      return NextResponse.json({ success: true, verified: paymentStatus === 'paid', paymentStatus, transaction_status, midtrans: data });
    } catch (err) {
      console.error('Midtrans verify: error fetching status', err);
      return NextResponse.json({ success: false, error: 'Midtrans status fetch error', details: String(err) }, { status: 500 });
    }
  } catch (err) {
    console.error('GET /api/midtrans/verify error', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
