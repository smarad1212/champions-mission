import { useState, useCallback, useEffect, useRef } from 'react'
import ModelBadge from './components/ModelBadge'
import XPCelebration from './components/XPCelebration'
import './index.css'
import { AppProvider, useApp } from './context/AppContext'
import type { ChildProfile, SprintContent } from './types'
import { generateSprint, getChild } from './services/api'

import HomeScreen from './screens/HomeScreen'
import AddChildScreen from './screens/AddChildScreen'
import SplashScreen from './screens/SplashScreen'
import LessonScreen from './screens/LessonScreen'
import QuestionScreen from './screens/QuestionScreen'
import SummaryScreen from './screens/SummaryScreen'
import LoadingScreen from './screens/LoadingScreen'
import ErrorScreen from './screens/ErrorScreen'

type Screen = 'home' | 'addChild' | 'splash' | 'loading' | 'lesson' | 'question' | 'summary' | 'error'

function Navigator() {
  const { state, setChild, setSprint, clearNextSprint, advanceQuestion } = useApp()
  const [screen, setScreen] = useState<Screen>('home')
  const [activeChild, setActiveChild] = useState<ChildProfile | null>(null)
  const [sprint, setSp] = useState<SprintContent | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // Prevents fetchAndNavigate from firing twice on the same loading screen
  const fetchingRef = useRef(false)

  const handleChildSelected = (child: ChildProfile) => {
    setChild(child)
    setActiveChild(child)
    setScreen('splash')
  }

  const handleAddChild = () => setScreen('addChild')

  const handleAddChildSuccess = (child: ChildProfile) => {
    setChild(child)
    setActiveChild(child)
    setScreen('splash')
  }

  const handleSprintLoaded = (s: SprintContent, sprintId: string | null = null) => {
    setSp(s)
    setSprint(s, sprintId)
    setScreen('lesson')
  }

  const handleLessonNext = () => setScreen('question')

  const handleQuestionNext = () => {
    advanceQuestion()
    setScreen('question')
  }

  const handleErrorRetry = () => setScreen('home')

  // Fetch a fresh sprint and go to lesson (fallback) — guarded against double calls
  const fetchAndNavigate = useCallback(async () => {
    if (fetchingRef.current) return
    fetchingRef.current = true
    try {
      const child = state.child
      if (!child) { setScreen('error'); return }
      const updatedChild = await getChild(child.id)
      const { sprint: next, sprint_id } = await generateSprint(updatedChild)
      setSp(next)
      setSprint(next, sprint_id)
      setScreen('lesson')
    } catch {
      setScreen('error')
    } finally {
      fetchingRef.current = false
    }
  }, [state.child, setSprint])

  // When loading screen is shown and preload finishes, transition to lesson
  useEffect(() => {
    if (screen !== 'loading') {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
      fetchingRef.current = false
      return
    }

    if (state.nextSprint) {
      // Preload just completed while we were on loading screen
      const next = state.nextSprint
      const nextId = state.nextSprintId
      clearNextSprint()
      setSp(next)
      setSprint(next, nextId)
      setScreen('lesson')
      return
    }

    if (!state.isPreloading) {
      // Nothing preloading — fetch directly
      fetchAndNavigate()
      return
    }

    // Poll every 300ms for preload to complete
    let waited = 0
    pollRef.current = setInterval(() => {
      waited += 300
      if (waited >= 10000) {
        clearInterval(pollRef.current!)
        pollRef.current = null
        fetchAndNavigate()
      }
    }, 300)

    return () => {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
    }
  }, [screen]) // eslint-disable-line react-hooks/exhaustive-deps

  // Poll state.nextSprint while on loading screen
  useEffect(() => {
    if (screen !== 'loading') return
    if (!state.nextSprint) return

    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
    const next = state.nextSprint
    const nextId = state.nextSprintId
    clearNextSprint()
    setSp(next)
    setSprint(next, nextId)
    setScreen('lesson')
  }, [state.nextSprint, screen]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleNextSprint = useCallback(() => {
    if (state.nextSprint) {
      // Preloaded sprint ready — instant switch, zero loading screen
      const next = state.nextSprint
      const nextId = state.nextSprintId
      clearNextSprint()
      setSp(next)
      setSprint(next, nextId)
      setScreen('lesson')
    } else if (state.isPreloading) {
      // Still loading — show loading screen, poll until ready
      setScreen('loading')
    } else {
      // Preload failed — fetch now with loading screen
      setScreen('loading')
    }
  }, [state.nextSprint, state.nextSprintId, state.isPreloading, clearNextSprint, setSprint])

  if (screen === 'home') return (
    <HomeScreen onSelectChild={handleChildSelected} onAddChild={handleAddChild} />
  )

  if (screen === 'addChild') return (
    <AddChildScreen onSuccess={handleAddChildSuccess} onBack={() => setScreen('home')} />
  )

  if (screen === 'splash') {
    if (!activeChild) { setScreen('home'); return null }
    return (
      <SplashScreen
        child={activeChild}
        onSuccess={handleSprintLoaded}
        onError={() => setScreen('error')}
      />
    )
  }

  if (screen === 'loading') return <LoadingScreen />

  if (screen === 'error') return <ErrorScreen onRetry={handleErrorRetry} />

  if (!sprint) return <LoadingScreen />

  if (screen === 'lesson') return (
    <LessonScreen sprint={sprint} onNext={handleLessonNext} onGoHome={() => setScreen('home')} />
  )

  if (screen === 'question') return (
    <QuestionScreen
      sprint={sprint}
      questionIndex={state.currentQuestionIndex}
      onNext={handleQuestionNext}
      onAllDone={() => setScreen('summary')}
      onGoHome={() => setScreen('home')}
    />
  )

  if (screen === 'summary') return (
    <SummaryScreen sprint={sprint} onNextSprint={handleNextSprint} onGoHome={() => setScreen('home')} />
  )

  return <LoadingScreen />
}

export default function App() {
  return (
    <AppProvider>
      <div className="app-container">
        <ModelBadge />
        <XPCelebration />
        <Navigator />
      </div>
    </AppProvider>
  )
}
