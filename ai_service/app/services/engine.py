"""
engine.py — Core matching engine that orchestrates the five scoring algorithms.

Provides three public functions: compute_score (calculates a full MatchResult
for a builder-investor pair using sector, location, investment fit, ROI, and
risk dimensions totalling 100 points), rank_builders (scores and sorts a list
of builders for an investor), and rank_investors (scores and sorts a list of
investors for a builder). Project context overrides builder profile defaults
when provided. Also generates human-readable strength/gap narratives and a
recommendation string.
"""
from __future__ import annotations

import time
from typing import Optional

from ..schemas import (
    BuilderProfile,
    InvestorProfile,
    ProjectProfile,
    ScoreBreakdown,
    MatchResult,
    RankedMatch,
    RankResult,
)
from ..algorithms import (
    score_sector_alignment,
    score_location_overlap,
    score_investment_fit,
    score_roi_compatibility,
    score_risk_tolerance,
)

# ── Dimension max-scores ───────────────────────────────────────────────────────
_SECTOR_MAX     = 25
_LOCATION_MAX   = 20
_INVESTMENT_MAX = 25
_ROI_MAX        = 20
_RISK_MAX       = 10


# ── Label thresholds ───────────────────────────────────────────────────────────
def _match_label(score: int) -> str:
    if score >= 85: return "Excellent Match"
    if score >= 70: return "Strong Match"
    if score >= 55: return "Good Match"
    if score >= 40: return "Fair Match"
    return "Poor Match"


# ── Narrative helpers ──────────────────────────────────────────────────────────

def _sector_narrative(raw: float, pct: float) -> tuple[str | None, str | None]:
    """Return (strength, gap) string or None for the sector dimension."""
    if pct >= 0.80:
        return "Strong sector alignment", None
    if pct >= 0.50:
        return "Moderate sector overlap", None
    if pct >= 0.25:
        return None, "Partial sector mismatch"
    return None, "Sector mismatch — limited common ground"


def _location_narrative(raw: float, pct: float) -> tuple[str | None, str | None]:
    if pct >= 0.90:
        return "Exact geographic match", None
    if pct >= 0.65:
        return "Same state / adjacent market", None
    if pct >= 0.40:
        return "Same broad region", None
    if pct > 0:
        return None, "Different geographic regions"
    return None, "No geographic overlap"


def _investment_narrative(raw: float, pct: float) -> tuple[str | None, str | None]:
    if pct >= 0.90:
        return "Deal size is an ideal fit", None
    if pct >= 0.70:
        return "Deal size within investor range", None
    if pct >= 0.40:
        return None, "Deal size slightly outside investor range"
    return None, "Deal size significantly misaligned"


def _roi_narrative(raw: float, pct: float) -> tuple[str | None, str | None]:
    if pct >= 0.90:
        return "ROI exceeds investor target", None
    if pct >= 0.70:
        return "ROI meets investor expectation", None
    if pct >= 0.40:
        return None, "ROI slightly below investor target"
    return None, "ROI significantly below investor target"


def _risk_narrative(raw: float, pct: float) -> tuple[str | None, str | None]:
    if pct >= 0.90:
        return "Risk profiles are well matched", None
    if pct >= 0.60:
        return None, "Minor risk appetite mismatch"
    return None, "Significant risk tolerance mismatch"


def _build_narrative(breakdown: ScoreBreakdown) -> tuple[list[str], list[str], str]:
    """Produce strengths, gaps, and a recommendation sentence."""
    strengths: list[str] = []
    gaps: list[str]      = []

    checks = [
        (_sector_narrative,     breakdown.sector,         _SECTOR_MAX),
        (_location_narrative,   breakdown.location,       _LOCATION_MAX),
        (_investment_narrative, breakdown.investment_fit,  _INVESTMENT_MAX),
        (_roi_narrative,        breakdown.roi,             _ROI_MAX),
        (_risk_narrative,       breakdown.risk,            _RISK_MAX),
    ]
    for fn, raw, mx in checks:
        pct = raw / mx if mx > 0 else 0.0
        s, g = fn(raw, pct)
        if s: strengths.append(s)
        if g: gaps.append(g)

    total = breakdown.sector + breakdown.location + breakdown.investment_fit + breakdown.roi + breakdown.risk

    if total >= 85:
        rec = "Highly recommended — strong alignment across all key dimensions."
    elif total >= 70:
        rec = "Recommended — solid match with minor areas to discuss."
    elif total >= 55:
        rec = "Potential match — further due diligence advised on highlighted gaps."
    elif total >= 40:
        rec = "Marginal fit — significant gaps may require negotiation or restructuring."
    else:
        rec = "Low compatibility — consider other candidates with better alignment."

    return strengths, gaps, rec


# ── Core scoring function ─────────────────────────────────────────────────────

