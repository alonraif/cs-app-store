import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, AlertTriangle, LogOut, Tag, X, Download, Upload, CheckCircle } from 'lucide-react'
import Header from '../components/Header'
import { TypeBadge, CategoryBadge } from '../components/Badge'
import { api } from '../api/client'
import { useAdminAuth } from '../hooks/useAdminAuth'
import type { Tool, Category } from '../types'

interface ImportPreview {
  tools: number
  categories: number
  raw: unknown
}

export default function AdminDashboard() {
  const qc = useQueryClient()
  const { logout } = useAdminAuth()
  const importInputRef = useRef<HTMLInputElement>(null)

  const [confirmDelete, setConfirmDelete] = useState<Tool | null>(null)
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null)
  const [importSuccess, setImportSuccess] = useState<{ tools: number; categories: number } | null>(null)
  const [newCategory, setNewCategory] = useState('')
  const [catError, setCatError] = useState('')

  const { data: tools = [], isLoading } = useQuery<Tool[]>({
    queryKey: ['tools'],
    queryFn: api.tools.list,
  })

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: api.categories.list,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.tools.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tools'] })
      setConfirmDelete(null)
    },
  })

  const addCategoryMutation = useMutation({
    mutationFn: (name: string) => api.categories.create(name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      setNewCategory('')
      setCatError('')
    },
    onError: (err: Error) => {
      setCatError(err.message.includes('Unique') ? 'Category already exists' : err.message)
    },
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => api.categories.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })

  const importMutation = useMutation({
    mutationFn: (data: unknown) => api.admin.import(data),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['tools'] })
      qc.invalidateQueries({ queryKey: ['categories'] })
      setImportPreview(null)
      setImportSuccess(result.imported)
      setTimeout(() => setImportSuccess(null), 5000)
    },
  })

  function handleAddCategory(e: React.FormEvent) {
    e.preventDefault()
    const name = newCategory.trim()
    if (!name) { setCatError('Enter a category name'); return }
    addCategoryMutation.mutate(name)
  }

  async function handleExport() {
    const token = sessionStorage.getItem('admin_token')
    const res = await fetch('/api/admin/export', {
      headers: token ? { 'X-Admin-Token': token } : {},
    })
    if (!res.ok) { alert('Export failed'); return }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cs-app-store-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const raw = JSON.parse(ev.target?.result as string)
        setImportPreview({
          tools: Array.isArray(raw.tools) ? raw.tools.length : 0,
          categories: Array.isArray(raw.categories) ? raw.categories.length : 0,
          raw,
        })
      } catch {
        alert('Could not parse file — make sure it is a valid CS App Store export.')
      }
    }
    reader.readAsText(file)
  }

  const toolCountByCategory = tools.reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] ?? 0) + 1
    return acc
  }, {})

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Header />

      {/* Admin header bar */}
      <div style={{ background: 'var(--color-admin-bg)', borderBottom: '1px solid var(--color-admin-border)', padding: '14px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '1rem', fontWeight: 600, color: '#f1f5f9', margin: 0 }}>
              Admin — Tool Management
            </h1>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
              {tools.length} tool{tools.length !== 1 ? 's' : ''} · {categories.length} categories
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={handleExport}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 12px', background: 'transparent', color: '#94a3b8',
                border: '1px solid #334155', borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem', cursor: 'pointer',
              }}
            >
              <Download size={13} /> Export
            </button>
            <button
              onClick={() => importInputRef.current?.click()}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 12px', background: 'transparent', color: '#94a3b8',
                border: '1px solid #334155', borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem', cursor: 'pointer',
              }}
            >
              <Upload size={13} /> Import
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImportFile}
              style={{ display: 'none' }}
            />
            <button
              onClick={logout}
              title="Sign out"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 12px', background: 'transparent', color: '#64748b',
                border: '1px solid #334155', borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem', cursor: 'pointer',
              }}
            >
              <LogOut size={14} />
            </button>
            <Link
              to="/admin/new"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', background: 'var(--color-primary)',
                color: '#fff', borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none',
              }}
            >
              <Plus size={15} /> Add tool
            </Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '24px 24px 60px' }}>

        {/* Import success banner */}
        {importSuccess && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px', marginBottom: 20,
            background: 'rgba(0,217,126,0.08)', border: '1px solid rgba(0,217,126,0.25)',
            borderRadius: 'var(--radius-md)',
          }}>
            <CheckCircle size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              Imported <strong>{importSuccess.tools}</strong> tool{importSuccess.tools !== 1 ? 's' : ''} and <strong>{importSuccess.categories}</strong> categor{importSuccess.categories !== 1 ? 'ies' : 'y'} successfully.
            </span>
          </div>
        )}

        {/* Tools table */}
        {isLoading ? (
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Loading…</div>
        ) : tools.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg)' }}>
                  {['Name', 'Category', 'Type', 'Version', 'Owner', ''].map((h) => (
                    <th key={h} style={{
                      padding: '10px 16px', textAlign: 'left',
                      fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-muted)',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      borderBottom: '1px solid var(--color-border)', whiteSpace: 'nowrap',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tools.map((tool, i) => (
                  <tr key={tool.id} style={{ borderBottom: i < tools.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
                        {tool.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '5px 10px', border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-sm)', fontSize: '0.78rem',
                            color: 'var(--color-text-secondary)', textDecoration: 'none',
                            background: 'var(--color-surface)',
                          }}
                        >
                          <Pencil size={12} /> Edit
                        </Link>
                        <button
                          onClick={() => setConfirmDelete(tool)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '5px 10px', border: '1px solid #fecaca',
                            borderRadius: 'var(--radius-sm)', fontSize: '0.78rem',
                            color: 'var(--color-danger)', background: 'var(--color-danger-light)',
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

        {/* ── Category Management ───────────────────────────────── */}
        <div style={{ marginTop: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Tag size={14} style={{ color: 'var(--color-text-muted)' }} />
            <h2 style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              Category Management
            </h2>
          </div>

          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg)' }}>
              <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="text"
                  value={newCategory}
                  onChange={e => { setNewCategory(e.target.value); setCatError('') }}
                  placeholder="New category name…"
                  maxLength={60}
                  style={{
                    flex: 1, maxWidth: 280,
                    padding: '8px 12px',
                    border: `1.5px solid ${catError ? 'var(--color-danger)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem', color: 'var(--color-text-primary)',
                    background: 'var(--color-surface)', outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  disabled={addCategoryMutation.isPending}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '8px 16px', background: 'var(--color-primary)',
                    color: '#fff', border: 'none', borderRadius: 'var(--radius-md)',
                    fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                    opacity: addCategoryMutation.isPending ? 0.7 : 1,
                  }}
                >
                  <Plus size={13} /> Add category
                </button>
                {catError && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-danger)' }}>{catError}</span>
                )}
              </form>
            </div>

            {categories.length === 0 ? (
              <div style={{ padding: '24px 20px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                No categories yet. Add one above.
              </div>
            ) : (
              <div>
                {categories.map((cat, i) => {
                  const count = toolCountByCategory[cat.name] ?? 0
                  return (
                    <div
                      key={cat.id}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '11px 20px',
                        borderBottom: i < categories.length - 1 ? '1px solid var(--color-border)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                          {cat.name}
                        </span>
                        <span style={{
                          fontSize: '0.72rem', fontFamily: 'var(--font-mono)',
                          padding: '2px 8px', borderRadius: 100,
                          background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                          color: 'var(--color-text-muted)',
                        }}>
                          {count} {count === 1 ? 'tool' : 'tools'}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteCategoryMutation.mutate(cat.id)}
                        disabled={deleteCategoryMutation.isPending}
                        title="Remove category"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '4px 10px',
                          border: '1px solid #fecaca', borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem', color: 'var(--color-danger)',
                          background: 'var(--color-danger-light)', cursor: 'pointer',
                          opacity: deleteCategoryMutation.isPending ? 0.5 : 1,
                        }}
                      >
                        <X size={11} /> Remove
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          <p style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Removing a category does not delete tools assigned to it.
          </p>
        </div>
      </div>

      {/* ── Delete tool modal ──────────────────────────────────── */}
      {confirmDelete && (
        <Modal onClose={() => setConfirmDelete(null)}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-danger-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
            <ModalBtn onClick={() => setConfirmDelete(null)}>Cancel</ModalBtn>
            <button
              onClick={() => deleteMutation.mutate(confirmDelete.id)}
              disabled={deleteMutation.isPending}
              style={{ padding: '8px 16px', border: 'none', borderRadius: 'var(--radius-md)', background: 'var(--color-danger)', color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: deleteMutation.isPending ? 'not-allowed' : 'pointer', opacity: deleteMutation.isPending ? 0.7 : 1 }}
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Yes, delete'}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Import confirm modal ───────────────────────────────── */}
      {importPreview && (
        <Modal onClose={() => setImportPreview(null)}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(77,159,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Upload size={17} color="#4D9FFF" />
            </div>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 6 }}>Import store data?</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.55, marginBottom: 12 }}>
                This will <strong>replace all existing tools and categories</strong> with the contents of the import file. This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <StatChip label="Tools" value={importPreview.tools} />
                <StatChip label="Categories" value={importPreview.categories} />
              </div>
            </div>
          </div>
          {importMutation.isError && (
            <p style={{ fontSize: '0.82rem', color: 'var(--color-danger)', marginBottom: 12 }}>
              {(importMutation.error as Error).message}
            </p>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <ModalBtn onClick={() => setImportPreview(null)}>Cancel</ModalBtn>
            <button
              onClick={() => importMutation.mutate(importPreview.raw)}
              disabled={importMutation.isPending}
              style={{ padding: '8px 16px', border: 'none', borderRadius: 'var(--radius-md)', background: '#4D9FFF', color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: importMutation.isPending ? 'not-allowed' : 'pointer', opacity: importMutation.isPending ? 0.7 : 1 }}
            >
              {importMutation.isPending ? 'Importing…' : 'Replace & import'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: '28px 32px', maxWidth: 440, width: '90%', boxShadow: 'var(--shadow-lg)' }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

function ModalBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ padding: '8px 16px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-surface)', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
    >
      {children}
    </button>
  )
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ padding: '6px 14px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
      <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>{value}</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>No tools yet.</p>
      <Link to="/admin/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: 'var(--color-primary)', color: '#fff', borderRadius: 'var(--radius-md)', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}>
        <Plus size={15} /> Add your first tool
      </Link>
    </div>
  )
}
