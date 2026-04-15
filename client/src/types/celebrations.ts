import type { Level } from '../data/levels'

export type CelebrationEvent =
  | { type: 'sprint_complete'; xp: number }
  | { type: 'streak_bonus'; xp: number; days: number }
  | { type: 'double_xp'; sessionXP: number; newTotal: number }
  | { type: 'level_up'; newLevel: Level }
