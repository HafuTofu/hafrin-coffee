"use client"

import { useEffect, useState } from "react"
import { motion, type Variants } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { MenuCard, type MenuItem } from "./menu-card"
import { fetchJson } from "@/lib/http"

const container = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
}

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 12 } },
}

export function MenusSection() {
  const [menus, setMenus] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const data = await fetchJson<{ success: boolean; menus: MenuItem[]; error?: string }>("/controller/menu", { timeoutMs: 8000, retries: 2 })
        
        if (!data.success) {
          throw new Error(data.error || "Failed to fetch menus")
        }
        
        setMenus(data.menus)
      } catch (err) {
        console.error("Error fetching menus:", err)
        setError(err instanceof Error ? err.message : "Failed to load menus")
      } finally {
        setLoading(false)
      }
    }

    fetchMenus()
  }, [])

  // Split menus into coffee and non-coffee items
  const coffees = menus.filter(item => 
    item.title.toLowerCase().includes("coffee") || 
    !["matcha", "chocolate"].some(type => 
      item.title.toLowerCase().includes(type)
    )
  )

  const nonCoffees = menus.filter(item => 
    !item.title.toLowerCase().includes("coffee") && 
    ["matcha", "chocolate"].some(type => 
      item.title.toLowerCase().includes(type)
    )
  )
  return (
    <section id="menus" className="bg-muted/40 py-16">
      <div className="mx-auto max-w-6xl px-4 space-y-10">
        <motion.div
          className="text-center space-y-2"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ type: "spring", stiffness: 60, damping: 15 }}
        >
          <h2 className="text-2xl font-semibold">Our Menus</h2>
        </motion.div>

        {loading ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-6">Loading Menus...</h3>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-60 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-8 w-24 ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-lg text-red-500">{error}</p>
          </div>
        ) : (
          <>
            {coffees.length > 0 && (
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ type: "spring", stiffness: 60, damping: 15 }}
                >
                  <h3 className="text-xl font-semibold">Coffees</h3>
                </motion.div>
                <motion.div
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                  variants={container}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                >
                  {coffees.map((itemData) => (
                    <motion.div key={itemData.id} variants={item}>
                      <MenuCard item={itemData} />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}

            {nonCoffees.length > 0 && (
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ type: "spring", stiffness: 60, damping: 15 }}
                >
                  <h3 className="text-xl font-semibold">Non-Coffees</h3>
                </motion.div>
                <motion.div
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                  variants={container}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                >
                  {nonCoffees.map((itemData) => (
                    <motion.div key={itemData.id} variants={item}>
                      <MenuCard item={itemData} />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}