import type { Analysis, FormatResult, Settings } from '../types'

const BASE = ((import.meta.env.VITE_API_URL as string | undefined) ?? '').replace(/\/$/, '')
export const MAX_BYTES = 20 * 1024 * 1024

export class ApiError extends Error {
  constructor(public code: string, message: string) { super(message) }
}

const NETWORK = 'Unable to connect to the formatting service. Please check your connection and try again.'

export function validateFile(file: File): string | null {
  if (!file.name.toLowerCase().endsWith('.docx')) return 'Only Microsoft Word .docx files are supported.'
  if (file.size > MAX_BYTES) return 'Your file is larger than the 20 MB limit.'
  if (file.size === 0) return 'Please upload a valid DOCX file.'
  return null
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, init)
  } catch {
    throw new ApiError('network', NETWORK)
  }
  if (res.ok) return res
  let message = 'Something went wrong while formatting your document. Please try again.'
  let code = 'processing_failed'
  try {
    const body = await res.json()
    if (body?.error?.message) { message = body.error.message; code = body.error.code }
  } catch {
    if (res.status === 413) message = 'Your file is larger than the 20 MB limit.'
    else if (res.status >= 502 && res.status <= 504) { message = NETWORK; code = 'network' }
  }
  throw new ApiError(code, message)
}

export async function analyze(file: File): Promise<Analysis> {
  const form = new FormData()
  form.append('file', file)
  return (await request('/api/analyze', { method: 'POST', body: form })).json()
}

export async function formatDocument(file: File, settings: Settings): Promise<FormatResult> {
  const form = new FormData()
  form.append('file', file)
  form.append('settings', JSON.stringify(settings))
  return (await request('/api/format', { method: 'POST', body: form })).json()
}

export async function downloadFile(fileId: string, name: string): Promise<Blob> {
  return (await request(`/api/download/${fileId}?name=${encodeURIComponent(name)}`)).blob()
}

export function discardFile(fileId: string): void {
  void fetch(`${BASE}/api/files/${fileId}`, { method: 'DELETE', keepalive: true }).catch(() => undefined)
}

export function saveBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}
