import { useEffect } from 'react'
import { COLORS, GRADIENT } from '../theme'

const DOTS = Array.from({ length: 40 }, (_, i) => ({
  color: ['#FFD700','#4ade80','#60a5fa','#f87171','#a78bfa','#fb923c'][i % 6],
  left: `${Math.random() * 100}%`,
  delay: `${Math.random() * 0.5}s`,
  size: `${8 + Math.random() * 8}px`,
}))

interface Props { streak: number; onDismiss: () => void }

export default function XPCelebrationScreen({ streak, onDismiss }: Props) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 2500)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div style={{ ...styles.screen, background: GRADIENT }} onClick={onDismiss}>
      {DOTS.map((d, i) => (
        <div key={i} style={{
          position: 'absolute', left: d.left, top: '-10px',
          width: d.size, height: d.size, borderRadius: '50%',
          background: d.color, animationDelay: d.delay,
          animation: `confettiFall 2s ease forwards`,
        }} />
      ))}
      <div style={{ fontSize: 90, animation: 'bounceIn 0.5s cubic-bezier(.34,1.56,.64,1)' }}>🔥</div>
      <p style={styles.streakText}>רצף {streak} ימים!!</p>
      <p style={styles.multiplierText}>מכפיל XP פעיל! 🚀</p>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  screen: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '100dvh', gap: 16,
    position: 'relative', overflow: 'hidden', cursor: 'pointer',
  },
  streakText: { color: COLORS.yellow, fontSize: 'clamp(36px,9vw,52px)', fontWeight: 'bold', direction: 'rtl', margin: 0 },
  multiplierText: { color: COLORS.white, fontSize: 24, direction: 'rtl', margin: 0 },
}
