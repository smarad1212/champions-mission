import { useState, useRef, useEffect } from 'react'
import { COLORS, GRADIENT } from '../theme'
import { useApp } from '../context/AppContext'
import type { Question, SprintContent } from '../types'
import { SoundFX } from '../services/sounds'
import { submitAnswer } from '../services/api'

const PRAISE_TEMPLATES = [
  'מטורף! 🔥',
  'וואו, נכון לגמרי!',
  '{name} אלוף! 🏆',
  'ידעתי שתצליח! ⭐',
  'מושלם! כך ממשיכים!',
  'חכם מאוד! 💡',
  'בדיוק! אין כמוך!',
]

function getPraise(name: string) {
  const t = PRAISE_TEMPLATES[Math.floor(Math.random() * PRAISE_TEMPLATES.length)]
  return t.replace('{name}', name || 'אלוף')
}

const CONFETTI_COLORS = ['#FFD700', '#4ade80', '#60a5fa', '#f87171', '#a78bfa', '#fb923c']
const CONFETTI_DOTS = Array.from({ length: 30 }, (_, i) => ({
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  left: `${Math.random() * 100}%`,
  delay: `${Math.random() * 0.3}s`,
  size: `${8 + Math.random() * 8}px`,
}))

interface FloatXP { id: number; amount: number }

interface Props {
  sprint: SprintContent
  questionIndex: number
  onNext: () => void
  onAllDone: () => void
}

