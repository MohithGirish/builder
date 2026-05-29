"""
match.py — FastAPI router for the AI matchmaking endpoints (/api/v1/match).

Exposes three POST endpoints: /score (single builder-investor pair score),
/rank/builders (rank multiple builders for an investor), and /rank/investors
(rank multiple investors for a builder), plus /batch-score for up to 50 pairs
in one request. All endpoints delegate to the matching engine service and
return validated Pydantic response models.
"""
import time
from fastapi import APIRouter, HTTPException

from ..schemas import (
    ScoreRequest,
    RankBuildersRequest,
    RankInvestorsRequest,
    BatchScoreRequest,
    MatchResult,
    RankResult,
    BatchScoreResult,
)
from ..services.engine import compute_score, rank_builders, rank_investors

router = APIRouter(prefix="/api/v1/match", tags=["Matchmaking"])


@router.post(
    "/score",
    response_model=MatchResult,
    summary="Score a builder–investor pair",
    description=(
        "Compute a compatibility score (0–100) with a per-dimension breakdown "
        "for a given builder–investor pair. Optionally provide a project for "
        "more precise scoring."
    ),
)
def score_pair(req: ScoreRequest) -> MatchResult:
    return compute_score(req.builder, req.investor, req.project)


@router.post(
    "/rank/builders",
    response_model=RankResult,
    summary="Rank builders for an investor",
    description="Return builders sorted by compatibility score for the given investor.",
)
def rank_builders_for_investor(req: RankBuildersRequest) -> RankResult:
    return rank_builders(req.investor, req.builders, req.project, req.limit)


@router.post(
    "/rank/investors",
    response_model=RankResult,
    summary="Rank investors for a builder",
    description="Return investors sorted by compatibility score for the given builder.",
)
def rank_investors_for_builder(req: RankInvestorsRequest) -> RankResult:
    return rank_investors(req.builder, req.investors, req.project, req.limit)


@router.post(
    "/batch-score",
    response_model=BatchScoreResult,
    summary="Batch score multiple builder–investor pairs",
    description="Score up to 50 pairs in a single request. Results maintain input order.",
)
def batch_score(req: BatchScoreRequest) -> BatchScoreResult:
    t0 = time.perf_counter()
    results = [
        compute_score(pair.builder, pair.investor, pair.project)
        for pair in req.pairs
    ]
    elapsed_ms = (time.perf_counter() - t0) * 1000
    return BatchScoreResult(
        results=results,
        processing_time_ms=round(elapsed_ms, 3),
    )
