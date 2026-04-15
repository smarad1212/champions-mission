import { useState } from 'react'
import { COLORS, GRADIENT } from '../theme'
import { createChild, setActiveChildId } from '../services/api'
import type { ChildProfile } from '../types'
import { LoadingSpinner } from '../components/LoadingSpinner'

const ALL_SUBJECTS = [
  { key: 'math', label: 'מתמטיקה', emoji: '🔢' },
  { key: 'hebrew', label: 'עברית', emoji: '📖' },
  { key: 'english', label: 'אנגלית', emoji: '🌍' },
  { key: 'torah', label: 'תורה', emoji: '✡️' },
  { key: 'finance', label: 'כספים', emoji: '💰' },
  { key: 'ai_tech', label: 'טכנולוגיה', emoji: '🤖' },
]

const INTEREST_OPTIONS = [
  { key: 'חלל וכוכבים', emoji: '🚀' },
  { key: 'חיות בר וטבע', emoji: '🦁' },
  { key: 'רובוטים ומחשבים', emoji: '💻' },
  { key: 'דינוזאורים', emoji: '🦕' },
  { key: 'ספורט', emoji: '⚽' },
  { key: 'קסמים ואגדות', emoji: '🦄' },
  { key: 'מדע וניסויים', emoji: '🔬' },
  { key: 'מכוניות ורכבים', emoji: '🏎️' },
  { key: 'שחמט', emoji: '♟️' },
  { key: 'אוכל ובישול', emoji: '🍕' },
  { key: 'מוזיקה', emoji: '🎵' },
  { key: 'ציור ויצירה', emoji: '🎨' },
  { key: 'כדורגל', emoji: '⚽' },
  { key: 'גיבורי על', emoji: '🦸' },
  { key: 'Minecraft', emoji: '⛏️' },
  { key: 'ריקוד', emoji: '💃' },
]

interface Props {
  onSuccess: (child: ChildProfile) => void
  onBack: () => void
}

