import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Login from './Login'
import Home from './Home'

export default function App(){
  const { i18n, t } = useTranslation()
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [page, setPage] = useState(token ? 'home' : 'login')

  function onLogin(tok){
    localStorage.setItem('token', tok)
    setToken(tok)
    setPage('home')
  }

  return (
    <div className="min-h-screen">
      <nav className="border-b p-4 flex items-center justify-between">
        <span className="font-semibold text-rose">{t('title')}</span>
        <div className="space-x-2">
          <button className="btn" onClick={()=>i18n.changeLanguage('en')}>EN</button>
          <button className="btn" onClick={()=>i18n.changeLanguage('hi')}>HI</button>
          <button className="btn" onClick={()=>i18n.changeLanguage('mr')}>MR</button>
        </div>
      </nav>
      {page === 'login' && <Login onSuccess={onLogin} />}
      {page === 'home' && <Home />}
    </div>
  )
}
