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
  createdAt: Date
  updatedAt: Date
}

export interface ApiError {
  error: string
  details?: unknown
}
