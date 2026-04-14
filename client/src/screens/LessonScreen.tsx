import { useEffect, useState } from 'react'
import { COLORS, GRADIENT } from '../theme'
import { useApp } from '../context/AppContext'
import type { SprintContent } from '../types'

const SUBJECT_EMOJI: Record<string, string> = {
  math: '🔢',
  hebrew: '📖',
  english: '🌍',
  torah: '✡️',
  finance: '💰',
  ai_tech: '🤖',
  spatial: '📐',
}

interface Props { sprint: SprintContent; onNext: () => void }

export default function LessonScreen({ sprint, onNext }: Props) {
  const { state } = useApp()
  const [visible, setVisible] = useState(false)
  const { lesson } = sprint

  useEffect(() => { setTimeout(() => setVisible(true), 30) }, [])

  return (
    <div style={{ ...styles.screen, background: GRADIENT }}>
      {/* Top bar */}
      <div style={styles.topBar}>
        <div style={styles.pill}>⭐ {state.totalXP} XP</div>
        <div style={{ ...styles.pill, background: COLORS.streakBg }}>🔥 {state.streak}</div>
      </div>

      {/* Slide-up card */}
      <div style={{
        ...styles.card,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(40px)',
        transition: 'all 0.4s cubic-bezier(.34,1.2,.64,1)',
      }}>
        <div style={styles.icon}>{lesson.icon}</div>
        <h2 style={styles.title}>{lesson.title}</h2>
        <p style={styles.hook}>{lesson.hook}</p>

        {/* Unsplash image with subject badge */}
        {lesson.imageUrl && (
          <div style={styles.imgWrapper}>
            <img
              src={lesson.imageUrl}
              alt=""
              style={{ ...styles.img, opacity: 0, transition: 'opacity 0.5s ease' }}
              onLoad={e => { (e.target as HTMLImageElement).style.opacity = '1' }}
              onError={e => {
                const el = (e.target as HTMLImageElement).parentElement
                if (el) el.style.display = 'none'
              }}
            />
            <div style={styles.imgBadge}>
              {SUBJECT_EMOJI[lesson.subject] ?? '📚'} {lesson.concept}
            </div>
          </div>
        )}

        <p style={styles.lessonText}>{lesson.text}</p>

        {lesson.passage && (
          <div style={styles.passageCard}>
            <p style={styles.passageText}>{lesson.passage}</p>
          </div>
        )}
      </div>

      <button style={styles.btn} onClick={onNext}>הבנתי, לשאלות! ✏️</button>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  screen: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    minHeight: '100dvh', padding: '60px 20px 32px', gap: 0,
  },
  topBar: {
    display: 'flex', justifyContent: 'space-between',
    width: '100%', maxWidth: 500, marginBottom: 20,
  },
  pill: {
    background: 'rgba(255,255,255,0.15)', color: COLORS.white,
    borderRadius: 999, padding: '6px 16px', fontSize: 16, fontWeight: 600,
  },
  card: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 14, width: '100%', maxWidth: 500,
  },
  icon: { fontSize: 68, animation: 'pulse 2s ease-in-out infinite' },
  title: {
    color: COLORS.white, fontSize: 'clamp(22px,5vw,28px)', fontWeight: 'bold',
    textAlign: 'center', direction: 'rtl', margin: 0,
  },
  hook: {
    color: COLORS.blueLight, fontSize: 18, fontStyle: 'italic',
    textAlign: 'center', direction: 'rtl', margin: 0, lineHeight: 1.6,
  },
  imgWrapper: {
    width: '100%', height: 200, borderRadius: 16,
    overflow: 'hidden', position: 'relative',
    background: '#1a1a2e', flexShrink: 0,
  },
  img: {
    width: '100%', height: '100%', objectFit: 'cover', display: 'block',
  },
  imgBadge: {
    position: 'absolute', bottom: 8, right: 8,
    background: 'rgba(0,0,0,0.6)', color: 'white',
    fontSize: 12, padding: '4px 10px', borderRadius: 20,
    backdropFilter: 'blur(4px)', direction: 'rtl',
  },
  lessonText: {
    color: COLORS.white, fontSize: 18, textAlign: 'center',
    direction: 'rtl', margin: 0, lineHeight: 1.8, maxWidth: 440,
  },
  passageCard: {
    background: 'rgba(255,255,255,0.1)', borderRadius: 16,
    padding: '16px 20px', width: '100%',
  },
  passageText: {
    color: COLORS.whiteAlpha80, fontSize: 17, direction: 'rtl',
    margin: 0, lineHeight: 1.7, textAlign: 'right',
  },
  btn: {
    background: COLORS.purple, color: COLORS.white, border: 'none',
    borderRadius: 999, padding: '18px 40px', fontSize: 19,
    fontWeight: 'bold', cursor: 'pointer', minHeight: 64,
    width: '100%', maxWidth: 500, marginTop: 16,
    boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
    fontFamily: 'inherit',
  },
}
