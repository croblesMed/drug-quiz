export default function ScoreBar({ score, total, onReset }) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-700">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <button
          onClick={onReset}
          className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1"
        >
          ← Back
        </button>

        <div className="flex-1">
          <div className="flex items-center justify-center gap-3">
            <span className="text-white font-bold text-lg tabular-nums">
              {score} <span className="text-slate-400 font-normal">/ {total}</span>
            </span>
            <div className="hidden sm:block w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="text-slate-400 text-sm font-mono">
          {pct}%
        </div>
      </div>
    </div>
  )
}
