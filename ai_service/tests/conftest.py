"""
Shared pytest fixtures for the Matchmaking Engine test suite.
"""
import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.schemas import (
    BuilderProfile,
    InvestorProfile,
    ProjectProfile,
    GeoLocation,
    InvestmentRange,
)


# ── Profile fixtures ───────────────────────────────────────────────────────────

@pytest.fixture
def mumbai_location() -> GeoLocation:
    return GeoLocation(city="Mumbai", state="Maharashtra", region="West")


@pytest.fixture
def bangalore_location() -> GeoLocation:
    return GeoLocation(city="Bangalore", state="Karnataka", region="South")


@pytest.fixture
def delhi_location() -> GeoLocation:
    return GeoLocation(city="Delhi", state="Delhi", region="North")


@pytest.fixture
def builder_residential(mumbai_location) -> BuilderProfile:
    return BuilderProfile(
        id="b1",
        name="Rajesh Kumar",
        company="Kumar Infrastructure",
        location=mumbai_location,
        sectors=["Luxury Residential", "Commercial", "Smart Cities"],
        avg_project_size_cr=250.0,
        expected_roi=20.0,
        risk_profile="medium",
        projects_completed=45,
        success_rate=0.96,
        verified=True,
    )


@pytest.fixture
def builder_infra(bangalore_location) -> BuilderProfile:
    return BuilderProfile(
        id="b2",
        name="Vikram Patel",
        company="Patel Infrastructure",
        location=bangalore_location,
        sectors=["Roads & Bridges", "Highways", "Infrastructure"],
        avg_project_size_cr=800.0,
        expected_roi=16.0,
        risk_profile="low",
        projects_completed=52,
        success_rate=0.98,
        verified=True,
    )


@pytest.fixture
def investor_real_estate(mumbai_location) -> InvestorProfile:
    return InvestorProfile(
        id="i1",
        name="Aditya Ventures",
        investor_type="VC",
        location=mumbai_location,
        preferred_sectors=["Real Estate", "PropTech", "Commercial"],
        preferred_locations=["Mumbai", "Pune", "Bangalore"],
        investment_range=InvestmentRange(min_cr=10, max_cr=100),
        min_roi_expectation=15.0,
        risk_appetite="medium",
        verified=True,
    )


@pytest.fixture
def investor_infrastructure(delhi_location) -> InvestorProfile:
    return InvestorProfile(
        id="i2",
        name="Global India Fund",
        investor_type="PE",
        location=delhi_location,
        preferred_sectors=["Infrastructure", "Smart Cities", "Commercial"],
        preferred_locations=["Delhi", "NCR", "Mumbai"],
        investment_range=InvestmentRange(min_cr=50, max_cr=500),
        min_roi_expectation=12.0,
        risk_appetite="low",
        verified=True,
    )


@pytest.fixture
def project_skyline(mumbai_location) -> ProjectProfile:
    return ProjectProfile(
        id="p1",
        title="Skyline Towers",
        builder_id="b1",
        sector="Luxury Residential",
        location=mumbai_location,
        funding_required_cr=250.0,
        expected_roi=20.0,
        risk_level="medium",
        timeline_months=24,
        progress_pct=70.0,
    )


@pytest.fixture
def project_metro() -> ProjectProfile:
    return ProjectProfile(
        id="p2",
        title="Metro Phase 2",
        builder_id="b2",
        sector="Infrastructure",
        location=GeoLocation(city="Navi Mumbai", state="Maharashtra", region="West"),
        funding_required_cr=1200.0,
        expected_roi=14.0,
        risk_level="low",
        timeline_months=36,
    )


# ── HTTP client fixture ────────────────────────────────────────────────────────

@pytest.fixture
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as c:
        yield c
