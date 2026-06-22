import { useState, useMemo, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import Header from '../components/Header'
import ToolCard from '../components/ToolCard'
import CategoryFilter from '../components/CategoryFilter'
import { api } from '../api/client'
import type { Tool } from '../types'

// ─── Waveform background ────────────────────────────────────────
function AnimatedWaveform() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let animId: number
    let frame = 0
    const c = canvas  // stable reference for closure

    function resize() {
      c.width  = c.offsetWidth
      c.height = c.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const waves = [
      { amp: 32, freq: 2.6, phase: 0,    opacity: 0.10 },
      { amp: 18, freq: 5.1, phase: 0.8,  opacity: 0.06 },
      { amp: 9,  freq: 9.4, phase: 1.7,  opacity: 0.04 },
    ]

    function draw() {
      const w = c.width, h = c.height
      ctx.clearRect(0, 0, w, h)
      for (const wave of waves) {
        ctx.beginPath()
        ctx.strokeStyle = `rgba(0,217,126,${wave.opacity})`
        ctx.lineWidth = 1.5
        for (let x = 0; x <= w; x++) {
          const y = h * 0.55 + Math.sin((x / w * wave.freq + frame * 0.006 + wave.phase) * Math.PI * 2) * wave.amp
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
      frame++
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  )
}

// ─── Terminal search input ──────────────────────────────────────
function TerminalSearch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 0,
      background: 'rgba(24,28,36,0.9)',
      border: `1px solid ${focused ? 'rgba(0,217,126,0.5)' : 'rgba(37,44,59,0.8)'}`,
      borderRadius: 'var(--r-lg)',
      maxWidth: 560,
      transition: 'border-color 0.2s, box-shadow 0.2s',
      boxShadow: focused ? '0 0 0 3px rgba(0,217,126,0.08)' : 'none',
      backdropFilter: 'blur(8px)',
      overflow: 'hidden',
    }}>
      {/* prompt prefix */}
      <span style={{
        padding: '11px 0 11px 16px',
        fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 700,
        color: 'var(--accent)',
        userSelect: 'none', flexShrink: 0,
      }}>
        &gt;
      </span>
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="search tools_"
        style={{
          flex: 1, padding: '11px 16px 11px 8px',
          background: 'none', border: 'none', outline: 'none',
          color: 'var(--text-hi)',
          fontFamily: 'var(--font-mono)', fontSize: '0.875rem',
          caretColor: 'var(--accent)',
        }}
      />
    </div>
  )
}

// ─── Skeleton card ──────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', overflow: 'hidden', height: 188 }}>
      <div style={{ height: 3, background: 'var(--border)' }} />
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 'var(--r-md)' }} />
        <div className="skeleton" style={{ height: 13, width: '55%' }} />
        <div className="skeleton" style={{ height: 10, width: '90%' }} />
        <div className="skeleton" style={{ height: 10, width: '70%' }} />
      </div>
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────
export default function StorefrontHome() {
  const [query, setQuery]       = useState('')
  const [category, setCategory] = useState<string | null>(null)

  const { data: tools = [], isLoading, isError } = useQuery<Tool[]>({
    queryKey: ['tools'],
    queryFn: api.tools.list,
  })

  const categories = useMemo(() => [...new Set(tools.map(t => t.category))].sort(), [tools])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return tools.filter(t =>
      (!q || t.name.toLowerCase().includes(q) || t.shortDescription.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)) &&
      (!category || t.category === category)
    )
  }, [tools, query, category])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ground)' }}>
      <Header />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '52px 0 48px', borderBottom: '1px solid var(--border)' }}>
        <AnimatedWaveform />

        {/* subtle radial glow behind text */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 60% 80% at 50% 100%, rgba(0,217,126,0.04) 0%, transparent 70%)',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', boxShadow: '0 0 6px var(--accent)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-mid)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              LiveU · Customer Success
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            fontWeight: 700,
            color: 'var(--text-hi)',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: 12,
          }}>
            Tool Library
          </h1>

          <p style={{ color: 'var(--text-mid)', fontSize: '0.9rem', marginBottom: 28, maxWidth: 420 }}>
            Internal tools built for field diagnostics, stream monitoring, and lab automation.
          </p>

          <TerminalSearch value={query} onChange={setQuery} />
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────── */}
      <div className="container" style={{ padding: '28px 24px 72px' }}>

        {/* Category filter */}
        {categories.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <CategoryFilter categories={categories} selected={category} onChange={setCategory} />
          </div>
        )}

        {/* Count */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-lo)' }}>
            {isLoading ? '…' : `${filtered.length} tool${filtered.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        {isError && (
          <div style={{ padding: '14px 18px', background: 'rgba(255,77,106,0.1)', border: '1px solid rgba(255,77,106,0.25)', borderRadius: 'var(--r-md)', color: 'var(--color-danger)', fontSize: '0.875rem' }}>
            Backend unreachable. Is the API running?
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-lo)', fontSize: '0.875rem' }}>no results — try a different filter</p>
          </div>
        )}

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 14 }}>
          {isLoading
            ? Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
            : filtered.map((tool, i) => <ToolCard key={tool.id} tool={tool} index={i} />)
          }
        </div>
      </div>
    </div>
  )
}
