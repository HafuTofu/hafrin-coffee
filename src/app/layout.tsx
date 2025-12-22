import type { Metadata } from 'next'
import { Geist, Geist_Mono } from "next/font/google";
import './globals.css'
import { Toaster } from 'react-hot-toast';
import { CartProvider } from '@/app/controller/context/cartcontext';
import { UserProvider } from '@/app/controller/context/usercontext';

export const metadata: Metadata = {
  title: 'Hafrin Coffee',
  description: 'Hafrin coffee',
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <UserProvider>
          <CartProvider>
            {children}
            <Toaster position="bottom-center" />
          </CartProvider>
        </UserProvider>
      </body>
    </html>
  )
}