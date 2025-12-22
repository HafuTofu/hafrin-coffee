import { Suspense } from 'react'
import CheckoutFinishClient from './CheckoutFinishClient'

export default function CheckoutFinishPage() {
  return (
    <Suspense fallback={(
      <div className="min-h-screen bg-muted/40">
        <CheckoutFinishClient loadingOnly />
      </div>
    )}>
      <CheckoutFinishClient />
    </Suspense>
  )
}