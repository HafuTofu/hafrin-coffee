"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/app/controller/context/usercontext"
import AdminDashboard from "@/components/admin/index"
import { Loader2, ShieldX } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [authorized, setAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    if (!loading) {
      // Check if user is logged in and has username "admin"
      if (user && user.username === "admin") {
        setAuthorized(true)
      } else {
        setAuthorized(false)
      }
    }
  }, [user, loading])

  // Loading state
  if (loading || authorized === null) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking authorization...</p>
        </div>
      </div>
    )
  }

  // Not authorized
  if (!authorized) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
              <ShieldX className="h-10 w-10 text-red-600" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Akses Ditolak</h1>
            <p className="text-muted-foreground">
              {user 
                ? "Anda tidak memiliki izin untuk mengakses halaman admin."
                : "Silakan login dengan akun admin untuk mengakses halaman ini."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={() => router.push('/')}>
              Kembali ke Beranda
            </Button>
            {!user && (
              <Button onClick={() => router.push('/login')} className="bg-amber-600 hover:bg-amber-700">
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Authorized - show admin dashboard
  return <AdminDashboard />
}