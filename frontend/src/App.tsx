import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import StorefrontHome from './pages/StorefrontHome'
import ToolDetail from './pages/ToolDetail'
import AdminDashboard from './pages/AdminDashboard'
import AdminToolForm from './pages/AdminToolForm'
import AdminLogin from './pages/AdminLogin'
import { AdminAuthProvider, useAdminAuth } from './hooks/useAdminAuth'

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAdminAuth()
  if (!isAuthenticated) return <AdminLogin />
  return <>{children}</>
}

export default function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<StorefrontHome />} />
          <Route path="/tools/:id" element={<ToolDetail />} />
          <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
          <Route path="/admin/new" element={<AdminGuard><AdminToolForm /></AdminGuard>} />
          <Route path="/admin/edit/:id" element={<AdminGuard><AdminToolForm /></AdminGuard>} />
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  )
}
