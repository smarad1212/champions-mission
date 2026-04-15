import { useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { SoundFX } from '../services/sounds'

const CONFETTI = Array.from({ length: 30 }, (_, i) => ({
  color: ['#FFD700','#4ade80','#60a5fa','#f87171','#a78bfa','#fb923c'][i % 6],
  left: `${Math.random() * 100}%`,
  delay: `${Math.random() * 0.5}s`,
  size: `${8 + Math.random() * 8}px`,
}))

const FLAMES = Array.from({ length: 16 }, (_) => ({
  left: `${Math.random() * 100}%`,
  delay: `${Math.random() * 0.4}s`,
  size: `${20 + Math.random() * 20}px`,
}))

export default function XPCelebration() {
  const { state, dismissCelebration } = useApp()
  const ev = state.pendingCelebration
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!ev) return
    // Auto-dismiss timings per event
    const durations: Record<string, number> = {
      sprint_complete: 2000,
      streak_bonus: 2500,
      double_xp: 3500,
      level_up: 3500,
    }
    const dur = durations[ev.type] ?? 2000

    // Play sound
    if (ev.type === 'double_xp' || ev.type === 'level_up') {
      SoundFX.streak()
      setTimeout(() => SoundFX.levelUp(), 300)
    } else if (ev.type === 'streak_bonus') {
      SoundFX.streak()
    } else {
      SoundFX.continueBonus()
    }

    timerRef.current = setTimeout(dismissCelebration, dur)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [ev]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!ev) return null

  const base: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 8000,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: 16, overflow: 'hidden',
  }

  if (ev.type === 'sprint_complete') {
    return (
      <div style={{ ...base, background: 'rgba(0,0,0,0.7)' }} onClick={dismissCelebration}>
        {CONFETTI.map((d, i) => (
          <div key={i} style={{
            position: 'absolute', left: d.left, top: '-10px',
            width: d.size, height: d.size, borderRadius: '50%',
            background: d.color, animationDelay: d.delay,
            animation: 'fall 2s ease forwards', pointerEvents: 'none',
          }} />
        ))}
        <div style={{ fontSize: 80, animation: 'xpBounce 0.5s ease forwards' }}>🚀</div>
        <p style={{ color: '#FFD700', fontSize: 56, fontWeight: 900, margin: 0, animation: 'xpBounce 0.6s ease forwards' }}>
          +{ev.xp} XP
        </p>
        <p style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0 }}>סיימת ספרינט!</p>
      </div>
    )
  }

  if (ev.type === 'streak_bonus') {
    return (
      <div style={{ ...base, background: 'rgba(20,10,0,0.85)' }} onClick={dismissCelebration}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(255,107,53,0.5)',
          animation: 'flashOrange 2s ease forwards',
          pointerEvents: 'none',
        }} />
        {FLAMES.map((f, i) => (
          <div key={i} style={{
            position: 'absolute', left: f.left, top: '-30px',
            fontSize: f.size, animationDelay: f.delay,
            animation: 'flameFall 2s ease forwards', pointerEvents: 'none',
          }}>🔥</div>
        ))}
        <div style={{ fontSize: 72, animation: 'xpBounce 0.5s ease forwards', zIndex: 1 }}>🔥</div>
        <p style={{ color: '#FF6B35', fontSize: 32, fontWeight: 900, margin: 0, textAlign: 'center', zIndex: 1 }}>
          {ev.days} ימים רצוף!
        </p>
        <p style={{ color: '#FFD700', fontSize: 48, fontWeight: 900, margin: 0, animation: 'xpBounce 0.6s ease forwards', zIndex: 1 }}>
          +{ev.xp} XP בונוס!
        </p>
      </div>
    )
  }

  if (ev.type === 'double_xp') {
    return (
      <div style={{ ...base, background: 'rgba(0,0,0,0.92)' }} onClick={dismissCelebration}>
        {CONFETTI.map((d, i) => (
          <div key={i} style={{
            position: 'absolute', left: d.left, top: '-10px',
            width: d.size, height: d.size, borderRadius: '50%',
            background: d.color, animationDelay: d.delay,
            animation: 'fall 3s ease forwards', pointerEvents: 'none',
          }} />
        ))}
        <div style={{ fontSize: 100, animation: 'scaleIn 0.6s cubic-bezier(.34,1.56,.64,1) forwards' }}>🤯</div>
        <p style={{ color: '#FFD700', fontSize: 72, fontWeight: 900, margin: 0, animation: 'scaleIn 0.7s ease forwards' }}>×2</p>
        <p style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0, textAlign: 'center' }}>8 שאלות ברצף!! הניקוד הוכפל!</p>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 17, margin: 0, textAlign: 'center' }}>
          היו לך {ev.sessionXP} → עכשיו {ev.newTotal} נקודות!
        </p>
      </div>
    )
  }

  if (ev.type === 'level_up') {
    return (
      <div style={{ ...base, background: 'rgba(0,0,0,0.88)' }} onClick={dismissCelebration}>
        {CONFETTI.map((d, i) => (
          <div key={i} style={{
            position: 'absolute', left: d.left, top: '-10px',
            width: d.size, height: d.size, borderRadius: '50%',
            background: d.color, animationDelay: d.delay,
            animation: 'fall 3s ease forwards', pointerEvents: 'none',
          }} />
        ))}
        <div style={{ fontSize: 100, animation: 'xpBounce 0.6s cubic-bezier(.34,1.56,.64,1) forwards' }}>
          {ev.newLevel.trophy}
        </div>
        <p style={{ color: '#FFD700', fontSize: 32, fontWeight: 900, margin: 0, animation: 'slideDown 0.4s ease forwards' }}>
          עלית רמה!
        </p>
        <p style={{ color: ev.newLevel.color, fontSize: 40, fontWeight: 900, margin: 0, animation: 'scaleIn 0.5s ease 0.2s forwards', opacity: 0 }}>
          {ev.newLevel.title}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, margin: 0 }}>לחץ להמשך</p>
      </div>
    )
  }

  return null
}
