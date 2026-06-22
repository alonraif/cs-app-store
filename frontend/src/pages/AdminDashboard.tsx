import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, AlertTriangle, LogOut } from 'lucide-react'
import Header from '../components/Header'
import { TypeBadge, CategoryBadge } from '../components/Badge'
import { api } from '../api/client'
import { useAdminAuth } from '../hooks/useAdminAuth'
import type { Tool } from '../types'

export default function AdminDashboard() {
  const qc = useQueryClient()
  const { logout } = useAdminAuth()
  const [confirmDelete, setConfirmDelete] = useState<Tool | null>(null)

  const { data: tools = [], isLoading } = useQuery<Tool[]>({
    queryKey: ['tools'],
    queryFn: api.tools.list,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.tools.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tools'] })
      setConfirmDelete(null)
    },
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Header />

      {/* Admin header bar */}
      <div
        style={{
          background: 'var(--color-admin-bg)',
          borderBottom: '1px solid var(--color-admin-border)',
          padding: '14px 0',
        }}
      >
        <div
          className="container"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div>
            <h1 style={{ fontSize: '1rem', fontWeight: 600, color: '#f1f5f9', margin: 0 }}>
              Admin — Tool Management
            </h1>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
              {tools.length} tool{tools.length !== 1 ? 's' : ''} in the store
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={logout}
            title="Sign out"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              background: 'transparent',
              color: '#64748b',
              border: '1px solid #334155',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <LogOut size={14} /> Sign out
          </button>
          <Link
            to="/admin/new"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              background: 'var(--color-primary)',
              color: '#fff',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <Plus size={15} /> Add tool
          </Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px 60px' }}>
        {isLoading ? (
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Loading…</div>
        ) : tools.length === 0 ? (
          <EmptyState />
        ) : (
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg)' }}>
                  {['Name', 'Category', 'Type', 'Version', 'Owner', ''].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '10px 16px',
                        textAlign: 'left',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: 'var(--color-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: '1px solid var(--color-border)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tools.map((tool, i) => (
                  <tr
                    key={tool.id}
                    style={{
                      borderBottom: i < tools.length - 1 ? '1px solid var(--color-border)' : 'none',
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
                        {tool.name}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--color-text-muted)',
                          maxWidth: 260,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {tool.shortDescription}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <CategoryBadge category={tool.category} />
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <TypeBadge type={tool.type} />
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {tool.version ?? '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                      {tool.owner}
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <Link
                          to={`/admin/edit/${tool.id}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '5px 10px',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.78rem',
                            color: 'var(--color-text-secondary)',
                            textDecoration: 'none',
                            background: 'var(--color-surface)',
                          }}
                        >
                          <Pencil size={12} /> Edit
                        </Link>
                        <button
                          onClick={() => setConfirmDelete(tool)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '5px 10px',
                            border: '1px solid #fecaca',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.78rem',
                            color: 'var(--color-danger)',
                            background: 'var(--color-danger-light)',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setConfirmDelete(null)}
        >
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: '28px 32px',
              maxWidth: 420,
              width: '90%',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'var(--color-danger-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={18} color="var(--color-danger)" />
              </div>
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 6 }}>Delete tool?</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  <strong>{confirmDelete.name}</strong> will be permanently removed. This cannot be undone.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmDelete(null)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(confirmDelete.id)}
                disabled={deleteMutation.isPending}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-danger)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: deleteMutation.isPending ? 'not-allowed' : 'pointer',
                  opacity: deleteMutation.isPending ? 0.7 : 1,
                }}
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>No tools yet.</p>
      <Link
        to="/admin/new"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '10px 20px',
          background: 'var(--color-primary)',
          color: '#fff',
          borderRadius: 'var(--radius-md)',
          fontWeight: 600,
          textDecoration: 'none',
          fontSize: '0.9rem',
        }}
      >
        <Plus size={15} /> Add your first tool
      </Link>
    </div>
  )
}
