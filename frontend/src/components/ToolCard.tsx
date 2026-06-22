import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Terminal, Monitor, Globe } from 'lucide-react'
import type { Tool } from '../types'
import type { JSX } from 'react'
import { TypeBadge } from './Badge'

const CATEGORY_COLORS: Record<string, string> = {
  Diagnostics: '#FF8C42',
  Monitoring:  '#00D97E',
  Automation:  '#4D9FFF',
  Security:    '#FF4D6A',
  Networking:  '#00E5FF',
  DevOps:      '#B84DFF',
  QA:          '#FFD93D',
  Analytics:   '#4DFFDB',
}
function catColor(c: string) { return CATEGORY_COLORS[c] ?? '#5A6580' }

const TYPE_ICON: Record<string, JSX.Element> = {
  cli:     <Terminal size={16} />,
  desktop: <Monitor  size={16} />,
  webapp:  <Globe    size={16} />,
}

interface Props { tool: Tool; index: number }

export default function ToolCard({ tool, index }: Props) {
  const [hovered, setHovered] = useState(false)
  const accent = catColor(tool.category)

  return (
    <Link
      to={`/tools/${tool.id}`}
      className="animate-fadeInUp"
      style={{ textDecoration: 'none', display: 'block', animationDelay: `${index * 35}ms` }}
    >
      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
          transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
          boxShadow: hovered ? `0 8px 32px rgba(0,0,0,0.5), 0 -1px 0 0 ${accent}50` : '0 1px 3px rgba(0,0,0,0.3)',
          borderColor: hovered ? `${accent}40` : 'var(--border)',
        }}
      >
        {/* Category color stripe */}
        <div style={{ height: 3, background: accent, flexShrink: 0 }} />

        <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>

          {/* Icon + type badge */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--r-md)',
              background: `${accent}18`,
              border: `1px solid ${accent}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: accent, flexShrink: 0,
            }}>
              {TYPE_ICON[tool.type] ?? <Terminal size={16} />}
            </div>
            <TypeBadge type={tool.type} />
          </div>

          {/* Name + description */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-hi)', letterSpacing: '-0.01em' }}>
              {tool.name}
            </h3>
            <p style={{ fontSize: '0.79rem', color: 'var(--text-mid)', lineHeight: 1.55 }}>
              {tool.shortDescription.length > 110 ? tool.shortDescription.slice(0, 107) + '…' : tool.shortDescription}
            </p>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: accent, letterSpacing: '0.04em', fontFamily: 'var(--font-mono)' }}>
              {tool.category.toUpperCase()}
            </span>
            <span style={{
              fontSize: '0.75rem', fontFamily: 'var(--font-mono)',
              color: hovered ? accent : 'var(--text-lo)',
              transition: 'color 0.2s, transform 0.2s',
              display: 'inline-block',
              transform: hovered ? 'translateX(3px)' : 'translateX(0)',
            }}>
              —›
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
