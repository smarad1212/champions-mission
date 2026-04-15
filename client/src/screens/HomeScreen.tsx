import { useEffect, useState } from 'react'
import { COLORS, GRADIENT } from '../theme'
import { getAllChildren, setActiveChildId } from '../services/api'
import type { ChildProfile } from '../types'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { getLevel, getProgressToNext, getNextLevel } from '../data/levels'

const SUBJECT_LABELS: Record<string, string> = {
  math: 'מתמטיקה',
  hebrew: 'עברית',
  english: 'אנגלית',
  torah: 'תורה',
  finance: 'כספים',
  ai_tech: 'טכנולוגיה',
  spatial: 'מרחבי',
}

const AVATARS = ['🦁', '🐯', '🦊', '🐻', '🐼', '🦅', '🐉', '⚡']

interface Props {
  onSelectChild: (child: ChildProfile) => void
  onAddChild: () => void
}

export default function HomeScreen({ onSelectChild, onAddChild }: Props) {
  const [children, setChildren] = useState<ChildProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    getAllChildren()
      .then(setChildren)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner message="טוען אלופים..." />

  return (
    <div className="screen-enter" style={{ ...styles.screen, background: GRADIENT }}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo}>🏆</div>
        <h1 style={styles.title}>משימת האלופים</h1>
        <p style={styles.subtitle}>בחר אלוף כדי להתחיל</p>
      </div>

      {/* Error state */}
      {error && (
        <div style={styles.errorBanner}>
          ⚠️ שגיאה בטעינת הנתונים — בדוק שהשרת פועל
        </div>
      )}

      {/* Children list */}
      <div className="children-list" style={styles.list}>
        {children.length === 0 && !error ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: 64 }}>🌟</div>
            <p style={styles.emptyText}>עדיין אין אלופים כאן</p>
            <p style={styles.emptySubtext}>הוסף את הילד הראשון!</p>
          </div>
        ) : (
          children.map((child, idx) => (
            <button
              key={child.id}
              className="game-btn"
              style={styles.card}
              onClick={() => { setActiveChildId(child.id); onSelectChild(child) }}
            >
              <div style={styles.avatar}>{AVATARS[idx % AVATARS.length]}</div>
              <div style={styles.cardInfo}>
                <div style={styles.cardName}>{child.name}</div>
                <div style={styles.cardMeta}>גיל {child.age} • {child.city}</div>
                <div style={styles.cardSubjects}>
                  {child.active_subjects.slice(0, 3).map(s => (
                    <span key={s} style={styles.subjectTag}>{SUBJECT_LABELS[s] ?? s}</span>
                  ))}
                </div>
                {/* Level progress bar */}
                <div style={{ marginTop: 6, width: '100%' }}>
                  <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 99, height: 4, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 99,
                      background: getLevel(child.total_xp).color,
                      width: `${getProgressToNext(child.total_xp)}%`,
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                </div>
              </div>
              <div style={styles.cardRight}>
                {/* Level badge */}
                <div style={{ fontSize: 22 }}>{getLevel(child.total_xp).trophy}</div>
                <div style={{ color: getLevel(child.total_xp).color, fontSize: 12, fontWeight: 700 }}>
                  {getLevel(child.total_xp).title}
                </div>
                <div style={{ ...styles.xpBadge, marginTop: 4 }}>⚡ {child.total_xp} XP</div>
                <div
                  className={child.streak_days > 3 ? 'streak-pulse' : ''}
                  style={styles.streakBadge}
                >
                  🔥 {child.streak_days}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Add child button — sticky at bottom */}
      <div className="sticky-bottom" style={{ padding: '12px 16px max(16px, env(safe-area-inset-bottom))' }}>
        <button style={styles.addBtn} onClick={onAddChild}>
          + הוסף ילד
        </button>
      </div>
    </div>
  )
}

// Suppress unused import warning for getNextLevel (used via getProgressToNext internally)
void getNextLevel

const styles: Record<string, React.CSSProperties> = {
  screen: {
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '48px 24px 24px',
    background: 'rgba(0,0,0,0.2)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    gap: 6,
  },
  logo: { fontSize: 56 },
  title: {
    color: COLORS.white, fontSize: 'clamp(24px,6vw,32px)',
    fontWeight: 'bold', direction: 'rtl', margin: 0,
  },
  subtitle: {
    color: COLORS.whiteAlpha60, fontSize: 16, direction: 'rtl', margin: 0,
  },
  errorBanner: {
    background: 'rgba(248,113,113,0.15)', border: `1px solid ${COLORS.red}`,
    color: COLORS.red, padding: '12px 20px', direction: 'rtl',
    fontSize: 15, textAlign: 'center',
  },
  list: {
    padding: '16px',
    display: 'flex', flexDirection: 'column', gap: 12,
  },
  emptyState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', flex: 1, padding: '60px 20px', gap: 8,
  },
  emptyText: {
    color: COLORS.white, fontSize: 22, fontWeight: 'bold',
    direction: 'rtl', margin: 0,
  },
  emptySubtext: {
    color: COLORS.whiteAlpha60, fontSize: 16, direction: 'rtl', margin: 0,
  },
  card: {
    background: 'rgba(255,255,255,0.07)',
    border: '1.5px solid rgba(255,255,255,0.12)',
    borderRadius: 20, padding: '16px',
    display: 'flex', alignItems: 'center', gap: 14,
    cursor: 'pointer', width: '100%', textAlign: 'right',
    transition: 'transform 0.15s, background 0.15s',
  },
  avatar: { fontSize: 40, flexShrink: 0 },
  cardInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4 },
  cardName: {
    color: COLORS.white, fontSize: 20, fontWeight: 'bold', direction: 'rtl',
  },
  cardMeta: { color: COLORS.whiteAlpha60, fontSize: 13, direction: 'rtl' },
  cardSubjects: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  subjectTag: {
    background: 'rgba(99,102,241,0.25)', color: '#a5b4fc',
    borderRadius: 99, padding: '2px 10px', fontSize: 12,
  },
  cardRight: {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0,
  },
  xpBadge: {
    background: 'rgba(255,215,0,0.15)', color: COLORS.yellow,
    borderRadius: 99, padding: '4px 10px', fontSize: 13, fontWeight: 600,
  },
  streakBadge: {
    background: 'rgba(255,107,53,0.2)', color: '#fb923c',
    borderRadius: 99, padding: '4px 10px', fontSize: 13, fontWeight: 600,
  },
  addBtn: {
    background: '#22c55e', color: COLORS.white, border: 'none',
    borderRadius: 999, minHeight: 60, fontSize: 20, width: '100%',
    fontWeight: 'bold', cursor: 'pointer',
    boxShadow: '0 4px 24px rgba(34,197,94,0.35)',
    direction: 'rtl', fontFamily: 'inherit',
  },
}
