import { useEffect, useState } from 'react'

interface Config {
  provider: string
  model: string
}

const PROVIDER_ICON: Record<string, string> = {
  claude: '🤖',
  gemini: '✨',
}

export default function ModelBadge() {
  const [config, setConfig] = useState<Config | null>(null)

  useEffect(() => {
    const base = import.meta.env.VITE_API_URL || ''
    fetch(`${base}/api/config`)
      .then(r => r.json())
      .then(setConfig)
      .catch(() => {})
  }, [])

  if (!config) return null

  const icon = PROVIDER_ICON[config.provider] ?? '🤖'

  return (
    <div style={{
      position: 'absolute',
      top: 10,
      right: 12,
      left: 'auto',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 4,
      direction: 'ltr',
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: 20,
      padding: '3px 10px',
      backdropFilter: 'blur(8px)',
      pointerEvents: 'none',
    }}>
      <span style={{ fontSize: 11 }}>{icon}</span>
      <span style={{
        fontSize: 11,
        fontWeight: 500,
        color: 'rgba(255,255,255,0.55)',
        letterSpacing: '0.02em',
        fontFamily: 'system-ui, sans-serif',
      }}>
        {config.model}
      </span>
    </div>
  )
}
