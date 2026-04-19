import { useState, useRef } from 'react'
import ModelBadge from './components/ModelBadge'
import XPCelebration from './components/XPCelebration'
import './index.css'
import { AppProvider, useApp } from './context/AppContext'
import type { ChildProfile, SprintContent } from './types'
import { PrefetchService } from './services/prefetchService'

import HomeScreen from './screens/HomeScreen'
import AddChildScreen from './screens/AddChildScreen'
import SplashScreen from './screens/SplashScreen'
import LessonScreen from './screens/LessonScreen'
import QuestionScreen from './screens/QuestionScreen'
import SummaryScreen from './screens/SummaryScreen'
import LoadingScreen from './screens/LoadingScreen'
import ErrorScreen from './screens/ErrorScreen'

type Screen = 'home' | 'addChild' | 'splash' | 'lesson' | 'question' | 'summary' | 'error'

function Navigator() {
  const { state, setChild, setSprint, advanceQuestion } = useApp()
  const [screen, setScreen] = useState<Screen>('home')
  const [activeChild, setActiveChild] = useState<ChildProfile | null>(null)
  const [sprint, setSp] = useState<SprintContent | null>(null)
  const navigatingRef = useRef(false)

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
    navigatingRef.current = false
    setScreen('lesson')
  }

  const handleLessonNext = () => setScreen('question')

  const handleQuestionNext = () => {
    advanceQuestion()
    setScreen('question')
  }

  const handleErrorRetry = () => setScreen('home')

  const handleGoHome = () => {
    PrefetchService.clear()
    setScreen('home')
  }

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

  if (screen === 'error') return <ErrorScreen onRetry={handleErrorRetry} />

  if (!sprint) return <LoadingScreen />

  if (screen === 'lesson') return (
    <LessonScreen sprint={sprint} onNext={handleLessonNext} onGoHome={handleGoHome} />
  )

  if (screen === 'question') return (
    <QuestionScreen
      sprint={sprint}
      questionIndex={state.currentQuestionIndex}
      onNext={handleQuestionNext}
      onAllDone={() => setScreen('summary')}
      onGoHome={handleGoHome}
    />
  )

  if (screen === 'summary') return (
    <SummaryScreen
      sprint={sprint}
      onNextSprint={handleSprintLoaded}
      onGoHome={handleGoHome}
    />
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
