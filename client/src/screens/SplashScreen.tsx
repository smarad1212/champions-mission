import { useEffect, useState } from 'react'
import { COLORS, GRADIENT } from '../theme'
import { generateSprint } from '../services/api'
import { useApp } from '../context/AppContext'
import type { ChildProfile, SprintContent } from '../types'

interface Props {
  child: ChildProfile
  onSuccess: (s: SprintContent, sprintId: string | null) => void
  onError: () => void
}

export default function SplashScreen({ child, onSuccess, onError }: Props) {
  const { setSprint } = useApp()
  const [loading, setLoading] = useState(false)
  const [scale, setScale] = useState(0)

  useEffect(() => {
    setTimeout(() => setScale(1.2), 50)
    setTimeout(() => setScale(1.0), 350)
  }, [])

  const handleStart = async () => {
    setLoading(true)
    try {
      const data = await generateSprint(child)
      setSprint(data.sprint, data.sprint_id ?? null)
      onSuccess(data.sprint, data.sprint_id ?? null)
    } catch {
      onError()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ ...styles.screen, background: GRADIENT }}>
      <div style={{ fontSize: 96, transform: `scale(${scale})`, transition: 'transform 0.3s cubic-bezier(.34,1.56,.64,1)' }}>
        🏆
      </div>

      <h1 style={styles.title}>משימת האלופים</h1>
      <p style={styles.sub}>מוכן לאתגר, {child.name}? 🚀</p>

      <div style={styles.statsRow}>
        <div style={styles.statPill}>⚡ {child.total_xp} XP</div>
        <div style={styles.statPill}>🔥 רצף {child.streak_days} ימים</div>
        <div style={styles.statPill}>⭐ רמה {child.level}</div>
      </div>

      {loading ? (
        <div style={styles.loadingBox}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>הבינה המלאכותית מכינה לך הרפתקה...</p>
        </div>
      ) : (
        <button style={styles.btn} onClick={handleStart}>בואו נתחיל! 🚀</button>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  screen: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '100dvh', gap: 20,
    padding: '0 24px', textAlign: 'center',
  },
  title: {
    color: COLORS.white, fontSize: 'clamp(28px,7vw,40px)',
    fontWeight: 'bold', direction: 'rtl', margin: 0,
  },
  sub: {
    color: COLORS.whiteAlpha80, fontSize: 20, direction: 'rtl', margin: 0,
  },
  statsRow: { display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  statPill: {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 99, padding: '6px 16px', fontSize: 14,
    color: COLORS.white, fontWeight: 600,
  },
  btn: {
    background: '#22c55e', color: COLORS.white, border: 'none',
    borderRadius: 999, padding: '18px 48px', fontSize: 20,
    fontWeight: 'bold', cursor: 'pointer', minHeight: 64,
    boxShadow: '0 4px 24px rgba(34,197,94,0.4)',
    marginTop: 8, fontFamily: 'inherit',
  },
  loadingBox: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 12, marginTop: 8,
  },
  spinner: {
    width: 40, height: 40,
    border: '4px solid rgba(255,255,255,0.2)',
    borderTop: `4px solid ${COLORS.green}`,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    color: COLORS.whiteAlpha80, fontSize: 16,
    direction: 'rtl', margin: 0, maxWidth: 260,
  },
}
