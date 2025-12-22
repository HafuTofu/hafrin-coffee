"use client"

import { useUser } from "@/app/controller/context/usercontext"
import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { MenusSection } from "@/components/landing/menus-section"
import { BrandSection } from "@/components/landing/brand-section"
import { SiteFooter } from "@/components/landing/footer"

export default function Page() {
  const { user } = useUser() // Cek status login

  return (
    <main>
      <Navbar />
      
      {user ? (
        // --- TAMPILAN DASHBOARD (USER) ---
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
           {/* Sapaan User */}
           <section className="bg-secondary/10 py-10 mb-8">
              <div className="mx-auto max-w-6xl px-4">
                 <h1 className="text-3xl font-bold">
                    Welcome back, {user.username || "Code Mate"}! 👋
                 </h1>
              </div>
           </section>
           
           {/* Langsung ke Menu */}
           <MenusSection />
        </div>
      ) : (
        // --- TAMPILAN LANDING PAGE (GUEST) ---
        <>
          <Hero />
          <BrandSection />
          <MenusSection />
        </>
      )}

      <SiteFooter />
    </main>
  )
}