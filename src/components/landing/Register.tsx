"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User, Lock, Eye, EyeOff, Mail, Phone, MapPin, UserCircle } from 'lucide-react'
import { toast } from 'sonner'
import { FcGoogle } from 'react-icons/fc' 

type FormData = {
  username: string
  name: string
  email: string
  password: string
  gender: string
  phone: string
  address: string
}

export function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    username: '',
    name: '',
    email: '',
    password: '',
    gender: 'other',
    phone: '',
    address: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement> | string
  ) => {
    const value = typeof e === 'string' ? e : e.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/controller/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json() as {
        success: boolean;
        user?: { _id: string; username: string; name: string; email: string; };
        error?: string;
      }

      if (!data.success) {
        throw new Error(data.error || 'Registration failed')
      }

      toast.success('Registration successful! Please login.')
      router.push('/login')
    } catch (err) {
      console.error('Registration error:', err)
      toast.error(err instanceof Error ? err.message : 'Registration failed')
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
        <div className="w-full max-w-md bg-card text-card-foreground rounded-lg p-6 md:p-8 border shadow-lg space-y-6"> 
          
          <div className="flex justify-center">
              <img 
                src="/loghaf.png" 
                alt="Hafrin Coffee Logo" 
                className="h-20 w-auto" 
              />
          </div>
          
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Create an Account
            </h2>
            <p className="text-sm text-muted-foreground">
              Join Hafrin Coffee to order faster.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="username" type="text" required value={formData.username} onChange={e => handleChange('username')(e)} className="pl-10" placeholder="Enter your username" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="name" type="text" required value={formData.name} onChange={e => handleChange('name')(e)} className="pl-10" placeholder="Enter your full name" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="email" type="email" required value={formData.email} onChange={e => handleChange('email')(e)} className="pl-10" placeholder="Enter your email" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} required value={formData.password} onChange={e => handleChange('password')(e)} className="pl-10 pr-10" placeholder="Create a password" />
                <button type="button" onClick={togglePasswordVisibility} className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground hover:text-foreground" aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={formData.gender} onValueChange={value => handleChange('gender')(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="phone" type="tel" value={formData.phone} onChange={e => handleChange('phone')(e)} className="pl-10" placeholder="Enter your phone number" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="address" type="text" value={formData.address} onChange={e => handleChange('address')(e)} className="pl-10" placeholder="Enter your address" />
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
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

          <Button
            variant="outline"
            className="w-full bg-white text-gray-700" 
          >
            <FcGoogle className="mr-2 h-5 w-5" /> 
            Login with Google
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}