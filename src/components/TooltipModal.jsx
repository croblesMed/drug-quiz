import { QUIZ_ATTRS } from '../utils/distractors'

export default function TooltipModal({ drug, onClose }) {
  if (!drug) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white border-2 border-amber-200 rounded-3xl card-shadow-lg overflow-hidden max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b-2 border-amber-100 bg-amber-50">
          <div>
            <div className="text-3xl">{drug.emoji}</div>
            <h2 className="text-gray-900 font-black text-xl mt-1">{drug.name}</h2>
            <p className="text-amber-600 text-sm font-semibold">{drug.drugClass}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-3xl leading-none ml-4 transition-colors font-light"
          >
            ×
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4 bg-white">
          {/* Tooltip summary */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
            <p className="text-gray-700 text-sm leading-relaxed font-semibold">{drug.tooltip}</p>
          </div>

          {/* All attributes */}
          {QUIZ_ATTRS.filter(a => a.key !== 'name').map(attr => (
            <div key={attr.key}>
              <p className="text-amber-600 text-xs font-black uppercase tracking-wider mb-1">
                {attr.label}
              </p>
              <p className="text-gray-800 text-sm leading-relaxed font-semibold">{drug[attr.key]}</p>
            </div>
          ))}
        </div>

        <div className="p-4 border-t-2 border-amber-100 bg-amber-50">
          <button
            onClick={onClose}
            className="w-full bg-amber-400 hover:bg-amber-500 text-white font-black rounded-2xl py-3 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
