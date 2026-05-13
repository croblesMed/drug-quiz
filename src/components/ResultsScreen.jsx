import { useState } from 'react'
import { motion } from 'framer-motion'
import TooltipModal from './TooltipModal'
import drugClasses from '../data/drugClasses.json'

const CLASS_COLORS = {}
drugClasses.forEach(({ name, color, shade }) => { CLASS_COLORS[name] = `bg-${color}-${shade}` })
function getClassColor(dc) { return CLASS_COLORS[dc] || 'bg-gray-400' }

function Confetti() {
  const pieces = Array.from({ length: 48 }, (_, i) => ({
    id: i, left: Math.random() * 100, delay: Math.random() * 0.9,
    color: ['#f59e0b','#10b981','#3b82f6','#ec4899','#8b5cf6','#f97316'][i % 6],
    size: 7 + Math.random() * 9,
  }))
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map(p => (
        <motion.div key={p.id} className="absolute top-0 rounded-sm"
          style={{ left: `${p.left}%`, width: p.size, height: p.size, backgroundColor: p.color }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: '110vh', opacity: 0, rotate: 360 * (Math.random() > 0.5 ? 1 : -1) }}
          transition={{ duration: 2.5 + Math.random(), delay: p.delay, ease: 'easeIn' }} />
      ))}
    </div>
  )
}

export default function ResultsScreen({ results, score, personalBest, newRecord, onPlayAgain, onHome }) {
  const [tooltipDrug,    setTooltipDrug]    = useState(null)
  const [showMissedOnly, setShowMissedOnly] = useState(false)

  const total   = results.length
  const wrong   = results.filter(r => !r.correct).length
  const perfect = score === total
  const pct     = total > 0 ? Math.round((score / total) * 100) : 0
  const display = showMissedOnly ? results.filter(r => !r.correct) : results

  return (
    <div className="min-h-screen bg-amber-50 pb-16">
      {perfect && <Confetti />}
      <div className="max-w-2xl mx-auto px-4 pt-10">

        <motion.div initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }} className="text-center mb-7">
          <div className="text-6xl mb-2">
            {perfect ? '\u{1F3C6}' : pct >= 80 ? '\u{1F31F}' : pct >= 60 ? '\u{1F44D}' : '\u{1F4DA}'}
          </div>
          <div className="flex items-center justify-center gap-8 mb-2">
            <div className="text-center">
              <div className="text-green-500 font-black text-5xl tabular-nums">{score}</div>
              <div className="text-green-500 font-black text-sm uppercase tracking-wide">Correct</div>
            </div>
            <div className="text-gray-300 font-black text-4xl">/</div>
            <div className="text-center">
              <div className="text-red-400 font-black text-5xl tabular-nums">{wrong}</div>
              <div className="text-red-400 font-black text-sm uppercase tracking-wide">Missed</div>
            </div>
          </div>
          <p className="text-gray-400 font-black text-lg">{pct}% &middot; {total} drugs</p>
          {perfect && <p className="mt-2 text-amber-500 font-black text-xl animate-pulse">Perfect! &#x1F389;</p>}
          {newRecord && !perfect && <p className="mt-2 text-amber-500 font-black">&#x2726; New personal best!</p>}
          {personalBest && !newRecord && (
            <p className="text-gray-400 text-sm font-semibold mt-1">
              Best: {personalBest.bestScore}/{personalBest.totalDrugs} on {personalBest.date}
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-2 gap-3 mb-7">
          <button onClick={onPlayAgain}
            className="bg-amber-400 hover:bg-amber-500 text-white font-black py-4 rounded-2xl transition-colors card-shadow">
            Play Again
          </button>
          <button onClick={onHome}
            className="bg-white border-2 border-amber-200 hover:border-amber-400 text-gray-700 font-black py-4 rounded-2xl transition-colors card-shadow">
            Change Settings
          </button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-900 font-black text-lg">
            Drug Review
            {wrong > 0 && <span className="ml-2 text-red-400 text-sm font-bold">{wrong} missed</span>}
          </h2>
          {wrong > 0 && (
            <button onClick={() => setShowMissedOnly(v => !v)}
              className={`text-sm px-3 py-1.5 rounded-xl font-black transition-colors border-2 ${
                showMissedOnly ? 'bg-red-500 text-white border-transparent'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-red-300'}`}>
              {showMissedOnly ? 'Show All' : 'Missed Only'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {display.map(({ drug, correct }, i) => (
            <motion.button key={drug.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02, duration: 0.18 }}
              onClick={() => setTooltipDrug(drug)}
              className={`relative rounded-2xl p-3 text-left border-2 card-shadow transition-transform hover:scale-105
                ${getClassColor(drug.drugClass)}
                ${correct ? 'border-white/30' : 'border-red-400/70'}`}>
              <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                correct ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-900'}`}>
                {correct ? '✓' : '✗'}
              </div>
              <div className="text-2xl mb-1">{drug.emoji}</div>
              <p className="text-white font-black text-sm leading-tight pr-7">{drug.name}</p>
              <p className="text-white/75 text-xs mt-0.5 leading-tight">{drug.drugClass}</p>
            </motion.button>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {drugClasses
            .filter(dc => results.some(r => r.drug.drugClass === dc.name))
            .map(dc => (
              <span key={dc.name} className={`text-xs px-2 py-1 rounded-full text-white font-bold ${getClassColor(dc.name)}`}>
                {dc.name}
              </span>
            ))}
        </div>
      </div>

      {tooltipDrug && <TooltipModal drug={tooltipDrug} onClose={() => setTooltipDrug(null)} />}
    </div>
  )
}
