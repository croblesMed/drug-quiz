import { useState } from 'react'
import { QUIZ_ATTRS } from '../utils/distractors'

export default function TooltipModal({ drug, onClose }) {
  if (!drug) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-slate-800 border border-slate-600 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <div>
            <div className="text-2xl">{drug.emoji}</div>
            <h2 className="text-white font-bold text-xl mt-1">{drug.name}</h2>
            <p className="text-slate-400 text-sm">{drug.drugClass}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl leading-none ml-4 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Tooltip summary */}
          <div className="bg-slate-700/50 rounded-xl p-4">
            <p className="text-slate-200 text-sm leading-relaxed">{drug.tooltip}</p>
          </div>

          {/* All attributes */}
          {QUIZ_ATTRS.filter(a => a.key !== 'name').map(attr => (
            <div key={attr.key}>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                {attr.label}
              </p>
              <p className="text-white text-sm leading-relaxed">{drug[attr.key]}</p>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white rounded-xl py-3 font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
