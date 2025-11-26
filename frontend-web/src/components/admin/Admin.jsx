import React from 'react'
import { motion } from 'framer-motion'

export default function Admin(){
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="card">
        <h2 className="font-display text-3xl text-charcoal mb-2">Admin Dashboard</h2>
        <div className="text-charcoal/80">Monitor users, salons, and feedback analytics here. (Placeholder)</div>
      </motion.div>
    </div>
  )
}
