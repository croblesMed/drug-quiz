import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AnswerCard from './AnswerCard'
import ScoreBar from './ScoreBar'
import TooltipModal from './TooltipModal'
import { QUIZ_ATTRS } from '../utils/distractors'

export default function GameBoard({ state, answer, next, reset }) {
  const [tooltipDrug, setTooltipDrug] = useState(null)

  const { round, score, currentIndex, queue, config } = state
  if (!round) return null

  const total = queue.length
  const progress = currentIndex + 1
  const qLabel = QUIZ_ATTRS.find(a => a.key === config.questionAttr)?.label || config.questionAttr
  const aLabel = QUIZ_ATTRS.find(a => a.key === config.answerAttr)?.label || config.answerAttr
  const isNameQuestion = config.questionAttr === 'name'

  return (
    <div className="min-h-screen bg-slate-900 pb-8">
      <ScoreBar score={score} total={total} onReset={reset} />

      <div className="max-w-2xl mx-auto px-4 pt-24">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-4 text-slate-400 text-sm">
          <span>Drug {progress} of {total}</span>
          <span>{qLabel} → {aLabel}</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-700 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${(progress / total) * 100}%` }}
          />
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={round.drug.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="bg-slate-800 border border-slate-600 rounded-2xl p-6 mb-6 text-center"
          >
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">
              {qLabel}
            </p>
            {isNameQuestion && (
              <div className="text-4xl mb-2">{round.drug.emoji}</div>
            )}
            <p className="text-white font-bold text-xl sm:text-2xl leading-snug">
              {round.question}
            </p>
            <p className="text-slate-400 text-sm mt-3">
              Select the correct <span className="text-blue-400 font-medium">{aLabel}</span>
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Answer choices */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
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

        {/* Post-answer section */}
        <AnimatePresence>
          {round.answered && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {/* Multiple correct notice */}
              {round.choices.filter(c => c.isCorrect).length > 1 && (
                <p className="text-center text-amber-400 text-sm">
                  ⚠️ Multiple correct answers — drugs share this {aLabel.toLowerCase()}
                </p>
              )}

              {/* Drug tooltip trigger */}
              <div className="text-center">
                <button
                  onClick={() => setTooltipDrug(round.drug)}
                  className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  <span>{round.drug.emoji}</span>
                  <span>{round.drug.name}</span>
                  <span className="text-blue-400">ℹ</span>
                </button>
              </div>

              {/* Next button */}
              <button
                onClick={next}
                className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold py-4 rounded-xl text-lg transition-colors"
              >
                {currentIndex + 1 < queue.length ? 'Next →' : 'See Results →'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tooltip modal */}
      {tooltipDrug && (
        <TooltipModal drug={tooltipDrug} onClose={() => setTooltipDrug(null)} />
      )}
    </div>
  )
}
