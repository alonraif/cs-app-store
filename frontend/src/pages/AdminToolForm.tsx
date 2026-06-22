import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Upload, X, Loader } from 'lucide-react'
import Header from '../components/Header'
import { api } from '../api/client'
import { CATEGORIES, TYPE_LABELS } from '../types'
import type { Tool, ToolFormData, ToolType, Category } from '../types'

const EMPTY: ToolFormData = {
  name: '',
  shortDescription: '',
  longDescription: '',
  category: CATEGORIES[0],
  type: 'webapp',
  version: '',
  owner: '',
  ownerContact: '',
  screenshots: [],
  installCommand: '',
  repoUrl: '',
  downloadUrl: '',
  installerFilename: '',
  launchUrl: '',
  installationInstructions: '',
  usageInstructions: '',
}

export default function AdminToolForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [form, setForm] = useState<ToolFormData>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof ToolFormData, string>>>({})
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState<'screenshots' | 'installer' | null>(null)
  const screenshotRef = useRef<HTMLInputElement>(null)
  const installerRef = useRef<HTMLInputElement>(null)

  const { data: categoriesData = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: api.categories.list,
  })
  const categoryNames = categoriesData.length > 0 ? categoriesData.map(c => c.name) : CATEGORIES

  const { data: existingTool } = useQuery<Tool>({
    queryKey: ['tools', id],
    queryFn: () => api.tools.get(id!),
    enabled: isEdit,
  })

  useEffect(() => {
    if (!existingTool) return
    setForm({
      name: existingTool.name,
      shortDescription: existingTool.shortDescription,
      longDescription: existingTool.longDescription ?? '',
      category: existingTool.category,
      type: existingTool.type,
      version: existingTool.version ?? '',
      owner: existingTool.owner,
      ownerContact: existingTool.ownerContact,
      screenshots: existingTool.screenshots,
      installCommand: existingTool.installCommand ?? '',
      repoUrl: existingTool.repoUrl ?? '',
      downloadUrl: existingTool.downloadUrl ?? '',
      installerFilename: existingTool.installerFilename ?? '',
      launchUrl: existingTool.launchUrl ?? '',
      installationInstructions: existingTool.installationInstructions ?? '',
      usageInstructions: existingTool.usageInstructions ?? '',
    })
    setScreenshotPreviews(existingTool.screenshots)
  }, [existingTool])

  const saveMutation = useMutation({
    mutationFn: (data: ToolFormData) =>
      isEdit ? api.tools.update(id!, data) : api.tools.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tools'] })
      navigate('/admin')
    },
    onError: (err: Error) => {
      setErrors({ name: err.message })
    },
  })

  function set<K extends keyof ToolFormData>(key: K, value: ToolFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function validate(): boolean {
    const errs: typeof errors = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.shortDescription.trim()) errs.shortDescription = 'Short description is required'
    if (!form.category) errs.category = 'Category is required'
    if (!form.owner.trim()) errs.owner = 'Owner is required'
    if (!form.ownerContact.trim()) errs.ownerContact = 'Owner contact is required'
    if (form.type === 'cli' && !form.installCommand.trim())
      errs.installCommand = 'Install command is required for CLI tools'
    if (form.type === 'webapp' && !form.launchUrl.trim())
      errs.launchUrl = 'Launch URL is required for web apps'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    saveMutation.mutate(form)
  }

  async function handleScreenshotUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading('screenshots')
    try {
      const paths = await api.uploads.screenshots(files)
      setScreenshotPreviews((p) => [...p, ...paths])
      set('screenshots', [...form.screenshots, ...paths])
    } catch {
      alert('Screenshot upload failed')
    } finally {
      setUploading(null)
      if (screenshotRef.current) screenshotRef.current.value = ''
    }
  }

  async function handleInstallerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading('installer')
    try {
      const { path, originalName } = await api.uploads.installer(file)
      set('downloadUrl', path)
      set('installerFilename', originalName)
    } catch {
      alert('Installer upload failed')
    } finally {
      setUploading(null)
      if (installerRef.current) installerRef.current.value = ''
    }
  }

  function removeScreenshot(index: number) {
    setScreenshotPreviews((p) => p.filter((_, i) => i !== index))
    set('screenshots', form.screenshots.filter((_, i) => i !== index))
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Header />

      <div style={{ background: 'var(--color-admin-bg)', borderBottom: '1px solid var(--color-admin-border)', padding: '14px 0' }}>
        <div className="container">
          <h1 style={{ fontSize: '1rem', fontWeight: 600, color: '#f1f5f9', margin: 0 }}>
            {isEdit ? 'Edit Tool' : 'Add New Tool'}
          </h1>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px 80px', maxWidth: 760 }}>
        <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: 24, textDecoration: 'none' }}>
          <ArrowLeft size={15} /> Back to admin
        </Link>

        <form onSubmit={handleSubmit} noValidate>
          <Section title="Basic Info">
            <Field label="Tool name *" error={errors.name}>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. net-probe"
                style={inputStyle(!!errors.name)}
              />
            </Field>

            <Field label="Short description * (shown on card, max 200 chars)" error={errors.shortDescription}>
              <input
                type="text"
                value={form.shortDescription}
                onChange={(e) => set('shortDescription', e.target.value)}
                maxLength={200}
                style={inputStyle(!!errors.shortDescription)}
              />
            </Field>

            <Field label="Long description (Markdown supported)">
              <textarea
                value={form.longDescription}
                onChange={(e) => set('longDescription', e.target.value)}
                rows={10}
                style={{ ...inputStyle(false), resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
              />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Category *" error={errors.category}>
                <select
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                  style={inputStyle(!!errors.category)}
                >
                  {categoryNames.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>

              <Field label="Type *">
                <select
                  value={form.type}
                  onChange={(e) => set('type', e.target.value as ToolType)}
                  style={inputStyle(false)}
                >
                  {(Object.keys(TYPE_LABELS) as ToolType[]).map((t) => (
                    <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Usage instructions (Markdown — how to use this tool)">
              <textarea
                value={form.usageInstructions}
                onChange={(e) => set('usageInstructions', e.target.value)}
                rows={6}
                placeholder="Describe how to use this tool, common workflows, options, examples…"
                style={{ ...inputStyle(false), resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
              />
            </Field>

            {form.type === 'desktop' && (
              <Field label="Installation instructions (Markdown — for desktop apps)">
                <textarea
                  value={form.installationInstructions}
                  onChange={(e) => set('installationInstructions', e.target.value)}
                  rows={6}
                  placeholder="Step-by-step installation instructions, system requirements, post-install setup…"
                  style={{ ...inputStyle(false), resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
                />
              </Field>
            )}
          </Section>

          <Section title="Ownership">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Owner name *" error={errors.owner}>
                <input
                  type="text"
                  value={form.owner}
                  onChange={(e) => set('owner', e.target.value)}
                  placeholder="e.g. Yoav Ben-David"
                  style={inputStyle(!!errors.owner)}
                />
              </Field>

              <Field label="Owner contact *" error={errors.ownerContact}>
                <input
                  type="text"
                  value={form.ownerContact}
                  onChange={(e) => set('ownerContact', e.target.value)}
                  placeholder="@slack or email"
                  style={inputStyle(!!errors.ownerContact)}
                />
              </Field>
            </div>

            <Field label="Version">
              <input
                type="text"
                value={form.version}
                onChange={(e) => set('version', e.target.value)}
                placeholder="e.g. 1.2.3"
                style={{ ...inputStyle(false), maxWidth: 180 }}
              />
            </Field>
          </Section>

          {/* Type-specific fields */}
          {form.type === 'cli' && (
            <Section title="CLI Settings">
              <Field label="Install command *" error={errors.installCommand}>
                <input
                  type="text"
                  value={form.installCommand}
                  onChange={(e) => set('installCommand', e.target.value)}
                  placeholder="npm install -g @liveu/tool-name"
                  style={{ ...inputStyle(!!errors.installCommand), fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}
                />
              </Field>
              <Field label="Repository URL">
                <input
                  type="url"
                  value={form.repoUrl}
                  onChange={(e) => set('repoUrl', e.target.value)}
                  placeholder="https://github.com/..."
                  style={inputStyle(false)}
                />
              </Field>
            </Section>
          )}

          {form.type === 'desktop' && (
            <Section title="Desktop Settings">
              <Field label="Installer file">
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <input
                    type="url"
                    value={form.downloadUrl}
                    onChange={(e) => set('downloadUrl', e.target.value)}
                    placeholder="/uploads/installers/... or external URL"
                    style={{ ...inputStyle(false), flex: 1 }}
                  />
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>or</span>
                  <button
                    type="button"
                    onClick={() => installerRef.current?.click()}
                    disabled={uploading === 'installer'}
                    style={uploadBtnStyle}
                  >
                    {uploading === 'installer' ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={14} />}
                    Upload file
                  </button>
                  <input ref={installerRef} type="file" onChange={handleInstallerUpload} style={{ display: 'none' }} />
                </div>
                {form.downloadUrl && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-success)', marginTop: 6 }}>
                    ✓ {form.downloadUrl}
                  </p>
                )}
              </Field>
            </Section>
          )}

          {form.type === 'webapp' && (
            <Section title="Web App Settings">
              <Field label="Launch URL *" error={errors.launchUrl}>
                <input
                  type="url"
                  value={form.launchUrl}
                  onChange={(e) => set('launchUrl', e.target.value)}
                  placeholder="http://tool.cs.liveu.internal"
                  style={inputStyle(!!errors.launchUrl)}
                />
              </Field>
            </Section>
          )}

          {/* Screenshots */}
          <Section title="Screenshots">
            <div
              style={{ border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)', padding: '20px', textAlign: 'center', cursor: 'pointer', marginBottom: screenshotPreviews.length ? 16 : 0 }}
              onClick={() => screenshotRef.current?.click()}
            >
              {uploading === 'screenshots' ? (
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Uploading…</span>
              ) : (
                <>
                  <Upload size={20} style={{ margin: '0 auto 8px', display: 'block', color: 'var(--color-text-muted)' }} />
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    Click to upload screenshots (PNG, JPG, WebP — max 10 MB each)
                  </p>
                </>
              )}
            </div>
            <input ref={screenshotRef} type="file" accept="image/*" multiple onChange={handleScreenshotUpload} style={{ display: 'none' }} />

            {screenshotPreviews.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                {screenshotPreviews.map((src, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={src} alt="" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
                    <button
                      type="button"
                      onClick={() => removeScreenshot(i)}
                      style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Submit */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8 }}>
            <Link
              to="/admin"
              style={{ padding: '10px 20px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-secondary)', fontSize: '0.875rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              style={{ padding: '10px 24px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontWeight: 600, cursor: saveMutation.isPending ? 'not-allowed' : 'pointer', opacity: saveMutation.isPending ? 0.7 : 1, display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              {saveMutation.isPending && <Loader size={14} />}
              {isEdit ? 'Save changes' : 'Create tool'}
            </button>
          </div>

          {saveMutation.isError && (
            <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem', textAlign: 'right', marginTop: 8 }}>
              {(saveMutation.error as Error).message}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 20 }}>
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg)' }}>
        <h2 style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
          {title}
        </h2>
      </div>
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {children}
      </div>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
        {label}
      </label>
      {children}
      {error && <p style={{ fontSize: '0.78rem', color: 'var(--color-danger)', marginTop: 4 }}>{error}</p>}
    </div>
  )
}

function inputStyle(hasError: boolean): React.CSSProperties {
  return {
    width: '100%',
    padding: '9px 12px',
    border: `1.5px solid ${hasError ? 'var(--color-danger)' : 'var(--color-border)'}`,
    borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem',
    color: 'var(--color-text-primary)',
    background: 'var(--color-surface)',
    outline: 'none',
    transition: 'border-color 0.15s',
  }
}

const uploadBtnStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 14px', border: '1.5px solid var(--color-border)',
  borderRadius: 'var(--radius-md)', background: 'var(--color-surface)',
  fontSize: '0.82rem', color: 'var(--color-text-secondary)',
  cursor: 'pointer', whiteSpace: 'nowrap',
}
