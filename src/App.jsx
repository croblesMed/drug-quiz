import { useState, useEffect } from 'react'
import StartScreen from './components/StartScreen'
import GameBoard from './components/GameBoard'
import ResultsScreen from './components/ResultsScreen'
import { useGameSession } from './hooks/useGameSession'
import { usePersonalBest } from './hooks/usePersonalBest'
import cardiologyDrugs from './data/topics/cardiology.json'

export default function App() {
  const { state, start, answer, next, reset } = useGameSession()
  const { getBest, getAllBests, saveBest } = usePersonalBest()
  const [personalBests, setPersonalBests] = useState({})
  const [savedResult, setSavedResult] = useState(null)  // { newRecord, best }

  useEffect(() => {
    setPersonalBests(getAllBests())
  }, [getAllBests])

  // When game finishes, save the score
  useEffect(() => {
    if (state.status === 'finished' && state.config) {
      const prev = getBest(state.config)
      const isNew = saveBest(state.config, state.score, state.queue.length)
      setSavedResult({ newRecord: isNew, best: prev })
      setPersonalBests(getAllBests())
    }
  }, [state.status])

  function handleStart(drugs, config) {
    setSavedResult(null)
    start(drugs, config)
  }

  function handlePlayAgain() {
    // restart with same config and same drug pool
    setSavedResult(null)
    start(state.queue, state.config)
  }

  function handleHome() {
    setSavedResult(null)
    reset()
    setPersonalBests(getAllBests())
  }

  if (state.status === 'playing') {
    return (
      <GameBoard
        state={state}
        answer={answer}
        next={next}
        reset={handleHome}
      />
    )
  }

  if (state.status === 'finished') {
    return (
      <ResultsScreen
        results={state.results}
        score={state.score}
        config={state.config}
        personalBest={savedResult?.best}
        newRecord={savedResult?.newRecord}
        onPlayAgain={handlePlayAgain}
        onHome={handleHome}
      />
    )
  }

  // default: idle → show start screen
  return (
    <StartScreen
      allDrugs={cardiologyDrugs}
      personalBests={personalBests}
      onStart={handleStart}
    />
  )
}
