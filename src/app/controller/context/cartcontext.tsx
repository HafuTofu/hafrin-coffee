"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { toast } from "sonner"
import { useUser } from "@/app/controller/context/usercontext"
import { useRouter } from "next/navigation"
import { fetchJson } from "@/lib/http"

export type CartItem = {
  quantity: number
  sugar: string
  ice: string
  additions: string[]
  idProduct: {
    _id: string
    name: string
    price: number
    pic: string
  }
}

type CartContextType = {
  cart: CartItem[]
  loading: boolean
  addToCart: (item: CartItem) => Promise<void>
  updateQuantity: (idProduct: string, quantity: number, customizations?: { sugar: string; ice: string; additions: string[] }) => Promise<void>
  removeItem: (idProduct: string, customizations?: { sugar: string; ice: string; additions: string[] }) => Promise<void>
  clearCart: () => Promise<void>
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useUser()
  const router = useRouter()

  // Calculate total
  const total = cart.reduce((sum, item) => sum + item.idProduct.price * item.quantity, 0)

  // Fetch cart on mount and when user changes. Make fetchCart stable via useCallback
  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log("🔍 Fetching cart for user:", user._id)
      
  const data = await fetchJson<ApiResponse>(`/controller/cart?idUser=${user._id}`, { timeoutMs: 500, retries: 120 })
      
      console.log("📦 Cart data received:", data)
      
      if (data.success && data.cart?.items) {
        setCart(data.cart.items)
        console.log("✅ Cart updated with items:", data.cart.items)
      } else {
        console.log("ℹ️ No items in cart or cart not found")
        setCart([])
      }
    } catch (err) {
      console.error("❌ Failed to fetch cart:", err)
      toast.error("Failed to load cart")
      setCart([])
    } finally {
      setLoading(false)
    }
  }, [user?._id])

  useEffect(() => {
    // call the stable fetch function whenever the user id changes
    fetchCart()
  }, [fetchCart])

  type ApiResponse = {
    success: boolean;
    cart?: {
      _id: string;
      idUser: string;
      items: CartItem[];
      createdAt: string;
      updatedAt: string;
    };
    error?: string;
  }

  const addToCart = async (item: CartItem) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      router.push("/login");
      return;
    }

    try {
      setLoading(true)
      // Always add as new item and let the server handle combinations
      const data = await fetchJson<ApiResponse>("/controller/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idUser: user._id,
          idProduct: item.idProduct._id,
          pic: item.idProduct.pic || item.idProduct.name.toLowerCase(),
          quantity: item.quantity,
          customizations: {
            sugar: item.sugar,
            ice: item.ice,
            additions: item.additions,
          }
        }),
        timeoutMs: 9000,
        retries: 1,
      })

      if (data.success && data.cart) {
        await fetchCart(); // Refresh cart data
        toast.success("Added to cart!");
      } else {
        throw new Error(data.error || "Failed to add item");
      }
    } catch (err) {
      console.error("Failed to add to cart:", err);
      toast.error(err instanceof Error ? err.message : "Failed to add to cart");
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (idProduct: string, quantity: number, customizations?: { sugar: string; ice: string; additions: string[] }) => {
    if (!user) {
      toast.error("Please login to update cart");
      router.push("/login");
      return;
    }

    // Update local state immediately for better UX
    setCart(currentCart => 
      currentCart.map(item => {
        if (customizations) {
          // If customizations provided, match exactly
          const isMatch = item.idProduct._id === idProduct &&
            item.sugar === customizations.sugar &&
            item.ice === customizations.ice &&
            JSON.stringify([...item.additions].sort()) === JSON.stringify([...customizations.additions].sort());
          
          return isMatch ? { ...item, quantity } : item;
        } else {
          // Backward compatibility: if no customizations provided, match by ID only
          return item.idProduct._id === idProduct ? { ...item, quantity } : item;
        }
      })
    );

    try {
      const data = await fetchJson<ApiResponse>("/controller/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idUser: user._id,
          idProduct,
          quantity,
          customizations: customizations || undefined,
        }),
        timeoutMs: 9000,
        retries: 1,
      })

      if (!data.success) {
        // If server update fails, revert the local change
        await fetchCart();
        throw new Error(data.error || "Failed to update quantity");
      }
    } catch (err) {
      console.error("Failed to update quantity:", err);
      toast.error("Failed to update quantity");
      // Revert local state on error
      await fetchCart();
    }
  }

  const removeItem = async (idProduct: string, customizations?: { sugar: string; ice: string; additions: string[] }) => {
    if (!user) {
      toast.error("Please login to remove items");
      router.push("/login");
      return;
    }

    try {
      setLoading(true)
      const data = await fetchJson<ApiResponse>("/controller/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idUser: user._id,
          idProduct,
          customizations
        }),
        timeoutMs: 9000,
        retries: 1,
      })
      if (data.success) {
        await fetchCart()
        toast.success("Item removed")
      } else {
        throw new Error(data.error || "Failed to remove item")
      }
    } catch (err) {
      console.error("Failed to remove item:", err)
      toast.error("Failed to remove item")
    } finally {
      setLoading(false)
    }
  }

  const clearCart = async () => {
    if (!user) {
      toast.error("Please login to clear cart");
      router.push("/login");
      return;
    }

    try {
      setLoading(true)
      const data = await fetchJson<ApiResponse>("/controller/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idUser: user._id,
          deleteCart: true,
        }),
        timeoutMs: 9000,
        retries: 1,
      })
      if (data.success) {
        setCart([])
        toast.success("Cart cleared")
      } else {
        throw new Error(data.error || "Failed to clear cart")
      }
    } catch (err) {
      console.error("Failed to clear cart:", err)
      toast.error("Failed to clear cart")
    } finally {
      setLoading(false)
    }
  }

  return (
    <CartContext.Provider value={{ 
      cart, 
      loading, 
      total,
      addToCart, 
      updateQuantity,
      removeItem, 
      clearCart 
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within a CartProvider")
  return context
}
