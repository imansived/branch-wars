# Branch Wars 👑

A 2048-style tile-merging game themed around the Indian engineering "branch wars" —
merge your way from Civil up through Mech, Instru, E&TC, Robotics, AI&DS, IT, and
finally CS. Merge two CS tiles to trigger placement season and find out your fate.

Built with React + Vite. Sound effects are synthesized live with the Web Audio API —
no external audio files. A built-in **expectimax search AI** (`src/ai/solver.js`)
can suggest the next move or play the whole game out — see [AI solver](#ai-solver) below.

The AI's heuristic weights are also empirically evaluated in a standalone
Python experiment (self-play simulation, hill-climbing search, held-out
evaluation) — see [`python/`](python/).

## Getting started

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
npm run preview  # preview the production build
npm test         # run the unit test suite (Vitest)
```

## Project structure

```
src/
├── main.jsx                 # React entry point
├── App.jsx                  # Top-level layout — wires useGameState() to the UI
│
├── hooks/
│   └── useGameState.js      # All game state, move handling, sound hooks, effects
│
├── game/
│   ├── gridLogic.js         # Pure 2048 board math (slide/merge/rotate/move-detect)
│   ├── events.js            # Resolves a "college event"'s gameplay effect
│   └── __tests__/           # Vitest unit tests for gridLogic.js
│
├── ai/
│   ├── solver.js            # Expectimax search + heuristic board evaluator
│   └── __tests__/           # Vitest unit tests for solver.js
│
├── data/
│   ├── branches.js          # Branch metadata: colors, icons, roast lines
│   └── flavorText.js        # Win/loss roasts, placement-result twists, event pool
│
├── audio/
│   └── sfx.js               # Web Audio synth engine + all sound effects
│
├── utils/
│   └── helpers.js           # pickRandom, fmtNum (locale number formatting)
│
├── components/
│   ├── FrontPage.jsx        # "Practical file" cover page (start screen)
│   ├── Grid.jsx              # The 4x4 board
│   ├── AIHint.jsx           # Pulsing directional badge showing the solver's suggested move
│   ├── Tile.jsx              # A single branch tile
│   ├── BranchArrows.jsx     # Progression pipeline (Civil → ... → CS)
│   ├── CollisionPopup.jsx   # Roast-line speech bubble on tile merge
│   ├── UnlockToast.jsx      # "X UNLOCKED" floating toast
│   ├── EventBanner.jsx      # Random college-event banner
│   ├── WelcomeBanner.jsx    # One-time intro banner
│   ├── CSUnlockedBanner.jsx # Full-screen banner on first reaching CS
│   ├── WinScreen.jsx        # 3-stage win flow + placement-result twist
│   ├── GameOverScreen.jsx   # Board-locked screen + backlog rescue button
│   ├── KTToast.jsx          # "Backlog cleared" confirmation toast
│   ├── PaperCard.jsx        # Reusable lined-paper card
│   ├── Footer.jsx           # Credit footer
│   ├── Confetti.jsx         # Win-screen confetti
│   └── MarginDoodles.jsx    # Decorative margin notes (math/code/notices)
│
└── styles/
    └── animations.css       # Global resets + all CSS keyframes
```

## AI solver

`src/ai/solver.js` is a from-scratch **expectimax search** over the board —
the same family of algorithm used by classic 2048 AIs, adapted to this game's
rules (tiles only ever spawn as value `1`, so the chance node is a plain
uniform average rather than 2048's 90/10 split).

- **Max nodes** try all four moves and keep the one leading to the
  highest-valued resulting position.
- **Chance nodes** average the heuristic value of every cell a new tile could
  land in, since the player doesn't control where it spawns.
- **Search depth adapts to how full the board is** — a packed board has fewer
  legal branches per ply, so it can afford to look further ahead in the same
  time budget, and that's exactly when deeper lookahead matters most.
- The position evaluator (`evaluateGrid`) weighs four heuristics: empty-cell
  count, monotonicity (rewards rows/columns that read as a consistent ramp),
  smoothness (penalizes sharp value jumps between neighbors), and a
  corner bonus for keeping the highest tile anchored in a corner.

It's exposed in the UI two ways (wired up in `useGameState.js`):
- **Hint** (lightbulb button) — runs the solver once and flashes the
  suggested direction as a pulsing badge (`AIHint.jsx`) on the board.
- **AI Autoplay** (bot button) — re-runs the solver on an interval and plays
  the suggested move automatically until toggled off or the game ends.

Both the search and the heuristics are pure functions over the same grid
format `gridLogic.js` uses, so they're unit-tested in isolation
(`src/ai/__tests__/solver.test.js`) without touching React at all.

## Architecture notes

- **`game/` and `ai/` are framework-agnostic.** `gridLogic.js`, `events.js`,
  and `solver.js` contain zero React — pure functions in, pure data out. They
  could be lifted into a Node test suite or a different UI framework without
  changes.
- **`hooks/useGameState.js` is the only place game state lives.** `App.jsx` is
  pure layout — it destructures what it needs from the hook and renders. This
  keeps the render tree easy to scan and the state machine easy to unit-test
  in isolation.
- **`audio/sfx.js` is self-contained.** All sounds are synthesized with
  oscillators (no audio files to host). It exposes `SFX` (the sound library)
  and `unlockAudio()` (call once on first user gesture — works around mobile
  Safari/Chrome silently dropping the first sound on a page).
- **`data/` holds all copy and config**, so editing roast lines, colors, or
  event text never requires touching component code.

## Customizing

- **Add/edit roast lines or branch colors** → `src/data/branches.js`
- **Add/edit a college event** → `src/data/flavorText.js` (`COLLEGE_EVENTS`)
  and, if it needs a new gameplay effect, `src/game/events.js`
- **Change a sound** → `src/audio/sfx.js`
- **Change the event firing frequency** → `EVENT_INTERVAL_MIN` /
  `EVENT_INTERVAL_RANGE` in `src/hooks/useGameState.js` (currently fires every
  25–40 successful moves)
- **Tune the AI** → `WEIGHTS` (heuristic balance) or `adaptiveDepth` (how far
  ahead it searches) in `src/ai/solver.js`; `AI_AUTOPLAY_INTERVAL_MS` /
  `HINT_DISPLAY_MS` in `src/hooks/useGameState.js` control the UI timing

## License

Personal/educational project.
