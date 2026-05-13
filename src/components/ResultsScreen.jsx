import { useState } from 'react'
import { motion } from 'framer-motion'
import TooltipModal from './TooltipModal'
import drugClasses from '../data/drugClasses.json'

// Map drug class → Tailwind bg class
const CLASS_COLORS = {}
drugClasses.forEach(({ name, color, shade }) => {
  CLASS_COLORS[name] = `bg-${color}-${shade}`
})

function getClassColor(drugClass) {
  return CLASS_COLORS[drugClass] || 'bg-slate-600'
}

// Simple confetti component
function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.8,
    color: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'][i % 5],
    size: 6 + Math.random() * 8,
  }))
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map(p => (
        <motion.div
          key={p.id}
          className="absolute top-0 rounded-sm"
          style={{ left: `${p.left}%`, width: p.size, height: p.size, backgroundColor: p.color }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: '110vh', opacity: 0, rotate: 360 * (Math.random() > 0.5 ? 1 : -1) }}
          transition={{ duration: 2.5 + Math.random(), delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  )
}

export default function ResultsScreen({ results, score, config, personalBest, newRecord, onPlayAgain, onHome }) {
  const [tooltipDrug, setTooltipDrug] = useState(null)
  const [showMissedOnly, setShowMissedOnly] = useState(false)

  const total = results.length
  const perfect = score === total
  const pct = total > 0 ? Math.round((score / total) * 100) : 0
  const missed = results.filter(r => !r.correct)

  const displayResults = showMissedOnly ? results.filter(r => !r.correct) : results

  return (
    <div className="min-h-screen bg-slate-900 pb-16">
      {perfect && <Confetti />}

      <div className="max-w-2xl mx-auto px-4 pt-10">
        {/* Score hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <div className="text-5xl mb-3">
            {perfect ? '🏆' : pct >= 80 ? '🌟' : pct >= 60 ? '👍' : '📚'}
          </div>
          <h1 className="text-6xl font-black text-white tabular-nums">
            {score}<span className="text-slate-500 text-4xl font-light"> / {total}</span>
          </h1>
          <p className="text-slate-400 mt-2 text-lg">{pct}% correct</p>

          {perfect && (
            <p className="mt-3 text-emerald-400 font-bold text-xl animate-pulse">
              Perfect score! 🎉
            </p>
          )}

          {newRecord && !perfect && (
            <p className="mt-3 text-amber-400 font-semibold">✦ New personal best!</p>
          )}

          {personalBest && !newRecord && (
            <p className="text-slate-500 text-sm mt-2">
              Personal best: {personalBest.bestScore}/{personalBest.totalDrugs} on {personalBest.date}
            </p>
          )}
        </motion.div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button
            onClick={onPlayAgain}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-colors"
          >
            Play Again
          </button>
          <button
            onClick={onHome}
            className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-4 rounded-xl transition-colors"
          >
            Change Settings
          </button>
        </div>

        {/* Filter toggle */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-lg">
            Drug Review
            {missed.length > 0 && (
              <span className="ml-2 text-red-400 text-sm font-normal">
                {missed.length} missed
              </span>
            )}
          </h2>
          {missed.length > 0 && (
            <button
              onClick={() => setShowMissedOnly(v => !v)}
              className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                showMissedOnly
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {showMissedOnly ? 'Show All' : 'Missed Only'}
            </button>
          )}
        </div>

        {/* Tile grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {displayResults.map(({ drug, correct }, i) => (
            <motion.button
              key={drug.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.025, duration: 0.2 }}
              onClick={() => setTooltipDrug(drug)}
              className={`
                relative rounded-xl p-3 text-left border-2 transition-opacity
                ${getClassColor(drug.drugClass)}
                ${correct ? 'border-emerald-400/40' : 'border-red-400/60'}
              `}
            >
              {/* Correct/wrong badge */}
              <div className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                correct ? 'bg-emerald-400 text-emerald-900' : 'bg-red-400 text-red-900'
              }`}>
                {correct ? '✓' : '✗'}
              </div>

              <div className="text-xl mb-1">{drug.emoji}</div>
              <p className="text-white font-semibold text-sm leading-tight pr-6">{drug.name}</p>
              <p className="text-white/70 text-xs mt-0.5 leading-tight">{drug.drugClass}</p>
            </motion.button>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-2">
          {drugClasses
            .filter(dc => results.some(r => r.drug.drugClass === dc.name))
            .map(dc => (
              <span
                key={dc.name}
                className={`text-xs px-2 py-1 rounded-full text-white ${getClassColor(dc.name)}`}
              >
                {dc.name}
              </span>
            ))}
        </div>
      </div>

      {tooltipDrug && (
        <TooltipModal drug={tooltipDrug} onClose={() => setTooltipDrug(null)} />
      )}
    </div>
  )
}