export default function AddChildScreen({ onSuccess, onBack }: Props) {
  const [step, setStep] = useState<1 | 2>(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [city, setCity] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [subjects, setSubjects] = useState<string[]>(['math', 'hebrew', 'finance', 'torah', 'ai_tech', 'english'])

  const toggleInterest = (key: string) =>
    setInterests(prev => prev.includes(key) ? prev.filter(i => i !== key) : [...prev, key])

  const toggleSubject = (key: string) =>
    setSubjects(prev =>
      prev.includes(key) ? (prev.length > 1 ? prev.filter(s => s !== key) : prev) : [...prev, key]
    )

  const handleStep1 = () => {
    if (!name.trim() || !age || !gender || !city.trim()) { setError('נא למלא את כל השדות'); return }
    setError(''); setStep(2)
  }

  const handleSubmit = async () => {
    setSaving(true); setError('')
    try {
      const child = await createChild({ name: name.trim(), age: parseInt(age), gender, city: city.trim(), interests, active_subjects: subjects })
      setActiveChildId(child.id)
      onSuccess(child)
    } catch { setError('שגיאה בשמירה — נסה שוב') }
    finally { setSaving(false) }
  }

  if (saving) return <LoadingSpinner message="שומר פרופיל חדש..." />

  return (
    <div style={{ background: GRADIENT, minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>→</button>
        <h2 style={styles.headerTitle}>{step === 1 ? 'פרטי האלוף' : 'מה הכי מעניין אותך?'}</h2>
        <div style={styles.stepBadge}>{step}/2</div>
      </div>

      <div style={styles.content}>
        {step === 1 ? (
          <>
            <div style={{ fontSize: 64, textAlign: 'center' }}>👦</div>
            <p style={styles.hint}>בואו נכיר את האלוף החדש!</p>
            <div style={styles.form}>
              {[
                { label: 'שם', placeholder: 'שם הילד', value: name, setter: setName, type: 'text' },
                { label: 'גיל', placeholder: '7-14', value: age, setter: setAge, type: 'number' },
                { label: 'עיר', placeholder: 'ירושלים, תל אביב...', value: city, setter: setCity, type: 'text' },
              ].map(f => (
                <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={styles.label}>{f.label}</label>
                  <input style={styles.input} type={f.type} placeholder={f.placeholder}
                    value={f.value} onChange={e => f.setter(e.target.value)}
                    min={f.type === 'number' ? 7 : undefined} max={f.type === 'number' ? 14 : undefined} dir="rtl" />
                </div>
              ))}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={styles.label}>מגדר</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[{ value: 'זכר', label: '👦 בן' }, { value: 'נקבה', label: '👧 בת' }].map(g => (
                    <button key={g.value} style={{ ...styles.genderBtn, ...(gender === g.value ? styles.genderBtnActive : {}) }}
                      onClick={() => setGender(g.value)}>{g.label}</button>
                  ))}
                </div>
              </div>
            </div>
            {error && <p style={styles.error}>{error}</p>}
            <button style={styles.primaryBtn} onClick={handleStep1}>הבא ←</button>
          </>
        ) : (
          <>
            <p style={styles.subHint}>בחר/י לפחות 3 נושאים שאת/ה אוהב/ת:</p>

            {/* Interests grid */}
            <div style={styles.cardGrid}>
              {INTEREST_OPTIONS.map(item => {
                const active = interests.includes(item.key)
                return (
                  <button key={item.key} style={{ ...styles.interestCard, ...(active ? styles.interestCardActive : {}) }}
                    onClick={() => toggleInterest(item.key)}>
                    <span style={styles.cardEmoji}>{item.emoji}</span>
                    <span style={styles.cardLabel}>{item.key}</span>
                    {active && <div style={styles.checkmark}>✓</div>}
                  </button>
                )
              })}
            </div>

            {/* Subjects */}
            <div style={styles.sectionLabel}>מקצועות</div>
            <div style={styles.cardGrid}>
              {ALL_SUBJECTS.map(s => {
                const active = subjects.includes(s.key)
                return (
                  <button key={s.key} style={{ ...styles.interestCard, ...(active ? styles.interestCardActive : {}) }}
                    onClick={() => toggleSubject(s.key)}>
                    <span style={styles.cardEmoji}>{s.emoji}</span>
                    <span style={styles.cardLabel}>{s.label}</span>
                    {active && <div style={styles.checkmark}>✓</div>}
                  </button>
                )
              })}
            </div>

            {error && <p style={styles.error}>{error}</p>}
            <button style={styles.primaryBtn} onClick={handleSubmit}>יאללה נתחיל! 🚀</button>
          </>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(0,0,0,0.2)',
  },
  backBtn: {
    background: 'rgba(255,255,255,0.1)', border: 'none', color: COLORS.white,
    fontSize: 22, width: 40, height: 40, borderRadius: 99, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    color: COLORS.yellow, fontSize: 20, fontWeight: 'bold',
    direction: 'rtl', margin: 0,
  },
  stepBadge: {
    background: 'rgba(99,102,241,0.3)', color: '#a5b4fc',
    borderRadius: 99, padding: '4px 12px', fontSize: 13, fontWeight: 600,
  },
  content: {
    flex: 1, overflowY: 'auto', padding: '20px 16px 32px',
    display: 'flex', flexDirection: 'column', gap: 16,
  },
  hint: { color: COLORS.whiteAlpha80, fontSize: 17, direction: 'rtl', textAlign: 'center', margin: 0 },
  subHint: { color: COLORS.white, fontSize: 17, direction: 'rtl', textAlign: 'center', margin: 0, fontWeight: 600 },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  label: { color: COLORS.whiteAlpha80, fontSize: 14, direction: 'rtl' },
  input: {
    background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.2)',
    borderRadius: 12, padding: '14px 16px', color: COLORS.white,
    fontSize: 17, outline: 'none', fontFamily: 'inherit',
  },
  genderBtn: {
    flex: 1, background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.15)',
    borderRadius: 12, padding: '14px', color: COLORS.whiteAlpha80,
    fontSize: 17, cursor: 'pointer', fontFamily: 'inherit',
  },
  genderBtnActive: {
    background: 'rgba(99,102,241,0.35)', border: '1.5px solid #6366f1', color: COLORS.white,
  },
  sectionLabel: {
    color: COLORS.yellow, fontSize: 16, direction: 'rtl',
    fontWeight: 700, marginTop: 8,
  },
  // Card grid for interests
  cardGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
  },
  interestCard: {
    background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.1)',
    borderRadius: 20, padding: '20px 12px', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
    position: 'relative', transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  },
  interestCardActive: {
    background: 'rgba(99,102,241,0.35)', border: '2px solid #6366f1',
  },
  cardEmoji: { fontSize: 44 },
  cardLabel: {
    color: COLORS.white, fontSize: 14, fontWeight: 700,
    direction: 'rtl', textAlign: 'center',
  },
  checkmark: {
    position: 'absolute', top: 8, left: 8,
    background: '#6366f1', color: 'white',
    width: 22, height: 22, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 'bold',
  },
  primaryBtn: {
    background: '#22c55e', color: COLORS.white, border: 'none',
    borderRadius: 999, minHeight: 60, fontSize: 20, fontWeight: 'bold',
    cursor: 'pointer', marginTop: 8,
    boxShadow: '0 4px 20px rgba(34,197,94,0.35)', fontFamily: 'inherit',
  },
  error: { color: COLORS.red, fontSize: 15, direction: 'rtl', margin: 0, textAlign: 'center' },
}
