import { Activity, CheckCircle2, Clock, Ban, X } from "lucide-react"

// --- Tipe Data ---
export type Product = {
  id: string
  name: string
  category: string
  price: number
  status: string
  sales: number
  description?: string 
  image?: string 
}

export type Order = {
  id: string
  customer: string
  email?: string
  total: number
  status: string
  paymentStatus?: string
  deliveryStatus?: string
  date: string
  items?: {
    name: string
    quantity: number
    price: number
    sugar?: string
    ice?: string
    additions?: string[]
  }[]
  deliveryInfo?: {
    name?: string
    phone?: string
    address?: string
    time?: string
  }
}

export type DashboardStats = {
  totalRevenue: number
  activeOrders: number
  totalProducts: number
  totalCustomers: number
  revenueTrend: string
  monthlyOrdersData: { name: string; total: number }[]
}

// --- Helper for Status Color ---
export const getStatusBadge = (status: string) => {
  switch (status) {
    case "Active":
    case "Completed":
      return "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200"
    case "Pending":
        return "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200"
    case "Processing":
      return "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200"
    case "Disabled":
        return "bg-gray-100 text-gray-500 hover:bg-gray-200 border-gray-200"
    case "Cancelled": 
      return "bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

// --- Helper for Category Color ---
export const getCategoryColor = (category: string) => {
  switch (category) {
    case "Coffee":
      return "bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200"
    case "Non-Coffee":
      return "bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200"
    default:
      return "bg-slate-100 text-slate-700 hover:bg-slate-200"
  }
}

// --- Helper for Status Icon ---
export const getStatusIcon = (status: string) => {
  switch (status) {
    case "Active": return <Activity className="h-3.5 w-3.5" />
    case "Completed": return <CheckCircle2 className="h-3.5 w-3.5" />
    case "Pending": return <Clock className="h-3.5 w-3.5" />
    case "Processing": return <Activity className="h-3.5 w-3.5" />
    case "Disabled": return <Ban className="h-3.5 w-3.5" />
    case "Cancelled": return <X className="h-3.5 w-3.5" /> 
    default: return <Activity className="h-3.5 w-3.5" />
  }
}

// Monthly orders data will be fetched from API
export const monthlyOrdersData = [
  { name: "Jan", total: 0 }, { name: "Feb", total: 0 }, { name: "Mar", total: 0 },
  { name: "Apr", total: 0 }, { name: "May", total: 0 }, { name: "Jun", total: 0 },
  { name: "Jul", total: 0 }, { name: "Aug", total: 0 }, { name: "Sep", total: 0 },
  { name: "Oct", total: 0 }, { name: "Nov", total: 0 }, { name: "Dec", total: 0 },
]

// Empty initial data - will be fetched from database
export const initialProducts: Product[] = []
export const initialOrders: Order[] = []