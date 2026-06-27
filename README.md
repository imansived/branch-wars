# Branch Wars 👑

A 2048-style tile-merging game themed around the Indian engineering "branch wars" —
merge your way from Civil up through Mech, Instru, E&TC, Robotics, AI&DS, IT, and
finally CS. Merge two CS tiles to trigger placement season and find out your fate.

Built with React + Vite. Sound effects are synthesized live with the Web Audio API —
no external audio files.

## Getting started

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
npm run preview  # preview the production build
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
│   └── events.js            # Resolves a "college event"'s gameplay effect
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

## Architecture notes

- **`game/` is framework-agnostic.** `gridLogic.js` and `events.js` contain zero
  React — pure functions in, pure data out. They could be lifted into a Node
  test suite or a different UI framework without changes.
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

## License

Personal/educational project.
