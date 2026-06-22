import type { Tool, ToolFormData, Category } from '../types'

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? ''

function adminHeaders(): Record<string, string> {
  const token = sessionStorage.getItem('admin_token')
  return token ? { 'X-Admin-Token': token } : {}
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...adminHeaders(), ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`)
  }
  if (res.status === 204) return undefined as unknown as T
  return res.json() as Promise<T>
}

export const api = {
  tools: {
    list: () => request<Tool[]>('/api/tools'),
    get: (id: string) => request<Tool>(`/api/tools/${id}`),
    create: (data: ToolFormData) =>
      request<Tool>('/api/tools', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: ToolFormData) =>
      request<Tool>(`/api/tools/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/api/tools/${id}`, { method: 'DELETE' }),
  },
  categories: {
    list: () => request<Category[]>('/api/categories'),
    create: (name: string) =>
      request<Category>('/api/categories', { method: 'POST', body: JSON.stringify({ name }) }),
    delete: (id: string) =>
      request<void>(`/api/categories/${id}`, { method: 'DELETE' }),
  },
  uploads: {
    screenshots: async (files: File[]): Promise<string[]> => {
      const form = new FormData()
      files.forEach((f) => form.append('screenshots', f))
      const res = await fetch(`${BASE}/api/uploads/screenshots`, {
        method: 'POST',
        body: form,
        headers: adminHeaders(),
      })
      if (!res.ok) throw new Error('Upload failed')
      const data = (await res.json()) as { paths: string[] }
      return data.paths
    },
    installer: async (file: File): Promise<string> => {
      const form = new FormData()
      form.append('installer', file)
      const res = await fetch(`${BASE}/api/uploads/installer`, {
        method: 'POST',
        body: form,
        headers: adminHeaders(),
      })
      if (!res.ok) throw new Error('Upload failed')
      const data = (await res.json()) as { path: string }
      return data.path
    },
  },
}
