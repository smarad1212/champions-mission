import { GRADIENT } from '../theme'

interface Props {
  message?: string
  fullScreen?: boolean
}

export function LoadingSpinner({ message = 'טוען...', fullScreen = true }: Props) {
  const inner = (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 16,
    }}>
      <div style={{
        width: 48, height: 48,
        border: '4px solid rgba(255,255,255,0.15)',
        borderTop: '4px solid #4ade80',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{
        color: 'rgba(255,255,255,0.8)',
        fontSize: 18,
        direction: 'rtl',
        margin: 0,
        textAlign: 'center',
        maxWidth: 260,
      }}>{message}</p>
    </div>
  )

  if (!fullScreen) return inner

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100dvh', background: GRADIENT,
    }}>
      {inner}
    </div>
  )
}
