"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/app/controller/context/usercontext'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Lock, Eye, EyeOff } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login } = useUser()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage('')
    setLoading(true)
    try {
      await login(username, password)
      toast.success('Login berhasil')
      router.push('/')
    } catch (err) {
      console.error('Login error', err)
      const msg = err instanceof Error ? err.message : 'Login failed'
      setMessage(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <main className="flex items-center justify-center py-16 md:py-24 px-4">
        <div className="w-full max-w-md bg-card text-card-foreground rounded-lg p-6 md:p-8 border shadow-lg space-y-8">
          
          <div className="flex justify-center">
            <img
              src="/loghaf.png"
              alt="Hafrin Coffee Logo"
              className="h-20 w-auto"
            />
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Login
            </h2>
            <p className="text-sm text-muted-foreground">
              Welcome back! Login to your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>
            
            {message && (
              <p className="text-sm font-medium text-destructive">
                {message}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Login'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <a href="/api/auth/google" className="w-full inline-block">
            <Button
              variant="outline"
              className="w-full bg-white text-gray-700"
              asChild={false}
            >
              <span>
                <FcGoogle className="mr-2 h-5 w-5 inline-block" />
                Login with Google
              </span>
            </Button>
          </a>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account yet?{' '}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}