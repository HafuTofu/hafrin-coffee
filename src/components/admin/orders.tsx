"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Search,
  MoreHorizontal,
  Activity,
  CheckCircle2,
  Clock,
  Ban,
  Loader2
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TabsContent } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Order, getStatusBadge, getStatusIcon } from "./types"

interface OrdersContentProps {
  orders: Order[]
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>
  onRefresh: () => Promise<void>
}

export default function OrdersContent({ orders, setOrders }: OrdersContentProps) {
  const [orderSearchQuery, setOrderSearchQuery] = useState("")
  const [orderStatusFilter, setOrderStatusFilter] = useState("all")
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

  // Logic Filter Orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(orderSearchQuery.toLowerCase())
    
    const matchesStatus = orderStatusFilter === "all" || order.status === orderStatusFilter

    return matchesSearch && matchesStatus
  })

  // Order Handler - Update status via API
  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId)
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus })
      })
      const data = await res.json() as { success: boolean; error?: string }
      if (data.success) {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        )
      } else {
        alert("Failed to update order status: " + data.error)
      }
    } catch (error) {
      console.error("Update order error:", error)
      alert("Failed to update order status")
    } finally {
      setUpdatingOrderId(null)
    }
  }

  return (
    <motion.div
        key="orders"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
    >
        <TabsContent value="orders" className="mt-0">
            <Card className="shadow-sm border-none ring-1 ring-gray-200/50">
            <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>Real-time order tracking.</CardDescription>
            </CardHeader>
            <CardContent>
                
                {/* --- SEARCH & FILTER BAR --- */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                    <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search orders (ID or Name)..."
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        className="pl-9 bg-gray-50 border-gray-200"
                    />
                    </div>

                    <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                    <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200">
                        <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Processing">Processing</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
                {/* --------------------------- */}

                <div className="rounded-lg border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                    <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        {/* --- UPDATED HEADER TITLE --- */}
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-gray-50/80 transition-colors">
                            <TableCell className="font-medium font-mono text-xs">
                            {order.id}
                            </TableCell>
                            <TableCell className="font-medium">{order.customer}</TableCell>
                            <TableCell>
                            <Badge variant="outline" className={`px-3 py-1 gap-1.5 pointer-events-none ${getStatusBadge(order.status)}`}>
                                {getStatusIcon(order.status)}
                                {order.status}
                            </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">{order.date}</TableCell>
                            <TableCell className="text-right font-medium">
                            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(order.total)}
                            </TableCell>
                            
                            {/* --- DROPDOWN ACTION --- */}
                            <TableCell className="text-right">
                            {updatingOrderId === order.id ? (
                              <div className="flex justify-end">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              </div>
                            ) : (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900 hover:bg-gray-100">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleOrderStatusChange(order.id, "Pending")} className="cursor-pointer">
                                    <Clock className="mr-2 h-4 w-4 text-red-500" /> 
                                    <span>Mark as Pending</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleOrderStatusChange(order.id, "Processing")} className="cursor-pointer">
                                    <Activity className="mr-2 h-4 w-4 text-amber-500" /> 
                                    <span>Mark as Processing</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleOrderStatusChange(order.id, "Completed")} className="cursor-pointer">
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> 
                                    <span>Mark as Completed</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleOrderStatusChange(order.id, "Cancelled")} className="cursor-pointer text-gray-600 focus:text-gray-600 focus:bg-gray-50">
                                    <Ban className="mr-2 h-4 w-4" /> 
                                    <span>Cancel Order</span>
                                </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            )}
                            </TableCell>
                            {/* ---------------------------------- */}

                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            No orders found matching your criteria.
                        </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
                </div>
            </CardContent>
            </Card>
        </TabsContent>
    </motion.div>
  )
}