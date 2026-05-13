import { motion } from 'framer-motion'

export default function AnswerCard({ choice, answered, onSelect, answerAttr }) {
  const isName = answerAttr === 'name'

  let bg = 'bg-slate-800 hover:bg-slate-700 border-slate-600'
  let textColor = 'text-white'

  if (answered) {
    if (choice.isCorrect) {
      bg = 'bg-emerald-600 border-emerald-400'
    } else if (choice.wasSelected) {
      bg = 'bg-red-600 border-red-400'
    } else {
      bg = 'bg-slate-800 border-slate-700 opacity-50'
    }
  }

  return (
    <motion.button
      className={`
        w-full rounded-xl border-2 p-3 sm:p-4 text-left transition-colors duration-150
        ${bg} ${textColor} tap-highlight-none
        disabled:cursor-default
      `}
      whileTap={!answered ? { scale: 0.96 } : {}}
      animate={
        answered && choice.isCorrect
          ? { scale: [1, 1.04, 1] }
          : answered && choice.wasSelected && !choice.isCorrect
          ? { x: [0, -6, 6, -4, 4, 0] }
          : {}
      }
      transition={{ duration: 0.35 }}
      onClick={() => !answered && onSelect(choice.value)}
      disabled={answered}
    >
      <p className={`text-sm sm:text-base leading-snug font-medium ${isName ? 'text-base sm:text-lg' : ''}`}>
        {choice.label || choice.value}
      </p>
      {answered && choice.isCorrect && (
        <span className="text-emerald-200 text-xs mt-1 block">✓ Correct</span>
      )}
      {answered && choice.wasSelected && !choice.isCorrect && (
        <span className="text-red-200 text-xs mt-1 block">✗ Incorrect</span>
      )}
    </motion.button>
  )
}
