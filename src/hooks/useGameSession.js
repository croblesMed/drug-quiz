import { useReducer, useCallback } from 'react'
import { buildAnswerChoices } from '../utils/distractors'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildRound(drug, allDrugs, questionAttr, answerAttr) {
  const choices = buildAnswerChoices(drug, allDrugs, answerAttr)
  const question = questionAttr === 'name'
    ? `${drug.emoji}  ${drug.name}`
    : drug[questionAttr]
  return { drug, question, choices, answered: false, correct: null, selectedValue: null }
}

const initialState = {
  status: 'idle',   // idle | playing | finished
  config: null,
  drugs: [],
  queue: [],
  currentIndex: 0,
  round: null,
  score: 0,
  results: [],      // [{ drug, correct }]
}

function reducer(state, action) {
  switch (action.type) {
    case 'START': {
      const { drugs, config } = action
      const shuffled = shuffle(drugs)
      const round = buildRound(shuffled[0], drugs, config.questionAttr, config.answerAttr)
      return {
        ...initialState,
        status: 'playing',
        config,
        drugs,
        queue: shuffled,
        currentIndex: 0,
        round,
        score: 0,
        results: [],
      }
    }
    case 'ANSWER': {
      const { value } = action
      const { round, queue, currentIndex, drugs, config } = state
      const correct = round.choices.some(c => c.isCorrect && c.value === value)
      const newScore = state.score + (correct ? 1 : 0)
      const newResults = [...state.results, { drug: round.drug, correct }]
      return {
        ...state,
        score: newScore,
        results: newResults,
        round: {
          ...round,
          answered: true,
          correct,
          selectedValue: value,
          // mark which choices are correct/selected
          choices: round.choices.map(c => ({
            ...c,
            wasSelected: c.value === value,
          }))
        }
      }
    }
    case 'NEXT': {
      const { queue, currentIndex, drugs, config } = state
      const nextIndex = currentIndex + 1
      if (nextIndex >= queue.length) {
        return { ...state, status: 'finished' }
      }
      const nextDrug = queue[nextIndex]
      const round = buildRound(nextDrug, drugs, config.questionAttr, config.answerAttr)
      return { ...state, currentIndex: nextIndex, round }
    }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

export function useGameSession() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const start = useCallback((drugs, config) => {
    dispatch({ type: 'START', drugs, config })
  }, [])

  const answer = useCallback((value) => {
    dispatch({ type: 'ANSWER', value })
  }, [])

  const next = useCallback(() => {
    dispatch({ type: 'NEXT' })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  return { state, start, answer, next, reset }
}
