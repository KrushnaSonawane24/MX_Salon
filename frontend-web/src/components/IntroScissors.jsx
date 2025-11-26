import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Scissors path simple SVG moving across screen with vintage flair
export default function IntroScissors({ show, onDone }){
  useEffect(() => {
    if (!show) return
    const t = setTimeout(() => onDone?.(), 1400)
    return () => clearTimeout(t)
  }, [show, onDone])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#EEDFC3 0%,#F5E6CC 60%)' }}
        >
          <div className="absolute inset-0 grain-overlay" />
          <motion.div
            initial={{ x: '-20%', rotate: -10 }}
            animate={{ x: '120%', rotate: 5 }}
            transition={{ duration: 1.1, ease: 'easeInOut' }}
            className="w-24 h-24"
          >
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <g fill="#2F2F2F">
                <path d="M30 20 L70 60" stroke="#2F2F2F" strokeWidth="6" strokeLinecap="round"/>
                <path d="M70 20 L30 60" stroke="#2F2F2F" strokeWidth="6" strokeLinecap="round"/>
                <circle cx="28" cy="62" r="10" fill="#C97C5D"/>
                <circle cx="72" cy="62" r="10" fill="#C97C5D"/>
              </g>
            </svg>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="absolute top-6 left-6 flex items-center gap-2">
            <img src="/logo.png" alt="Mx. Salon Logo" className="h-10 w-auto" />
            <span className="font-display text-2xl text-charcoal">Mx. Salon</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