export default function QuestionScreen({ sprint, questionIndex, onNext, onAllDone }: Props) {
  const { state, addXP, markCorrect, markWrong, incrementQuestionStreak, resetQuestionStreak, disableOption } = useApp()
  const childName = state.child?.name ?? ''
  const total = sprint.questions.length
  const question: Question | undefined = sprint.questions[questionIndex]

  // Guard: if index is somehow out of bounds, trigger done
  if (!question) { onAllDone(); return null }

  const [answeredCorrect, setAnsweredCorrect] = useState(false)
  const [wrongAttempt, setWrongAttempt] = useState<number | null>(null)
  const [shakingBtn, setShakingBtn] = useState<number | null>(null)
  const [floaters, setFloaters] = useState<FloatXP[]>([])
  const [praise, setPraise] = useState<string | null>(null)
  const [showStreak, setShowStreak] = useState(false)
  const [isFirstAttempt, setIsFirstAttempt] = useState(true)
  const attemptsRef = useRef(0)
  const floaterId = useRef(0)

  // Reset per-question state when question changes
  useEffect(() => {
    setAnsweredCorrect(false)
    setWrongAttempt(null)
    setShakingBtn(null)
    setPraise(null)
    setIsFirstAttempt(true)
    setFloaters([])
    attemptsRef.current = 0
  }, [questionIndex])

  const handleAnswer = (index: number) => {
    if (answeredCorrect) return
    if (state.disabledOptions.includes(index)) return

    const correct = index === question.correct_index
    attemptsRef.current += 1

    if (correct) {
      setAnsweredCorrect(true)
      markCorrect()
      SoundFX.correct()
      setPraise(getPraise(childName))

      // Submit answer to backend (non-blocking)
      if (state.child?.id) {
        submitAnswer(state.currentSprintId, {
          child_id: state.child.id,
          subject: sprint.lesson.subject,
          concept: sprint.lesson.concept,
          question_id: typeof question.id === 'number' ? question.id : questionIndex + 1,
          correct_on_first_attempt: isFirstAttempt,
          total_attempts: attemptsRef.current,
        })
      }

      // XP only on first attempt
      if (isFirstAttempt) {
        addXP(10)
        const id = floaterId.current++
        setFloaters(f => [...f, { id, amount: 10 }])
        setTimeout(() => setFloaters(f => f.filter(x => x.id !== id)), 1300)

        const newStreak = state.questionStreak + 1
        incrementQuestionStreak()

        if (newStreak === 8) {
          addXP(80)
          SoundFX.streak()
          setShowStreak(true)
          setTimeout(() => {
            setShowStreak(false)
            resetQuestionStreak()
            advance()
          }, 3000)
          return
        }
      }

      setTimeout(advance, 1800)
    } else {
      // Wrong answer
      setWrongAttempt(index)
      setShakingBtn(index)
      setIsFirstAttempt(false)
      resetQuestionStreak()
      markWrong()
      disableOption(index)
      SoundFX.wrong()
      setTimeout(() => setShakingBtn(null), 500)
    }
  }

  const advance = () => {
    // advanceQuestion is called by the parent (App.tsx) via onNext — don't call it here too
    if (questionIndex + 1 >= total) onAllDone()
    else onNext()
  }

  const getBtnStyle = (i: number): React.CSSProperties => {
    const isDisabled = state.disabledOptions.includes(i)
    const isShaking = shakingBtn === i
    const isCorrect = answeredCorrect && i === question.correct_index

    return {
      ...styles.optBtn,
      ...(isCorrect ? styles.correct : {}),
      ...(isDisabled && !isCorrect ? styles.disabled : {}),
      animation: isShaking ? 'shake 0.4s ease' : undefined,
      pointerEvents: (answeredCorrect || isDisabled) ? 'none' : 'auto',
      cursor: (answeredCorrect || isDisabled) ? 'default' : 'pointer',
    }
  }

  const progress = ((questionIndex) / total) * 100
  const diffLabel: Record<string, string> = {
    easy: '⭐ קל', medium: '⭐⭐ בינוני', hard: '⭐⭐⭐ קשה', wildcard: '🃏 ווילדקארד',
  }

  // Progress dots
  const progressDots = Array.from({ length: total }, (_, i) => {
    if (i < questionIndex) return 'done'
    if (i === questionIndex) return 'current'
    return 'pending'
  })

  return (
    <div style={{ ...styles.screen, background: GRADIENT }}>

      {/* 8-streak celebration overlay */}
      {showStreak && (
        <div style={styles.streakOverlay}>
          {CONFETTI_DOTS.map((d, i) => (
            <div key={i} style={{
              position: 'absolute', left: d.left, top: '-10px',
              width: d.size, height: d.size, borderRadius: '50%',
              background: d.color, animationDelay: d.delay,
              animation: 'fall 2.5s ease forwards',
            }} />
          ))}
          <div style={styles.streakEmoji}>🤯</div>
          <p style={styles.streakTitle}>8 שאלות ברצף!!</p>
          <p style={styles.streakSub}>הניקוד הוכפל! 🚀</p>
        </div>
      )}

      {/* Floating XP */}
      {floaters.map(f => (
        <div key={f.id} style={styles.floatXP}>+{f.amount} XP</div>
      ))}

      {/* Progress dots */}
      <div style={styles.dotsRow}>
        {progressDots.map((dot, i) => (
          <div key={i} style={{
            ...styles.dot,
            background: dot === 'done' ? COLORS.green : dot === 'current' ? COLORS.blue : COLORS.whiteAlpha20,
            transform: dot === 'current' ? 'scale(1.3)' : 'scale(1)',
          }} />
        ))}
      </div>

      {/* Progress bar */}
      <div style={styles.progressBg}>
        <div style={{ ...styles.progressFill, width: `${progress}%` }} />
      </div>

      <div style={styles.counter}>שאלה {questionIndex + 1} מתוך {total}</div>

      {/* Question */}
      <div style={styles.questionBox}>
        <span style={styles.difficulty}>{diffLabel[question.difficulty]}</span>
        <p style={styles.questionText}>{question.text}</p>
      </div>

      {/* 2×2 grid */}
      <div style={styles.grid}>
        {question.options.map((opt, i) => (
          <button key={i} style={getBtnStyle(i)} onClick={() => handleAnswer(i)}>
            {answeredCorrect && i === question.correct_index && <span style={{ marginLeft: 6 }}>✓ </span>}
            <span style={styles.optText}>{opt}</span>
          </button>
        ))}
      </div>

      {/* Wrong attempt message */}
      {wrongAttempt !== null && !answeredCorrect && (
        <div style={styles.retryBanner}>
          <p style={styles.retryText}>לא מדויק — נסה שוב! 💪</p>
        </div>
      )}

      {/* Correct explanation + praise */}
      {answeredCorrect && (
        <div style={styles.explanationBox}>
          <p style={styles.explanationText}>✅ {question.explanation}</p>
          {praise && <p style={styles.praiseText}>{praise}</p>}
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  screen: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    minHeight: '100dvh', padding: '52px 16px 24px', gap: 12,
    position: 'relative', overflow: 'hidden',
  },
  streakOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
    zIndex: 999, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 16,
    overflow: 'hidden',
  },
  streakEmoji: { fontSize: 90, animation: 'bounceIn 0.5s cubic-bezier(.34,1.56,.64,1)' },
  streakTitle: {
    color: COLORS.yellow, fontSize: 'clamp(32px,8vw,48px)',
    fontWeight: 'bold', direction: 'rtl', margin: 0,
    animation: 'pop 0.6s ease',
  },
  streakSub: {
    color: COLORS.white, fontSize: 24, direction: 'rtl', margin: 0, fontWeight: 'bold',
  },
  floatXP: {
    position: 'absolute', top: '28%', left: '50%',
    transform: 'translateX(-50%)',
    color: COLORS.green, fontSize: 30, fontWeight: 'bold',
    animation: 'floatUp 1.2s ease forwards', zIndex: 10, pointerEvents: 'none',
  },
  dotsRow: { display: 'flex', gap: 8, marginBottom: 4 },
  dot: {
    width: 12, height: 12, borderRadius: '50%',
    transition: 'all 0.3s ease',
  },
  progressBg: {
    width: '100%', maxWidth: 500, height: 6,
    background: COLORS.whiteAlpha20, borderRadius: 999,
  },
  progressFill: {
    height: 6, background: COLORS.green, borderRadius: 999,
    transition: 'width 0.4s ease',
  },
  counter: {
    color: COLORS.white, fontSize: 15, fontWeight: 600,
    direction: 'rtl', background: COLORS.whiteAlpha15,
    padding: '5px 16px', borderRadius: 999,
  },
  questionBox: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 8, width: '100%', maxWidth: 500,
  },
  difficulty: { color: COLORS.yellow, fontSize: 14, fontWeight: 600 },
  questionText: {
    color: COLORS.white, fontSize: 'clamp(19px,4.5vw,24px)', fontWeight: 'bold',
    textAlign: 'center', direction: 'rtl', margin: 0, lineHeight: 1.5,
  },
  grid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: 10, width: '100%', maxWidth: 500,
  },
  optBtn: {
    background: COLORS.whiteAlpha15, color: COLORS.white,
    border: '1.5px solid transparent', borderRadius: 16,
    padding: '14px 10px', fontSize: 16,
    minHeight: 70, display: 'flex', alignItems: 'center', justifyContent: 'center',
    direction: 'rtl', textAlign: 'center', transition: 'all 0.2s',
    fontFamily: 'inherit', cursor: 'pointer',
  },
  correct: {
    background: '#16a34a', borderColor: COLORS.green, color: COLORS.white,
  },
  disabled: {
    background: COLORS.redBg, borderColor: COLORS.red,
    opacity: 0.5, pointerEvents: 'none',
  },
  optText: { direction: 'rtl' },
  retryBanner: {
    background: 'rgba(248,113,113,0.15)', border: `1px solid ${COLORS.red}`,
    borderRadius: 12, padding: '10px 20px', width: '100%', maxWidth: 500,
  },
  retryText: {
    color: COLORS.red, fontSize: 17, direction: 'rtl',
    margin: 0, textAlign: 'center', fontWeight: 600,
  },
  explanationBox: {
    background: COLORS.greenBg, border: `1px solid ${COLORS.green}`,
    borderRadius: 14, padding: '14px 18px',
    width: '100%', maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 8,
  },
  explanationText: {
    color: COLORS.white, fontSize: 17, direction: 'rtl',
    margin: 0, textAlign: 'center', lineHeight: 1.5,
  },
  praiseText: {
    color: COLORS.yellow, fontSize: 20, fontWeight: 'bold',
    direction: 'rtl', margin: 0, textAlign: 'center',
    animation: 'pop 0.4s ease',
  },
}
