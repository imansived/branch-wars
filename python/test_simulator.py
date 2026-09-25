"""
Parity checks against src/game/gridLogic.test.js — same scenarios, same
expected outcomes, to build confidence this Python port actually behaves
like the JS it's standing in for (rather than just looking similar).

Run with: python -m unittest -v
"""

import random
import unittest

import simulator as sim


class MoveTests(unittest.TestCase):
    def test_slides_without_merging_mismatched_values(self):
        grid = [[0, 1, 0, 2], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
        new_grid, moved, score, merged = sim.move(grid, "left")
        self.assertTrue(moved)
        self.assertEqual(score, 0)
        self.assertEqual(new_grid[0], [1, 2, 0, 0])

    def test_merges_equal_tiles_and_scores_it(self):
        grid = [[1, 1, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
        new_grid, moved, score, merged = sim.move(grid, "left")
        self.assertTrue(moved)
        self.assertEqual(new_grid[0], [2, 0, 0, 0])
        self.assertEqual(score, 2)
        self.assertEqual(merged, [2])

    def test_only_merges_once_per_move(self):
        grid = [[1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
        new_grid, *_ = sim.move(grid, "left")
        self.assertEqual(new_grid[0], [2, 2, 0, 0])

    def test_reports_not_moved_when_nothing_changes(self):
        grid = [[1, 2, 3, 4], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
        _, moved, _, _ = sim.move(grid, "left")
        self.assertFalse(moved)

    def test_vertical_move_matches_horizontal_behaviour(self):
        grid = [[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 0, 0, 0]]
        new_grid, moved, score, _ = sim.move(grid, "up")
        self.assertEqual([row[0] for row in new_grid], [2, 0, 0, 0])
        self.assertEqual(score, 2)


class HasMovesLeftTests(unittest.TestCase):
    def test_true_on_empty_board(self):
        self.assertTrue(sim.has_moves_left(sim.empty_grid()))

    def test_true_when_full_but_an_adjacent_pair_exists(self):
        grid = [[1, 2, 1, 2], [2, 1, 2, 1], [1, 2, 1, 1], [2, 1, 2, 1]]
        self.assertTrue(sim.has_moves_left(grid))

    def test_false_when_full_with_no_adjacent_equal_values(self):
        grid = [[1, 2, 1, 2], [2, 1, 2, 1], [1, 2, 1, 2], [2, 1, 2, 1]]
        self.assertFalse(sim.has_moves_left(grid))


class HeuristicTests(unittest.TestCase):
    def test_emptier_board_scores_higher_all_else_equal(self):
        sparse = [[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
        packed = [[1, 3, 2, 4], [4, 2, 3, 1], [1, 3, 2, 4], [4, 2, 3, 1]]
        self.assertGreater(sim.evaluate(sparse, sim.DEFAULT_WEIGHTS), sim.evaluate(packed, sim.DEFAULT_WEIGHTS))

    def test_rewards_highest_tile_in_a_corner(self):
        cornered = [[4, 1, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
        centered = [[0, 0, 0, 0], [0, 4, 1, 0], [0, 1, 0, 0], [0, 0, 0, 0]]
        self.assertGreater(sim.evaluate(cornered, sim.DEFAULT_WEIGHTS), sim.evaluate(centered, sim.DEFAULT_WEIGHTS))


class BestMoveTests(unittest.TestCase):
    def test_only_returns_a_direction_that_actually_moves(self):
        grid = [[1, 2, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
        d = sim.best_move(grid, sim.DEFAULT_WEIGHTS, max_depth=2)
        self.assertIn(d, sim.DIRECTIONS)
        self.assertTrue(sim.move(grid, d)[1])

    def test_returns_none_on_a_fully_locked_board(self):
        grid = [[1, 2, 1, 2], [2, 1, 2, 1], [1, 2, 1, 2], [2, 1, 2, 1]]
        self.assertIsNone(sim.best_move(grid, sim.DEFAULT_WEIGHTS, max_depth=2))


class PlayGameTests(unittest.TestCase):
    def test_a_full_game_runs_to_completion_and_returns_sane_stats(self):
        result = sim.play_game(sim.DEFAULT_WEIGHTS, random.Random(42), max_depth=2)
        self.assertIn(result["outcome"], ("won", "over", "timeout"))
        self.assertGreaterEqual(result["score"], 0)
        self.assertGreaterEqual(result["highest"], 1)


if __name__ == "__main__":
    unittest.main()
