import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutGrid, Settings } from 'lucide-react'

export default function Header() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')

  return (
    <header style={{
      background: 'rgba(17,19,24,0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>

        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-hi)', textDecoration: 'none' }}>
          <div style={{
            width: 26, height: 26,
            background: 'var(--accent)',
            borderRadius: 5,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ color: '#0A0D14', fontSize: '0.7rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>LU</span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.82rem', letterSpacing: '0.04em', color: 'var(--text-mid)' }}>
            CS APP STORE
          </span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <NavLink to="/"      active={!isAdmin} icon={<LayoutGrid size={14} />} label="Browse"  />
          <NavLink to="/admin" active={isAdmin}  icon={<Settings   size={14} />} label="Admin"   />
        </nav>
      </div>
    </header>
  )
}

function NavLink({ to, active, icon, label }: { to: string; active: boolean; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to} style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '5px 12px',
      borderRadius: 'var(--r-md)',
      fontSize: '0.8rem', fontWeight: 500,
      color: active ? 'var(--accent)' : 'var(--text-mid)',
      background: active ? 'var(--accent-dim)' : 'transparent',
      textDecoration: 'none',
      transition: 'color 0.15s, background 0.15s',
      border: active ? '1px solid rgba(0,217,126,0.2)' : '1px solid transparent',
    }}>
      {icon}{label}
    </Link>
  )
}
