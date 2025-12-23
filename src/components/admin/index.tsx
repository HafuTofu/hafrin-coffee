"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"

// Import komponen pecahan
import DashboardOverview from "./dashboard"
import ProductsContent from "./products"
import OrdersContent from "./orders"
import { Product, Order, DashboardStats } from "./types"

export default function AdminDashboard() {
  // --- LOADING STATE ---
  const [isLoading, setIsLoading] = useState(true)
  
  // --- PRODUCT STATE ---
  const [products, setProducts] = useState<Product[]>([])
  
  // --- ORDER STATE ---
  const [orders, setOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  
  // --- DASHBOARD STATS ---
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    activeOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    revenueTrend: "+0%",
    monthlyOrdersData: []
  })

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch all data in parallel
        const [productsRes, ordersRes, statsRes] = await Promise.all([
          fetch("/api/admin/menus"),
          fetch("/api/admin/orders"),
          fetch("/api/admin/stats")
        ])

        const productsData = await productsRes.json() as { success: boolean; products: Product[] }
        const ordersData = await ordersRes.json() as { success: boolean; orders: Order[] }
        const statsData = await statsRes.json() as { success: boolean; stats: DashboardStats }

        if (productsData.success) {
          setProducts(productsData.products)
        }
        if (ordersData.success) {
          setOrders(ordersData.orders)
        }
        if (statsData.success) {
          setStats(statsData.stats)
        }
      } catch (error) {
        console.error("Failed to fetch admin data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Refresh data after product changes
  const refreshProducts = async () => {
    try {
      const res = await fetch("/api/admin/menus")
      const data = await res.json() as { success: boolean; products: Product[] }
      if (data.success) {
        setProducts(data.products)
      }
    } catch (error) {
      console.error("Failed to refresh products:", error)
    }
  }

  // Refresh data after order changes
  const refreshOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders")
      const data = await res.json() as { success: boolean; orders: Order[] }
      if (data.success) {
        setOrders(data.orders)
      }
    } catch (error) {
      console.error("Failed to refresh orders:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <motion.div 
        className="mx-auto max-w-7xl space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, Admin! Here's what's happening with Hafrin Coffee today.
            </p>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white p-1 border shadow-sm rounded-lg h-auto">
              <TabsTrigger value="overview" className="data-[state=active]:bg-gray-100 data-[state=active]:text-primary px-4 py-2 rounded-md transition-all">Overview</TabsTrigger>
              <TabsTrigger value="products" className="data-[state=active]:bg-gray-100 data-[state=active]:text-primary px-4 py-2 rounded-md transition-all">Products</TabsTrigger>
              <TabsTrigger value="orders" className="data-[state=active]:bg-gray-100 data-[state=active]:text-primary px-4 py-2 rounded-md transition-all">Orders</TabsTrigger>
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            {/* --- TAB 1: OVERVIEW --- */}
            {activeTab === 'overview' && (
                <DashboardOverview products={products} orders={orders} stats={stats} />
            )}

            {/* --- TAB 2: MENU MANAGEMENT --- */}
            {activeTab === 'products' && (
                <ProductsContent products={products} setProducts={setProducts} onRefresh={refreshProducts} />
            )}

             {/* --- TAB 3: ORDERS --- */}
             {activeTab === 'orders' && (
                <OrdersContent orders={orders} setOrders={setOrders} onRefresh={refreshOrders} />
             )}
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </div>
  )
}