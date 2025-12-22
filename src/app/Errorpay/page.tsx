import React from 'react'
import { Navbar } from '@/components/landing/navbar'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function ErrorPayPage(){
  const router = useRouter();
  return (
    <div className="min-h-screen bg-muted/40">
      <Navbar bgClass="bg-background" />
      <main className="mx-auto max-w-xl p-6 text-center">
        <h1 className="text-2xl font-semibold mb-4 text-red-600">Payment Failed / Canceled</h1>
        <p className="text-sm text-muted-foreground mb-6">Your payment was not completed. Your cart has been kept so you can try again.</p>
        <div className="space-x-3">
          <Button onClick={() => router.push('/cart')}>Back to Cart</Button>
          <Button variant="outline" onClick={() => router.push('/')}>Browse Menu</Button>
        </div>
      </main>
    </div>
  )
}
