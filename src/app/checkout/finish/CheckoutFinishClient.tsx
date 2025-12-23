"use client"

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/landing/navbar'
import { toast } from 'sonner'

type Props = {
  loadingOnly?: boolean
}

export default function CheckoutFinishClient({ loadingOnly = false }: Props) {
  // Lightweight fallback render to satisfy Suspense without running hooks
  if (loadingOnly) {
    return (
      <>
        <Navbar bgClass="bg-background" />
        <main className="mx-auto max-w-xl p-6">
          <p className="text-sm text-muted-foreground">Loading checkout status...</p>
        </main>
      </>
    )
  }

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
      const successStatuses = ['capture', 'settlement'];
      try {
        setProcessing(true);        // Post the query params to our callback handler as the server would do
        const res = await fetch('/api/midtrans/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(paramsObj)
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          console.warn('Callback endpoint returned non-OK', res.status, txt);
          // If the callback failed but transaction status indicates success, proceed to Successpay
          if (transaction_status && successStatuses.includes(transaction_status)) {
            toast.success('Payment confirmed (client-side). Redirecting to success page.');
            router.replace(`/Successpay?order_id=${encodeURIComponent(orderId)}`);
            return;
          }
          throw new Error(`Callback failed: ${res.status} ${String(txt).slice(0, 200)}`);
        }

        // Decide redirect target based on transaction_status
        if (transaction_status && successStatuses.includes(transaction_status)) {
          router.replace(`/Successpay?order_id=${encodeURIComponent(orderId)}`);
          return;
        }

        router.replace(`/Errorpay?order_id=${encodeURIComponent(orderId)}&status=${encodeURIComponent(transaction_status)}`);
      } catch (e: any) {
        console.error('Client callback/post failed', e);
        setError(String(e?.message || e));
        // If transaction status indicates success, proceed to success page even if callback failed
        if (transaction_status && successStatuses.includes(transaction_status)) {
          toast.success('Payment confirmed (client-side). Redirecting to success page.');
          router.replace(`/Successpay?order_id=${encodeURIComponent(orderId)}`);
        } else {
          toast.error('Payment processing error. Redirecting to error page.');
          // fallback redirect so user sees the error page
          const orderId = searchParams.get('order_id') || searchParams.get('orderId') || '';
          router.replace(`/Errorpay?order_id=${encodeURIComponent(orderId)}&status=client_callback_error`);
        }
      } finally {
        setProcessing(false);
      }
    }

    // if there are expected params, run the flow; otherwise do nothing
    if (Object.keys(paramsObj).length > 0) {
      void doPost();
    } else {
      setProcessing(false);
    }
  }, [router, searchParams]);

  return (
    <>
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
    </>
  )
}
