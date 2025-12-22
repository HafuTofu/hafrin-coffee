"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

// Import komponen pecahan
import DashboardOverview from "./dashboard"
import ProductsContent from "./products"
import OrdersContent from "./orders"
import { initialProducts, initialOrders, Product } from "./types"

export default function AdminDashboard() {
  // --- PRODUCT STATE ---
  const [products, setProducts] = useState<Product[]>(initialProducts)
  
  // --- ORDER STATE ---
  const [orders, setOrders] = useState(initialOrders)
  const [activeTab, setActiveTab] = useState("overview")

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
                <DashboardOverview products={products} orders={orders} />
            )}

            {/* --- TAB 2: MENU MANAGEMENT --- */}
            {activeTab === 'products' && (
                <ProductsContent products={products} setProducts={setProducts} />
            )}

             {/* --- TAB 3: ORDERS --- */}
             {activeTab === 'orders' && (
                <OrdersContent orders={orders} setOrders={setOrders} />
             )}
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </div>
  )
}