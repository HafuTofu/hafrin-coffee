"use client"

import React, { useState, useEffect } from 'react'
import { Navbar } from './navbar' 
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarImage } from '@/components/ui/avatar' 
import { useUser } from '@/app/controller/context/usercontext'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator' 
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"

export function ProfilePage() {
  const { user, loading, requireAuth, refreshUser } = useUser();
  // Redirect to login if not authenticated
  if (!loading && !requireAuth()) return <div />;

  const [namaAsli, setNamaAsli] = useState('')
  const [username, setUsername] = useState('')
  const [gender, setGender] = useState('')
  const [nomorHp, setNomorHp] = useState('')
  const [alamat, setAlamat] = useState('')
  const [currentEmail, setCurrentEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    if (user) {
      setNamaAsli(user.name || '')
      setUsername(user.username || '')
      setNomorHp(user.phone || '')
      setAlamat(user.address || '')
      setCurrentEmail(user.email || '')
      setAvatarUrl(user.picture || '')
      setGender(user.gender || '')
    }
  }, [user])
  
  // NEW: State for the main form's message
  const [mainMessage, setMainMessage] = useState('')
  const [mainMessageType, setMainMessageType] = useState<'success' | 'error'>('success')

  // --- Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false) // NEW: Controls modal visibility
  const [modalNewEmail, setModalNewEmail] = useState('')
  const [modalConfirmEmail, setModalConfirmEmail] = useState('')
  const [modalPassword, setModalPassword] = useState('')
  const [modalMessage, setModalMessage] = useState('')
  const [modalMessageType, setModalMessageType] = useState<'success' | 'error'>('success')


  // NEW: This handler now ONLY saves profile/personal details
  const handleSaveChanges = (event: React.FormEvent) => {
    event.preventDefault()
    setMainMessage('')
    ;(async () => {
      try {
        const res = await fetch('/controller/user', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: namaAsli,
            username,
            gender,
            phone: nomorHp,
            address: alamat,
            picture: avatarUrl
          })
        })

  const data = await res.json() as any
  if (!res.ok || !data.success) throw new Error(data.error || 'Update failed')

        await refreshUser()
        setMainMessageType('success')
        setMainMessage('Profile details updated successfully!')
        toast.success('Profile updated')
      } catch (err: any) {
        console.error('Failed to save profile:', err)
        setMainMessageType('error')
        setMainMessage(err?.message || 'Failed to update profile')
        toast.error(err?.message || 'Failed to update profile')
      }
    })()
  }

  // NEW: This handler manages the email change logic inside the modal
  const handleChangeEmail = (event: React.FormEvent) => {
    event.preventDefault()
    setModalMessage('')

    // Validation
    if (!modalNewEmail || !modalConfirmEmail || !modalPassword) {
      setModalMessageType('error')
      setModalMessage('Please fill in all fields.')
      return;
    }
    if (modalNewEmail !== modalConfirmEmail) {
      setModalMessageType('error')
      setModalMessage('Emails do not match. Please re-enter.')
      return;
    }
    
    // ---
    // TODO: Add logic here to verify the password is correct
    // ---

    // On Success
    console.log('Changing email to:', modalNewEmail)
    setCurrentEmail(modalNewEmail) // Update the email displayed on the main page
    setModalMessageType('success')
    setModalMessage('Email updated successfully! You can now close this window.')

    // Clear fields and close modal
    setModalNewEmail('')
    setModalConfirmEmail('')
    setModalPassword('')
    setIsModalOpen(false) // Close the modal on success
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <Navbar bgClass="bg-background" />

      <main className="flex justify-center pt-6 px-4">
        <div className="w-full max-w-4xl bg-card text-card-foreground rounded-lg p-6 md:p-8 border shadow-lg space-y-8">
          
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-28 w-28 border-2">
              <AvatarImage src="/placeholder-user.jpg"/>
            </Avatar>
          </div>

          <form onSubmit={handleSaveChanges} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Public Profile</h3>
                <Separator />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <Label htmlFor="namaAsli">Nama Asli</Label>
                  <Input id="namaAsli" type="text" value={namaAsli} onChange={(e) => setNamaAsli(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Section 2: Personal Details */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Personal Details</h3>
                <Separator />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Input id="gender" type="text" value={gender} onChange={(e) => setGender(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nomorHp">Nomor Hp</Label>
                  <Input id="nomorHp" type="tel" value={nomorHp} onChange={(e) => setNomorHp(e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="alamat">Alamat</Label>
                  <Input id="alamat" type="text" value={alamat} onChange={(e) => setAlamat(e.target.value)} />
                </div>
              </div>
            </div>

            {mainMessage && (
              <p className={`text-sm font-medium ${
                mainMessageType === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {mainMessage}
              </p>
            )}
            <div className="flex justify-end pt-4">
              <Button type="submit" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-8 py-3">
                Save Profile Changes
              </Button>
            </div>
          </form>

          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Account & Security</h3>
              <Separator />
            </div>

            <div className="space-y-4">
              <Label>Email Address</Label>
              <div className="flex items-center justify-between bg-muted p-3 rounded-lg border">
                <p className="font-medium text-foreground">{currentEmail}</p>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline">Change Email</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Change Email Address</DialogTitle>
                      <DialogDescription>
                        Enter your new email and your current password to make the change.
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleChangeEmail} className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="newEmail">New Email</Label>
                        <Input
                          id="newEmail"
                          type="email"
                          placeholder="your-new-email@example.com"
                          value={modalNewEmail}
                          onChange={(e) => setModalNewEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmEmail">Confirm New Email</Label>
                        <Input
                          id="confirmEmail"
                          type="email"
                          placeholder="Confirm your new email"
                          value={modalConfirmEmail}
                          onChange={(e) => setModalConfirmEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Current Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your current password"
                          value={modalPassword}
                          onChange={(e) => setModalPassword(e.target.value)}
                        />
                      </div>

                      {modalMessage && (
                        <p className={`text-sm font-medium ${
                          modalMessageType === 'success' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {modalMessage}
                        </p>
                      )}

                      <DialogFooter className="pt-4">
                        <DialogClose asChild>
                          <Button type="button" variant="ghost">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Save Email</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}