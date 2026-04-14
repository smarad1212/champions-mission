export type Subject =
  | "math"
  | "hebrew"
  | "english"
  | "torah"
  | "finance"
  | "ai_tech"
  | "spatial";

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  city: string;
  interests: string[];
  active_subjects: Subject[];
  adhd_mode: boolean;
  weak_areas: Subject[];
  subject_last_seen: Partial<Record<Subject, string>>; // ISO date string
  recent_concepts: string[];
  total_xp: number;
  streak_days: number;
  streak_shields: number;
  streak_last_active: string; // ISO date string
  level: number;
  sprint_count_today: number;
  xp_multiplier: number;
}

export interface CurriculumSlot {
  subject: Subject;
  concept: string;
  difficulty: 1 | 2 | 3 | 4;
  sprint_number_today: number;
  reason: string;
}

export interface Question {
  id: string;
  difficulty: "easy" | "medium" | "hard" | "wildcard";
  text: string;
  type: "multiple_choice";
  options: string[];
  correct_index: number;
  explanation: string;
  xp_reward: number;
}

export interface SprintContent {
  lesson: {
    subject: Subject;
    concept: string;
    icon: string;
    title: string;
    hook: string;
    text: string;
    passage?: string;
    video_hook?: string;
    imageKeyword?: string;
    imageUrl?: string;
  };
  questions: Question[];
  real_world_task: string | { text: string; xp_reward: number };
  metadata: {
    generated_at: string;
    child_id: string;
    difficulty: number;
    sprint_number: number;
    estimated_seconds?: number;
    tone_used?: string;
    interests_referenced?: string[];
  };
}

export interface DailyState {
  id: string;
  child_id: string;
  date: string; // ISO date string
  sprints_completed: number;
  field_task: {
    task: string;
    subject: Subject;
    completed: boolean;
  } | null;
}
