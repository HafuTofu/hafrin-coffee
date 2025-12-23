"use client"

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/landing/navbar'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { CheckCircle2, Coffee, MapPin, Clock } from 'lucide-react'

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

  const [verified, setVerified] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function verifyAndUpdate() {
      if (!orderId) {
        setChecking(false);
        return;
      }
      
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
          if (data.verified || data.paymentStatus === 'paid') {
            toast.success('Pembayaran berhasil!');
            setVerified(true);
          } else if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
            toast.success('Pembayaran berhasil!');
            setVerified(true);
          }
        } else {
          if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
            toast.success('Pembayaran berhasil!');
            setVerified(true);
          }
        }
      } catch (err) {
        console.error('Error verifying payment', err);
        if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
          setVerified(true);
        }
      } finally {
        setChecking(false);
      }
    }

    void verifyAndUpdate();
  }, [orderId, transactionStatus]);

  return (
    <>
      <Navbar bgClass="bg-background" />
      <main className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8">
          {checking ? (
            <div className="space-y-4">
              <div className="animate-pulse">
                <Coffee className="h-16 w-16 mx-auto text-amber-500" />
              </div>
              <p className="text-muted-foreground">Memverifikasi pembayaran...</p>
            </div>
          ) : verified ? (
            <>
              {/* Success Icon */}
              <div className="flex justify-center">
                <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-14 w-14 text-green-600" />
                </div>
              </div>

              {/* Thank You Message */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">Terima Kasih! ☕</h1>
                <p className="text-lg text-muted-foreground">Pembayaran kamu berhasil</p>
              </div>

              {/* Delivery Info Card */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 space-y-4">
                <h2 className="font-semibold text-amber-900">Detail Pengantaran</h2>
                
                <div className="space-y-3 text-left">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Lokasi</p>
                      <p className="text-gray-600">GDS Lantai 5</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Waktu</p>
                      <p className="text-gray-600">Besok, pukul 10.00 WIB</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order ID */}
              <p className="text-xs text-muted-foreground">
                Order ID: <span className="font-mono">{orderId}</span>
              </p>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button variant="outline" onClick={() => router.push('/history')}>
                  Lihat Riwayat Pesanan
                </Button>
                <Button onClick={() => router.push('/')} className="bg-amber-600 hover:bg-amber-700">
                  Kembali ke Menu
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Error/Pending State */}
              <div className="flex justify-center">
                <div className="h-24 w-24 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Coffee className="h-14 w-14 text-yellow-600" />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">Pembayaran Dalam Proses</h1>
                <p className="text-muted-foreground">
                  Kami sedang memverifikasi pembayaranmu. Silakan cek kembali beberapa saat lagi.
                </p>
              </div>

              {orderId && (
                <p className="text-xs text-muted-foreground">
                  Order ID: <span className="font-mono">{orderId}</span>
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button variant="outline" onClick={() => router.push('/history')}>
                  Lihat Riwayat Pesanan
                </Button>
                <Button onClick={() => router.push('/')} className="bg-amber-600 hover:bg-amber-700">
                  Kembali ke Menu
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  )
}
