"""
Hill-climbing search over the AI's four heuristic weights (empty-cell count,
monotonicity, smoothness, corner bonus) to check whether the hand-picked
values shipped in the web app's src/ai/solver.js can be beaten empirically,
rather than just asserted.

Method: start from the current weights, repeatedly perturb one weight at
random, re-evaluate over a fixed batch of self-play games, and keep the
change only if it improves the average score.

Two things matter here for the result to mean anything:

1. Common random numbers. Every candidate during search is evaluated on the
   exact same set of RNG seeds ("tuning seeds"), not a fresh random batch
   each time. Comparing candidates on different game instances would mean
   a "better" score might just mean an easier batch of random tile spawns —
   this makes it an apples-to-apples, paired comparison instead.
2. A held-out sample. The tuning seeds are also what the search is
   implicitly optimizing against, so a candidate that looks best on them
   can just be overfit to that particular batch. The final baseline-vs-tuned
   comparison runs on a separate, larger set of seeds never used during
   search — the train/test split idea, applied to game seeds instead of a
   dataset.

Usage:
    python tune_weights.py
    python tune_weights.py --games 10 --iterations 20 --final-games 40
"""

import argparse
import json
import random
import statistics
import time
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

import simulator as sim

RESULTS_DIR = Path(__file__).parent / "results"


def _play_one(job):
    weights, seed, max_depth = job
    return sim.play_game(weights, random.Random(seed), max_depth=max_depth)


def evaluate_weights(weights, seeds, max_depth, pool):
    jobs = [(weights, seed, max_depth) for seed in seeds]
    results = list(pool.map(_play_one, jobs))
    scores = [r["score"] for r in results]
    return {
        "avg_score": statistics.mean(scores),
        "median_score": statistics.median(scores),
        "win_rate": sum(r["outcome"] == "won" for r in results) / len(results),
        "avg_highest": statistics.mean(r["highest"] for r in results),
        "games": len(results),
    }


def perturb(weights, rng):
    key = rng.choice(list(weights))
    new_weights = dict(weights)
    new_weights[key] = max(0.0, round(new_weights[key] * rng.uniform(0.7, 1.3), 4))
    return new_weights


def run(args):
    rng = random.Random(args.seed)
    RESULTS_DIR.mkdir(exist_ok=True)

    # Disjoint seed pools: `tuning_seeds` is what the search optimizes
    # against, `holdout_seeds` is only ever used once, at the very end.
    all_seeds = rng.sample(range(10**9), args.games + args.final_games)
    tuning_seeds, holdout_seeds = all_seeds[: args.games], all_seeds[args.games :]

    with ProcessPoolExecutor(max_workers=args.workers) as pool:
        best = dict(sim.DEFAULT_WEIGHTS)
        best_fit = evaluate_weights(best, tuning_seeds, args.max_depth, pool)
        print(f"[baseline] {best}")
        print(f"           avg_score={best_fit['avg_score']:.0f}  win_rate={best_fit['win_rate']:.0%}  "
              f"(tuning sample, n={best_fit['games']})\n")

        history = [best_fit["avg_score"]]

        for i in range(args.iterations):
            candidate = perturb(best, rng)
            fit = evaluate_weights(candidate, tuning_seeds, args.max_depth, pool)
            improved = fit["avg_score"] > best_fit["avg_score"]
            if improved:
                best, best_fit = candidate, fit
            print(f"[{i + 1:02d}/{args.iterations}] {'kept' if improved else '    '} "
                  f"avg_score={fit['avg_score']:.0f}  {candidate}")
            history.append(best_fit["avg_score"])

        print(f"\nHeld-out check (n={len(holdout_seeds)}, seeds never seen during search)...")
        baseline_final = evaluate_weights(sim.DEFAULT_WEIGHTS, holdout_seeds, args.max_depth, pool)
        tuned_final = evaluate_weights(best, holdout_seeds, args.max_depth, pool)

    summary = {
        "baseline_weights": sim.DEFAULT_WEIGHTS,
        "baseline_result": baseline_final,
        "tuned_weights": best,
        "tuned_result": tuned_final,
        "tuning_sample_result": best_fit,
        "history": history,
        "config": vars(args),
    }
    (RESULTS_DIR / "summary.json").write_text(json.dumps(summary, indent=2))

    delta = tuned_final["avg_score"] - baseline_final["avg_score"]
    verdict = "tuned weights generalized" if delta > 0 else "baseline held up better — tuning overfit the search sample"
    print(f"\nBaseline (held-out): avg_score={baseline_final['avg_score']:.0f}  win_rate={baseline_final['win_rate']:.0%}")
    print(f"Tuned    (held-out): avg_score={tuned_final['avg_score']:.0f}  win_rate={tuned_final['win_rate']:.0%}")
    print(f"Verdict: {verdict} ({delta:+.0f} avg score)")
    print(f"Tuned weights: {best}")

    _plot(history, baseline_final, tuned_final)
    return summary


def _plot(history, baseline_final, tuned_final):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    fig, axes = plt.subplots(1, 2, figsize=(10, 4))

    axes[0].plot(history, marker="o", color="#3c7f6c")
    axes[0].set_title("Best avg. score on tuning sample")
    axes[0].set_xlabel("Hill-climbing step")
    axes[0].set_ylabel("Avg. score")

    labels = ["Baseline\n(hand-picked)", "Tuned\n(hill-climbed)"]
    values = [baseline_final["avg_score"], tuned_final["avg_score"]]
    axes[1].bar(labels, values, color=["#8a8a8a", "#3c7f6c"])
    axes[1].set_title("Held-out comparison (unseen seeds)")
    axes[1].set_ylabel("Avg. score")

    fig.tight_layout()
    out = RESULTS_DIR / "tuning_results.png"
    fig.savefig(out, dpi=150)
    print(f"\nSaved plot to {out}")


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--games", type=int, default=10, help="tuning-sample games, shared across every candidate (default: 10)")
    parser.add_argument("--iterations", type=int, default=20, help="hill-climbing steps (default: 20)")
    parser.add_argument("--max-depth", type=int, default=2, help="expectimax depth cap; solver.js itself caps at 4, "
                                                                   "but pure Python is much slower per node, so this "
                                                                   "defaults lower to keep a full run fast (default: 2)")
    parser.add_argument("--final-games", type=int, default=40, help="held-out games for the final comparison (default: 40)")
    parser.add_argument("--seed", type=int, default=0)
    parser.add_argument("--workers", type=int, default=None, help="defaults to os.cpu_count()")
    args = parser.parse_args()

    t0 = time.time()
    run(args)
    print(f"\nTotal time: {time.time() - t0:.0f}s")


if __name__ == "__main__":
    main()
