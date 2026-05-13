import { useCallback } from 'react'

const STORAGE_KEY = 'drugQuizBests'

function makeKey(config) {
  const { topicId = 'cardiology', filter = 'all', questionAttr, answerAttr } = config
  return `${topicId}_${filter}__${questionAttr}__to__${answerAttr}`
}

export function usePersonalBest() {
  const getAllBests = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    } catch {
      return {}
    }
  }, [])

  const getBest = useCallback((config) => {
    const all = getAllBests()
    return all[makeKey(config)] || null
  }, [getAllBests])

  const saveBest = useCallback((config, score, total) => {
    const all = getAllBests()
    const key = makeKey(config)
    const existing = all[key]
    if (!existing || score > existing.bestScore) {
      all[key] = {
        bestScore: score,
        totalDrugs: total,
        date: new Date().toISOString().split('T')[0]
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
      return true // new record
    }
    return false
  }, [getAllBests])

  const clearAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { getBest, getAllBests, saveBest, clearAll }
}
