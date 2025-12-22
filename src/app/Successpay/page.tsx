import { Suspense } from 'react'
import SuccesspayClient from './SuccesspayClient'

export default function SuccessPayPage() {
  return (
    <Suspense fallback={(
      <div className="min-h-screen bg-muted/40">
        <SuccesspayClient loadingOnly />
      </div>
    )}>
      <SuccesspayClient />
    </Suspense>
  )
}
