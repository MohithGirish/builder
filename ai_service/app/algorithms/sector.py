"""
sector.py — Sector alignment scoring algorithm (max 25 points).

For each of the investor's preferred sectors, finds the best similarity score
against all of the builder's sectors using a four-level taxonomy:
  1.00 — exact match (case-insensitive)
  0.90 — one name contains the other ("Residential" vs "Luxury Residential")
  0.75 — same parent category (both map to "Real Estate")
  0.45 — related categories ("Commercial" and "Real Estate")
  0.00 — no relationship
Averages those best scores and scales the result to max_score. Taxonomy covers
Real Estate, Infrastructure, Commercial, PropTech, and Green Buildings.
"""

MAX_SCORE = 25

# ── Sector taxonomy ────────────────────────────────────────────────────────────

# parent → direct subcategories
_PARENT_TO_CHILDREN: dict[str, list[str]] = {
    "real estate": [
        "luxury residential", "residential", "affordable housing",
        "gated communities", "mixed-use", "transit-oriented development",
        "urban renewal", "heritage properties",
    ],
    "infrastructure": [
        "roads & bridges", "highways", "metro", "railways",
        "smart cities", "urban planning", "government ppp",
        "strategic importance", "smart infrastructure",
    ],
    "commercial": [
        "office complexes", "retail spaces", "tech parks",
        "co-working spaces", "street buildings", "green buildings",
        "hospitality",
    ],
    "proptech": [
        "smart cities", "iot integration", "ai-driven platform",
        "scalable model",
    ],
    "green buildings": [
        "sustainable design", "eco-friendly residential", "leed buildings",
        "net zero", "renewable energy", "green buildings",
    ],
}

# bidirectional related-category pairs
_RELATED_PAIRS: list[tuple[str, str]] = [
    ("real estate", "commercial"),
    ("real estate", "green buildings"),
    ("real estate", "proptech"),
    ("infrastructure", "smart cities"),
    ("infrastructure", "proptech"),
    ("commercial", "proptech"),
    ("commercial", "green buildings"),
]


def _normalise(s: str) -> str:
    return s.strip().lower()


def _get_parent(sector: str) -> str | None:
    """Return the parent category name or None if not found."""
    norm = _normalise(sector)
    for parent, children in _PARENT_TO_CHILDREN.items():
        if norm == parent or norm in children:
            return parent
    return None


def _are_related(a: str, b: str) -> bool:
    pa = _get_parent(a)
    pb = _get_parent(b)
    if pa and pb and pa != pb:
        pair = tuple(sorted([pa, pb]))
        return any(tuple(sorted(p)) == pair for p in _RELATED_PAIRS)
    return False


def _sector_similarity(a: str, b: str) -> float:
    """Return [0, 1] similarity score between two sector strings."""
    na, nb = _normalise(a), _normalise(b)

    if na == nb:
        return 1.00

    # Substring containment ("Luxury Residential" ↔ "Residential")
    if na in nb or nb in na:
        return 0.90

    # Same parent category
    pa, pb = _get_parent(na), _get_parent(nb)
    if pa and pb and pa == pb:
        return 0.75

    # Related parent categories
    if pa and pb and _are_related(na, nb):
        return 0.45

    return 0.00


def score_sector_alignment(
    investor_sectors: list[str],
    builder_sectors: list[str],
    max_score: int = MAX_SCORE,
) -> float:
    """
    Score how well the builder's sector specialisations align with the
    investor's preferred sectors.

    Returns a float in [0, max_score].
    """
    if not investor_sectors or not builder_sectors:
        return 0.0

    total = 0.0
    for inv_s in investor_sectors:
        best = max(_sector_similarity(inv_s, bld_s) for bld_s in builder_sectors)
        total += best

    avg_similarity = total / len(investor_sectors)
    return round(avg_similarity * max_score, 2)
