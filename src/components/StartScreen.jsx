import { useState, useMemo } from 'react'
import { QUIZ_ATTRS } from '../utils/distractors'
import drugClassesData from '../data/drugClasses.json'
import topicTagsData from '../data/topicTags.json'

const FILTER_MODES = [
  { id: 'all',   label: 'All Drugs' },
  { id: 'class', label: 'By Class'  },
  { id: 'tag',   label: 'By Topic'  },
]

function classBg(name) {
  const dc = drugClassesData.find(d => d.name === name)
  return dc ? `bg-${dc.color}-${dc.shade}` : 'bg-gray-400'
}

export default function StartScreen({ allDrugs, personalBests, onStart }) {
  const [filterMode,      setFilterMode]      = useState('all')
  const [selectedClasses, setSelectedClasses] = useState(new Set())
  const [selectedTags,    setSelectedTags]    = useState(new Set())
  const [questionAttr,    setQuestionAttr]    = useState('name')
  const [answerAttr,      setAnswerAttr]      = useState('drugClass')
  const [startError,      setStartError]      = useState('')

  const availableClasses = useMemo(() => {
    const present = new Set(allDrugs.map(d => d.drugClass))
    return drugClassesData.filter(dc => present.has(dc.name))
  }, [allDrugs])

  const availableTags = useMemo(() => {
    const present = new Set(allDrugs.flatMap(d => d.topicTags || []))
    return topicTagsData.filter(t => present.has(t))
  }, [allDrugs])

  const filteredDrugs = useMemo(() => {
    if (filterMode === 'class' && selectedClasses.size > 0)
      return allDrugs.filter(d => selectedClasses.has(d.drugClass))
    if (filterMode === 'tag' && selectedTags.size > 0)
      return allDrugs.filter(d => d.topicTags?.some(t => selectedTags.has(t)))
    return allDrugs
  }, [allDrugs, filterMode, selectedClasses, selectedTags])

  function toggleClass(name) {
    setSelectedClasses(prev => { const n = new Set(prev); n.has(name) ? n.delete(name) : n.add(name); return n })
  }
  function toggleTag(tag) {
    setSelectedTags(prev => { const n = new Set(prev); n.has(tag) ? n.delete(tag) : n.add(tag); return n })
  }
  function clearSelections() { setSelectedClasses(new Set()); setSelectedTags(new Set()) }

  const topScores = useMemo(() => {
    if (!personalBests) return []
    return Object.entries(personalBests)
      .map(([key, val]) => ({ key, ...val }))
      .sort((a, b) => (b.bestScore / b.totalDrugs) - (a.bestScore / a.totalDrugs))
      .slice(0, 5)
  }, [personalBests])

  function formatKey(key) {
    try {
      const after = key.includes('__') ? key.split(/__(.+)/)[1] : key
      const parts = after.split('__to__')
      const q = QUIZ_ATTRS.find(a => a.key === parts[0])?.label || parts[0]
      const a = QUIZ_ATTRS.find(a => a.key === parts[1])?.label || parts[1]
      return `${q} -> ${a}`
    } catch { return key }
  }

  function handleStart() {
    setStartError('')
    if (questionAttr !== 'name' && answerAttr !== 'name') {
      setStartError('One of Question or Answer must be "Drug Name" to start.')
      return
    }
    if (questionAttr === answerAttr) {
      setStartError('Question and Answer types must differ.')
      return
    }
    if (filteredDrugs.length < 3) {
      setStartError('Select at least 3 drugs to start.')
      return
    }
    const filterKey =
      filterMode === 'class' ? [...selectedClasses].join('+') || 'all'
      : filterMode === 'tag' ? [...selectedTags].join('+') || 'all'
      : 'all'
    onStart(filteredDrugs, { questionAttr, answerAttr, topicId: 'cardiology', filter: filterKey })
  }

  return (
    <div className="min-h-screen bg-amber-50 pb-16">
      <div className="max-w-xl mx-auto px-4 pt-10">

        <div className="text-center mb-7">
          <div className="text-6xl mb-2">&#x1FAC0;</div>
          <h1 className="text-4xl font-black text-gray-900">Drug Quiz</h1>
          <p className="text-amber-600 font-bold mt-1">USMLE Step 1 &middot; Cardiology</p>
        </div>

        {topScores.length > 0 && (
          <div className="bg-white border-2 border-amber-200 rounded-3xl p-4 mb-5 card-shadow">
            <h2 className="text-amber-600 text-xs font-black uppercase tracking-wider mb-3">&#x1F3C6; Personal Bests</h2>
            <div className="space-y-2">
              {topScores.map(s => (
                <div key={s.key} className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm font-semibold">{formatKey(s.key)}</span>
                  <span className="text-gray-900 font-black text-sm">
                    {s.bestScore}/{s.totalDrugs}
                    <span className="text-gray-400 font-semibold text-xs ml-1">
                      ({Math.round((s.bestScore / s.totalDrugs) * 100)}%)
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white border-2 border-amber-200 rounded-3xl p-5 mb-4 card-shadow">
          <h2 className="text-gray-900 font-black text-lg mb-3">Drug Set</h2>
          <div className="flex gap-2 mb-4">
            {FILTER_MODES.map(m => (
              <button key={m.id} onClick={() => { setFilterMode(m.id); clearSelections() }}
                className={`flex-1 py-2 rounded-xl text-sm font-black transition-colors ${
                  filterMode === m.id ? 'bg-amber-400 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'}`}>
                {m.label}
              </button>
            ))}
          </div>

          {filterMode === 'class' && (
            <div className="flex flex-wrap gap-2">
              {availableClasses.map(dc => {
                const sel = selectedClasses.has(dc.name)
                return (
                  <button key={dc.name} onClick={() => toggleClass(dc.name)}
                    className={`text-xs px-3 py-1.5 rounded-full font-black transition-all border-2 ${
                      sel ? `${classBg(dc.name)} text-white border-transparent scale-105`
                          : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300'}`}>
                    {dc.name}
                  </button>
                )
              })}
            </div>
          )}

          {filterMode === 'tag' && (
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => {
                const sel = selectedTags.has(tag)
                return (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    className={`text-xs px-3 py-1.5 rounded-full font-black capitalize transition-all border-2 ${
                      sel ? 'bg-amber-400 text-white border-transparent scale-105'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300'}`}>
                    {tag}
                  </button>
                )
              })}
            </div>
          )}

          <p className="text-gray-500 text-sm mt-3 font-semibold">
            <span className="text-gray-900 font-black">{filteredDrugs.length}</span> drugs selected
          </p>
        </div>

        <div className="bg-white border-2 border-amber-200 rounded-3xl p-5 mb-4 card-shadow">
          <h2 className="text-gray-900 font-black text-lg mb-1">Quiz Mode</h2>
          <p className="text-gray-400 text-xs font-semibold mb-4">
            Pick any combination. One side must be Drug Name to play.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-amber-600 text-xs font-black uppercase tracking-wider mb-2">Question (shown)</label>
              <div className="space-y-1.5">
                {QUIZ_ATTRS.map(attr => (
                  <button key={attr.key} onClick={() => setQuestionAttr(attr.key)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-xl font-bold transition-colors border-2 ${
                      questionAttr === attr.key ? 'bg-amber-400 text-white border-transparent'
                        : 'bg-amber-50 text-gray-600 border-amber-100 hover:border-amber-300'}`}>
                    {attr.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-green-600 text-xs font-black uppercase tracking-wider mb-2">Answer (pick 1 of 6)</label>
              <div className="space-y-1.5">
                {QUIZ_ATTRS.map(attr => (
                  <button key={attr.key} onClick={() => setAnswerAttr(attr.key)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-xl font-bold transition-colors border-2 ${
                      answerAttr === attr.key ? 'bg-green-500 text-white border-transparent'
                        : 'bg-green-50 text-gray-600 border-green-100 hover:border-green-300'}`}>
                    {attr.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 text-center bg-amber-50 rounded-2xl py-2 px-3 border border-amber-200">
            <span className="text-amber-700 font-black text-sm">{QUIZ_ATTRS.find(a => a.key === questionAttr)?.label}</span>
            <span className="text-gray-400 font-bold text-sm"> &rarr; </span>
            <span className="text-green-700 font-black text-sm">{QUIZ_ATTRS.find(a => a.key === answerAttr)?.label}</span>
          </div>
        </div>

        {startError && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3 mb-3 text-center">
            <p className="text-red-600 text-sm font-black">{startError}</p>
          </div>
        )}

        <button onClick={handleStart}
          className="w-full bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-white font-black text-xl py-5 rounded-3xl transition-colors card-shadow-lg">
          Play &rarr;
        </button>

        <p className="text-center text-gray-400 text-xs mt-4 font-semibold">
          Inspired by{' '}
          <a href="https://apps.apple.com/us/app/amino-acid-quiz/id1301129866"
            target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline">
            Amino Acid Quiz
          </a>
        </p>
      </div>
    </div>
  )
}
