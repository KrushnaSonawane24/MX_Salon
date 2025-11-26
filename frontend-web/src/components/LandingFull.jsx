import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import heroBg from '../../vintage_salon_scene.png'

export default function LandingFull(){
  const nav = useNavigate()
  const [animOut, setAnimOut] = React.useState(false)

  const onStart = () => {
    setAnimOut(true)
    setTimeout(()=> nav('/start'), 1500)
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden" style={{
      backgroundImage: `url(${heroBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* soft vintage gradient overlay */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, rgba(245,230,204,0.65) 0%, rgba(201,124,93,0.25) 60%, rgba(44,110,111,0.25) 100%)'
      }} />
      <div className="grain-overlay" />

      {/* Hero section */}
      <div className="relative z-10 h-[calc(100vh-80px)] flex items-center justify-center px-4">
        <div className="text-center select-none">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={animOut ? { y: -110, scale: 0.8, opacity: 0.98 } : { opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="font-display text-6xl md:text-7xl text-charcoal drop-shadow"
          >Mx. Salon</motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={animOut ? { opacity: 0, y: -10 } : { opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: 'easeInOut' }}
            className="text-charcoal/80 mt-2 text-lg"
          >Cut the Wait. Look Great.</motion.p>

          {/* Scroll indicator */}
          <motion.a href="#start" className="mt-10 inline-flex flex-col items-center gap-1 text-charcoal/80"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            <span className="text-sm">Scroll</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </motion.a>
        </div>
      </div>

      {/* CTA section appears after scrolling */}
      <section id="start" className="relative z-10 min-h-[70vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7 }}
          className="text-center select-none"
        >
          <motion.button
            whileHover={{ y: -2 }}
            onClick={onStart}
            className="inline-block rounded-full px-8 py-3 text-charcoal font-medium"
            style={{
              background: 'linear-gradient(135deg, #D4AF37 0%, #C97C5D 100%)',
              boxShadow: '0 10px 24px rgba(0,0,0,0.18)'
            }}
          >Get Started</motion.button>
        </motion.div>
      </section>
    </div>
  )
}
