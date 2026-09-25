# Branch Wars AI — Python experiments

[Branch Wars](..) is a 2048-style tile-merging game with a from-scratch
**expectimax search** AI (`src/ai/solver.js`) that can hint or autoplay
moves. This folder is a standalone Python re-implementation of that same
board logic and search algorithm, used to ask a question the JS code can't
easily answer on its own: **are the AI's hand-picked heuristic weights any
good, or just plausible-looking guesses?**

This is a separate, self-contained experiment — it doesn't run inside the
web app, and nothing here affects the live game's runtime.

## Files

| File | What it does |
|---|---|
| `simulator.py` | Pure-Python port of `gridLogic.js` + `solver.js`: board moves, the four heuristics (empty cells, monotonicity, smoothness, corner bonus), and the expectimax search itself. Same algorithm, same numbers — not a reimagining. |
| `test_simulator.py` | Unit tests mirroring `src/game/gridLogic.test.js` and `src/ai/solver.test.js`, to check this port actually behaves like the JS it's standing in for. |
| `tune_weights.py` | Hill-climbing search over the four heuristic weights, with a proper held-out evaluation (see below). |
| `results/` | Output of the last `tune_weights.py` run: `summary.json` and a plot. |

## Setup

```bash
pip install -r requirements.txt   # just matplotlib; everything else is stdlib
python -m unittest -v             # parity tests
python tune_weights.py            # ~4-5 minutes on a 16-core machine
```

## The question

`solver.js` weighs four things when deciding how good a board position is:
how many empty cells it has, how "sorted" each row/column reads
(monotonicity), how jarring the value jumps between neighbors are
(smoothness), and whether the highest tile sits in a corner. The weights
(`{ empty: 2.7, monotonicity: 1.0, smoothness: 0.1, corner: 2.0 }`) were
hand-picked, the usual way heuristics get picked. `tune_weights.py` runs a
local search (hill-climbing: perturb one weight at random, keep it only if
it scores better) to see whether that guess can be beaten empirically.

## Why the evaluation is the actual point

A naive version of this — score each candidate on a few fresh random games
and keep whatever wins — is a trap. Two things make the result almost
meaningless if you don't control for them:

- **Different opponents.** If each candidate plays a different random batch
  of games, a "better" score might just mean an easier batch of tile
  spawns, not a better weight set. Fixed here by evaluating every candidate
  on the *same* fixed set of RNG seeds during search (common random
  numbers) — a fair, paired comparison.
- **Overfitting to the sample.** Even with paired comparisons, a search
  that's free to keep chasing whatever scores best on a small fixed sample
  will eventually fit noise in that sample, not a real improvement. Fixed
  here with a train/test-style split: the seeds used during search
  (`--games`, default 10) are never reused in the final comparison
  (`--final-games`, default 40, held out).

## Results

From the run checked into `results/` (`python tune_weights.py --games 10
--iterations 20 --final-games 40 --seed 0`, ~16-core machine, ~264s):

| | Baseline (hand-picked) | Tuned (hill-climbed) |
|---|---|---|
| Avg. score, tuning sample (n=10) | 850 | **973.5** |
| Avg. score, held-out (n=40, unseen) | **873.2** | 856.4 |
| Win rate, held-out | 97.5% | 100% |

The tuned weights looked like a clear win during search — 850 → 973.5 avg
score. On the held-out sample, that gain evaporated and the baseline came
out slightly ahead (873 vs. 856). That gap between the tuning-sample score
and the held-out score *is* overfitting, caught in the act by having a
proper held-out set at all.

Two things are true at once, and worth separating: the tuned weights
actually reach the best-possible outcome (a "win", tile value 9) slightly
*more often* (100% vs. 97.5%), but score lower on average getting there —
so this local search found a marginally more *reliable* configuration but
not a strictly *better* one, and the difference either way is small next to
the run-to-run noise from only 10-40 games per estimate.

**Net conclusion: the hand-picked weights already hold up well.** I didn't
copy the "tuned" weights into `solver.js` — they didn't demonstrate a real
improvement on unseen games, and shipping them on the strength of the
tuning-sample number alone would have been exactly the mistake this
experiment was designed to catch. A bigger sample size per candidate, or a
smarter search than random-coordinate hill-climbing, might still find a
genuine improvement — `--games` and `--iterations` are both CLI flags if
you want to push further.

## Mapping back to the web app

Everything in `simulator.py` is a direct, function-for-function port:

| Python | JavaScript |
|---|---|
| `move()` | `moveGrid()` in `src/game/gridLogic.js` |
| `has_moves_left()` | `hasMovesLeft()` |
| `monotonicity()` / `smoothness()` / `corner_bonus()` / `evaluate()` | same names in `src/ai/solver.js` |
| `best_move()` | `getBestMove()` |
| `DEFAULT_WEIGHTS` | `WEIGHTS` in `solver.js` |

The one deliberate difference: `adaptive_depth()` here defaults to a lower
search depth (`--max-depth`, default 2) than the JS solver's cap of 4.
Pure Python is much slower per node than JS in a browser, and a full
self-play game needs hundreds of these searches back-to-back — this keeps
a full tuning run in the range of minutes instead of hours. Set
`--max-depth 4` to match the web app's search exactly, at the cost of a
much longer run.
