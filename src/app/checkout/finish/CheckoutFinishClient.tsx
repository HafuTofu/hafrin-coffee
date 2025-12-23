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
    const raw_tx = paramsObj.transaction_status || paramsObj.transactionStatus || paramsObj.status || '';
    const status_code = paramsObj.status_code || paramsObj.statusCode || paramsObj.statusCode || '';
    const transaction_status = String(raw_tx || '').toLowerCase().trim();
    console.log('CheckoutFinish paramsObj:', paramsObj, 'resolved transaction_status:', transaction_status, 'status_code:', status_code, 'orderId:', orderId);

    // Immediate client-side success shortcut: if Midtrans reports a success status (case-insensitive), redirect now.
    const successStatuses = ['capture', 'settlement'];
    const txLooksSuccessful = transaction_status && successStatuses.includes(transaction_status);
    const statusCodeFallback = !transaction_status && String(status_code) === '200';

    if (txLooksSuccessful || statusCodeFallback) {
      console.log('Early redirect: transaction_status/status_code indicates success -> redirecting to Successpay', { txLooksSuccessful, statusCodeFallback });
      router.replace(`/Successpay?order_id=${encodeURIComponent(orderId)}`);
      return;
    }

    async function doPost() {
      const successStatuses = ['capture', 'settlement'];
      try {
        setProcessing(true);
        console.log('Posting to /api/midtrans/callback with transaction_status:', transaction_status);
        // Post the query params to our callback handler as the server would do
        const res = await fetch('/api/midtrans/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(paramsObj)
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          console.warn('Callback endpoint returned non-OK', res.status, txt, 'transaction_status:', transaction_status, 'status_code:', status_code);
          // If the callback failed but transaction status indicates success, proceed to Successpay
          if (transaction_status && successStatuses.includes(transaction_status)) {
            console.log('Non-OK callback but transaction_status indicates success -> redirecting to Successpay');
            toast.success('Payment confirmed (client-side). Redirecting to success page.');
            router.replace(`/Successpay?order_id=${encodeURIComponent(orderId)}`);
            return;
          }
          // Fallback: if no transaction_status but status_code is 200, treat as success for UX
          if (!transaction_status && String(status_code) === '200') {
            console.log('Non-OK callback but status_code==200 and no transaction_status -> redirecting to Successpay (fallback)');
            toast.success('Payment confirmed (client-side, fallback). Redirecting to success page.');
            router.replace(`/Successpay?order_id=${encodeURIComponent(orderId)}`);
            return;
          }
          throw new Error(`Callback failed: ${res.status} ${String(txt).slice(0, 200)}`);
        }

        // Decide redirect target based on transaction_status
        if (transaction_status && successStatuses.includes(transaction_status)) {
          console.log('transaction_status is success -> redirecting to Successpay');
          router.replace(`/Successpay?order_id=${encodeURIComponent(orderId)}`);
          return;
        }

        if (!transaction_status && String(status_code) === '200') {
          console.log('status_code==200 and no transaction_status -> redirecting to Successpay (fallback)');
          router.replace(`/Successpay?order_id=${encodeURIComponent(orderId)}`);
          return;
        }

        console.log('transaction_status not successful -> redirecting to Errorpay', transaction_status, 'status_code:', status_code);
        router.replace(`/Errorpay?order_id=${encodeURIComponent(orderId)}&status=${encodeURIComponent(transaction_status || status_code)}`);
      } catch (e: any) {
        console.error('Client callback/post failed', e, 'transaction_status:', transaction_status, 'status_code:', status_code, 'orderId:', orderId);
        setError(String(e?.message || e));
        // If transaction status or status_code indicates success, proceed to success page even if callback failed
        if ((transaction_status && successStatuses.includes(transaction_status)) || (!transaction_status && String(status_code) === '200')) {
          console.log('Catch: tx/status indicates success -> redirecting to Successpay');
          toast.success('Payment confirmed (client-side). Redirecting to success page.');
          router.replace(`/Successpay?order_id=${encodeURIComponent(orderId)}`);
        } else {
          console.log('Catch: redirecting to Errorpay');
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
