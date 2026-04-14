export type Subject =
  | 'math'
  | 'hebrew'
  | 'english'
  | 'torah'
  | 'finance'
  | 'ai_tech'
  | 'spatial'

export interface ChildProfile {
  id: string
  name: string
  age: number
  gender: string
  city: string
  interests: string[]
  active_subjects: Subject[]
  adhd_mode: boolean
  weak_areas: Subject[]
  subject_last_seen: Partial<Record<Subject, string>>
  recent_concepts: string[]
  total_xp: number
  streak_days: number
  streak_shields: number
  streak_last_active: string
  level: number
  sprint_count_today: number
  xp_multiplier: number
}

export interface Question {
  id: string
  difficulty: 'easy' | 'medium' | 'hard' | 'wildcard'
  text: string
  type: 'multiple_choice'
  options: string[]
  correct_index: number
  explanation: string
  xp_reward: number
}

export interface SprintContent {
  lesson: {
    subject: Subject
    concept: string
    icon: string
    title: string
    hook: string
    text: string
    passage?: string
    video_hook?: string
    imageKeyword?: string
    imageUrl?: string
  }
  questions: Question[]
  real_world_task: string
  metadata: {
    generated_at: string
    child_id: string
    difficulty: number
    sprint_number: number
  }
  field_task: string | null
}
