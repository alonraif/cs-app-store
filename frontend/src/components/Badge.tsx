import type { ToolType } from '../types'

const TYPE_CONFIG: Record<ToolType, { label: string; bg: string; text: string; border: string }> = {
  cli:     { label: 'CLI',     bg: 'var(--badge-cli-bg)',     text: 'var(--badge-cli-text)',     border: 'var(--badge-cli-border)'     },
  desktop: { label: 'Desktop', bg: 'var(--badge-desktop-bg)', text: 'var(--badge-desktop-text)', border: 'var(--badge-desktop-border)' },
  webapp:  { label: 'Web App', bg: 'var(--badge-webapp-bg)',  text: 'var(--badge-webapp-text)',  border: 'var(--badge-webapp-border)'  },
}

export function TypeBadge({ type }: { type: ToolType }) {
  const c = TYPE_CONFIG[type]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 8px',
      borderRadius: 'var(--r-sm)',
      fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
      fontFamily: 'var(--font-mono)',
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.text, flexShrink: 0 }} />
      {c.label}
    </span>
  )
}

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 8px',
      borderRadius: 'var(--r-sm)',
      fontSize: '0.68rem', fontWeight: 500,
      background: 'var(--badge-cat-bg)', color: 'var(--badge-cat-text)', border: '1px solid var(--badge-cat-border)',
    }}>
      {category}
    </span>
  )
}
