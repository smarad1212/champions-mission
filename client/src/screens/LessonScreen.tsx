import { useEffect, useState } from 'react'
import { COLORS, GRADIENT } from '../theme'
import { useApp } from '../context/AppContext'
import type { SprintContent } from '../types'
import HomeButton from '../components/HomeButton'

const SUBJECT_EMOJI: Record<string, string> = {
  math: '🔢', hebrew: '📖', english: '🌍',
  torah: '✡️', finance: '💰', ai_tech: '🤖', spatial: '📐',
}

interface Props { sprint: SprintContent; onNext: () => void; onGoHome: () => void }

export default function LessonScreen({ sprint, onNext, onGoHome }: Props) {
  const { state } = useApp()
  const [visible, setVisible] = useState(false)
  const { lesson } = sprint

  useEffect(() => { setTimeout(() => setVisible(true), 30) }, [])

  return (
    <div className="screen-enter" style={{ background: GRADIENT, minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 20px 32px', gap: 0, direction: 'rtl' }}>

      <HomeButton onConfirm={onGoHome} />

      {/* Top bar */}
      <div style={styles.topBar}>
        <div style={styles.xpPill}>⭐ {state.totalXP} XP</div>
        <div style={styles.streakPill}>🔥 {state.streak}</div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 18, width: '100%', maxWidth: 520,
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(40px)',
        transition: 'all 0.4s cubic-bezier(.34,1.2,.64,1)',
      }}>

        {/* Subject icon */}
        <div style={{ fontSize: 64, marginTop: 8 }}>{lesson.icon}</div>

        {/* Title — yellow, bold, italic, large */}
        <h1 style={styles.title}>{lesson.title}</h1>

        {/* Hook */}
        <p style={styles.hook}>{lesson.hook}</p>

        {/* Unsplash image */}
        {lesson.imageUrl && (
          <div style={styles.imgWrapper}>
            <img src={lesson.imageUrl} alt="" style={{ ...styles.img, opacity: 0, transition: 'opacity 0.5s ease' }}
              onLoad={e => { (e.target as HTMLImageElement).style.opacity = '1' }}
              onError={e => { const el = (e.target as HTMLImageElement).parentElement; if (el) el.style.display = 'none' }} />
            <div style={styles.imgBadge}>{SUBJECT_EMOJI[lesson.subject] ?? '📚'} {lesson.concept}</div>
          </div>
        )}

        {/* Lesson body */}
        <p style={styles.body}>{lesson.text}</p>

        {lesson.passage && (
          <div style={styles.passageCard}>
            <p style={styles.passageText}>{lesson.passage}</p>
          </div>
        )}
      </div>

      <div className="sticky-bottom">
        <button className="game-btn" style={styles.btn} onClick={onNext}>הבנתי, לשאלות! ✏️</button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  topBar: {
    display: 'flex', justifyContent: 'space-between',
    width: '100%', maxWidth: 520, marginBottom: 8,
  },
  xpPill: {
    background: 'rgba(255,215,0,0.2)', color: COLORS.yellow,
    borderRadius: 999, padding: '7px 18px', fontSize: 16, fontWeight: 700,
    border: '1.5px solid rgba(255,215,0,0.3)',
  },
  streakPill: {
    background: 'rgba(255,107,53,0.2)', color: '#FF6B35',
    borderRadius: 999, padding: '7px 18px', fontSize: 16, fontWeight: 700,
    border: '1.5px solid rgba(255,107,53,0.3)',
  },
  title: {
    color: COLORS.yellow,
    fontSize: 'clamp(26px, 6vw, 34px)',
    fontWeight: 900,
    fontStyle: 'italic',
    textAlign: 'center',
    direction: 'rtl',
    margin: 0,
    lineHeight: 1.2,
    textShadow: '0 2px 12px rgba(255,215,0,0.3)',
  },
  hook: {
    color: COLORS.white,
    fontSize: 'clamp(17px, 4vw, 20px)',
    textAlign: 'center',
    direction: 'rtl',
    margin: 0,
    lineHeight: 1.6,
    fontWeight: 500,
  },
  imgWrapper: {
    width: '100%', borderRadius: 20,
    overflow: 'hidden', position: 'relative',
    background: '#1a1a2e', flexShrink: 0, height: 210,
  },
  img: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  imgBadge: {
    position: 'absolute', bottom: 10, right: 10,
    background: 'rgba(0,0,0,0.65)', color: 'white',
    fontSize: 13, padding: '5px 12px', borderRadius: 20,
    backdropFilter: 'blur(6px)', direction: 'rtl', fontWeight: 600,
  },
  body: {
    color: COLORS.white,
    fontSize: 'clamp(17px, 4vw, 20px)',
    textAlign: 'center',
    direction: 'rtl',
    margin: 0,
    lineHeight: 1.8,
    maxWidth: 480,
    fontWeight: 400,
  },
  passageCard: {
    background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px 20px', width: '100%',
  },
  passageText: {
    color: COLORS.whiteAlpha80, fontSize: 18, direction: 'rtl',
    margin: 0, lineHeight: 1.7, textAlign: 'right',
  },
  btn: {
    background: COLORS.purple, color: COLORS.white, border: 'none',
    borderRadius: 999, padding: '18px 40px',
    fontSize: 20, fontWeight: 'bold', cursor: 'pointer',
    minHeight: 64, width: '100%',
    boxShadow: '0 4px 24px rgba(99,102,241,0.5)', fontFamily: 'inherit',
  },
}
