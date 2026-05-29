"""
roi.py — ROI compatibility scoring algorithm (max 20 points).

Compares the project's expected ROI percentage against the investor's minimum
ROI requirement. Awards full score when expected ROI exceeds the target with
a 30% headroom, 75% score for exactly meeting the target, proportional partial
credit for ROI between 80% and 100% of the target, and 0 for ROI below 80%
of the minimum requirement. A small outperformance bonus is capped at max_score.
"""

MAX_SCORE = 20
_HEADROOM_PCT = 0.30   # 30% above min = full score
_FLOOR_RATIO  = 0.80   # below 80% of min = 0 points


def score_roi_compatibility(
    expected_roi: float,
    min_roi_required: float,
    max_score: int = MAX_SCORE,
) -> float:
    """
    Score ROI alignment between expected project ROI and investor's requirement.

    Args:
        expected_roi:    Expected annual ROI percentage (e.g. 18.5).
        min_roi_required: Investor's minimum acceptable ROI (e.g. 15.0).
        max_score:       Maximum possible score for this dimension.

    Returns a float in [0, max_score].
    """
    # Graceful handling of zero/missing data
    if min_roi_required <= 0:
        # No requirement — give a neutral mid-score
        return round(max_score * 0.60, 2)
    if expected_roi <= 0:
        return 0.0

    ratio = expected_roi / min_roi_required  # 1.0 = exactly meets requirement

    # ── Below floor → 0 ────────────────────────────────────────────────────────
    if ratio <= _FLOOR_RATIO:
        return 0.0

    # ── Partial credit between floor and requirement ───────────────────────────
    if ratio < 1.0:
        # Linear scale from 0 (at floor) to 75% of max_score (at exactly min)
        partial = (ratio - _FLOOR_RATIO) / (1.0 - _FLOOR_RATIO)
        return round(max_score * 0.75 * partial, 2)

    # ── Meets requirement (ratio >= 1.0) ───────────────────────────────────────
    base = max_score * 0.75  # 15 pts for exactly meeting requirement

    # Outperformance bonus: +25% of max for each _HEADROOM_PCT above min
    outperform = min((ratio - 1.0) / _HEADROOM_PCT, 1.0)  # cap at 1× headroom
    bonus = max_score * 0.25 * outperform

    return round(min(float(max_score), base + bonus), 2)
