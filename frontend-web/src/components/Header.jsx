import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { i18n } = useTranslation()
  const { user, logout } = useAuth()

  return (
    <header className="w-full flex items-center justify-between px-5 py-3 relative z-10 bg-charcoal/5 backdrop-blur-sm border-b border-charcoal/10">
      {/* Logo Section - Left */}
      <Link to="/" className="flex items-center gap-2 group select-none">
        <motion.img 
          initial={{ opacity: 0, scale: 0.92 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.6 }}
          src="/logo.png" 
          alt="Mx. Salon Logo" 
          className="h-10 w-auto object-contain logo-gold logo-noclick" 
          draggable={false} 
          onMouseDown={(e) => e.preventDefault()} 
        />
        <span className="font-display text-xl text-charcoal/90">Mx. Salon</span>
      </Link>

      {/* Right Section - Language & Auth */}
      <div className="flex items-center gap-3">
        {/* Language Selector */}
        <select 
          value={i18n.language} 
          onChange={e => i18n.changeLanguage(e.target.value)} 
          className="bg-transparent border border-charcoal/30 text-charcoal/90 text-sm px-2 py-1 rounded hover:border-charcoal/50 transition-colors"
        >
          <option value="en">EN</option>
          <option value="hi">HI</option>
          <option value="mr">MR</option>
        </select>

        {/* Auth Section */}
        {user ? (
          <div className="flex items-center gap-2">
            {user.role === 'vendor' && (
              <Link to="/vendor-profile" title="Profile" className="rounded-full border border-charcoal/30 p-1 hover:bg-charcoal/10 transition-colors">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
            )}
            <span className="text-sm text-charcoal/90 font-medium">{user.name}</span>
            <button 
              onClick={logout} 
              className="text-sm px-3 py-1 rounded border border-charcoal/30 text-charcoal/90 hover:bg-charcoal/10 transition-colors"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link 
              to="/login" 
              className="text-sm px-3 py-1 rounded border border-charcoal/30 text-charcoal/90 hover:bg-charcoal/10 transition-colors"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="text-sm px-3 py-1 rounded font-medium transition-transform hover:scale-105" 
              style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C97C5D 100%)', color: '#2b2b2b' }}
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
