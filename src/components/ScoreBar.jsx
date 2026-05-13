export default function ScoreBar({ score, wrong, total, current, onReset }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b-2 border-amber-200 card-shadow">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

        {/* Back */}
        <button
          onClick={onReset}
          className="text-gray-400 hover:text-gray-700 transition-colors text-sm font-bold flex items-center gap-1"
        >
          ← Back
        </button>

        {/* Tally — ✓ N  ✗ N */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <span className="text-green-500 font-black text-xl leading-none">✓</span>
            <span className="text-gray-800 font-black text-xl tabular-nums">{score}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-red-500 font-black text-xl leading-none">✗</span>
            <span className="text-gray-800 font-black text-xl tabular-nums">{wrong}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="text-gray-400 text-sm font-semibold">
          {current}/{total}
        </div>

      </div>
    </div>
  )
}
