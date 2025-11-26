import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'

export default function StartPage(){
  const nav = useNavigate()
  const location = useLocation()
  const [showChoices, setShowChoices] = React.useState(false)

  React.useEffect(()=>{
    try{
      // Rely on AuthProvider's keys for consistency
      const token = typeof window !== 'undefined' ? localStorage.getItem('mx_token') : null
      const role = typeof window !== 'undefined' ? localStorage.getItem('mx_role') : null
      if (token && role){
        // Token present: skip login screen → directly role dashboard
        if (role === 'vendor') nav('/vendor-dashboard', { replace: true })
        else if (role === 'admin') nav('/admin', { replace: true })
        else nav('/customer-dashboard', { replace: true })
        setShowChoices(false)
      } else {
        // No token: show role choice
        setShowChoices(true)
      }
    }catch{ setShowChoices(true) }
  },[nav, location.pathname])
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="w-full max-w-md text-center">
        <motion.h2 initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }} className="font-display text-3xl text-charcoal mb-6">
          Welcome
        </motion.h2>
        {showChoices && (
          <div className="grid gap-3">
            <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={()=>nav('/login?role=customer')} className="px-6 py-3 rounded-md border border-charcoal/15 bg-white/80 backdrop-blur text-charcoal shadow-sm">
              Continue as Customer
            </motion.button>
            <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={()=>nav('/login?role=vendor')} className="px-6 py-3 rounded-md border border-charcoal/15 bg-white/80 backdrop-blur text-charcoal shadow-sm">
              Continue as Vendor
            </motion.button>
            {/* Admin option hidden unless explicitly enabled (e.g., query flag) */}
            {new URLSearchParams(location.search).get('admin') === '1' && (
              <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={()=>nav('/login?role=admin')} className="px-6 py-3 rounded-md border border-charcoal/15 bg-white/80 backdrop-blur text-charcoal shadow-sm">
                Continue as Admin
              </motion.button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
