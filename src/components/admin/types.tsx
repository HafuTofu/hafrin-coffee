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
  total: number
  status: string
  date: string
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

// --- Mock Data Products ---
export const initialProducts: Product[] = [
  { 
    id: "1", 
    name: "Aren Latte", 
    category: "Coffee", 
    price: 18000, 
    status: "Active", 
    sales: 1240, 
    description: "Signature coffee with authentic palm sugar.",
    image: "./aren latte.png" 
  },
  { 
    id: "2", 
    name: "Moccachino", 
    category: "Coffee", 
    price: 15000, 
    status: "Active", 
    sales: 856, 
    description: "Rich espresso with chocolate flavor.",
    image: "./mocca.png"
  },
  { 
    id: "3", 
    name: "Matcha", 
    category: "Non-Coffee", 
    price: 22000, 
    status: "Active", 
    sales: 2101, 
    description: "Premium matcha powder imported from Japan.",
    image: "./matcha.png" 
  },
  { 
    id: "4", 
    name: "Cappuccino", 
    category: "Coffee", 
    price: 24000, 
    status: "Active", 
    sales: 504, 
    description: "Espresso with steamed milk foam.",
    image: "./latte cappu.png"
  },
  { 
    id: "5", 
    name: "Butterscotch", 
    category: "Coffee", 
    price: 18000, 
    status: "Active", 
    sales: 0, 
    description: "Sweet and creamy butterscotch flavor.",
    image: "./bs.png" 
  },
]

// --- Mock Data Orders ---
export const initialOrders: Order[] = [
  { id: "ORD-001", customer: "Budi Santoso", total: 40000, status: "Completed", date: "Today" },
  { id: "ORD-002", customer: "Siti Aminah", total: 22000, status: "Pending", date: "Today" },
  { id: "ORD-003", customer: "Rizky Code", total: 18000, status: "Processing", date: "Tuesday" },
  { id: "ORD-004", customer: "Dewi Lestari", total: 56000, status: "Completed", date: "Tuesday" },
  { id: "ORD-005", customer: "Micka Shivi", total: 56000, status: "Completed", date: "Monday" },
]

export const monthlyOrdersData = [
  { name: "Jan", total: 45 }, { name: "Feb", total: 72 }, { name: "Mar", total: 120 },
  { name: "Apr", total: 98 }, { name: "May", total: 150 }, { name: "Jun", total: 142 },
  { name: "Jul", total: 185 }, { name: "Aug", total: 160 }, { name: "Sep", total: 195 },
  { name: "Oct", total: 210 }, { name: "Nov", total: 180 }, { name: "Dec", total: 250 },
]