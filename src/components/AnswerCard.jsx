import { motion } from 'framer-motion'

export default function AnswerCard({ choice, answered, onSelect }) {
  let bg = 'bg-white hover:bg-amber-50 border-gray-200 hover:border-amber-300 text-gray-800'

  if (answered) {
    if (choice.isCorrect) {
      bg = 'bg-green-500 border-green-400 text-white'
    } else if (choice.wasSelected) {
      bg = 'bg-red-500 border-red-400 text-white'
    } else {
      bg = 'bg-gray-100 border-gray-200 text-gray-400'
    }
  }

  return (
    <motion.button
      className={`
        w-full rounded-2xl border-2 p-3 sm:p-4 text-left transition-all duration-150
        card-shadow tap-highlight-none
        ${bg}
        disabled:cursor-default
      `}
      whileTap={!answered ? { scale: 0.97 } : {}}
      animate={
        answered && choice.isCorrect
          ? { scale: [1, 1.04, 1] }
          : answered && choice.wasSelected && !choice.isCorrect
          ? { x: [0, -6, 6, -4, 4, 0] }
          : {}
      }
      transition={{ duration: 0.3 }}
      onClick={() => !answered && onSelect(choice.value)}
      disabled={answered}
    >
      <p className="text-sm sm:text-base leading-snug font-700 font-bold">
        {choice.label || choice.value}
      </p>
      {answered && choice.isCorrect && (
        <span className="text-green-100 text-xs mt-1 block font-semibold">✓ Correct</span>
      )}
      {answered && choice.wasSelected && !choice.isCorrect && (
        <span className="text-red-100 text-xs mt-1 block font-semibold">✗ Incorrect</span>
      )}
    </motion.button>
  )
}
