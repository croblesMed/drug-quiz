import { useState, useMemo } from 'react'
import { QUIZ_ATTRS } from '../utils/distractors'
import drugClasses from '../data/drugClasses.json'
import topicTags from '../data/topicTags.json'

const FILTER_MODES = [
  { id: 'all', label: 'All Drugs' },
  { id: 'class', label: 'By Class' },
  { id: 'tag', label: 'By Topic' },
]

export default function StartScreen({ allDrugs, personalBests, onStart }) {
  const [filterMode, setFilterMode] = useState('all')
  const [selectedClass, setSelectedClass] = useState(null)
  const [selectedTag, setSelectedTag] = useState(null)
  const [questionAttr, setQuestionAttr] = useState('name')
  const [answerAttr, setAnswerAttr] = useState('drugClass')
  const [modeError, setModeError] = useState('')

  // Classes that exist in the drug data
  const availableClasses = useMemo(() => {
    const set = new Set(allDrugs.map(d => d.drugClass))
    return drugClasses.filter(dc => set.has(dc.name))
  }, [allDrugs])

  // Tags that exist in the drug data
  const availableTags = useMemo(() => {
    const set = new Set(allDrugs.flatMap(d => d.topicTags || []))
    return topicTags.filter(t => set.has(t))
  }, [allDrugs])

  // Filtered drug list
  const filteredDrugs = useMemo(() => {
    if (filterMode === 'class' && selectedClass)
      return allDrugs.filter(d => d.drugClass === selectedClass)
    if (filterMode === 'tag' && selectedTag)
      return allDrugs.filter(d => d.topicTags?.includes(selectedTag))
    return allDrugs
  }, [allDrugs, filterMode, selectedClass, selectedTag])

  // Top scores from personalBests
  const topScores = useMemo(() => {
    if (!personalBests) return []
    return Object.entries(personalBests)
      .map(([key, val]) => ({ key, ...val }))
      .sort((a, b) => (b.bestScore / b.totalDrugs) - (a.bestScore / a.totalDrugs))
      .slice(0, 5)
  }, [personalBests])

  function handleQuestionChange(val) {
    if (val === answerAttr) {
      setModeError('Question and answer types must differ.')
      return
    }
    if (val !== 'name' && answerAttr !== 'name') {
      setModeError('One of Question or Answer must be "Drug Name".')
      return
    }
    setModeError('')
    setQuestionAttr(val)
  }

  function handleAnswerChange(val) {
    if (val === questionAttr) {
      setModeError('Question and answer types must differ.')
      return
    }
    if (questionAttr !== 'name' && val !== 'name') {
      setModeError('One of Question or Answer must be "Drug Name".')
      return
    }
    setModeError('')
    setAnswerAttr(val)
  }

  function handleStart() {
    if (filteredDrugs.length < 3) {
      alert('Please select at least 3 drugs to start.')
      return
    }
    if (questionAttr === answerAttr) {
      setModeError('Question and answer types must differ.')
      return
    }
    const filterKey = filterMode === 'class' ? (selectedClass || 'all')
      : filterMode === 'tag' ? (selectedTag || 'all') : 'all'

    onStart(filteredDrugs, {
      questionAttr,
      answerAttr,
      topicId: 'cardiology',
      filter: filterKey,
    })
  }

  function formatKey(key) {
    // "cardiology_all__name__to__drugClass" → "All • Name → Drug Class"
    try {
      const [, rest] = key.split('_all__').length > 1 ? ['', key.split('_all__')[1]] : ['', key.split(/__(.+)/)[1]]
      const parts = rest.split('__to__')
      const q = QUIZ_ATTRS.find(a => a.key === parts[0])?.label || parts[0]
      const a = QUIZ_ATTRS.find(a => a.key === parts[1])?.label || parts[1]
      return `${q} → ${a}`
    } catch {
      return key
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-16">
      <div className="max-w-xl mx-auto px-4 pt-12">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🫀</div>
          <h1 className="text-4xl font-black text-white">Drug Quiz</h1>
          <p className="text-slate-400 mt-2">USMLE Step 1 · Cardiology</p>
        </div>

        {/* Personal bests */}
        {topScores.length > 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 mb-6">
            <h2 className="text-slate-300 text-sm font-semibold uppercase tracking-wider mb-3">
              🏆 Personal Bests
            </h2>
            <div className="space-y-2">
              {topScores.map(s => (
                <div key={s.key} className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">{formatKey(s.key)}</span>
                  <span className="text-white font-bold text-sm">
                    {s.bestScore}/{s.totalDrugs}
                    <span className="text-slate-500 font-normal text-xs ml-1">
                      ({Math.round((s.bestScore / s.totalDrugs) * 100)}%)
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Drug set selector */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-4">
          <h2 className="text-white font-bold mb-3">Drug Set</h2>

          {/* Filter mode tabs */}
          <div className="flex gap-2 mb-4">
            {FILTER_MODES.map(m => (
              <button
                key={m.id}
                onClick={() => setFilterMode(m.id)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterMode === m.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Class picker */}
          {filterMode === 'class' && (
            <div className="flex flex-wrap gap-2">
              {availableClasses.map(dc => (
                <button
                  key={dc.name}
                  onClick={() => setSelectedClass(dc.name)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors border ${
                    selectedClass === dc.name
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {dc.name}
                </button>
              ))}
            </div>
          )}

          {/* Tag picker */}
          {filterMode === 'tag' && (
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors border capitalize ${
                    selectedTag === tag
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Drug count */}
          <p className="text-slate-400 text-sm mt-3">
            <span className="text-white font-bold">{filteredDrugs.length}</span> drugs selected
          </p>
        </div>

        {/* Quiz mode selector */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-4">
          <h2 className="text-white font-bold mb-3">Quiz Mode</h2>
          <p className="text-slate-400 text-xs mb-4">One side must always be Drug Name.</p>

          <div className="grid grid-cols-2 gap-4">
            {/* Question type */}
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Question (shown)
              </label>
              <div className="space-y-1.5">
                {QUIZ_ATTRS.map(attr => (
                  <button
                    key={attr.key}
                    onClick={() => handleQuestionChange(attr.key)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors ${
                      questionAttr === attr.key
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {attr.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Answer type */}
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Answer (pick from 6)
              </label>
              <div className="space-y-1.5">
                {QUIZ_ATTRS.map(attr => (
                  <button
                    key={attr.key}
                    onClick={() => handleAnswerChange(attr.key)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors ${
                      answerAttr === attr.key
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {attr.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {modeError && (
            <p className="text-red-400 text-xs mt-3">{modeError}</p>
          )}

          {!modeError && (
            <div className="mt-4 text-center text-slate-400 text-sm">
              <span className="text-blue-400 font-medium">{QUIZ_ATTRS.find(a => a.key === questionAttr)?.label}</span>
              {' '}→{' '}
              <span className="text-emerald-400 font-medium">{QUIZ_ATTRS.find(a => a.key === answerAttr)?.label}</span>
            </div>
          )}
        </div>

        {/* Play button */}
        <button
          onClick={handleStart}
          disabled={!!modeError || filteredDrugs.length < 3}
          className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xl py-5 rounded-2xl transition-colors shadow-lg shadow-blue-900/40"
        >
          Play →
        </button>

        <p className="text-center text-slate-500 text-xs mt-4">
          Inspired by{' '}
          <a
            href="https://apps.apple.com/us/app/amino-acid-quiz/id1301129866"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Amino Acid Quiz
          </a>
        </p>
      </div>
    </div>
  )
}
