"""
match.py — FastAPI router for the AI matchmaking endpoints (/api/v1/match).

Exposes three POST endpoints: /score (single builder-investor pair score),
/rank/builders (rank multiple builders for an investor), and /rank/investors
(rank multiple investors for a builder), plus /batch-score for up to 50 pairs
in one request. All endpoints delegate to the matching engine service and
return validated Pydantic response models.
"""
import hmac
import time
from fastapi import APIRouter, Depends, Header, HTTPException

from ..config import get_settings
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


def require_internal_key(x_internal_api_key: str = Header(default="")) -> None:
    """Enforce the shared internal API key when one is configured.

    If INTERNAL_API_KEY is set and non-empty, every request must send a matching
    X-Internal-Api-Key header (constant-time compared). If it is unset/empty we
    skip enforcement so local dev and the test suite work without a key.
    """
    expected = get_settings().internal_api_key
    if expected and not hmac.compare_digest(x_internal_api_key, expected):
        raise HTTPException(status_code=401, detail="Invalid or missing internal API key.")


router = APIRouter(
    prefix="/api/v1/match",
    tags=["Matchmaking"],
    dependencies=[Depends(require_internal_key)],
)


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
