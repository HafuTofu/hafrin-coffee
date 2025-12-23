import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from '@/lib/mongodb'
import { Order } from '@/models/order'

/**
 * POST /api/midtrans/auth
 * Body: { orderId: string, gross_amount: number, items?: Array, customer?: Object }
 * Creates a Midtrans Snap transaction and returns the Snap token / transaction result.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json() as any;
    const { orderId, gross_amount, items, customer } = body || {};

    if (!orderId || typeof gross_amount !== 'number') {
      return NextResponse.json({ success: false, error: 'orderId and gross_amount are required' }, { status: 400 });
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const baseUrl = process.env.MIDTRANS_BASE_URL || 'https://app.sandbox.midtrans.com';
    
    // Get the app URL for redirects (localhost for dev, production URL for prod)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';

    if (!serverKey) {
      return NextResponse.json({ success: false, error: 'MIDTRANS_SERVER_KEY not configured' }, { status: 500 });
    }

    // Build payload for Snap API with callbacks
    const payload: any = {
      transaction_details: {
        order_id: String(orderId),
        gross_amount: gross_amount
      },
      item_details: items || [],
      customer_details: customer || {},
      callbacks: {
        finish: `${appUrl}/Successpay?order_id=${orderId}`,
        error: `${appUrl}/Errorpay?order_id=${orderId}`,
        pending: `${appUrl}/Successpay?order_id=${orderId}&status=pending`
      }
    };

    const auth = Buffer.from(`${serverKey}:`).toString('base64');

    const res = await fetch(`${baseUrl}/snap/v1/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify(payload)
    });

  const data: any = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error('Midtrans Snap create failed', res.status, data);
      return NextResponse.json({ success: false, error: 'Midtrans Snap create failed', details: data }, { status: 502 });
    }

    // Optionally persist midtrans response to Order (token/redirect_url)
    try {
      await connectDB();
  await Order.findByIdAndUpdate(orderId, { $set: { 'midtrans': { snapToken: data.token, redirectUrl: data.redirect_url, raw: data } } });
    } catch (err) {
      console.warn('Failed to persist midtrans info to order', err);
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('POST /api/midtrans/auth error', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
