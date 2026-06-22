import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Copy, Check, ExternalLink, Download, User, Tag, Clock, Terminal, Monitor, Globe } from 'lucide-react'
import Header from '../components/Header'
import { TypeBadge, CategoryBadge } from '../components/Badge'
import MarkdownContent from '../components/MarkdownContent'
import ScreenshotGallery from '../components/ScreenshotGallery'
import { api } from '../api/client'
import { getCategoryMeta } from '../categoryConfig'
import type { Tool } from '../types'
const TYPE_ICON: Record<string, React.ReactNode> = {
  cli: <Terminal size={22} />, desktop: <Monitor size={22} />, webapp: <Globe size={22} />,
}

export default function ToolDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: tool, isLoading, isError } = useQuery<Tool>({
    queryKey: ['tools', id],
    queryFn: () => api.tools.get(id!),
    enabled: !!id,
  })

  if (isLoading) return <Shell><div style={{ padding: '60px 0', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--text-lo)', fontSize: '0.875rem' }}>loading…</div></Shell>
  if (isError || !tool) return <Shell><div style={{ padding: '60px 0', textAlign: 'center' }}><p style={{ color: 'var(--color-danger)', marginBottom: 16 }}>tool not found</p><button onClick={() => navigate(-1)} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>← go back</button></div></Shell>

  const { color: accent, icon: CategoryIcon } = getCategoryMeta(tool.category)

  return (
    <Shell>
      {/* Hero strip */}
      <div style={{ borderBottom: '1px solid var(--border)', padding: '32px 0 28px', background: `linear-gradient(180deg, ${accent}08 0%, transparent 100%)` }}>
        <div className="container">
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--text-mid)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', marginBottom: 24, textDecoration: 'none' }}>
            <ArrowLeft size={13} /> back
          </Link>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 'var(--r-lg)',
              background: `${accent}18`, border: `1px solid ${accent}35`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: accent, flexShrink: 0,
            }}>
              {TYPE_ICON[tool.type] ?? <Terminal size={22} />}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{tool.name}</h1>
                {tool.version && (
                  <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', padding: '2px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 100, color: 'var(--text-mid)' }}>
                    v{tool.version}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                <TypeBadge type={tool.type} />
                <CategoryBadge category={tool.category} />
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-mid)', maxWidth: 540 }}>{tool.shortDescription}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container" style={{ padding: '32px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32, alignItems: 'start' }}>

          <div>
            <PrimaryAction tool={tool} accent={accent} />

            {tool.screenshots.length > 0 && (
              <section style={{ marginTop: 36 }}>
                <SectionLabel>Screenshots</SectionLabel>
                <ScreenshotGallery screenshots={tool.screenshots} />
              </section>
            )}

            {tool.longDescription && (
              <section style={{ marginTop: 36 }}>
                <SectionLabel>About</SectionLabel>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '24px 28px' }}>
                  <MarkdownContent content={tool.longDescription} />
                </div>
              </section>
            )}

            {tool.type === 'desktop' && tool.installationInstructions && (
              <section style={{ marginTop: 36 }}>
                <SectionLabel>Installation</SectionLabel>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '24px 28px' }}>
                  <MarkdownContent content={tool.installationInstructions} />
                </div>
              </section>
            )}

            {tool.usageInstructions && (
              <section style={{ marginTop: 36 }}>
                <SectionLabel>Usage</SectionLabel>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '24px 28px' }}>
                  <MarkdownContent content={tool.usageInstructions} />
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
              <div style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-lo)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Details</span>
              </div>
              <div>
                <MetaRow icon={<User size={13} />}           label="Owner"    value={tool.owner} />
                <MetaRow icon={<Tag size={13} />}            label="Contact"  value={tool.ownerContact} />
                <MetaRow icon={<CategoryIcon size={13} />}  label="Category" value={tool.category} />
                {tool.version && <MetaRow icon={<Clock size={13} />} label="Version"  value={`v${tool.version}`} mono />}
                <MetaRow icon={<Clock size={13} />} label="Updated"  value={new Date(tool.updatedAt).toLocaleDateString()} />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: '100vh', background: 'var(--ground)' }}><Header />{children}</div>
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-lo)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>{children}</p>
}

function MetaRow({ icon, label, value, mono = false }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 10, padding: '10px 16px', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
      <span style={{ color: 'var(--text-lo)', marginTop: 2, flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-lo)', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-hi)', fontFamily: mono ? 'var(--font-mono)' : undefined, wordBreak: 'break-word' }}>{value}</div>
      </div>
    </div>
  )
}

function PrimaryAction({ tool, accent }: { tool: Tool; accent: string }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    if (tool.installCommand) {
      navigator.clipboard.writeText(tool.installCommand)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (tool.type === 'cli') {
    return (
      <div>
        <SectionLabel>Install</SectionLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#0A0D14', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '12px 16px', marginBottom: 12 }}>
          <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', flexShrink: 0 }}>$</span>
          <code style={{ flex: 1, color: '#C8D3E8', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', wordBreak: 'break-all' }}>
            {tool.installCommand ?? 'No install command set'}
          </code>
          <button onClick={copy} style={{
            background: copied ? 'var(--accent-dim)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${copied ? 'rgba(0,217,126,0.3)' : 'var(--border)'}`,
            borderRadius: 'var(--r-sm)', padding: '5px 10px',
            color: copied ? 'var(--accent)' : 'var(--text-mid)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)', transition: 'all 0.2s', whiteSpace: 'nowrap',
          }}>
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'copied' : 'copy'}
          </button>
        </div>
        {tool.repoUrl && (
          <a href={tool.repoUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>
            <ExternalLink size={13} /> view repository
          </a>
        )}
      </div>
    )
  }

  if (tool.type === 'desktop') {
    return (
      <a
        href={tool.downloadUrl ?? '#'}
        download={tool.installerFilename || true}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '10px 22px', background: accent, color: '#0A0D14',
          borderRadius: 'var(--r-md)', fontWeight: 700, fontSize: '0.875rem',
          textDecoration: 'none', opacity: tool.downloadUrl ? 1 : 0.4,
          pointerEvents: tool.downloadUrl ? 'auto' : 'none', fontFamily: 'var(--font-mono)',
        }}>
        <Download size={15} /> Download{tool.version ? ` v${tool.version}` : ''}
      </a>
    )
  }

  return (
    <a href={tool.launchUrl ?? '#'} target="_blank" rel="noopener noreferrer" style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '10px 22px', background: accent, color: '#0A0D14',
      borderRadius: 'var(--r-md)', fontWeight: 700, fontSize: '0.875rem',
      textDecoration: 'none', fontFamily: 'var(--font-mono)',
    }}>
      <ExternalLink size={15} /> Launch app
    </a>
  )
}