def compute_score(
    builder: BuilderProfile,
    investor: InvestorProfile,
    project: Optional[ProjectProfile] = None,
) -> MatchResult:
    """
    Compute a full compatibility score for a builder–investor pair.

    If a project is provided, its sector, location, funding, ROI, and risk
    take precedence over the builder's profile defaults.
    """
    # ── Resolve effective values ────────────────────────────────────────────────
    # Sector: project.sector overrides builder.sectors when present
    if project:
        effective_sectors = [project.sector]
    else:
        effective_sectors = builder.sectors

    # Location: project location overrides builder location when present
    if project:
        eff_city  = project.location.city
        eff_state = project.location.state
    else:
        eff_city  = builder.location.city
        eff_state = builder.location.state

    # Funding: project.funding_required_cr or builder's avg project size
    if project:
        funding_cr = project.funding_required_cr
    elif builder.avg_project_size_cr:
        funding_cr = builder.avg_project_size_cr
    else:
        funding_cr = (investor.investment_range.min_cr + investor.investment_range.max_cr) / 2

    # ROI and risk: project overrides builder defaults
    expected_roi = project.expected_roi if project else builder.expected_roi
    risk_level   = project.risk_level   if project else builder.risk_profile

    # ── Compute each dimension ──────────────────────────────────────────────────
    sector_score = score_sector_alignment(
        investor.preferred_sectors,
        effective_sectors,
        _SECTOR_MAX,
    )

    location_score = score_location_overlap(
        builder_city=eff_city,
        builder_state=eff_state,
        investor_preferred_locations=investor.preferred_locations,
        investor_location_city=investor.location.city,
        investor_location_state=investor.location.state,
        max_score=_LOCATION_MAX,
    )

    investment_score = score_investment_fit(
        funding_required_cr=funding_cr,
        inv_min_cr=investor.investment_range.min_cr,
        inv_max_cr=investor.investment_range.max_cr,
        max_score=_INVESTMENT_MAX,
    )

    roi_score = score_roi_compatibility(
        expected_roi=expected_roi,
        min_roi_required=investor.min_roi_expectation,
        max_score=_ROI_MAX,
    )

    risk_score = score_risk_tolerance(
        investor_risk=investor.risk_appetite,
        project_risk=risk_level,
        max_score=_RISK_MAX,
    )

    # ── Aggregate ───────────────────────────────────────────────────────────────
    breakdown = ScoreBreakdown(
        sector=sector_score,
        location=location_score,
        investment_fit=investment_score,
        roi=roi_score,
        risk=risk_score,
    )

    raw_total = sector_score + location_score + investment_score + roi_score + risk_score
    compatibility_score = min(100, round(raw_total))

    label = _match_label(compatibility_score)
    strengths, gaps, recommendation = _build_narrative(breakdown)

    return MatchResult(
        compatibility_score=compatibility_score,
        breakdown=breakdown,
        match_label=label,
        strengths=strengths,
        gaps=gaps,
        recommendation=recommendation,
    )


# ── Ranking functions ──────────────────────────────────────────────────────────

def rank_builders(
    investor: InvestorProfile,
    builders: list[BuilderProfile],
    project: Optional[ProjectProfile] = None,
    limit: int = 10,
) -> RankResult:
    """Rank builders for an investor and return sorted results."""
    t0 = time.perf_counter()

    scored: list[tuple[BuilderProfile, MatchResult]] = []
    for builder in builders:
        result = compute_score(builder, investor, project)
        scored.append((builder, result))

    scored.sort(key=lambda x: x[1].compatibility_score, reverse=True)
    top = scored[:limit]

    ranked = [
        RankedMatch(
            rank=i + 1,
            candidate_id=b.id,
            candidate_name=f"{b.name} — {b.company}",
            compatibility_score=r.compatibility_score,
            breakdown=r.breakdown,
            match_label=r.match_label,
        )
        for i, (b, r) in enumerate(top)
    ]

    elapsed_ms = (time.perf_counter() - t0) * 1000

    return RankResult(
        ranked_matches=ranked,
        total_candidates=len(builders),
        returned=len(ranked),
        processing_time_ms=round(elapsed_ms, 3),
    )


def rank_investors(
    builder: BuilderProfile,
    investors: list[InvestorProfile],
    project: Optional[ProjectProfile] = None,
    limit: int = 10,
) -> RankResult:
    """Rank investors for a builder and return sorted results."""
    t0 = time.perf_counter()

    scored: list[tuple[InvestorProfile, MatchResult]] = []
    for investor in investors:
        result = compute_score(builder, investor, project)
        scored.append((investor, result))

    scored.sort(key=lambda x: x[1].compatibility_score, reverse=True)
    top = scored[:limit]

    ranked = [
        RankedMatch(
            rank=i + 1,
            candidate_id=inv.id,
            candidate_name=f"{inv.name}",
            compatibility_score=r.compatibility_score,
            breakdown=r.breakdown,
            match_label=r.match_label,
        )
        for i, (inv, r) in enumerate(top)
    ]

    elapsed_ms = (time.perf_counter() - t0) * 1000

    return RankResult(
        ranked_matches=ranked,
        total_candidates=len(investors),
        returned=len(ranked),
        processing_time_ms=round(elapsed_ms, 3),
    )
