import { useState, useRef, useEffect } from 'react'
import { COLORS, GRADIENT } from '../theme'
import { useApp } from '../context/AppContext'
import type { Question, SprintContent } from '../types'
import { SoundFX } from '../services/sounds'
import { submitAnswer } from '../services/api'
import HomeButton from '../components/HomeButton'
import { getLevel } from '../data/levels'

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

interface FloatXP { id: number; amount: number }

interface Props {
  sprint: SprintContent
  questionIndex: number
  onNext: () => void
  onAllDone: () => void
  onGoHome: () => void
}

export default function QuestionScreen({ sprint, questionIndex, onNext, onAllDone, onGoHome }: Props) {
  const { state, addXP, markCorrect, markWrong, incrementQuestionStreak, resetQuestionStreak, disableOption, doubleSessionXP } = useApp()
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
  const [isFirstAttempt, setIsFirstAttempt] = useState(true)
  const attemptsRef = useRef(0)
  const floaterId = useRef(0)
  const prevXPRef = useRef(state.totalXP)

  // Track XP for level-up detection (handled in AppContext addXP)
  useEffect(() => {
    prevXPRef.current = state.totalXP
  }, [state.totalXP])

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

  // Suppress unused import warning for getLevel (available for future use)
  void getLevel

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
          doubleSessionXP()
          resetQuestionStreak()
          setTimeout(advance, 1800)
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

  const progress = (questionIndex / total) * 100

  // Progress dots
  const progressDots = Array.from({ length: total }, (_, i) => {
    if (i < questionIndex) return 'done'
    if (i === questionIndex) return 'current'
    return 'pending'
  })

  return (
    <div className="screen-enter" style={{ ...styles.screen, background: GRADIENT }}>

      <HomeButton onConfirm={onGoHome} />

      {/* Floating XP */}
      {floaters.map(f => (
        <div key={f.id} style={styles.floatXP}>+{f.amount} XP</div>
      ))}

      {/* Top bar: score+streak LEFT | question counter RIGHT */}
      <div style={styles.topBar}>
        <div style={styles.scorePill}>🔥 ניקוד: {state.totalXP} | רצף: {state.questionStreak}</div>
        <div style={styles.counterPill}>שאלה {questionIndex + 1} מתוך {total}</div>
      </div>

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

      {/* Question */}
      <div style={styles.questionBox}>
        <p style={styles.questionText}>{question.text}</p>
      </div>

      {/* Single-column answers */}
      <div style={styles.answerList}>
        {question.options.map((opt, i) => (
          <button key={i} className="answer-btn game-btn" style={getBtnStyle(i)} onClick={() => handleAnswer(i)}>
            {answeredCorrect && i === question.correct_index && <span style={{ marginLeft: 8 }}>✓</span>}
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
    minHeight: '100dvh', padding: '20px 16px 80px', gap: 14,
    position: 'relative',
  },
  topBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    width: '100%', maxWidth: 520,
  },
  scorePill: {
    background: 'rgba(34,197,94,0.2)', color: '#4ade80',
    border: '1.5px solid rgba(74,222,128,0.35)',
    borderRadius: 999, padding: '7px 16px', fontSize: 15, fontWeight: 700,
  },
  counterPill: {
    background: 'rgba(96,165,250,0.2)', color: '#93c5fd',
    border: '1.5px solid rgba(96,165,250,0.35)',
    borderRadius: 999, padding: '7px 16px', fontSize: 15, fontWeight: 700,
    direction: 'rtl',
  },
  floatXP: {
    position: 'absolute', top: '28%', left: '50%',
    transform: 'translateX(-50%)',
    color: COLORS.green, fontSize: 30, fontWeight: 'bold',
    animation: 'floatUp 1.2s ease forwards', zIndex: 10, pointerEvents: 'none',
  },
  dotsRow: { display: 'flex', gap: 8, marginBottom: 0 },
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
  questionBox: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 6, width: '100%', maxWidth: 520,
  },
  questionText: {
    color: COLORS.white,
    fontSize: 'clamp(22px, 5vw, 28px)',
    fontWeight: 900,
    textAlign: 'center', direction: 'rtl', margin: 0, lineHeight: 1.45,
  },
  answerList: {
    display: 'flex', flexDirection: 'column',
    gap: 12, width: '100%', maxWidth: 520,
  },
  optBtn: {
    background: 'rgba(255,255,255,0.12)', color: COLORS.white,
    border: '2px solid rgba(255,255,255,0.15)', borderRadius: 18,
    padding: '18px 22px',
    fontSize: 18, fontWeight: 600,
    minHeight: 64, display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
    textAlign: 'right', transition: 'all 0.2s',
    fontFamily: 'inherit', cursor: 'pointer', width: '100%',
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
