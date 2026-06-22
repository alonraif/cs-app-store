export type ToolType = 'cli' | 'desktop' | 'webapp'

export interface Tool {
  id: string
  name: string
  shortDescription: string
  longDescription: string
  category: string
  type: ToolType
  version: string | null
  owner: string
  ownerContact: string
  screenshots: string[]
  installCommand: string | null
  repoUrl: string | null
  downloadUrl: string | null
  launchUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface ToolFormData {
  name: string
  shortDescription: string
  longDescription: string
  category: string
  type: ToolType
  version: string
  owner: string
  ownerContact: string
  screenshots: string[]
  installCommand: string
  repoUrl: string
  downloadUrl: string
  launchUrl: string
}

export const CATEGORIES = [
  'Diagnostics',
  'Monitoring',
  'Automation',
  'Networking',
  'Security',
  'DevOps',
  'QA',
  'Analytics',
]

export const TYPE_LABELS: Record<ToolType, string> = {
  cli: 'CLI',
  desktop: 'Desktop',
  webapp: 'Web App',
}
