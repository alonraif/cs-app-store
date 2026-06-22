import { useState } from 'react'
import { LayoutGrid } from 'lucide-react'
import { getCategoryMeta } from '../categoryConfig'

interface Props {
  categories: string[]
  selected: string | null
  onChange: (cat: string | null) => void
}

export default function CategoryFilter({ categories, selected, onChange }: Props) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      <Chip label="All" active={!selected} onClick={() => onChange(null)} isAll />
      {categories.map(cat => (
        <Chip key={cat} label={cat} active={selected === cat} onClick={() => onChange(cat === selected ? null : cat)} />
      ))}
    </div>
  )
}

function Chip({
  label,
  active,
  onClick,
  isAll = false,
}: {
  label: string
  active: boolean
  onClick: () => void
  isAll?: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const on = active || hovered
  const { icon: Icon, color } = isAll ? { icon: LayoutGrid, color: 'var(--accent)' } : getCategoryMeta(label)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '4px 12px',
        borderRadius: 100,
        border: `1px solid ${on ? (isAll ? 'rgba(0,217,126,0.35)' : `${color}45`) : 'var(--border)'}`,
        background: on ? (isAll ? 'var(--accent-dim)' : `${color}14`) : 'transparent',
        color: on ? (isAll ? 'var(--accent)' : color) : 'var(--text-mid)',
        fontSize: '0.75rem', fontWeight: active ? 600 : 400,
        fontFamily: active ? 'var(--font-mono)' : 'var(--font-sans)',
        cursor: 'pointer',
        transition: 'all 0.15s',
        letterSpacing: active ? '0.04em' : 'normal',
        whiteSpace: 'nowrap',
      }}
    >
      <Icon size={12} strokeWidth={on ? 2.2 : 1.8} />
      {label}
    </button>
  )
}
