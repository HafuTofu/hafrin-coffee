"use client"

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/landing/navbar'
import { toast } from 'sonner'

export default function CheckoutFinishPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const paramsObj: Record<string, string> = {};
    for (const [k, v] of searchParams.entries()) paramsObj[k] = v;

    const orderId = paramsObj.order_id || paramsObj.orderId || paramsObj.id || '';
    const transaction_status = paramsObj.transaction_status || paramsObj.transactionStatus || paramsObj.status || '';

    async function doPost() {
      try {
        setProcessing(true);
        // Post the query params to our callback handler as the server would do
        const res = await fetch('/api/midtrans/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(paramsObj)
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          throw new Error(`Callback failed: ${res.status} ${String(txt).slice(0,200)}`);
        }

        // Decide redirect target based on transaction_status
        const successStatuses = ['capture', 'settlement'];
        if (transaction_status && successStatuses.includes(transaction_status)) {
          router.replace(`/Successpay?order_id=${encodeURIComponent(orderId)}`);
          return;
        }

        router.replace(`/Errorpay?order_id=${encodeURIComponent(orderId)}&status=${encodeURIComponent(transaction_status)}`);
      } catch (e: any) {
        console.error('Client callback/post failed', e);
        setError(String(e?.message || e));
        toast.error('Payment processing error. Redirecting to error page.');
        // fallback redirect so user sees the error page
        const orderId = searchParams.get('order_id') || searchParams.get('orderId') || '';
        router.replace(`/Errorpay?order_id=${encodeURIComponent(orderId)}&status=client_callback_error`);
      } finally {
        setProcessing(false);
      }
    }

    // if there are expected params, run the flow; otherwise do nothing
    if (Object.keys(paramsObj).length > 0) {
      doPost();
    } else {
      setProcessing(false);
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-muted/40">
      <Navbar bgClass="bg-background" />
      <main className="mx-auto max-w-xl p-6">
        <h1 className="text-2xl font-semibold mb-4">Processing payment...</h1>
        {processing ? (
          <p className="text-sm text-muted-foreground">Please wait while we confirm your payment and prepare the delivery form.</p>
        ) : error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : (
          <p className="text-sm text-muted-foreground">Done — redirecting...</p>
        )}
      </main>
    </div>
  )
}