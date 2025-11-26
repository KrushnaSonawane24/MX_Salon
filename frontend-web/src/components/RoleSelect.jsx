import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function RoleSelect(){
  const nav = useNavigate()
  const { t } = useTranslation()
  return (
    <div className="container mx-auto px-4 py-16">
      <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="font-display text-4xl text-charcoal mb-8">
        {t('roles.title', 'Choose your role')}
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={()=>nav('/customer')} className="card text-left">
          <div className="text-2xl font-semibold">{t('roles.customer', 'Customer')}</div>
          <p className="text-charcoal/80 mt-1">{t('roles.customerDesc', 'Discover top salons and services around you.')}</p>
        </motion.button>
        <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={()=>nav('/vendor')} className="card text-left">
          <div className="text-2xl font-semibold">{t('roles.vendor', 'Vendor')}</div>
          <p className="text-charcoal/80 mt-1">{t('roles.vendorDesc', 'Manage your salon profile and bookings.')}</p>
        </motion.button>
      </div>
    </div>
  )
}
