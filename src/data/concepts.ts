export const SUBJECT_CONCEPTS: Record<string, string[]> = {
  math: [
    'חיבור וחיסור', 'כפל וחילוק', 'אחוזים', 'שברים',
    'סטטיסטיקה', 'הסתברות', 'גיאומטריה', 'יחסים ופרופורציות',
    'חשיבה לוגית', 'בעיות מילוליות', 'אלגברה',
  ],
  hebrew: [
    'הבנת הנקרא', 'שורשים', 'דקדוק', 'כתיב',
    'אוצר מילים', 'ניקוד', 'סוגי משפטים', 'פיסוק',
  ],
  finance: [
    'חיסכון והשקעה', 'עלות ורווח', 'אחוזים בחיים',
    'תקציב', 'ריבית דריבית', 'הכנסה והוצאה',
    'מחיר ועלות', 'השקעות בסיסיות',
  ],
  torah: [
    'כיבוד אב ואם', 'שבת', 'חגים', 'פרשת השבוע',
    'עשרת הדיברות', 'מוסר ומידות', 'תפילה', 'צדקה',
  ],
  english: [
    'past tense', 'present tense', 'future tense',
    'vocabulary', 'reading comprehension', 'spelling',
    'adjectives', 'questions and answers',
  ],
  ai_tech: [
    'איך AI לומד', 'מה זה אלגוריתם', 'בינה מלאכותית בחיים',
    'רובוטים', 'אינטרנט ואבטחה', 'תכנות בסיסי', 'נתונים ומידע',
  ],
  spatial: [
    'צורות גיאומטריות', 'שטח והיקף', 'נפח',
    'כיוונים ומפות', 'סימטריה', 'תבניות',
  ],
}

export function pickConcept(subject: string, seen: string[] = [], failed: string[] = []): string {
  const all = SUBJECT_CONCEPTS[subject] ?? ['כללי']

  // Prioritise failed concepts first
  const failedAvailable = failed.filter(c => all.includes(c))
  if (failedAvailable.length > 0) return failedAvailable[0]

  // Then prefer unseen
  const unseen = all.filter(c => !seen.includes(c))
  const pool = unseen.length > 0 ? unseen : all

  return pool[Math.floor(Math.random() * pool.length)]
}
