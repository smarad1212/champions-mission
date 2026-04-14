import { useState } from 'react'
import { COLORS, GRADIENT } from '../theme'
import { createChild, setActiveChildId } from '../services/api'
import type { ChildProfile } from '../types'
import { LoadingSpinner } from '../components/LoadingSpinner'

const ALL_SUBJECTS = [
  { key: 'math', label: 'מתמטיקה 🔢' },
  { key: 'hebrew', label: 'עברית 📖' },
  { key: 'english', label: 'אנגלית 🌍' },
  { key: 'torah', label: 'תורה ✡️' },
  { key: 'finance', label: 'כספים 💰' },
  { key: 'ai_tech', label: 'טכנולוגיה 🤖' },
]

const INTEREST_OPTIONS = [
  'Minecraft', 'כדורגל', 'מוזיקה', 'ציור', 'בישול', 'חלל',
  'דינוזאורים', 'רובוטים', 'ספרים', 'ריקוד', 'שחמט', 'טכנולוגיה',
  'בעלי חיים', 'גיבורי על', 'ספורט', 'YouTube',
]

interface Props {
  onSuccess: (child: ChildProfile) => void
  onBack: () => void
}

export default function AddChildScreen({ onSuccess, onBack }: Props) {
  const [step, setStep] = useState<1 | 2>(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Step 1 fields
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [city, setCity] = useState('')

  // Step 2 fields
  const [interests, setInterests] = useState<string[]>([])
  const [subjects, setSubjects] = useState<string[]>(['math', 'hebrew', 'finance', 'torah', 'ai_tech', 'english'])

  const toggleInterest = (item: string) =>
    setInterests(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    )

  const toggleSubject = (key: string) =>
    setSubjects(prev =>
      prev.includes(key)
        ? prev.length > 1 ? prev.filter(s => s !== key) : prev
        : [...prev, key]
    )

  const handleStep1 = () => {
    if (!name.trim() || !age || !gender || !city.trim()) {
      setError('נא למלא את כל השדות')
      return
    }
    setError('')
    setStep(2)
  }

  const handleSubmit = async () => {
    setSaving(true)
    setError('')
    try {
      const child = await createChild({
        name: name.trim(),
        age: parseInt(age),
        gender,
        city: city.trim(),
        interests,
        active_subjects: subjects,
      })
      setActiveChildId(child.id)
      onSuccess(child)
    } catch {
      setError('שגיאה בשמירה — נסה שוב')
    } finally {
      setSaving(false)
    }
  }

  if (saving) return <LoadingSpinner message="שומר פרופיל חדש..." />

  return (
    <div style={{ ...styles.screen, background: GRADIENT }}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>→</button>
        <h2 style={styles.headerTitle}>
          {step === 1 ? 'פרטי הילד' : 'תחומי עניין'}
        </h2>
        <div style={styles.stepBadge}>{step}/2</div>
      </div>

      <div style={styles.content}>
        {step === 1 ? (
          <>
            <div style={styles.emojiHero}>👦</div>
            <p style={styles.hint}>בואו נכיר את האלוף החדש!</p>

            <div style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>שם</label>
                <input
                  style={styles.input}
                  placeholder="שם הילד"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  dir="rtl"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>גיל</label>
                <input
                  style={styles.input}
                  type="number"
                  placeholder="7-14"
                  min={7} max={14}
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  dir="rtl"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>מגדר</label>
                <div style={styles.genderRow}>
                  {[
                    { value: 'זכר', label: '👦 בן' },
                    { value: 'נקבה', label: '👧 בת' },
                  ].map(g => (
                    <button
                      key={g.value}
                      style={{
                        ...styles.genderBtn,
                        ...(gender === g.value ? styles.genderBtnActive : {}),
                      }}
                      onClick={() => setGender(g.value)}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>עיר</label>
                <input
                  style={styles.input}
                  placeholder="ירושלים, תל אביב..."
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  dir="rtl"
                />
              </div>
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <button style={styles.primaryBtn} onClick={handleStep1}>
              הבא ←
            </button>
          </>
        ) : (
          <>
            <p style={styles.hint}>מה מעניין את {name || 'הילד'}?</p>

            {/* Interests */}
            <div style={styles.sectionLabel}>תחומי עניין</div>
            <div style={styles.chips}>
              {INTEREST_OPTIONS.map(item => (
                <button
                  key={item}
                  style={{
                    ...styles.chip,
                    ...(interests.includes(item) ? styles.chipActive : {}),
                  }}
                  onClick={() => toggleInterest(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Subjects */}
            <div style={styles.sectionLabel}>מקצועות</div>
            <div style={styles.chips}>
              {ALL_SUBJECTS.map(s => (
                <button
                  key={s.key}
                  style={{
                    ...styles.chip,
                    ...(subjects.includes(s.key) ? styles.chipActive : {}),
                  }}
                  onClick={() => toggleSubject(s.key)}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <button style={styles.primaryBtn} onClick={handleSubmit}>
              יאללה נתחיל! 🚀
            </button>
          </>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  screen: {
    minHeight: '100dvh', display: 'flex', flexDirection: 'column',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(0,0,0,0.2)',
  },
  backBtn: {
    background: 'rgba(255,255,255,0.1)', border: 'none', color: COLORS.white,
    fontSize: 22, width: 40, height: 40, borderRadius: 99, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    color: COLORS.white, fontSize: 20, fontWeight: 'bold',
    direction: 'rtl', margin: 0,
  },
  stepBadge: {
    background: 'rgba(99,102,241,0.3)', color: '#a5b4fc',
    borderRadius: 99, padding: '4px 12px', fontSize: 13, fontWeight: 600,
  },
  content: {
    flex: 1, overflowY: 'auto', padding: '24px 20px 32px',
    display: 'flex', flexDirection: 'column', gap: 16,
  },
  emojiHero: { fontSize: 64, textAlign: 'center' },
  hint: {
    color: COLORS.whiteAlpha80, fontSize: 17, direction: 'rtl',
    textAlign: 'center', margin: 0,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { color: COLORS.whiteAlpha80, fontSize: 14, direction: 'rtl' },
  input: {
    background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.2)',
    borderRadius: 12, padding: '14px 16px', color: COLORS.white,
    fontSize: 17, outline: 'none', fontFamily: 'inherit',
  },
  genderRow: { display: 'flex', gap: 10 },
  genderBtn: {
    flex: 1, background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.15)',
    borderRadius: 12, padding: '14px', color: COLORS.whiteAlpha80,
    fontSize: 17, cursor: 'pointer', fontFamily: 'inherit',
  },
  genderBtnActive: {
    background: 'rgba(99,102,241,0.35)', border: '1.5px solid #6366f1',
    color: COLORS.white,
  },
  sectionLabel: {
    color: COLORS.whiteAlpha60, fontSize: 13, direction: 'rtl',
    textTransform: 'uppercase', letterSpacing: 1,
  },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  chip: {
    background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)',
    borderRadius: 99, padding: '8px 16px', color: COLORS.whiteAlpha80,
    fontSize: 15, cursor: 'pointer', fontFamily: 'inherit',
  },
  chipActive: {
    background: 'rgba(99,102,241,0.4)', border: '1.5px solid #6366f1',
    color: COLORS.white,
  },
  primaryBtn: {
    background: '#22c55e', color: COLORS.white, border: 'none',
    borderRadius: 999, minHeight: 60, fontSize: 20,
    fontWeight: 'bold', cursor: 'pointer', marginTop: 8,
    boxShadow: '0 4px 20px rgba(34,197,94,0.35)',
    fontFamily: 'inherit',
  },
  error: { color: COLORS.red, fontSize: 15, direction: 'rtl', margin: 0, textAlign: 'center' },
}
