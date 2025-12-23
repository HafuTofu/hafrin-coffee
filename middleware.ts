import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const pathname = url.pathname;

    // Only act on root path
    if (pathname === '/') {
      const params = url.searchParams;
      const orderId = params.get('order_id') || params.get('orderId') || params.get('id');
      const txStatus = params.get('transaction_status') || params.get('transactionStatus') || params.get('status');

      if (orderId && txStatus) {
        // If a transaction status is present, decide server-side redirect for better UX (avoids relying on client JS)
        const successStatuses = ['capture', 'settlement'];
        const txNormalized = String(txStatus || '').toLowerCase().trim();
        if (successStatuses.includes(txNormalized)) {
          const dest = new URL(`/Successpay${url.search}`, url.origin);
          console.log('Middleware: redirecting to Successpay', { orderId, txStatus: txNormalized });
          return NextResponse.redirect(dest);
        } else {
          const dest = new URL(`/Errorpay${url.search}`, url.origin);
          console.log('Middleware: redirecting to Errorpay', { orderId, txStatus: txNormalized });
          return NextResponse.redirect(dest);
        }
      }
    }
  } catch (e) {
    // Don't break requests on unexpected errors in middleware
    console.warn('Middleware error', e);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/']
}