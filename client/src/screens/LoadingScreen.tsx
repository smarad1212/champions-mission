import { useEffect, useState } from 'react'
import { COLORS, GRADIENT } from '../theme'

const LOADING_MESSAGES = [
  'הבינה המלאכותית חושבת...',
  'מכין הפתעה בשבילך...',
  'בודק מה אתה אוהב...',
  'יוצר שאלות מיוחדות...',
  'כמעט מוכן...',
]

export default function LoadingScreen() {
  const [msgIdx, setMsgIdx] = useState(0)
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    const msg = setInterval(() => setMsgIdx(i => (i + 1) % LOADING_MESSAGES.length), 1500)
    const rot = setInterval(() => setRotation(r => (r + 6) % 360), 16)
    return () => { clearInterval(msg); clearInterval(rot) }
  }, [])

  return (
    <div style={{ ...styles.screen, background: GRADIENT }}>
      <div style={{ fontSize: 72, transform: `rotate(${rotation}deg)`, transition: 'none' }}>⭐</div>
      <p style={styles.message}>{LOADING_MESSAGES[msgIdx]}</p>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  screen: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '100dvh', gap: 24,
    padding: '0 24px', textAlign: 'center',
  },
  message: {
    color: COLORS.whiteAlpha80, fontSize: 20, direction: 'rtl',
    margin: 0, maxWidth: 300,
  },
}
