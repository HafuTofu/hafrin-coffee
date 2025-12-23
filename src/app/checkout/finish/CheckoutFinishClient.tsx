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
    const orderId =
      searchParams.get('order_id') ||
      searchParams.get('orderId') ||
      '';

    const transaction_status = (
      searchParams.get('transaction_status') || ''
    ).toLowerCase();

    const status_code = searchParams.get('status_code') || '';

    const successStatuses = ['capture', 'settlement'];

    if (
      successStatuses.includes(transaction_status) ||
      status_code === '200'
    ) {
      router.replace(`/Successpay?order_id=${encodeURIComponent(orderId)}`);
    } else {
      router.replace(
        `/Errorpay?order_id=${encodeURIComponent(orderId)}&status=${encodeURIComponent(
          transaction_status || status_code
        )}`
      );
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
