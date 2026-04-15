export const LEVELS = [
  { level: 1, title: 'מתחיל', minXP: 0,     trophy: '🥉', color: '#CD7F32' },
  { level: 2, title: 'לוחם',  minXP: 200,   trophy: '🥈', color: '#C0C0C0' },
  { level: 3, title: 'גיבור', minXP: 500,   trophy: '🥇', color: '#FFD700' },
  { level: 4, title: 'אלוף',  minXP: 1000,  trophy: '🏆', color: '#FF6B35' },
  { level: 5, title: 'מאסטר', minXP: 2000,  trophy: '👑', color: '#9B59B6' },
  { level: 6, title: 'אגדה',  minXP: 5000,  trophy: '💎', color: '#00CED1' },
  { level: 7, title: 'מיתוס', minXP: 10000, trophy: '🌟', color: '#FF1493' },
]

export type Level = typeof LEVELS[0]

export function getLevel(totalXP: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].minXP) return LEVELS[i]
  }
  return LEVELS[0]
}

export function getNextLevel(totalXP: number): Level | null {
  const current = getLevel(totalXP)
  return LEVELS.find(l => l.level === current.level + 1) ?? null
}

export function getProgressToNext(totalXP: number): number {
  const current = getLevel(totalXP)
  const next = getNextLevel(totalXP)
  if (!next) return 100
  const range = next.minXP - current.minXP
  const earned = totalXP - current.minXP
  return Math.round((earned / range) * 100)
}
