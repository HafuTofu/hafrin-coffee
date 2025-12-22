"use client"

import { motion } from "framer-motion"

export function BrandSection() {
  return (
    <section id="about" className="bg-acent/40">
      <div className="mx-auto max-w-6xl px-4 py-16 grid md:grid-cols-2 gap-10 items-start">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: "spring", stiffness: 70, damping: 16 }}
          className="flex justify-center md:justify-end align-items-start flex-col w-full"
        >
          <img src="/team.jpg" alt="Hafrin Coffee team at an event" className="w-full max-w-sm rounded-lg border" />
          <p className="mt-3 text-xs text-black self-center font-bold mr-39">MIPA PRENEUR EXPO 2025</p>
        </motion.div>
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: "spring", stiffness: 70, damping: 16, delay: 0.05 }}
        >
          <div className="leading-none">
            <p className="text-5xl font-bold tracking-tight">
              hafrin <span className="text-primary">.COFFEE</span>
            </p>
          </div>
          <p className="leading-relaxed text-pretty">
            We craft coffee for builders. From reliable classics to seasonal specials, our menu fuels deep work and
            great conversations. Taste that lasts, delivered fast.
          </p>
          <p className="leading-relaxed text-pretty">
            Join the community at events, pop-ups, and online. Your code mate, always ready.
          </p>
        </motion.div>
      </div>
    </section>
  )
}