"use client"

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/landing/navbar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type Props = {
  loadingOnly?: boolean
}

export default function SuccesspayClient({ loadingOnly = false }: Props) {
  if (loadingOnly) {
    return (
      <>
        <Navbar bgClass="bg-background" />
        <main className="mx-auto max-w-xl p-6">
          <p className="text-sm text-muted-foreground">Loading payment success page...</p>
        </main>
      </>
    )
  }

  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id') || searchParams.get('orderId') || searchParams.get('id') || '';
  
  // Midtrans redirect params
  const transactionStatus = searchParams.get('transaction_status') || '';
  const statusCode = searchParams.get('status_code') || '';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);

  const [verified, setVerified] = useState<boolean | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    async function verifyAndUpdate() {
      if (!orderId) return;
      setChecking(true);
      
      try {
        // If we have transaction_status from Midtrans redirect, update order status first
        if (transactionStatus) {
          const statusMap: Record<string, string> = {
            'capture': 'paid',
            'settlement': 'paid',
            'pending': 'pending',
            'deny': 'failed',
            'expire': 'failed',
            'cancel': 'failed'
          };
          
          const mappedStatus = statusMap[transactionStatus] || 'pending';
          
          // Update order payment status directly
          try {
            await fetch('/api/order/payment-status', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                orderId, 
                paymentStatus: mappedStatus,
                transactionStatus 
              })
            });
          } catch (err) {
            console.warn('Failed to update payment status from redirect params', err);
          }
        }

        // Then verify with Midtrans API
        const res = await fetch(`/api/midtrans/verify?orderId=${encodeURIComponent(orderId)}`);
        const data = await res.json().catch(() => ({})) as any;
        
        if (res.ok && data.success) {
          setVerified(Boolean(data.verified));
          setPaymentStatus(data.paymentStatus || null);
          if (data.verified || data.paymentStatus === 'paid') {
            toast.success('Payment confirmed!');
            setVerified(true);
          } else if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
            // Midtrans redirect says success, trust it
            toast.success('Payment successful!');
            setVerified(true);
            setPaymentStatus('paid');
          } else {
            toast('Payment is being processed...');
          }
        } else {
          // If API verification fails but redirect says success, still show success
          if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
            toast.success('Payment successful!');
            setVerified(true);
            setPaymentStatus('paid');
          } else {
            console.warn('Verify returned non-ok', data);
            toast.error('Failed to verify payment');
          }
        }
      } catch (err) {
        console.error('Error verifying payment', err);
        // Still check redirect params
        if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
          toast.success('Payment successful!');
          setVerified(true);
          setPaymentStatus('paid');
        } else {
          toast.error('Error verifying payment');
        }
      } finally {
        setChecking(false);
      }
    }

    void verifyAndUpdate();
  }, [orderId, transactionStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) {
      toast.error('Order id not found in URL.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/order', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, delivery: { name, phone, address, time } }),
      });

      const data = await res.json().catch(() => ({})) as any;
      if (!res.ok || !data || !data.success) {
        console.error('Failed to save delivery info', data);
        toast.error('Failed to save delivery info');
        setLoading(false);
        return;
      }

      toast.success('Delivery info saved. Thank you!');
      // Redirect to history or a thank-you page
      router.push('/history');
    } catch (err) {
      console.error('Error saving delivery info', err);
      toast.error('Error saving delivery info');
    } finally {
      setLoading(false);
    }
  }

  const handleCheckStatus = async () => {
    if (!orderId) return;
    setChecking(true);
    try {
      const res = await fetch(`/api/midtrans/verify?orderId=${encodeURIComponent(orderId)}`);
      const data = await res.json().catch(() => ({})) as any;
      if (res.ok && data.success) {
        setVerified(Boolean(data.verified));
        setPaymentStatus(data.paymentStatus || null);
        if (data.verified) toast.success('Payment confirmed');
        else toast('Payment still not confirmed');
      } else {
        toast.error('Failed to verify payment');
      }
    } catch (err) {
      console.error('Error checking status', err);
      toast.error('Error checking status');
    } finally {
      setChecking(false);
    }
  }

  return (
    <>
      <Navbar bgClass="bg-background" />
      <main className="mx-auto max-w-xl p-6">
        <h1 className="text-2xl font-semibold mb-4">Complete Delivery Details</h1>
        <p className="text-sm text-muted-foreground mb-4">Please provide delivery name, phone, address and preferred time to deliver your order. Order ID: <span className="font-mono">{orderId || 'N/A'}</span></p>

        {/* Verification status */}
        {verified === true ? (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-800">Payment confirmed — you can complete delivery details below.</div>
        ) : verified === false ? (
          <div className="mb-4 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 flex items-center justify-between">
            <div>Payment not yet confirmed. You can still provide delivery info but we'll notify you when confirmed.</div>
            <div className="ml-4">
              <Button size="sm" variant="outline" onClick={handleCheckStatus} disabled={checking}>{checking ? 'Checking...' : 'Check status'}</Button>
            </div>
          </div>
        ) : (
          <div className="mb-4 rounded-md bg-muted/20 p-3 text-sm">Checking payment status…</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Recipient name" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0812xxxx" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Delivery address" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Preferred time</label>
            <Input value={time} onChange={(e) => setTime(e.target.value)} placeholder="e.g. 2025-11-18 10:00" />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading} className="px-6">{loading ? 'Saving...' : 'Save & Continue'}</Button>
          </div>
        </form>
      </main>
    </>
  )
}
