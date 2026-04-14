import { COLORS, GRADIENT } from '../theme'

interface Props { onRetry: () => void }

export default function ErrorScreen({ onRetry }: Props) {
  return (
    <div style={{ ...styles.screen, background: GRADIENT }}>
      <div style={{ fontSize: 80 }}>😕</div>
      <p style={styles.title}>משהו השתבש...</p>
      <button style={styles.btn} onClick={onRetry}>נסה שוב 🔄</button>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  screen: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '100dvh', gap: 24,
    padding: '0 24px', textAlign: 'center',
  },
  title: { color: COLORS.white, fontSize: 26, fontWeight: 'bold', direction: 'rtl', margin: 0 },
  btn: {
    background: COLORS.blue, color: COLORS.white, border: 'none',
    borderRadius: 999, padding: '16px 40px', fontSize: 18,
    fontWeight: 'bold', cursor: 'pointer', minHeight: 60,
  },
}
