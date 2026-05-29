"""
schemas.py — Pydantic v2 request and response schemas for the AI Matchmaking Engine.

Defines sub-models (GeoLocation, InvestmentRange), input profiles
(BuilderProfile, InvestorProfile, ProjectProfile), request models
(ScoreRequest, RankBuildersRequest, RankInvestorsRequest, BatchScoreRequest),
and response models (ScoreBreakdown, MatchResult, RankedMatch, RankResult,
BatchScoreResult). All monetary values are in Indian Crores; ROI values are
percentages.
"""
from __future__ import annotations

from pydantic import BaseModel, Field, field_validator
from typing import Optional


# ── Sub-models ────────────────────────────────────────────────────────────────

class GeoLocation(BaseModel):
    city: str
    state: Optional[str] = None
    region: Optional[str] = None  # "North" | "South" | "East" | "West" | "Central"

    @field_validator("city", "state", "region", mode="before")
    @classmethod
    def strip_whitespace(cls, v):
        return v.strip() if isinstance(v, str) else v


class InvestmentRange(BaseModel):
    min_cr: float = Field(ge=0, description="Minimum investment in Crores")
    max_cr: float = Field(ge=0, description="Maximum investment in Crores")

    @field_validator("max_cr")
    @classmethod
    def max_gte_min(cls, v, info):
        if "min_cr" in info.data and v < info.data["min_cr"]:
            raise ValueError("max_cr must be >= min_cr")
        return v


# ── Profile models ─────────────────────────────────────────────────────────────

class BuilderProfile(BaseModel):
    """Input profile for a builder / developer."""
    id: str
    name: str
    company: str
    location: GeoLocation
    sectors: list[str] = Field(min_length=1)
    avg_project_size_cr: Optional[float] = Field(None, ge=0)
    expected_roi: float = Field(default=18.0, ge=0, le=200, description="Expected ROI %")
    risk_profile: str = Field(default="medium")   # low | medium | high
    projects_completed: int = Field(default=0, ge=0)
    success_rate: float = Field(default=1.0, ge=0, le=1)
    verified: bool = False


class InvestorProfile(BaseModel):
    """Input profile for an investor."""
    id: str
    name: str
    investor_type: str = Field(default="VC")   # VC | PE | Angel | REIT | Institutional
    location: GeoLocation
    preferred_sectors: list[str] = Field(min_length=1)
    preferred_locations: list[str] = Field(default_factory=list)
    investment_range: InvestmentRange
    min_roi_expectation: float = Field(default=15.0, ge=0, le=200)
    risk_appetite: str = Field(default="medium")  # low | medium | high
    verified: bool = False


class ProjectProfile(BaseModel):
    """Optional project context that enriches the match score."""
    id: str
    title: str
    builder_id: Optional[str] = None
    sector: str
    location: GeoLocation
    funding_required_cr: float = Field(ge=0)
    expected_roi: float = Field(default=18.0, ge=0)
    risk_level: str = Field(default="medium")
    timeline_months: int = Field(default=24, ge=1)
    progress_pct: float = Field(default=0.0, ge=0, le=100)


# ── Request models ─────────────────────────────────────────────────────────────

class ScoreRequest(BaseModel):
    """Score a single builder–investor pair (optionally with project context)."""
    builder: BuilderProfile
    investor: InvestorProfile
    project: Optional[ProjectProfile] = None


class RankBuildersRequest(BaseModel):
    """Rank multiple builders for a given investor (+ optional project)."""
    investor: InvestorProfile
    builders: list[BuilderProfile] = Field(min_length=1)
    project: Optional[ProjectProfile] = None
    limit: int = Field(default=10, ge=1, le=100)


class RankInvestorsRequest(BaseModel):
    """Rank multiple investors for a given builder (+ optional project)."""
    builder: BuilderProfile
    investors: list[InvestorProfile] = Field(min_length=1)
    project: Optional[ProjectProfile] = None
    limit: int = Field(default=10, ge=1, le=100)


class BatchScoreRequest(BaseModel):
    """Score multiple builder–investor pairs in one request."""
    pairs: list[ScoreRequest] = Field(min_length=1, max_length=50)


# ── Response models ────────────────────────────────────────────────────────────

class ScoreBreakdown(BaseModel):
    """Per-dimension scores (each is out of its configured max)."""
    sector: float = Field(description="Sector alignment score (max 25)")
    location: float = Field(description="Geographic overlap score (max 20)")
    investment_fit: float = Field(description="Investment size fit score (max 25)")
    roi: float = Field(description="ROI compatibility score (max 20)")
    risk: float = Field(description="Risk tolerance score (max 10)")

    @property
    def total(self) -> float:
        return self.sector + self.location + self.investment_fit + self.roi + self.risk


class MatchResult(BaseModel):
    """Full scoring result for a single builder–investor pair."""
    compatibility_score: int = Field(ge=0, le=100)
    breakdown: ScoreBreakdown
    match_label: str       # Excellent | Strong | Good | Fair | Poor
    strengths: list[str]
    gaps: list[str]
    recommendation: str


class RankedMatch(BaseModel):
    rank: int
    candidate_id: str
    candidate_name: str
    compatibility_score: int
    breakdown: ScoreBreakdown
    match_label: str


class RankResult(BaseModel):
    ranked_matches: list[RankedMatch]
    total_candidates: int
    returned: int
    processing_time_ms: float


class BatchScoreResult(BaseModel):
    results: list[MatchResult]
    processing_time_ms: float
