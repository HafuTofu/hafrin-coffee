"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ShoppingCart,
  User,
  History,
  Info,
  BookMarked,
  LogOut,
  LogIn,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUser } from '@/app/controller/context/usercontext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NavbarProps {
  bgClass?: string
}

export function Navbar({
  bgClass = "bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60",
}: NavbarProps) {
  const router = useRouter()

  // 1. Ambil 'user' dan 'loading' selain 'logout'
  const { user, logout, loading } = useUser()

  const handleLogout = async () => {
    try {
      await logout()
      // Redirect ke login setelah logout
      router.push('/login')
    } catch (err) {
      console.error('Logout failed from navbar:', err)
      router.push('/login')
    }
  }

  return (
    <header className={`sticky top-0 z-50 border-b ${bgClass}`}>
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-wide">
          <img src="/loghaf.png" alt="Hafrin Coffee Logo" className="h-16 w-24 object-contain" />
          <span className="sr-only">Hafrin Coffee</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* 2. Logika Conditional Rendering */}
          {loading ? (
             // Tampilan saat memuat (mencegah layout bergeser/flickering)
             <div className="flex gap-2">
               <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
               <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
             </div>
          ) : user ? (
            // --- TAMPILAN USER (SUDAH LOGIN) ---
            <>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Cart"
                className="h-12 w-12"
                asChild
              >
                <Link href="/cart">
                  <ShoppingCart className="h-7 w-7" />
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Profile"
                    className="h-12 w-12"
                  >
                    <User className="h-7 w-7" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {/* Tampilkan nama user jika ada */}
                  <DropdownMenuLabel>Hi, {user.username || "User"}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/history">
                        <History className="mr-2 h-4 w-4" />
                        <span>History</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/#about">
                        <Info className="mr-2 h-4 w-4" />
                        <span>About Us</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/#menus">
                        <BookMarked className="mr-2 h-4 w-4" />
                        <span>Menu</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            // --- TAMPILAN GUEST (BELUM LOGIN) ---
            <Button asChild className="bg-secondary text-secondary-foreground hover:opacity-90 font-semibold">
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}