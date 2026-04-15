import type { ChildProfile, SprintContent } from '../types'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'
console.log('API_BASE:', BASE)

export async function getAllChildren(): Promise<ChildProfile[]> {
  const res = await fetch(`${BASE}/api/children`)
  if (!res.ok) throw new Error('Failed to fetch children')
  return res.json()
}

export async function createChild(child: {
  name: string
  age: number
  gender: string
  city: string
  interests: string[]
  active_subjects: string[]
}): Promise<ChildProfile> {
  const res = await fetch(`${BASE}/api/children`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(child),
  })
  if (!res.ok) throw new Error('Failed to create child')
  return res.json()
}

export async function getChild(id: string): Promise<ChildProfile> {
  const res = await fetch(`${BASE}/api/children/${id}`)
  if (!res.ok) throw new Error('Failed to fetch child')
  return res.json()
}

export async function updateInterests(id: string, interests: string[]): Promise<ChildProfile> {
  const res = await fetch(`${BASE}/api/children/${id}/interests`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ interests }),
  })
  if (!res.ok) throw new Error('Failed to update interests')
  return res.json()
}

export async function updateProgress(id: string, data: {
  total_xp: number
  streak_days: number
  sprint_count_today: number
  xp_multiplier: number
  weak_areas: string[]
  subject_last_seen: Record<string, string>
  recent_concepts: string[]
}): Promise<ChildProfile> {
  const res = await fetch(`${BASE}/api/children/${id}/progress`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update progress')
  return res.json()
}

export async function generateSprint(child: ChildProfile): Promise<{ sprint: SprintContent; sprint_id: string | null }> {
  const res = await fetch(`${BASE}/api/sprint/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ child }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `HTTP ${res.status}`)
  }
  const data = await res.json()
  return { sprint: data.sprint as SprintContent, sprint_id: data.sprint_id ?? null }
}

export async function submitAnswer(
  sprintId: string | null,
  data: {
    child_id: string
    subject: string
    concept: string
    question_id: number
    correct_on_first_attempt: boolean
    total_attempts: number
  }
): Promise<void> {
  const id = sprintId ?? 'null'
  await fetch(`${BASE}/api/sprint/${id}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).catch(() => {
    // Non-fatal — don't block the UI
  })
}

// localStorage — only for persisting active child ID across page reloads
export function getActiveChildId(): string | null {
  return localStorage.getItem('champions_active_child_id')
}

export function setActiveChildId(id: string): void {
  localStorage.setItem('champions_active_child_id', id)
}
