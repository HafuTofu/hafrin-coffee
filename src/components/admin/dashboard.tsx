"use client"

import { motion } from "framer-motion"
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  ArrowUpRight
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TabsContent } from "@/components/ui/tabs"
import { Product, Order, DashboardStats } from "./types"

interface DashboardOverviewProps {
  products: Product[]
  orders: Order[]
  stats: DashboardStats
}

export default function DashboardOverview({ products, orders, stats }: DashboardOverviewProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", { 
      style: "currency", 
      currency: "IDR", 
      maximumFractionDigits: 0 
    }).format(value)
  }

  return (
    <motion.div
        key="overview"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
    >
        <TabsContent value="overview" className="space-y-6 mt-0">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              title="Total Revenue" 
              value={formatCurrency(stats.totalRevenue)} 
              icon={DollarSign} 
              trend={stats.revenueTrend} 
              trendUp={stats.revenueTrend.startsWith("+")} 
              color="text-green-600" 
              bgColor="bg-green-100" 
            />
            <StatCard 
              title="Active Orders" 
              value={stats.activeOrders.toString()} 
              icon={ShoppingBag} 
              trend={`${orders.filter(o => o.status === "Pending").length} pending`} 
              trendUp={true} 
              color="text-blue-600" 
              bgColor="bg-blue-100" 
            />
            <StatCard 
              title="Total Products" 
              value={stats.totalProducts.toString()} 
              icon={Package} 
              trend="In Catalog" 
              trendUp={true} 
              color="text-orange-600" 
              bgColor="bg-orange-100" 
            />
            <StatCard 
              title="Total Customers" 
              value={stats.totalCustomers.toString()} 
              icon={Users} 
              trend="Registered users" 
              trendUp={true} 
              color="text-purple-600" 
              bgColor="bg-purple-100" 
            />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 shadow-sm border-none ring-1 ring-gray-200/50 flex flex-col">
                <CardHeader>
                <CardTitle>Monthly Orders</CardTitle>
                <CardDescription>Total number of orders placed per month.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pl-2">
                    <CustomBarChart data={stats.monthlyOrdersData.length > 0 ? stats.monthlyOrdersData : [
                      { name: "Jan", total: 0 }, { name: "Feb", total: 0 }, { name: "Mar", total: 0 },
                      { name: "Apr", total: 0 }, { name: "May", total: 0 }, { name: "Jun", total: 0 },
                      { name: "Jul", total: 0 }, { name: "Aug", total: 0 }, { name: "Sep", total: 0 },
                      { name: "Oct", total: 0 }, { name: "Nov", total: 0 }, { name: "Dec", total: 0 },
                    ]} />
                </CardContent>
            </Card>
            <Card className="col-span-3 shadow-sm border-none ring-1 ring-gray-200/50">
                <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest transaction activity.</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="space-y-8">
                    {orders.length > 0 ? orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center group">
                        <div className="space-y-1">
                        <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">{order.customer}</p>
                        <p className="text-xs text-muted-foreground">{order.date}</p>
                        </div>
                        <div className="ml-auto font-medium">
                        +{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(order.total)}
                        </div>
                    </div>
                    )) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>
                    )}
                </div>
                </CardContent>
            </Card>
            </div>
        </TabsContent>
    </motion.div>
  )
}

// --- Component: Custom Animated Bar Chart ---
function CustomBarChart({ data }: { data: { name: string; total: number }[] }) {
  const maxTotal = Math.max(...data.map(d => d.total))

  return (
    <div className="w-full h-[300px] flex items-end gap-2 sm:gap-4 pt-10 pb-2">
      {data.map((item, index) => {
        const heightPercentage = Math.max((item.total / maxTotal) * 100, 5)
        
        return (
          <div key={index} className="group relative flex-1 flex flex-col items-center h-full justify-end">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs py-1 px-2 rounded shadow-lg pointer-events-none z-10 whitespace-nowrap">
              <span className="font-bold">{item.total}</span> Orders
              <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: `${heightPercentage}%` }}
              transition={{ type: "spring", stiffness: 60, damping: 15, delay: index * 0.05 }}
              className="w-full max-w-[30px] bg-blue-500/80 hover:bg-blue-600 rounded-t-sm cursor-pointer transition-colors relative"
            >
            </motion.div>
            <span className="text-[10px] sm:text-xs text-muted-foreground mt-2 font-medium truncate w-full text-center">
              {item.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// --- Component: Stat Card ---
function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp, 
  color, 
  bgColor 
}: { 
  title: string, 
  value: string, 
  icon: any, 
  trend: string, 
  trendUp: boolean, 
  color: string, 
  bgColor: string 
}) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card className="shadow-sm border-none ring-1 ring-gray-200/50 overflow-hidden relative">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide">
            {title}
          </CardTitle>
          <div className={`p-2 rounded-full ${bgColor} ${color}`}>
            <Icon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="flex items-center mt-1">
            {trendUp ? (
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
            ) : (
              <ArrowUpRight className="h-3 w-3 text-red-600 mr-1 rotate-90" />
            )}
            <p className="text-xs text-muted-foreground">
              <span className={trendUp ? "text-green-600 font-medium" : "text-red-600"}>{trend}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}