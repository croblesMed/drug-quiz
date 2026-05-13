import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AnswerCard from './AnswerCard'
import ScoreBar from './ScoreBar'
import TooltipModal from './TooltipModal'
import { QUIZ_ATTRS } from '../utils/distractors'

export default function GameBoard({ state, answer, next, reset }) {
  const [tooltipDrug, setTooltipDrug] = useState(null)

  const { round, score, results, currentIndex, queue, config } = state
  if (!round) return null

  const total   = queue.length
  const current = currentIndex + 1
  const wrong   = results.filter(r => !r.correct).length
  const qLabel  = QUIZ_ATTRS.find(a => a.key === config.questionAttr)?.label || config.questionAttr
  const aLabel  = QUIZ_ATTRS.find(a => a.key === config.answerAttr)?.label || config.answerAttr
  const isNameQ = config.questionAttr === 'name'

  return (
    <div className="min-h-screen bg-amber-50 pb-8">
      <ScoreBar score={score} wrong={wrong} total={total} current={current} onReset={reset} />

      <div className="max-w-2xl mx-auto px-4 pt-24">

        {/* Mode label */}
        <p className="text-center text-amber-600 text-xs font-black uppercase tracking-widest mb-4">
          {qLabel} → {aLabel}
        </p>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={round.drug.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.22 }}
            className="bg-yellow-100 border-2 border-amber-300 rounded-3xl p-6 mb-5 text-center card-shadow"
          >
            {isNameQ && (
              <div className="text-5xl mb-2">{round.drug.emoji}</div>
            )}
            <p className="text-gray-900 font-black text-2xl sm:text-3xl leading-snug">
              {round.question}
            </p>
            <p className="text-amber-600 text-sm mt-3 font-bold">
              Select the correct <span className="text-amber-700">{aLabel}</span>
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Answer choices – 2 col grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {round.choices.map((choice, i) => (
            <AnswerCard
              key={i}
              choice={choice}
              answered={round.answered}
              onSelect={answer}
              answerAttr={config.answerAttr}
            />
          ))}
        </div>

        {/* Post-answer */}
        <AnimatePresence>
          {round.answered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className="space-y-3"
            >
              {round.choices.filter(c => c.isCorrect).length > 1 && (
                <p className="text-center text-amber-600 text-sm font-bold">
                  ⚠️ Multiple correct — drugs share this {aLabel.toLowerCase()}
                </p>
              )}

              {/* Tooltip trigger */}
              <div className="text-center">
                <button
                  onClick={() => setTooltipDrug(round.drug)}
                  className="inline-flex items-center gap-2 bg-white border-2 border-amber-200 hover:border-amber-400 text-gray-700 px-4 py-2 rounded-2xl text-sm font-bold transition-colors card-shadow"
                >
                  <span>{round.drug.emoji}</span>
                  <span>{round.drug.name}</span>
                  <span className="text-amber-500 font-black">ℹ</span>
                </button>
              </div>

              {/* Next */}
              <button
                onClick={next}
                className="w-full bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-white font-black py-4 rounded-2xl text-lg transition-colors card-shadow"
              >
                {currentIndex + 1 < queue.length ? 'Next →' : 'See Results →'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {tooltipDrug && (
        <TooltipModal drug={tooltipDrug} onClose={() => setTooltipDrug(null)} />
      )}
    </div>
  )
}
