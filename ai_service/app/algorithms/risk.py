"""
risk.py — Risk tolerance compatibility scoring algorithm (max 10 points).

Maps investor risk appetite and project risk level to numeric values (0-4:
very_low to very_high), then performs a lookup in a 5x5 compatibility matrix
to produce a raw score out of 10, scaled to max_score. Full score is awarded
when risk levels match exactly; score decreases the further apart the levels
are. Conservative investors are penalised heavily for high-risk projects.
"""

MAX_SCORE = 10

# ── Risk level encoding ────────────────────────────────────────────────────────

_RISK_MAP: dict[str, int] = {
    "very_low": 0,
    "very low":  0,
    "low":       1,
    "medium":    2,
    "moderate":  2,
    "high":      3,
    "very_high": 4,
    "very high": 4,
}

# Lookup table: (investor_level, project_level) → raw score out of 10
_MATRIX: dict[tuple[int, int], int] = {
    # investor \ project
    #          vl    lo    me    hi    vh
    (0, 0): 10, (0, 1): 8,  (0, 2): 3,  (0, 3): 0,  (0, 4): 0,
    (1, 0): 9,  (1, 1): 10, (1, 2): 6,  (1, 3): 2,  (1, 4): 0,
    (2, 0): 7,  (2, 1): 9,  (2, 2): 10, (2, 3): 7,  (2, 4): 3,
    (3, 0): 4,  (3, 1): 7,  (3, 2): 9,  (3, 3): 10, (3, 4): 8,
    (4, 0): 2,  (4, 1): 5,  (4, 2): 8,  (4, 3): 9,  (4, 4): 10,
}


def _encode(level: str) -> int:
    """Map a risk string to its numeric level; defaults to 2 (medium)."""
    return _RISK_MAP.get(level.strip().lower(), 2)


def score_risk_tolerance(
    investor_risk: str,
    project_risk: str,
    max_score: int = MAX_SCORE,
) -> float:
    """
    Score the compatibility between investor risk appetite and project risk level.

    Args:
        investor_risk: Investor's risk appetite string.
        project_risk:  Project/builder's risk profile string.
        max_score:     Maximum possible score for this dimension.

    Returns a float in [0, max_score].
    """
    i_level = _encode(investor_risk)
    p_level = _encode(project_risk)

    raw = _MATRIX.get((i_level, p_level), 5)  # fallback to neutral 5/10
    return round((raw / 10.0) * max_score, 2)
