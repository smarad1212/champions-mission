import { ChildProfile, CurriculumSlot, Subject } from "../types";
import { pool } from "../lib/db";
import { pickConcept } from "../data/concepts";

interface SubjectPerformance {
  subject: string;
  total_questions: number;
  first_attempt_correct: number;
  error_rate: number;
  current_difficulty: number;
  concepts_seen: string[];
  concepts_failed: string[];
  concepts_mastered: string[];
}

async function getSubjectPerformances(childId: string): Promise<SubjectPerformance[]> {
  if (!childId || childId === "test-yonatan") return [];
  try {
    const { rows } = await pool.query(
      "SELECT * FROM subject_performance WHERE child_id = $1",
      [childId]
    );
    return rows as SubjectPerformance[];
  } catch {
    return [];
  }
}

function daysSince(dateStr: string | undefined): number {
  if (!dateStr) return 999;
  const last = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
}

function getMaxDifficulty(age: number): number {
  if (age <= 8) return 2;
  if (age <= 10) return 3;
  return 4;
}

function buildSlot(
  subject: Subject,
  perf: SubjectPerformance | undefined,
  reason: string,
  sprintCountToday: number,
  age: number
): CurriculumSlot {
  const maxDiff = getMaxDifficulty(age);
  const baseDiff = perf?.current_difficulty ?? 2;
  const difficulty = Math.min(baseDiff, maxDiff) as 1 | 2 | 3 | 4;

  const concept = pickConcept(
    subject,
    perf?.concepts_seen ?? [],
    perf?.concepts_failed ?? []
  );

  return {
    subject,
    concept,
    difficulty,
    sprint_number_today: sprintCountToday + 1,
    reason,
  };
}

export async function pickNextSubject(child: ChildProfile): Promise<CurriculumSlot> {
  const {
    active_subjects,
    subject_last_seen = {},
    age,
    sprint_count_today = 0,
  } = child;

  const performances = await getSubjectPerformances(child.id);
  const perfMap = new Map(performances.map(p => [p.subject, p]));

  // Rule 1: never repeat last subject
  // Determine last subject from subject_last_seen (most recently seen)
  let lastSubject: string | null = null;
  let mostRecent = -1;
  for (const s of active_subjects) {
    const seen = (subject_last_seen as Record<string, string>)[s];
    if (seen) {
      const d = new Date(seen).getTime();
      if (d > mostRecent) { mostRecent = d; lastSubject = s; }
    }
  }
  const candidates = active_subjects.filter(s => s !== lastSubject);

  // Rule 2: force any subject unseen 7+ days
  const overdue = candidates.filter(s => {
    const lastSeen = (subject_last_seen as Record<string, string>)[s];
    return daysSince(lastSeen) >= 7;
  });
  if (overdue.length > 0) {
    const subject = overdue[Math.floor(Math.random() * overdue.length)];
    return buildSlot(subject as Subject, perfMap.get(subject), `לא נראה ${subject} כבר 7 ימים+`, sprint_count_today, age);
  }

  // Rule 3: weighted random — higher error_rate = more likely to be picked
  const weighted: Subject[] = [];
  for (const s of candidates) {
    const perf = perfMap.get(s);
    const errorRate = perf?.error_rate ?? 0;
    const weight =
      errorRate > 0.5 ? 4 :  // struggling badly
      errorRate > 0.3 ? 3 :  // needs help
      errorRate > 0.1 ? 2 :  // some issues
      1;                      // doing fine
    for (let i = 0; i < weight; i++) weighted.push(s as Subject);
  }

  const pool_subjects = weighted.length > 0 ? weighted : (candidates as Subject[]);
  const picked = pool_subjects[Math.floor(Math.random() * pool_subjects.length)];
  const perf = perfMap.get(picked);
  const errorRate = perf?.error_rate ?? 0;
  const reason = errorRate > 0.3
    ? `שיעור שגיאה גבוה (${Math.round(errorRate * 100)}%) — ${picked} מקבל עדיפות`
    : 'בחירה מאוזנת';

  return buildSlot(picked, perf, reason, sprint_count_today, age);
}
