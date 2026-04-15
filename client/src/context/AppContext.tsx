import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { ChildProfile, SprintContent } from '../types'
import { getLevel } from '../data/levels'
import type { CelebrationEvent } from '../types/celebrations'

interface AppState {
  child: ChildProfile | null
  currentSprint: SprintContent | null
  currentSprintId: string | null
  nextSprint: SprintContent | null
  nextSprintId: string | null
  isPreloading: boolean
  currentQuestionIndex: number
  totalXP: number
  streak: number
  questionStreak: number
  correctAnswers: number
  wrongAnswers: number
  sprintXPEarned: number
  disabledOptions: number[]
  lastSubject: string
  sessionXP: number
  streakMultiplied: boolean
  pendingCelebration: CelebrationEvent | null
}

interface AppContextType {
  state: AppState
  setChild: (child: ChildProfile) => void
  setSprint: (sprint: SprintContent, sprintId?: string | null) => void
  setNextSprint: (sprint: SprintContent, sprintId?: string | null) => void
  setPreloading: (loading: boolean) => void
  clearNextSprint: () => void
  advanceQuestion: () => void
  addXP: (amount: number) => void
  markCorrect: () => void
  markWrong: () => void
  incrementQuestionStreak: () => void
  resetQuestionStreak: () => void
  disableOption: (index: number) => void
  clearDisabledOptions: () => void
  resetSprint: () => void
  doubleSessionXP: () => void
  triggerCelebration: (event: CelebrationEvent) => void
  dismissCelebration: () => void
  setStreakMultiplied: (val: boolean) => void
}

const defaultState: AppState = {
  child: null,
  currentSprint: null,
  currentSprintId: null,
  nextSprint: null,
  nextSprintId: null,
  isPreloading: false,
  currentQuestionIndex: 0,
  totalXP: 0,
  streak: 0,
  questionStreak: 0,
  correctAnswers: 0,
  wrongAnswers: 0,
  sprintXPEarned: 0,
  disabledOptions: [],
  lastSubject: '',
  sessionXP: 0,
  streakMultiplied: false,
  pendingCelebration: null,
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState)

  const setChild = (child: ChildProfile) =>
    setState(s => ({
      ...s,
      child,
      totalXP: child.total_xp,
      streak: child.streak_days,
    }))

  const setSprint = (sprint: SprintContent, sprintId: string | null = null) =>
    setState(s => ({
      ...s,
      currentSprint: sprint,
      currentSprintId: sprintId,
      currentQuestionIndex: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      sprintXPEarned: 0,
      disabledOptions: [],
      lastSubject: sprint.lesson.subject,
    }))

  const setNextSprint = (sprint: SprintContent, sprintId: string | null = null) =>
    setState(s => ({ ...s, nextSprint: sprint, nextSprintId: sprintId, isPreloading: false }))

  const setPreloading = (loading: boolean) =>
    setState(s => ({ ...s, isPreloading: loading }))

  const clearNextSprint = () =>
    setState(s => ({ ...s, nextSprint: null, nextSprintId: null, isPreloading: false }))

  const advanceQuestion = () =>
    setState(s => ({
      ...s,
      currentQuestionIndex: s.currentQuestionIndex + 1,
      disabledOptions: [],
    }))

  const addXP = (amount: number) =>
    setState(s => {
      const prevLevel = getLevel(s.totalXP)
      const newTotalXP = s.totalXP + amount
      const newLevel = getLevel(newTotalXP)
      const leveledUp = newLevel.level > prevLevel.level

      const newPendingCelebration: CelebrationEvent | null =
        leveledUp && !s.pendingCelebration
          ? { type: 'level_up', newLevel }
          : s.pendingCelebration

      return {
        ...s,
        totalXP: newTotalXP,
        sprintXPEarned: s.sprintXPEarned + amount,
        sessionXP: s.sessionXP + amount,
        pendingCelebration: newPendingCelebration,
      }
    })

  const markCorrect = () =>
    setState(s => ({ ...s, correctAnswers: s.correctAnswers + 1 }))

  const markWrong = () =>
    setState(s => ({ ...s, wrongAnswers: s.wrongAnswers + 1 }))

  const incrementQuestionStreak = () =>
    setState(s => ({ ...s, questionStreak: s.questionStreak + 1 }))

  const resetQuestionStreak = () =>
    setState(s => ({ ...s, questionStreak: 0 }))

  const disableOption = (index: number) =>
    setState(s => ({ ...s, disabledOptions: [...s.disabledOptions, index] }))

  const clearDisabledOptions = () =>
    setState(s => ({ ...s, disabledOptions: [] }))

  const resetSprint = () =>
    setState(s => ({
      ...s,
      currentQuestionIndex: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      sprintXPEarned: 0,
      disabledOptions: [],
      currentSprint: null,
      currentSprintId: null,
    }))

  const doubleSessionXP = () =>
    setState(s => {
      const newTotalXP = s.totalXP + s.sessionXP
      const newSprintXPEarned = s.sprintXPEarned + s.sessionXP
      const celebration: CelebrationEvent = {
        type: 'double_xp',
        sessionXP: s.sessionXP,
        newTotal: newTotalXP,
      }
      return {
        ...s,
        totalXP: newTotalXP,
        sprintXPEarned: newSprintXPEarned,
        streakMultiplied: true,
        pendingCelebration: celebration,
      }
    })

  const triggerCelebration = (event: CelebrationEvent) =>
    setState(s => ({ ...s, pendingCelebration: event }))

  const dismissCelebration = () =>
    setState(s => ({ ...s, pendingCelebration: null }))

  const setStreakMultiplied = (val: boolean) =>
    setState(s => ({ ...s, streakMultiplied: val }))

  return (
    <AppContext.Provider value={{
      state, setChild, setSprint, setNextSprint, setPreloading, clearNextSprint,
      advanceQuestion, addXP, markCorrect, markWrong,
      incrementQuestionStreak, resetQuestionStreak,
      disableOption, clearDisabledOptions, resetSprint,
      doubleSessionXP, triggerCelebration, dismissCelebration, setStreakMultiplied,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
