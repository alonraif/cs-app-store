import { useState } from 'react'

interface Props {
  categories: string[]
  selected: string | null
  onChange: (cat: string | null) => void
}

export default function CategoryFilter({ categories, selected, onChange }: Props) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      <Chip label="All" active={!selected} onClick={() => onChange(null)} />
      {categories.map(cat => (
        <Chip key={cat} label={cat} active={selected === cat} onClick={() => onChange(cat === selected ? null : cat)} />
      ))}
    </div>
  )
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const on = active || hovered

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '4px 12px',
        borderRadius: 100,
        border: `1px solid ${on ? 'rgba(0,217,126,0.35)' : 'var(--border)'}`,
        background: on ? 'var(--accent-dim)' : 'transparent',
        color: on ? 'var(--accent)' : 'var(--text-mid)',
        fontSize: '0.75rem', fontWeight: active ? 600 : 400,
        fontFamily: active ? 'var(--font-mono)' : 'var(--font-sans)',
        cursor: 'pointer',
        transition: 'all 0.15s',
        letterSpacing: active ? '0.04em' : 'normal',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}
