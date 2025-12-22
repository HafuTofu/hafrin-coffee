"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { WhatsAppButton } from "./whatsapp-button" // Import the WhatsAppButton component

export function Hero() {
  return (
    <section id="home" className="bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
        {/* Text column */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ type: "spring", stiffness: 60, damping: 15 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-pretty text-black">
            Hafrin Coffee, <span className="text-accent font-bold">your code</span> mate {"\u2615"}
          </h1>
          <p className="text-muted-foreground leading-relaxed">Code longer, delivered fast, a taste that lasts.</p>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Button asChild className="bg-secondary text-secondary-foreground hover:opacity-90">
              <a href="#about" aria-label="Learn more about us">
                About Us
              </a>
            </Button>
          </motion.div>
        </motion.div>

        {/* Image column */}
        <motion.div
          className="flex justify-center md:justify-end align-items-start"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ type: "spring", stiffness: 90, damping: 14 }}
        >
          <div className="size-80 md:size-80 rounded-full grid place-items-center">
            <img src={"/hafrin.png"} className="h-full w-full object-cover" />
          </div>
        </motion.div>
      </div>
      <WhatsAppButton /> {/* Add the WhatsAppButton here */}
    </section>
  )
}