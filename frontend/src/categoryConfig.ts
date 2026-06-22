import {
  Stethoscope,
  Eye,
  Bot,
  Network,
  Shield,
  GitBranch,
  FlaskConical,
  BarChart2,
  Tag,
  type LucideIcon,
} from 'lucide-react'

export interface CategoryMeta {
  icon: LucideIcon
  color: string
}

const CONFIG: Record<string, CategoryMeta> = {
  Diagnostics: { icon: Stethoscope,  color: '#FF8C42' },
  Monitoring:  { icon: Eye,          color: '#00D97E' },
  Automation:  { icon: Bot,          color: '#4D9FFF' },
  Networking:  { icon: Network,      color: '#00E5FF' },
  Security:    { icon: Shield,       color: '#FF4D6A' },
  DevOps:      { icon: GitBranch,    color: '#B84DFF' },
  QA:          { icon: FlaskConical, color: '#FFD93D' },
  Analytics:   { icon: BarChart2,    color: '#4DFFDB' },
}

const FALLBACK: CategoryMeta = { icon: Tag, color: '#5A6580' }

export function getCategoryMeta(category: string): CategoryMeta {
  return CONFIG[category] ?? FALLBACK
}
