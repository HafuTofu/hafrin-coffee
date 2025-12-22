import { NextResponse } from "next/server";
import { connectDB } from '@/lib/mongodb'
import { Order } from '@/models/order'
import crypto from 'crypto'

// Midtrans notification handler
export async function POST(req: Request) {
  try {
    const body = await req.json() as any;

    // Log incoming payload (debug only) when DEBUG_MIDTRANS_CALLBACK is set
    if (process.env.DEBUG_MIDTRANS_CALLBACK === 'true') {
      try { console.info('Midtrans callback payload:', JSON.stringify(body).slice(0, 2000)); } catch(e){}
    }

    // Midtrans typically sends these fields: order_id, status_code, gross_amount, transaction_status, signature_key
    const { order_id, status_code, gross_amount, transaction_status, signature_key } = body || {};

    if (!order_id || !status_code || typeof gross_amount === 'undefined' || !transaction_status) {
      console.warn('Midtrans callback received invalid payload', { body });
      return NextResponse.json({ success: false, error: 'Invalid notification payload' }, { status: 400 });
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      console.error('MIDTRANS_SERVER_KEY not set - cannot verify signature');
      return NextResponse.json({ success: false, error: 'Server not configured' }, { status: 500 });
    }

    // Verify signature: sha512(order_id + status_code + gross_amount + serverKey)
    let computed: string;
    try {
      computed = crypto.createHash('sha512').update(String(order_id) + String(status_code) + String(gross_amount) + serverKey).digest('hex');
    } catch (e) {
      console.error('Failed to compute signature', e);
      return NextResponse.json({ success: false, error: 'Signature computation failed' }, { status: 500 });
    }

    if (signature_key && signature_key !== computed) {
      console.error('Invalid Midtrans signature', { provided: signature_key, computed });
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 403 });
    }

    // Map transaction_status to our Order.paymentStatus and deliveryStatus actions
    const statusMap: Record<string, string> = {
      'capture': 'paid',
      'settlement': 'paid',
      'pending': 'pending',
      'deny': 'failed',
      'expire': 'failed',
      'cancel': 'canceled'
    };

    const paymentStatus = statusMap[transaction_status] || transaction_status;

    // Update order in DB and perform cart cleanup only when payment succeeded
    try {
      await connectDB();
      const order = await Order.findById(order_id);
      if (!order) {
        console.warn('Midtrans callback: order not found', order_id);
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
      }

      // Update payment status and push history
      order.paymentStatus = paymentStatus;
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({ status: `midtrans:${transaction_status}`, timestamp: new Date() });

      // If payment succeeded, mark delivery as preparing and remove items from user's cart
      if (paymentStatus === 'paid') {
        // mark delivery as preparing (next step)
        order.deliveryStatus = order.deliveryStatus || 'preparing';

        try {
          // Remove the ordered items from the user's cart
          const CartModel = (await import('@/models/cart')).Cart;
          const cartDoc: any = await CartModel.findOne({ idUser: order.idUser });
          if (cartDoc) {
            for (const ordItem of order.items) {
              const idProductToRemove = String(ordItem.idProduct);
              const { sugar, ice, additions } = ordItem as any;

              if (additions && additions.length > 0) {
                cartDoc.items = cartDoc.items.filter((it: any) => {
                  const basicMatch = String(it.idProduct) === idProductToRemove &&
                    it.sugar === sugar &&
                    it.ice === ice;

                  if (!basicMatch) return true; // keep

                  const itemAdditions = it.additions || [];
                  const deleteAdditions = additions || [];

                  if (itemAdditions.length !== deleteAdditions.length) return true;

                  const sortedItemAdditions = [...itemAdditions].sort();
                  const sortedDeleteAdditions = [...deleteAdditions].sort();

                  // If they match exactly, filter this item out (i.e. return false)
                  return !sortedItemAdditions.every((addition, index) => addition === sortedDeleteAdditions[index]);
                });
              } else {
                // Remove all items with matching product id
                cartDoc.items = cartDoc.items.filter((it: any) => String(it.idProduct) !== idProductToRemove);
              }
            }

            await cartDoc.save();
            console.log('🧹 Removed ordered items from cart for user', String(order.idUser));
          }
        } catch (cleanupErr) {
          console.warn('Failed to cleanup cart after payment', cleanupErr);
          // don't fail the notification, but log
        }
      }

      // If canceled mark deliveryStatus as canceled (keep cart intact)
      if (paymentStatus === 'canceled') {
        order.deliveryStatus = 'canceled';
      }

      await order.save();

      console.log('Midtrans notification processed for order', order_id, 'status', transaction_status);
      return NextResponse.json({ success: true });
    } catch (dbErr) {
      console.error('Failed to update order from Midtrans notification', dbErr);
      return NextResponse.json({ success: false, error: 'DB update failed' }, { status: 500 });
    }
  } catch (err) {
    console.error('POST /api/midtrans/callback error', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
