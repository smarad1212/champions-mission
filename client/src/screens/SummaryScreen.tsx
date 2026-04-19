import { useEffect, useState, useRef } from 'react'
import { COLORS, GRADIENT } from '../theme'
import { useApp } from '../context/AppContext'
import type { SprintContent } from '../types'
import { SoundFX } from '../services/sounds'
import { updateProgress, getChild } from '../services/api'
import { getLevel, getNextLevel, getProgressToNext } from '../data/levels'
import HomeButton from '../components/HomeButton'
import { PrefetchService } from '../services/prefetchService'

const CONFETTI_COLORS = ['#FFD700', '#4ade80', '#60a5fa', '#f87171', '#a78bfa', '#fb923c']
const DOTS = Array.from({ length: 30 }, (_, i) => ({
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  left: `${Math.random() * 100}%`,
  delay: `${Math.random() * 0.5}s`,
  size: `${8 + Math.random() * 8}px`,
}))

interface Props {
  sprint: SprintContent
  onNextSprint: (sprint: SprintContent, sprintId: string | null) => void
  onGoHome: () => void
}

export default function SummaryScreen({ sprint, onNextSprint, onGoHome }: Props) {
  const { state, triggerCelebration, setChild } = useApp()
  const { sprintXPEarned, streak, child, correctAnswers, wrongAnswers } = state
  const [displayXP, setDisplayXP] = useState(0)
  const [continuing, setContinuing] = useState(false)
  const savedRef = useRef(false)

  // Save progress to DB on mount (includes +40 sprint bonus), then refresh child
  useEffect(() => {
    if (!child || savedRef.current) return
    savedRef.current = true

    const today = new Date().toISOString().slice(0, 10)
    const subject = sprint.lesson.subject
    const concept = sprint.lesson.concept

    const totalAnswers = correctAnswers + wrongAnswers
    const isWeak = totalAnswers > 0 && correctAnswers / totalAnswers < 0.6
    const newWeakAreas = isWeak
      ? Array.from(new Set([...child.weak_areas, subject]))
      : child.weak_areas.filter(a => a !== subject)

    const newSubjectLastSeen: Record<string, string> = {
      ...(child.subject_last_seen as Record<string, string>),
      [subject]: today,
    }
    const newRecentConcepts = [
      concept,
      ...child.recent_concepts.filter(c => c !== concept),
    ].slice(0, 10)

    const newTotalXP = (child.total_xp || 0) + sprintXPEarned + 40

    updateProgress(child.id, {
      total_xp: newTotalXP,
      streak_days: child.streak_days,
      sprint_count_today: (child.sprint_count_today || 0) + 1,
      xp_multiplier: child.xp_multiplier,
      weak_areas: newWeakAreas,
      subject_last_seen: newSubjectLastSeen,
      recent_concepts: newRecentConcepts,
    })
      .then(async () => {
        // Refresh child in context so next sprint saves with correct base XP
        try {
          const freshChild = await getChild(child.id)
          setChild(freshChild)
        } catch {
          // Non-critical
        }
      })
      .catch(err => console.warn('Progress save failed:', err))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // XP count-up animation
  useEffect(() => {
    SoundFX.levelUp()
    const duration = 1500
    const start = Date.now()
    const iv = setInterval(() => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      setDisplayXP(Math.round(progress * sprintXPEarned))
      if (progress >= 1) clearInterval(iv)
    }, 30)
    return () => clearInterval(iv)
  }, [sprintXPEarned])

  const handleNextSprint = async () => {
    if (continuing) return
    setContinuing(true)
    triggerCelebration({ type: 'sprint_complete', xp: 40 })
    SoundFX.continueBonus()

    try {
      // Use latest child from context (refreshed after save)
      const currentChild = state.child ?? child!
      const result = await PrefetchService.get(currentChild)
      // Brief pause so celebration animation plays
      setTimeout(() => {
        onNextSprint(result.sprint, result.sprint_id)
      }, 800)
    } catch (e) {
      console.error('Failed to get next sprint:', e)
      setContinuing(false)
    }
  }

  const childName = child?.name ?? ''
  const isReady = PrefetchService.isReady()
  const isLoadingPrefetch = PrefetchService.isLoading()

  return (
    <div className="screen-enter" style={{ ...styles.screen, background: GRADIENT }}>

      <HomeButton onConfirm={onGoHome} />

      {/* Confetti */}
      {DOTS.map((d, i) => (
        <div key={i} style={{
          position: 'absolute', left: d.left, top: '-10px',
          width: d.size, height: d.size, borderRadius: '50%',
          background: d.color, animationDelay: d.delay,
          animation: 'fall 2.5s ease forwards', pointerEvents: 'none', zIndex: 0,
        }} />
      ))}

      <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%', maxWidth: 480 }}>
        <div style={{ fontSize: 80, filter: 'drop-shadow(0 0 20px #ffd700)', animation: 'bounceIn 0.5s cubic-bezier(.34,1.56,.64,1)' }}>🏆</div>

        <h2 style={styles.congrats}>כל הכבוד{childName ? ` ${childName}` : ''}!</h2>

        <div style={styles.xpBubble}>
          <span style={styles.xpNum}>{displayXP}</span>
          <span style={styles.xpLabel}>XP הרווחת</span>
        </div>

        {/* Level display */}
        {(() => {
          const lv = getLevel(state.totalXP)
          const next = getNextLevel(state.totalXP)
          const pct = getProgressToNext(state.totalXP)
          return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 36 }}>{lv.trophy}</span>
                <span style={{ color: lv.color, fontSize: 22, fontWeight: 900 }}>{lv.title}</span>
              </div>
              {next && (
                <div style={{ width: '100%', maxWidth: 280 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{lv.title}</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{next.title}</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 99, background: lv.color, width: `${pct}%`, transition: 'width 1s ease' }} />
                  </div>
                </div>
              )}
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: 0 }}>
                צברת {state.sessionXP} נקודות בסשן הזה
              </p>
            </div>
          )
        })()}

        <div style={styles.streakPill}>🔥 רצף {streak} ימים</div>

        {/* Correct/wrong breakdown */}
        <div style={styles.statsRow}>
          <div style={styles.statBox}>
            <span style={{ color: COLORS.green, fontSize: 22 }}>✓ {correctAnswers}</span>
            <span style={{ color: COLORS.whiteAlpha60, fontSize: 13 }}>נכון</span>
          </div>
          <div style={styles.statBox}>
            <span style={{ color: COLORS.red, fontSize: 22 }}>✗ {wrongAnswers}</span>
            <span style={{ color: COLORS.whiteAlpha60, fontSize: 13 }}>שגוי</span>
          </div>
        </div>

        {sprint.field_task && (
          <div style={styles.fieldCard}>
            <p style={styles.fieldEmoji}>🌍</p>
            <p style={styles.fieldText}>{sprint.field_task}</p>
            <p style={styles.fieldBonus}>+50 XP בונוס מחר</p>
          </div>
        )}

        <div style={styles.actions}>
          <button
            className="game-btn"
            style={{
              ...styles.primaryBtn,
              ...(!isReady && isLoadingPrefetch && !continuing ? { opacity: 0.85 } : {}),
            }}
            onClick={handleNextSprint}
            disabled={continuing}
          >
            {continuing
              ? '⏳ טוען...'
              : isReady
              ? 'ספרינט נוסף! ⚡'
              : isLoadingPrefetch
              ? 'מכין ספרינט... ⏳'
              : 'ספרינט נוסף! ⚡'}
          </button>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  screen: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    minHeight: '100dvh', padding: '60px 20px 40px', gap: 0,
    position: 'relative',
  },
  congrats: {
    color: COLORS.yellow, fontSize: 'clamp(24px,6vw,32px)',
    fontWeight: 'bold', direction: 'rtl', margin: 0,
  },
  xpBubble: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    background: 'rgba(255,255,255,0.12)', borderRadius: 24, padding: '20px 48px',
  },
  xpNum: { color: COLORS.yellow, fontSize: 60, fontWeight: 'bold', lineHeight: 1 },
  xpLabel: { color: COLORS.whiteAlpha80, fontSize: 17, direction: 'rtl' },
  streakPill: {
    background: COLORS.streakBg, color: COLORS.white,
    borderRadius: 999, padding: '8px 24px', fontSize: 17, fontWeight: 600, direction: 'rtl',
  },
  statsRow: { display: 'flex', gap: 16 },
  statBox: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
    background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: '12px 28px',
  },
  fieldCard: {
    background: 'linear-gradient(135deg, rgba(22,163,74,0.25), rgba(16,185,129,0.15))',
    border: `1.5px solid ${COLORS.green}`,
    borderRadius: 20, padding: '20px 22px', width: '100%',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
    boxShadow: '0 0 24px rgba(74,222,128,0.15)',
  },
  fieldEmoji: { fontSize: 36, margin: 0 },
  fieldText: {
    color: COLORS.white, fontSize: 17, direction: 'rtl',
    margin: 0, lineHeight: 1.6, textAlign: 'center',
  },
  fieldBonus: { color: COLORS.green, fontSize: 16, fontWeight: 'bold', direction: 'rtl', margin: 0 },
  actions: { display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: 8 },
  primaryBtn: {
    background: COLORS.purple, color: COLORS.white, border: 'none',
    borderRadius: 999, minHeight: 64, fontSize: 20, fontWeight: 'bold',
    cursor: 'pointer', boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
    fontFamily: 'inherit', transition: 'opacity 0.2s',
  },
}
