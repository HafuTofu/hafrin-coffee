"use client"

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/landing/navbar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function SuccessPayPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id') || searchParams.get('orderId') || searchParams.get('id') || '';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // optionally, if you want to pre-fill user info you can fetch /controller/user
  }, []);

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

  return (
    <div className="min-h-screen bg-muted/40">
      <Navbar bgClass="bg-background" />
      <main className="mx-auto max-w-xl p-6">
        <h1 className="text-2xl font-semibold mb-4">Complete Delivery Details</h1>
        <p className="text-sm text-muted-foreground mb-4">Please provide delivery name, phone, address and preferred time to deliver your order. Order ID: <span className="font-mono">{orderId || 'N/A'}</span></p>

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
    </div>
  )
}
