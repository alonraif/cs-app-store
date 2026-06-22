import { useState, FormEvent } from 'react'
import { Lock } from 'lucide-react'
import { useAdminAuth } from '../hooks/useAdminAuth'

export default function AdminLogin() {
  const { login, loading, error } = useAdminAuth()
  const [password, setPassword] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await login(password)
    // AdminGuard re-renders automatically when isAuthenticated flips
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-admin-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 'var(--radius-xl)',
          padding: '40px 36px',
          width: '100%',
          maxWidth: 380,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'rgba(37,99,235,0.2)',
            border: '1px solid rgba(37,99,235,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}
        >
          <Lock size={20} color="#60a5fa" />
        </div>

        <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>
          Admin access
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 28 }}>
          Enter the admin password to continue.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            style={{
              width: '100%',
              padding: '10px 14px',
              background: '#0f172a',
              border: `1.5px solid ${error ? '#ef4444' : '#334155'}`,
              borderRadius: 'var(--radius-md)',
              color: '#f1f5f9',
              fontSize: '0.9rem',
              outline: 'none',
              marginBottom: error ? 8 : 16,
              boxSizing: 'border-box',
            }}
          />

          {error && (
            <p style={{ fontSize: '0.8rem', color: '#f87171', marginBottom: 12 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            style={{
              width: '100%',
              padding: '10px',
              background: 'var(--color-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: loading || !password ? 'not-allowed' : 'pointer',
              opacity: loading || !password ? 0.6 : 1,
            }}
          >
            {loading ? 'Checking…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
