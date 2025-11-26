import React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import heroImg from '../../vintage_salon_scene.png'

const salonsMock = [
  { id: '1', name: 'Urban Trim', city: 'Pune', rating: 4.7, wait: 2 },
  { id: '2', name: 'Heritage Cuts', city: 'Mumbai', rating: 4.5, wait: 8 },
  { id: '3', name: 'Vintage Glow', city: 'Nashik', rating: 4.8, wait: 15 },
]

function WaitBadge({ minutes }){
  let color = 'bg-green-500'
  if (minutes >= 10) color = 'bg-red-500'
  else if (minutes >= 5) color = 'bg-yellow-500'
  return <span className={`text-xs text-white px-2 py-0.5 rounded ${color}`}>{minutes}m</span>
}

export default function Landing(){
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { scrollYProgress } = useScroll()
  const ySlow = useTransform(scrollYProgress, [0, 1], [0, -50])
  const ySlower = useTransform(scrollYProgress, [0, 1], [0, -80])

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="grain-overlay pointer-events-none" />
      <section className="container mx-auto px-4 pt-16 pb-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <motion.div style={{ y: ySlow }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <h1 className="font-display text-5xl md:text-6xl text-charcoal mb-3">{t('hero.title')}</h1>
          <div className="w-24 h-1 bg-gold mb-4 rounded" />
          <p className="text-charcoal/80 text-lg max-w-xl mb-6">{t('hero.subtitle')}</p>
        </motion.div>
        <motion.div style={{ y: ySlower }} initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="flex justify-center">
          {/* Gender-neutral hero illustration placeholder */}
          <div className="illustration-card">
            <img src={heroImg} alt="Vintage salon scene" className="rounded-xl shadow-xl object-cover w-full h-full" />
            <div className="vignette" />
          </div>
        </motion.div>
      </section>

      <section id="salons" className="container mx-auto px-4 pb-16">
        <h2 className="font-display text-3xl text-charcoal mb-4">{t('landing.topSalons')}</h2>
        <div className="carousel grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {salonsMock.map((s, idx) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 * idx, duration: 0.4 }}
              className="card hover:lift">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-lg text-charcoal">{s.name}</div>
                  <div className="text-sm text-charcoal/70">{s.city} • {s.rating.toFixed(1)}★</div>
                </div>
                <WaitBadge minutes={s.wait} />
              </div>
              <div className="mt-3 text-sm text-charcoal/80">{t('landing.cardNote')}</div>
            </motion.div>
          ))}
        </div>
        {/* CTA appears after most of Top Salons has been viewed */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.85 }}
          transition={{ duration: 0.5 }}
          className="mt-8 flex justify-center"
        >
          <motion.button
            whileHover={{ y: -2 }}
            onClick={()=>navigate('/start')}
            className="inline-block rounded-full px-6 py-2 text-charcoal font-medium"
            style={{
              background: 'linear-gradient(135deg, #D4AF37 0%, #C97C5D 100%)',
              boxShadow: '0 10px 24px rgba(0,0,0,0.16)'
            }}
          >Get Started</motion.button>
        </motion.div>
      </section>
    </div>
  )
}
