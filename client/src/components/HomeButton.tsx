import { useState } from 'react'

interface Props { onConfirm: () => void }

export default function HomeButton({ onConfirm }: Props) {
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <>
      <button
        className="game-btn"
        onClick={() => setShowConfirm(true)}
        style={{
          position: 'fixed', top: 12, left: 12, zIndex: 100,
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.2)',
          fontSize: 18, cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)',
        }}
      >🏠</button>

      {showConfirm && (
        <div
          onClick={() => setShowConfirm(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9000,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#302B63', borderRadius: 24, padding: '28px 24px',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 20, maxWidth: 300, width: '90%',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            }}
          >
            <span style={{ fontSize: 40 }}>🏠</span>
            <p style={{ color: '#fff', fontSize: 18, fontWeight: 700, textAlign: 'center', margin: 0 }}>
              לחזור לבית?<br />
              <span style={{ fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.6)' }}>ההתקדמות תישמר</span>
            </p>
            <div style={{ display: 'flex', gap: 12, width: '100%' }}>
              <button
                className="game-btn"
                onClick={() => { setShowConfirm(false); onConfirm() }}
                style={{
                  flex: 1, background: '#22c55e', color: '#fff', border: 'none',
                  borderRadius: 99, padding: '14px', fontSize: 17, fontWeight: 700, cursor: 'pointer',
                }}
              >כן</button>
              <button
                className="game-btn"
                onClick={() => setShowConfirm(false)}
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.12)', color: '#fff', border: 'none',
                  borderRadius: 99, padding: '14px', fontSize: 17, fontWeight: 700, cursor: 'pointer',
                }}
              >לא</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
