import React from 'react'
import { BrowserRouter, Routes, Route, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Login from './components/Login'
import Landing from './components/Landing'
import RoleSelect from './components/RoleSelect'
import IntroScissors from './components/IntroScissors'
import Customer from './components/customer/Customer'
import Vendor from './components/vendor/Vendor'
import VendorProfile from './components/vendor/VendorProfile'
import LandingFull from './components/LandingFull'
import StartPage from './components/StartPage'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/AuthContext'
import Admin from './components/admin/Admin'
import Register from './components/Register'
import SalonDetail from './components/customer/SalonDetail'
import Onboarding from './components/customer/Onboarding'
import Dashboard from './components/customer/Dashboard'
import Booking from './components/customer/Booking'
import Header from './components/Header'
import ProtectedRoute, { PublicRoute } from './components/ProtectedRoute'

function Shell() {
  return (
    <div className="min-h-screen bg-ivory text-charcoal relative">
      <div className="grain-overlay" />
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  )
}

function InnerApp(){
  const [showSplash, setShowSplash] = React.useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const { token, user } = useAuth()

  React.useEffect(()=>{
    try{
      const lt = typeof window!=='undefined' ? (localStorage.getItem('token') || localStorage.getItem('mx_token')) : null
      const lr = user?.role || (typeof window!=='undefined' ? (localStorage.getItem('role') || localStorage.getItem('mx_role')) : null)
      const path = location.pathname
      const landingPaths = ['/', '/start', '/login', '/register']
      if((token || lt) && lr && landingPaths.includes(path)){
        if(lr === 'vendor') navigate('/vendor-dashboard', { replace: true })
        else if(lr === 'customer') navigate('/customer-dashboard', { replace: true })
      }
    }catch{}
  },[location.pathname, navigate, token, user])

  return (
    <>
      <IntroScissors show={showSplash} onDone={()=>setShowSplash(false)} />
      {!showSplash && (
        <Routes>
          {/* All routes under Shell with global header */}
          <Route element={<Shell />}> 
            <Route path="/" element={<LandingFull />} />
            <Route path="/start" element={<StartPage />} />
            <Route path="home" element={<Landing />} />
            <Route path="roles" element={<RoleSelect />} />
            <Route path="login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="register" element={<PublicRoute><Register /></PublicRoute>} />
            
            {/* Protected customer routes */}
            <Route path="customer" element={<ProtectedRoute allowedRoles={['customer']}><Customer /></ProtectedRoute>} />
            <Route path="salon/:id" element={<ProtectedRoute allowedRoles={['customer']}><SalonDetail /></ProtectedRoute>} />
            <Route path="onboarding" element={<ProtectedRoute allowedRoles={['customer']}><Onboarding /></ProtectedRoute>} />
            <Route path="dashboard" element={<ProtectedRoute allowedRoles={['customer']}><Dashboard /></ProtectedRoute>} />
            {/* Alias as requested */}
            <Route path="customer-dashboard" element={<ProtectedRoute allowedRoles={['customer']}><Dashboard /></ProtectedRoute>} />
            {/* New alias per requirement */}
            <Route path="customer/home" element={<ProtectedRoute allowedRoles={['customer']}><Dashboard /></ProtectedRoute>} />
            <Route path="book" element={<ProtectedRoute allowedRoles={['customer']}><Booking /></ProtectedRoute>} />
            
            {/* Protected vendor routes */}
            <Route path="vendor" element={<ProtectedRoute allowedRoles={['vendor']}><Vendor /></ProtectedRoute>} />
            {/* Alias as requested */}
            <Route path="vendor-dashboard" element={<ProtectedRoute allowedRoles={['vendor']}><Vendor /></ProtectedRoute>} />
            {/* New alias per requirement */}
            <Route path="vendor/home" element={<ProtectedRoute allowedRoles={['vendor']}><Vendor /></ProtectedRoute>} />
            <Route path="vendor-profile" element={<ProtectedRoute allowedRoles={['vendor']}><VendorProfile /></ProtectedRoute>} />
            
            {/* Protected admin routes */}
            <Route path="admin" element={<ProtectedRoute allowedRoles={['admin']}><Admin /></ProtectedRoute>} />
            {/* New alias per requirement */}
            <Route path="admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><Admin /></ProtectedRoute>} />
          </Route>
        </Routes>
      )}
    </>
  )
}

export default function App(){
  return (
    <BrowserRouter>
      <AuthProvider>
        <InnerApp />
      </AuthProvider>
    </BrowserRouter>
  )
}
