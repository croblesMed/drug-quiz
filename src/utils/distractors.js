/**
 * Distractor selection algorithm.
 * Returns an array of 6 answer objects: { value, drugIds, isCorrect }
 * Multiple drugs can share the same value → all marked isCorrect.
 */

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function buildAnswerChoices(currentDrug, allDrugs, answerAttr) {
  const correctValue = currentDrug[answerAttr]
  if (!correctValue) return []

  // --- Step 1: Find all drugs that share this exact answer value (collisions = also correct) ---
  const sharedCorrect = allDrugs.filter(
    d => d.id !== currentDrug.id && d[answerAttr] === correctValue
  )

  // Collect correct answer ids
  const correctIds = new Set([currentDrug.id, ...sharedCorrect.map(d => d.id)])

  // The correct answer entry (represents all drugs with this value)
  const correctEntry = {
    value: correctValue,
    drugIds: [...correctIds],
    isCorrect: true,
    label: answerAttr === 'name'
      ? `${currentDrug.emoji} ${correctValue}`
      : correctValue
  }

  // --- Step 2: Build a pool of distractor candidates (wrong answers only) ---
  const wrongDrugs = allDrugs.filter(d => !correctIds.has(d.id))

  // Partition by priority: same drug class first, then same tag, then rest
  const sameClass   = wrongDrugs.filter(d => d.drugClass === currentDrug.drugClass)
  const sameTags    = wrongDrugs.filter(d =>
    !sameClass.includes(d) &&
    d.topicTags?.some(t => currentDrug.topicTags?.includes(t))
  )
  const rest        = wrongDrugs.filter(d => !sameClass.includes(d) && !sameTags.includes(d))

  const prioritized = [...shuffle(sameClass), ...shuffle(sameTags), ...shuffle(rest)]

  // Deduplicate by answer value (each unique value can only appear once)
  const seenValues  = new Set([correctValue])
  const distractors = []

  for (const drug of prioritized) {
    if (distractors.length >= 5) break
    const val = drug[answerAttr]
    if (!val || seenValues.has(val)) continue
    seenValues.add(val)
    distractors.push({
      value: val,
      drugIds: [drug.id],
      isCorrect: false,
      label: answerAttr === 'name' ? `${drug.emoji} ${drug.name}` : val
    })
  }

  // --- Step 3: Shuffle final 6 choices ---
  return shuffle([correctEntry, ...distractors])
}

export const QUIZ_ATTRS = [
  { key: 'name',              label: 'Drug Name' },
  { key: 'drugClass',         label: 'Drug Class' },
  { key: 'primaryEffect',     label: 'Primary Effect' },
  { key: 'treatmentUsage',    label: 'Treatment Usage' },
  { key: 'mechanismOfAction', label: 'Mechanism of Action' },
  { key: 'sideEffects',       label: 'Side Effects' },
  { key: 'contraindications', label: 'Contraindications' },
]
