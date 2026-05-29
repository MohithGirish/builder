"""
investment.py — Investment fit scoring algorithm (max 25 points).

Compares a project's required funding amount against the investor's investment
range [min_cr, max_cr]. Awards full score for funding within range (with a
sweet-spot bonus near the mid-point), applies linear penalties for funding
slightly below the minimum or above the maximum, and returns 0 for completely
misaligned ticket sizes (< 20% of min or > 2x max).

Compares the project's funding requirement (or builder's avg project size)
against the investor's investment range [min_cr, max_cr].

Scoring bands:
  25.0  — funding is within the investor's range
  Linear penalty — the further outside the range, the lower the score
  0     — funding is > 2× the max, or < 20% of the min (completely misaligned)

Sweet-spot bonus: funding near the mid-point of the range scores slightly
higher than funding at the edges of the range.
"""

MAX_SCORE = 25


def score_investment_fit(
    funding_required_cr: float,
    inv_min_cr: float,
    inv_max_cr: float,
    max_score: int = MAX_SCORE,
) -> float:
    """
    Score how well the required funding matches the investor's ticket size.

    Returns a float in [0, max_score].

    Edge cases:
      - If funding_required_cr <= 0: return 0
      - If inv_max_cr <= 0: return 0
      - If inv_min_cr == inv_max_cr: treat as exact point match
    """
    if funding_required_cr <= 0 or inv_max_cr <= 0:
        return 0.0

    # Clamp min to 0 in case of bad data
    inv_min_cr = max(0.0, inv_min_cr)

    # ── Case 1: Funding is within range ────────────────────────────────────────
    if inv_min_cr <= funding_required_cr <= inv_max_cr:
        range_size = inv_max_cr - inv_min_cr
        if range_size == 0:
            return float(max_score)

        # Sweet-spot: mid-point of the range gets full score; edges get 85%
        mid = (inv_min_cr + inv_max_cr) / 2.0
        normalised_dist = abs(funding_required_cr - mid) / (range_size / 2.0)
        score = max_score * (1.0 - 0.15 * normalised_dist)
        return round(score, 2)

    # ── Case 2: Funding is BELOW the minimum ───────────────────────────────────
    if funding_required_cr < inv_min_cr:
        # Too small a deal for the investor; penalty proportional to shortfall
        shortfall_ratio = (inv_min_cr - funding_required_cr) / inv_min_cr
        if shortfall_ratio >= 0.80:  # less than 20% of minimum → unfit
            return 0.0
        score = max_score * (1.0 - shortfall_ratio * 1.25)
        return round(max(0.0, score), 2)

    # ── Case 3: Funding is ABOVE the maximum ───────────────────────────────────
    excess_ratio = (funding_required_cr - inv_max_cr) / inv_max_cr
    if excess_ratio >= 1.0:  # more than 2× max → completely out of range
        return 0.0
    score = max_score * (1.0 - excess_ratio * 1.5)
    return round(max(0.0, score), 2)
