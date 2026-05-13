# Drug Quiz App — Product & Implementation Spec

> A gamified, modular drug-learning app for first-year medical students (M1) and USMLE Step 1 preparation.  
> Inspired by [Amino Acid Quiz](https://apps.apple.com/us/app/amino-acid-quiz/id1301129866).

---

## 1. Project Overview

The Drug Quiz App is a matching-game flashcard system built around a single core loop: you are shown one attribute of a drug, and you must select the correct match from 6 answer choices. Every round covers the entire drug set you've selected, and your goal is to get a perfect score. The game is designed to be fast, visually clean, and deeply satisfying to complete — like Amino Acid Quiz, but for pharmacology.

**V1 scope:** Cardiology drugs for M1 exam preparation and USMLE Step 1. The architecture is explicitly designed to support additional topic modules (psychiatry, neurology, hematology, etc.) without code changes — only new data files.

**Target users:** M1 medical students studying cardiology and preparing for USMLE Step 1.

**Target platform:** A static web app deployed to **GitHub Pages** — accessible via a shareable link that opens in any browser on iPhone or desktop. No app store, no install required. Optionally configured as a PWA (Progressive Web App) so the user can add it to their iPhone home screen and use it offline.

---

## 2. Core Game Loop

1. The user arrives at the **Start Screen**, reviews their past scores, selects a drug set and quiz mode, and taps Play.
2. The app shuffles the drug set and begins presenting drugs one at a time.
3. Each round: one attribute is shown as the **question**. Six answer choices are shown as tappable cards. The user taps one.
4. The answer is immediately revealed — correct flashes green, incorrect flashes red (and the correct answer also highlights green). The drug name then shows a tappable tooltip with its clinical summary.
5. Wrong answers are noted but **not recycled** within the same session. Every drug appears exactly once. The goal is to learn the correct answer and aim for a better score next game.
6. When all drugs have been shown, the **Results Screen** appears: a tile grid of all drugs, color-coded by drug class, showing a ✓ or ✗ on each tile. Score and personal best are prominently displayed.

---

## 3. Design Principles

### 3.1 Modularity and Editability
All drug data lives in topic-specific JSON files (e.g., `cardiology.json`, `psychiatry.json`). These files are human-readable and editable without touching any code. New topic modules are added by creating a new JSON file and registering it — no logic changes needed.

### 3.2 Redundancy Handling
Some attributes are shared across drugs (e.g., two drugs in the same class may share a mechanism). The app handles this in two ways:

- **Prevention:** The distractor-selection algorithm prefers distractors where the answer attribute value differs from the correct answer, minimizing collisions.
- **Resolution:** If two drugs genuinely share the exact same value for the answer attribute and both appear in the same question's answer bank, **both are marked as correct**. Selecting either counts as a correct answer for that round. This is explicitly surfaced to the user ("Multiple correct answers possible").

### 3.3 Name Is Always One Side of the Match
Every quiz mode pairs the drug **Name** on one side with one other attribute on the other. The user selects which side Name is on:

- **Name → Attribute:** The drug name (+ emoji) is the question. Six values of the chosen attribute are the answer choices.
- **Attribute → Name:** A drug attribute value is the question. Six drug names (+ emoji) are the answer choices.

No quiz mode pairs two non-name attributes against each other.

### 3.4 Randomization Within Sessions
Even when the same game mode is selected again, the experience should feel varied:

- Drug order is shuffled each game.
- Distractor selection is randomized from the eligible pool each game (not fixed).
- The result: the same quiz mode played twice will have different ordering and different wrong answer choices.

### 3.5 Completion and Gamification
- The score counter (e.g., **14 / 42**) is always visible in the top bar during gameplay.
- Personal best per (drug set + quiz mode) configuration is stored locally and shown on the Start Screen and Results Screen.
- A perfect score triggers a distinct celebration animation.

### 3.6 Emoji Visual Identity
Each drug has a unique 3-emoji combination displayed alongside its name throughout the app. Emojis are chosen to be thematically suggestive of the drug's effect or class. Every combination must be globally unique across all topic modules. Emojis are stored in the data file, assigned once, and never auto-generated.

### 3.7 Generic Names Only
All drug names in the database and UI use generic (INN) names exclusively. Brand names are never shown anywhere in the app.

### 3.8 Attribute Completeness
For high-yield fields like **side effects** and **contraindications**, the stored value must include all clinically significant, exam-relevant entries — not a random subset. These fields are particularly important for USMLE Step 1 and should not be abbreviated.

### 3.9 Conciseness
Attribute values should be as brief as possible while remaining complete. Use comma-separated lists for multi-value fields. Mechanisms are 1–2 sentences maximum.

---

## 4. Start Screen

The Start Screen is the app's home. It shows:

1. **App title and logo**
2. **Personal best scores** — a compact table or card showing the user's top scores by quiz mode (e.g., "Name → Mechanism: 38/42 ✦")
3. **Drug set selector** — choose which drugs to include:
   - All cardiology drugs
   - Filter by drug class (e.g., Beta-blockers, ACE Inhibitors, Antiarrhythmics)
   - Filter by topic tag (e.g., Heart Failure, Hypertension, Arrhythmias)
   - In future versions: combine multiple topic modules (e.g., Cardiology + Psychiatry)
   - The total count of selected drugs is shown (e.g., "42 drugs")
4. **Quiz mode selector** — two dropdowns or segmented controls:
   - **Question type:** Name | Drug Class | Primary Effect | Treatment Usage | Mechanism of Action | Side Effects | Contraindications
   - **Answer type:** same list
   - Constraint enforced in UI: exactly one of the two must be "Name." Selecting non-Name for both is blocked with an inline message.
5. **Play button** — launches the game with the current configuration

---

## 5. Game Mechanics

### 5.1 Round Structure
Each round:
1. Display the **question** (drug name + emoji, or attribute value).
2. Display **6 answer cards** — one correct, five distractors (or fewer if pool is small, minimum 3).
3. User taps a card.
4. Immediately:
   - Correct tap → that card turns green, score increments, brief animation.
   - Incorrect tap → that card turns red, correct card(s) pulse green.
5. A **tooltip trigger** appears on the drug name. Tapping it opens a modal with the drug's ≤50-word clinical summary, plus all attribute values for review.
6. A **"Next →"** button advances to the next drug. There is no retry; wrong answers are recorded and reviewed at the end.

### 5.2 Scoring
- +1 for a correct first tap. 0 for an incorrect tap.
- Score visible throughout in top bar.
- No partial credit, no retries mid-game.
- At game end: score, personal best, and any improvement are shown.

### 5.3 Distractor Selection Algorithm
For each round, the 6 answer choices are assembled as follows:

1. **Insert the correct answer** (the true attribute value for the drug being quizzed).
2. **Scan for shared-value collisions.** If any other drug in the active set shares the exact same value for the answer attribute, mark it also as correct. The shared value appears only once in the answer bank but both underlying drugs are flagged as acceptable.
3. **Fill distractor slots** (up to 5 wrong answers) using this priority:
   - First, prefer drugs from the **same drug class** as the correct drug — these are the most educationally meaningful distractors.
   - If insufficient same-class options exist, pull from the same **topic tag**.
   - Fill remaining slots from the broader active drug set.
4. **Randomize the selection** within each priority tier every game (so distractors differ between sessions).
5. **Shuffle** the final 6 cards before display.

### 5.4 Tooltip
After each round, the drug name is shown with a small info indicator. Tapping opens a modal with:
- Drug name + emoji (large)
- ≤50-word clinical summary (the `tooltip` field)
- All attribute values listed for that drug (class, mechanism, treatments, side effects, contraindications)
- Dismisses on tap outside or a close button

### 5.5 No-Retry Design
If the user answers incorrectly, they see the correct answer, then move on. The app is designed for repeated play — the incentive to improve is the score and personal best system, not in-session correction. This preserves the integrity of the completion score.

---

## 6. Results Screen

The Results Screen appears after all drugs have been answered. It contains:

### 6.1 Score Summary
- Large **Score / Total** display (e.g., **38 / 42**)
- Personal best for this configuration
- Delta from personal best (e.g., "+3 from your best")
- Perfect score triggers a full-screen celebration (confetti or similar)

### 6.2 Drug Tile Grid
Every drug in the active set is shown as a tile in a responsive grid (similar to the Amino Acid Quiz end screen). Each tile shows:
- Drug name + emoji
- ✓ (if answered correctly) or ✗ (if answered incorrectly)
- **Color-coded by drug class** — each drug class gets a consistent color throughout the app (the tile background or border uses that class color)
- Tapping a tile opens the tooltip modal for that drug

The tile grid gives the user an at-a-glance view of exactly which drugs they know and which they missed, and the color coding reinforces class groupings visually.

### 6.3 Action Buttons
- **Play Again** — same configuration, reshuffled
- **Change Settings** — return to Start Screen
- **Review Missed** — filter tile view to show only incorrect drugs and their correct answers

---

## 7. Drug Class Color Palette

Each drug class is assigned one consistent color used across tiles, filter chips, and card accents. Colors should be visually distinct, aesthetically clean, and work in both light and dark mode. Suggested mapping (exact hex values to be finalized in implementation):

| Drug Class | Suggested Color |
|-----------|----------------|
| Beta-blocker | Slate blue |
| ACE Inhibitor | Teal |
| ARB | Cyan |
| Calcium Channel Blocker (DHP) | Amber |
| Calcium Channel Blocker (non-DHP) | Orange |
| Loop Diuretic | Sky blue |
| Thiazide / Thiazide-like Diuretic | Indigo |
| Potassium-sparing Diuretic | Violet |
| Antiarrhythmic Class IA | Red |
| Antiarrhythmic Class IB | Rose |
| Antiarrhythmic Class IC | Pink |
| Antiarrhythmic Class III | Crimson |
| Cardiac Glycoside | Green |
| Nitrate | Yellow |
| Statin | Lime |
| Antiplatelet | Orange-red |
| Anticoagulant | Deep red |
| Thrombolytic | Magenta |
| Direct Vasodilator | Purple |
| Sympathomimetic / Inotrope | Emerald |
| ARNI | Teal-green |
| Other / Miscellaneous | Gray |

---

## 8. Data Structure

### 8.1 Schema

All drug data is stored in `/src/data/topics/cardiology.json` as a JSON array. Each entry:

```json
{
  "id": "metoprolol",
  "name": "Metoprolol",
  "emoji": "❤️🛡️🐢",
  "drugClass": "Beta-blocker (cardioselective, β1)",
  "primaryEffect": "Reduces heart rate and myocardial contractility",
  "treatmentUsage": "Hypertension, angina, heart failure (HFrEF), post-MI, atrial fibrillation rate control, SVT prevention",
  "mechanismOfAction": "Selectively antagonizes β1-adrenergic receptors in the heart, reducing sympathetic stimulation of heart rate, contractility, and renin release.",
  "sideEffects": "Bradycardia, fatigue, cold extremities, depression, sexual dysfunction, masks hypoglycemia symptoms, bronchospasm (less than non-selective beta-blockers), rebound hypertension on abrupt discontinuation",
  "contraindications": "Cardiogenic shock, decompensated heart failure, significant bradycardia or heart block (without pacemaker), severe reactive airway disease",
  "topicTags": ["hypertension", "heart failure", "arrhythmias", "angina", "post-MI"],
  "tooltip": "Cardioselective β1-blocker reducing heart rate, contractility, and renin release. High-yield for hypertension, angina, HFrEF, and rate control. Classic USMLE associations: masks hypoglycemia, causes bronchospasm, rebound hypertension if stopped abruptly."
}
```

### 8.2 Field Reference

| Field | Type | Required | Quizzable | Notes |
|-------|------|----------|-----------|-------|
| `id` | string | Yes | No | Unique slug, lowercase, no spaces |
| `name` | string | Yes | Always one side | Generic (INN) name only |
| `emoji` | string | Yes | Displayed with name | Exactly 3 emoji; globally unique |
| `drugClass` | string | Yes | Yes | Specific enough to distinguish most drugs |
| `primaryEffect` | string | Yes | Yes | One sentence; physiological outcome |
| `treatmentUsage` | string | Yes | Yes | Comma-separated; all major indications |
| `mechanismOfAction` | string | Yes | Yes | 1–2 sentences; molecular/receptor level |
| `sideEffects` | string | Yes | Yes | All high-yield adverse effects; comma-separated |
| `contraindications` | string | Yes | Yes | All major absolute/relative contraindications |
| `topicTags` | string[] | Yes | No | Used for filtering and distractor grouping |
| `tooltip` | string | Yes | Tooltip only | ≤50 words; USMLE-relevant clinical summary |

### 8.3 File Structure

```
/src/data/
├── topics/
│   ├── cardiology.json       ← V1 drug database (edit here to add drugs)
│   ├── psychiatry.json       ← future module
│   ├── neurology.json        ← future module
│   └── ...
├── topicRegistry.json        ← list of available topic modules + metadata
├── drugClasses.json          ← valid drug class strings + assigned colors
└── topicTags.json            ← valid topic tag strings
```

`topicRegistry.json` format:
```json
[
  {
    "id": "cardiology",
    "label": "Cardiology",
    "file": "topics/cardiology.json",
    "icon": "🫀",
    "description": "M1 cardiology and USMLE Step 1 pharmacology"
  }
]
```

---

## 9. V1 Cardiology Drug Database

The following drugs constitute the complete V1 dataset. All must be entered in `cardiology.json` with every field populated. Drugs are organized here by class for authoring convenience only — in the JSON file they are a flat array.

### Beta-blockers

| Drug | Emoji | Key Side Effects (exam-critical) |
|------|-------|----------------------------------|
| Metoprolol | ❤️🛡️🐢 | Masks hypoglycemia, bronchospasm |
| Atenolol | 💙🎯🐌 | Masks hypoglycemia, less lipid-soluble (less CNS) |
| Carvedilol | 🖤⚡🧤 | Orthostatic hypotension (α1 block), bronchospasm |
| Propranolol | 🫀🚫⚡ | Non-selective; bronchospasm, masks hypoglycemia, CNS effects |
| Labetalol | 🤰💊🩺 | α1 + β block; safe in pregnancy hypertension |
| Esmolol | ⏱️❤️💉 | Ultra-short acting IV; perioperative/acute rate control |
| Nebivolol | 🌬️❤️🔵 | Releases NO → vasodilation; least sexual dysfunction |

### ACE Inhibitors

| Drug | Emoji | Key Side Effects (exam-critical) |
|------|-------|----------------------------------|
| Lisinopril | 😮‍💨💧❤️ | Dry cough (bradykinin), angioedema, hyperkalemia, teratogen |
| Enalapril | 🫁💊🔴 | Dry cough, angioedema, first-dose hypotension |
| Captopril | 🏗️⚗️💊 | Dry cough, angioedema, agranulocytosis, rash, dysgeusia |
| Ramipril | 🫀🔬💉 | Dry cough; mortality benefit post-MI |

### Angiotensin Receptor Blockers (ARBs)

| Drug | Emoji | Key Side Effects (exam-critical) |
|------|-------|----------------------------------|
| Losartan | 🚪🔒💙 | Hyperkalemia, teratogen; NO cough (vs ACEi) |
| Valsartan | 🧱🛡️🫀 | Hyperkalemia, teratogen; used in HFrEF |
| Irbesartan | 🔑🔵💊 | Hyperkalemia, teratogen |
| Candesartan | 🕳️🧊💊 | Hyperkalemia, teratogen |

### Calcium Channel Blockers — Dihydropyridines (DHP)

| Drug | Emoji | Key Side Effects (exam-critical) |
|------|-------|----------------------------------|
| Amlodipine | 🫀🔓💊 | Peripheral edema, flushing, reflex tachycardia |
| Nifedipine | 🩸🔓🫀 | Peripheral edema, reflex tachycardia; used in Raynaud, preterm labor |
| Nicardipine | 🌊🔓💉 | IV form for hypertensive emergency |
| Clevidipine | ⚡🔓💉 | Ultra-short IV; intraoperative hypertension |
| Felodipine | 🌸🔓💊 | Peripheral edema; fewer drug interactions than amlodipine |

### Calcium Channel Blockers — Non-Dihydropyridines (non-DHP)

| Drug | Emoji | Key Side Effects (exam-critical) |
|------|-------|----------------------------------|
| Diltiazem | ⏱️❤️🔒 | Bradycardia, AV block, constipation; do NOT use in HFrEF |
| Verapamil | ❄️❤️🔒 | Bradycardia, AV block, constipation; most negative inotrope of CCBs |

### Diuretics — Loop

| Drug | Emoji | Key Side Effects (exam-critical) |
|------|-------|----------------------------------|
| Furosemide | 💧🏃💨 | Hypokalemia, hypomagnesemia, ototoxicity, hyperuricemia, sulfa allergy |
| Bumetanide | 💦🏃💊 | Same as furosemide; more potent per mg; sulfa allergy |
| Ethacrynic acid | 💧🚫💊 | Only loop diuretic safe in sulfa allergy; more ototoxic |
| Torsemide | 🌊🏃💊 | Longer acting than furosemide; better oral bioavailability |

### Diuretics — Thiazide / Thiazide-like

| Drug | Emoji | Key Side Effects (exam-critical) |
|------|-------|----------------------------------|
| Hydrochlorothiazide | 💊💧🫀 | Hypokalemia, hyponatremia, hyperuricemia, hyperglycemia, hypercalcemia, hyperlipidemia |
| Chlorthalidone | ☁️💧💊 | Longer acting than HCTZ; same side effect profile |
| Metolazone | 🔵💧💊 | Used with loop diuretics for synergistic effect in refractory edema |
| Indapamide | 💙💧🩺 | Thiazide-like; preferred in CKD (vs HCTZ) |

### Diuretics — Potassium-sparing

| Drug | Emoji | Key Side Effects (exam-critical) |
|------|-------|----------------------------------|
| Spironolactone | 🌿💊🧪 | Hyperkalemia, gynecomastia (anti-androgen), menstrual irregularity; used in HFrEF |
| Eplerenone | 🧬🔒💊 | Selective aldosterone antagonist; fewer anti-androgen effects; used in HFrEF post-MI |
| Triamterene | 🔺💊🩺 | Hyperkalemia, kidney stones; blocks ENaC directly |
| Amiloride | 🔷💊🩺 | Hyperkalemia; blocks ENaC directly; used in Liddle syndrome |

### Diuretics — Other

| Drug | Emoji | Key Side Effects (exam-critical) |
|------|-------|----------------------------------|
| Acetazolamide | 🏔️💊🧪 | Metabolic acidosis, hypokalemia, paresthesias; used in altitude sickness, glaucoma |
| Mannitol | 🍬💧🧠 | Pulmonary edema in heart failure patients (contraindicated); used for cerebral edema |

### Antiarrhythmics — Class IA (Na⁺ channel blockers, intermediate kinetics; also block K⁺ channels → prolong QT)

| Drug | Emoji | Key Side Effects (exam-critical) |
|------|-------|----------------------------------|
| Quinidine | 🎻🫀🔴 | Torsades de pointes (QT prolongation), cinchonism (tinnitus, headache), thrombocytopenia |
| Procainamide | 🔫🫀💊 | Drug-induced lupus (anti-histone antibodies), Torsades, agranulocytosis |
| Disopyramide | 🚫💧🫀 | Anticholinergic effects (urinary retention, dry mouth), negative inotropy |

### Antiarrhythmics — Class IB (Na⁺ channel blockers, fast kinetics; shorten action potential)

| Drug | Emoji | Key Side Effects (exam-critical) |
|------|-------|----------------------------------|
| Lidocaine | 💉🔇🫀 | CNS toxicity (seizures, perioral numbness) at high doses; no oral bioavailability |
| Mexiletine | 💊🔇🫀 | Oral lidocaine analog; GI side effects, tremor |
| Phenytoin | 🧠🔇💊 | Used in digoxin-induced arrhythmias; gingival hyperplasia, nystagmus |

### Antiarrhythmics — Class IC (Na⁺ channel blockers, slow kinetics; most potent Na⁺ blockers)

| Drug | Emoji | Key Side Effects (exam-critical) |
|------|-------|----------------------------------|
| Flecainide | ⚠️🚫🫀 | Proarrhythmic (avoid post-MI or structural heart disease); CAST trial |
| Propafenone | ⚠️🔇🫀 | Proarrhythmic; mild β-blocking effect; avoid post-MI |

### Antiarrhythmics — Class II (Beta-blockers)
See Beta-blockers section. Key agents for arrhythmia: **Metoprolol**, **Esmolol**, **Propranolol**.

### Antiarrhythmics — Class III (K⁺ channel blockers; prolong repolarization/QT)

| Drug | Emoji | Key Side Effects (exam-critical) |
|------|-------|----------------------------------|
| Amiodarone | ☢️🫀🌊 | Pulmonary toxicity, thyroid dysfunction (hypo/hyper), hepatotoxicity, corneal deposits, blue-gray skin, photosensitivity, prolongs QT (rarely Torsades); very long half-life |
| Sotalol | 📡🫀⚡ | Torsades de pointes (QT prolongation), bradycardia; also β-blocking |
| Dofetilide | 🔴🫀⚡ | Torsades (QT prolongation); strictly renally dosed |
| Ibutilide | 💉🫀⚡ | IV only; Torsades; used for acute AF/flutter conversion |
| Dronedarone | 🔵🫀⚡ | Amiodarone analog without iodine; contraindicated in permanent AF and HFrEF |

### Antiarrhythmics — Class IV (Non-DHP CCBs)
See Calcium Channel Blockers section. Key agents: **Diltiazem**, **Verapamil**.

### Antiarrhythmics — Miscellaneous

| Drug | Emoji | Key Side Effects (exam-critical) |
|------|-------|----------------------------------|
| Adenosine | ⚡🔌🫀 | Transient complete heart block, flushing, chest tightness, dyspnea; extremely short half-life (~10 sec); blocked by theophylline, potentiated by dipyridamole |
| Digoxin | 🌸❤️💀 | Narrow therapeutic index; toxicity: nausea, vomiting, yellow-green halos, bradycardia, AV block, arrhythmias; hypokalemia and hypomagnesemia worsen toxicity |
| Atropine | 👁️💊🚀 | Tachycardia, dry mouth, urinary retention, blurred vision, confusion (antimuscarinic); used for symptomatic bradycardia |
| Ivabradine | 🌀❤️⏱️ | Bradycardia, phosphenes (visual brightness); used in HFrEF when beta-blockers contraindicated |

### Nitrates

| Drug | Emoji | Key Side Effects (exam-critical) |
|------|-------|----------------------------------|
| Nitroglycerin | 💥❤️🩸 | Headache, hypotension, reflex tachycardia, methemoglobinemia (rare); tolerance with continuous use |
| Isosorbide mononitrate | 🕐❤️💊 | Headache, hypotension; long-acting oral; nitrate-free window required |
| Isosorbide dinitrate | ⏳❤️💊 | Headache, hypotension; often combined with hydralazine in HFrEF (V-HeFT II) |

### Statins (HMG-CoA reductase inhibitors)

| Drug | Emoji | Key Side Effects (exam-critical) |
|------|-------|----------------------------------|
| Atorvastatin | 🏆🧬💊 | Myopathy/rhabdomyolysis (CK elevation), hepatotoxicity (LFT elevation); most commonly prescribed |
| Rosuvastatin | 🌟🧬💊 | Myopathy; highest potency for LDL reduction; renal excretion |
| Simvastatin | 📉🧬💊 | Myopathy (especially with CYP3A4 inhibitors, e.g., amiodarone); interacts with many drugs |
| Pravastatin | 🛡️🧬💊 | Myopathy (rare); not metabolized by CYP450; safest in transplant patients |
| Lovastatin | 🌽🧬💊 | Myopathy; significant CYP3A4 interactions |

### Other Lipid-Lowering Agents

| Drug | Emoji | Key Side Effects (exam-critical) |
|------|-------|----------------------------------|
| Ezetimibe | 🚫🍔🧬 | GI upset; inhibits intestinal NPC1L1 cholesterol transporter |
| Niacin (nicotinic acid) | 🔥🩸💊 | Flushing (prostaglandin-mediated; blocked by aspirin), hyperglycemia, hyperuricemia, hepatotoxicity; raises HDL most effectively |
| Gemfibrozil | 🧶🩸💊 | Myopathy (especially with statins), cholelithiasis, GI upset; PPAR-α agonist |
| Fenofibrate | 🧵🩸💊 | Less myopathy risk with statins than gemfibrozil; PPAR-α agonist |
| Cholestyramine | 🧱🧬💊 | Constipation, impairs absorption of fat-soluble vitamins and other drugs; bile acid resin |
| Evolocumab | 💉🧬🎯 | Injection site reactions; PCSK9 inhibitor; used in refractory hypercholesterolemia |

### Antiplatelets

| Drug | Emoji | Key Side Effects (exam-critical) |
|------|-------|----------------------------------|
| Aspirin | 💊🩸🛡️ | GI bleeding, peptic ulcer, tinnitus (salicylism), Reye syndrome in children, bronchospasm (aspirin-exacerbated respiratory disease) |
| Clopidogrel | 🔑🩸🚫 | Bleeding, TTP (rare); prodrug requiring CYP2C19 activation (poor metabolizers have reduced effect) |
| Ticagrelor | ⏱️🩸🚫 | Bleeding, dyspnea (non-bronchospastic), reversible; no prodrug activation needed |
| Prasugrel | ⚡🩸🚫 | Bleeding (more than clopidogrel); contraindicated in prior stroke/TIA, age >75, low body weight |
| Dipyridamole | 🌀🩸💊 | Headache, flushing, dizziness; inhibits adenosine reuptake and phosphodiesterase |
| Cilostazol | 🦵🩸💊 | Headache, palpitations; phosphodiesterase inhibitor; contraindicated in heart failure |
| Abciximab | 💉🩸🎯 | Bleeding, thrombocytopenia; GP IIb/IIIa inhibitor |
| Eptifibatide | 💉🩸🔵 | Bleeding, thrombocytopenia; GP IIb/IIIa inhibitor |
| Tirofiban | 💉🩸🔴 | Bleeding, thrombocytopenia; GP IIb/IIIa inhibitor |

### Anticoagulants

| Drug | Emoji | Key Side Effects (exam-critical) |
|------|-------|----------------------------------|
| Heparin (UFH) | ⚗️🩸💉 | Bleeding, HIT (heparin-induced thrombocytopenia — IgG antibody to PF4-heparin complex), osteoporosis with prolonged use; reversal: protamine sulfate |
| Enoxaparin | 🧪🩸💉 | Bleeding, HIT (lower risk than UFH); avoid in severe CKD; LMWH, anti-Xa activity |
| Fondaparinux | 🔩🩸💉 | Bleeding; does NOT cause HIT; pure factor Xa inhibitor; renally cleared |
| Warfarin | 🐀🩸💊 | Bleeding, teratogen (warfarin embryopathy), skin necrosis (protein C/S deficiency), drug/food interactions; reversal: vitamin K, FFP, or 4-factor PCC |
| Apixaban | 🍎🩸🔒 | Bleeding; direct factor Xa inhibitor; reversal: andexanet alfa |
| Rivaroxaban | 🔑🩸🔒 | Bleeding; direct factor Xa inhibitor; once or twice daily; reversal: andexanet alfa |
| Edoxaban | 🌀🩸🔒 | Bleeding; direct factor Xa inhibitor |
| Dabigatran | 🔴🩸🔒 | Bleeding, dyspepsia; direct thrombin inhibitor; reversal: idarucizumab |
| Bivalirudin | 💉🔒🩸 | Bleeding; direct thrombin inhibitor; used as heparin alternative in PCI, especially HIT |
| Argatroban | ⚗️🔒🩸 | Bleeding; direct thrombin inhibitor; used in HIT (hepatically metabolized) |

### Thrombolytics

| Drug | Emoji | Key Side Effects (exam-critical) |
|------|-------|----------------------------------|
| Alteplase (tPA) | 🔓🩸🚑 | Bleeding (especially intracranial hemorrhage), angioedema; used in STEMI, PE, ischemic stroke (within 3 h) |
| Tenecteplase | 🎯🩸🚑 | Bleeding; fibrin-specific tPA; single IV bolus; used in STEMI |
| Streptokinase | 🧫🩸💉 | Bleeding, allergic reactions, hypotension; not fibrin-specific; antibody formation limits re-use |

### Direct Vasodilators

| Drug | Emoji | Key Side Effects (exam-critical) |
|------|-------|----------------------------------|
| Hydralazine | 🌺💊🩺 | Reflex tachycardia, lupus-like syndrome (anti-histone antibodies), fluid retention, headache; arterial vasodilator; safe in pregnancy |
| Minoxidil | 💇🩸💊 | Hypertrichosis (hair growth), fluid retention, reflex tachycardia, pericardial effusion; also topical for hair loss |
| Sodium nitroprusside | ☠️💊💉 | Cyanide toxicity (from nitric oxide + CN⁻ release), hypotension; requires ICU monitoring |
| Diazoxide | 📡💊🩺 | Reflex tachycardia, hyperglycemia (inhibits insulin release), fluid retention |
| Fenoldopam | 🫘💊💉 | Reflex tachycardia, headache, flushing; D1 receptor agonist; increases renal perfusion — preferred in hypertensive emergency with renal involvement |

### Heart Failure — Specialized Agents

| Drug | Emoji | Key Side Effects (exam-critical) |
|------|-------|----------------------------------|
| Sacubitril/valsartan | 🫀🔧🔵 | Hypotension, hyperkalemia, angioedema (do NOT combine with ACEi); ARNI (angiotensin receptor-neprilysin inhibitor) |
| Dobutamine | 💪❤️💉 | Tachycardia, arrhythmias, increased myocardial O₂ demand; β1 agonist; used in acute decompensated HF |
| Dopamine | 🧠❤️💉 | Tachycardia, arrhythmias; dose-dependent: low = renal D1, medium = β1, high = α1 |
| Milrinone | 🔋❤️💉 | Hypotension, arrhythmias; PDE3 inhibitor; "inodilator"; used in acute decompensated HF |
| Nesiritide | 💧❤️💉 | Hypotension; recombinant BNP; limited clinical benefit in HF |

### Vasopressors / Sympathomimetics

| Drug | Emoji | Key Side Effects (exam-critical) |
|------|-------|----------------------------------|
| Norepinephrine | 🔺❤️💉 | Peripheral ischemia, reflex bradycardia; α1 > β1 agonist; first-line for septic shock |
| Epinephrine | ⚡💉🚨 | Tachycardia, arrhythmias, hypertension; α + β agonist; anaphylaxis and cardiac arrest |
| Vasopressin | 🧪💧💉 | Ischemia (coronary, mesenteric), hyponatremia; V1 receptor → vasoconstriction; used in septic shock as adjunct |
| Phenylephrine | 🔴💉⬆️ | Reflex bradycardia (pure α1 agonist); used in hypotension when tachycardia is problematic |

---

## 10. Quiz Modes Available in V1

The following mode combinations are valid (one side must always be Name):

| # | Question | Answer choices |
|---|----------|----------------|
| 1 | Drug Name | Drug Class |
| 2 | Drug Name | Primary Effect |
| 3 | Drug Name | Treatment Usage |
| 4 | Drug Name | Mechanism of Action |
| 5 | Drug Name | Side Effects |
| 6 | Drug Name | Contraindications |
| 7 | Drug Class | Drug Name |
| 8 | Primary Effect | Drug Name |
| 9 | Treatment Usage | Drug Name |
| 10 | Mechanism of Action | Drug Name |
| 11 | Side Effects | Drug Name |
| 12 | Contraindications | Drug Name |
| 13 | Mixed (randomized) | Mixed (randomized) |

---

## 11. Technical Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Framework | React (Vite) | Fast dev, component model fits card UI |
| Styling | Tailwind CSS | Utility-first, responsive layout |
| State | React Context + useReducer | No Redux needed for this complexity |
| Persistence | localStorage | Personal bests, no backend needed |
| Data | Static JSON files | Human-editable, modular by topic |
| PWA | vite-plugin-pwa | Offline use, home screen install on iPhone |
| Animations | Framer Motion | Card flip/bounce, results celebration |
| Deployment | **GitHub Pages** | Static hosting; shareable link; free |

### 11.1 Project File Structure

```
/
├── public/
│   └── manifest.json               ← PWA manifest
├── src/
│   ├── data/
│   │   ├── topics/
│   │   │   ├── cardiology.json     ← V1 drug database
│   │   │   └── [future modules]
│   │   ├── topicRegistry.json      ← which topic files exist + metadata
│   │   ├── drugClasses.json        ← class names + assigned colors
│   │   └── topicTags.json          ← valid topic tag strings
│   ├── components/
│   │   ├── StartScreen.jsx         ← stats, drug set + mode selection, Play button
│   │   ├── GameBoard.jsx           ← main quiz UI
│   │   ├── AnswerCard.jsx          ← individual answer option card
│   │   ├── ScoreBar.jsx            ← top bar with live score
│   │   ├── TooltipModal.jsx        ← post-round drug info overlay
│   │   └── ResultsScreen.jsx       ← tile grid + score summary
│   ├── hooks/
│   │   ├── useGameSession.js       ← game state machine (shuffle, scoring, advance)
│   │   └── usePersonalBest.js      ← localStorage persistence
│   ├── utils/
│   │   └── distractors.js          ← distractor selection + collision detection
│   ├── App.jsx
│   └── main.jsx
├── vite.config.js
└── README.md
```

### 11.2 Deployment

- Hosted on **GitHub Pages** via the `gh-pages` npm package or GitHub Actions.
- The app is accessible at a URL like `https://[username].github.io/drug-quiz/`.
- That URL can be opened on iPhone in Safari and added to the home screen as a standalone app icon (via the PWA manifest).
- No server, no database, no login required.

---

## 12. Personal Best Storage

Saved to `localStorage` under key `drugQuizBests`. Key format: `{topicId}_{filterKey}__{questionAttr}__to__{answerAttr}`.

```json
{
  "cardiology_all__name__to__drugClass": {
    "bestScore": 38,
    "totalDrugs": 42,
    "date": "2026-05-10"
  },
  "cardiology_beta-blockers__mechanismOfAction__to__name": {
    "bestScore": 7,
    "totalDrugs": 7,
    "date": "2026-05-11"
  }
}
```

The Start Screen reads these keys and displays a summary of the user's best scores by configuration.

---

## 13. Future Topic Modules (Out of Scope for V1)

The data architecture supports new modules with zero code changes. To add a new topic:

1. Create `/src/data/topics/[topic].json` with drug entries following the schema in Section 8.
2. Register it in `topicRegistry.json`.
3. Assign any new drug classes to `drugClasses.json` with a color.

Planned future modules:
- **Psychiatry** — antidepressants, antipsychotics, mood stabilizers, anxiolytics
- **Neurology** — anticonvulsants, Parkinson's drugs, migraine treatments, MS drugs
- **Hematology / Oncology** — chemotherapy agents, growth factors
- **Infectious Disease** — antibiotics, antivirals, antifungals
- **Combined sessions** — the Start Screen will allow selecting multiple topic modules simultaneously once they exist

---

## 14. Adding New Drugs

Open `src/data/topics/cardiology.json` and append a new object following the schema in Section 8.2. Checklist:

- [ ] `id` is unique across all topic files, lowercase, no spaces
- [ ] `emoji` is exactly 3 emoji, not already used by any other drug
- [ ] `tooltip` is ≤50 words
- [ ] `sideEffects` includes all exam-relevant adverse effects
- [ ] `contraindications` includes all major absolute and relative contraindications
- [ ] At least one `topicTag` is assigned
- [ ] Generic name only — no brand names

No code changes required.

---

## 15. What Was Deliberately Left Out of V1

- User accounts or cloud sync (localStorage only)
- Spaced repetition / Anki-style scheduling
- Audio pronunciation
- Multiplayer or competitive modes
- In-session retry of wrong answers (intentional — see Section 5.5)
- Brand name recognition mode
- Non-cardiology topic modules (architecture supports them; content deferred)

---

*Spec version 2.0 — May 2026*  
*Author: Carlos Robles | Icahn School of Medicine at Mount Sinai, M1*
