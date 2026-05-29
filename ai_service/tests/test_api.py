"""
Integration tests for the FastAPI endpoints.
Uses httpx.AsyncClient with ASGITransport (no live server needed).
"""
import pytest

pytestmark = pytest.mark.asyncio


# ── /health ───────────────────────────────────────────────────────────────────

async def test_health_check(client):
    resp = await client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert "scoring_dimensions" in data
    assert set(data["scoring_dimensions"].keys()) == {
        "sector", "location", "investment_fit", "roi", "risk"
    }


# ── /api/v1/match/score ───────────────────────────────────────────────────────

async def test_score_returns_200_with_complete_result(
    client, builder_residential, investor_real_estate
):
    payload = {
        "builder":  builder_residential.model_dump(),
        "investor": investor_real_estate.model_dump(),
    }
    resp = await client.post("/api/v1/match/score", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    assert "compatibility_score" in data
    assert 0 <= data["compatibility_score"] <= 100
    assert "breakdown" in data
    bd = data["breakdown"]
    assert {"sector", "location", "investment_fit", "roi", "risk"} == set(bd.keys())
    assert "match_label" in data
    assert "strengths" in data
    assert "gaps" in data
    assert "recommendation" in data


async def test_score_high_for_perfect_match(
    client, builder_residential, investor_real_estate
):
    """Builder and investor in same city, same sectors, matching risk → high score."""
    payload = {
        "builder":  builder_residential.model_dump(),
        "investor": investor_real_estate.model_dump(),
    }
    resp = await client.post("/api/v1/match/score", json=payload)
    data = resp.json()
    assert data["compatibility_score"] >= 65


async def test_score_with_project_context(
    client, builder_residential, investor_real_estate, project_skyline
):
    payload = {
        "builder":  builder_residential.model_dump(),
        "investor": investor_real_estate.model_dump(),
        "project":  project_skyline.model_dump(),
    }
    resp = await client.post("/api/v1/match/score", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["compatibility_score"] >= 60


async def test_score_low_for_mismatched_pair(
    client, builder_infra, investor_real_estate
):
    """Infrastructure builder vs real-estate-focused investor."""
    payload = {
        "builder":  builder_infra.model_dump(),
        "investor": investor_real_estate.model_dump(),
    }
    resp = await client.post("/api/v1/match/score", json=payload)
    data = resp.json()
    # Location mismatch (Bangalore vs Mumbai pref), different sectors, funding mismatch
    assert data["compatibility_score"] <= 75


async def test_score_breakdown_sums_to_total(
    client, builder_residential, investor_real_estate
):
    payload = {
        "builder":  builder_residential.model_dump(),
        "investor": investor_real_estate.model_dump(),
    }
    resp = await client.post("/api/v1/match/score", json=payload)
    data = resp.json()
    bd = data["breakdown"]
    total = sum(bd.values())
    # compatibility_score is round(sum), so allow ±1
    assert abs(total - data["compatibility_score"]) <= 1


async def test_score_validation_error_on_missing_field(client):
    resp = await client.post("/api/v1/match/score", json={"builder": {}})
    assert resp.status_code == 422


# ── /api/v1/match/rank/builders ───────────────────────────────────────────────

async def test_rank_builders_returns_sorted_list(
    client, builder_residential, builder_infra, investor_real_estate
):
    payload = {
        "investor": investor_real_estate.model_dump(),
        "builders": [builder_infra.model_dump(), builder_residential.model_dump()],
    }
    resp = await client.post("/api/v1/match/rank/builders", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    assert "ranked_matches" in data
    assert data["total_candidates"] == 2
    ranked = data["ranked_matches"]
    assert len(ranked) == 2

    # Must be sorted descending by score
    scores = [r["compatibility_score"] for r in ranked]
    assert scores == sorted(scores, reverse=True)

    # Ranks should be 1-indexed in order
    assert ranked[0]["rank"] == 1
    assert ranked[1]["rank"] == 2


async def test_rank_builders_respects_limit(
    client, builder_residential, builder_infra, investor_real_estate
):
    payload = {
        "investor": investor_real_estate.model_dump(),
        "builders": [builder_infra.model_dump(), builder_residential.model_dump()],
        "limit": 1,
    }
    resp = await client.post("/api/v1/match/rank/builders", json=payload)
    data = resp.json()
    assert len(data["ranked_matches"]) == 1
    assert data["total_candidates"] == 2


# ── /api/v1/match/rank/investors ──────────────────────────────────────────────

async def test_rank_investors_returns_sorted_list(
    client, builder_residential, investor_real_estate, investor_infrastructure
):
    payload = {
        "builder":   builder_residential.model_dump(),
        "investors": [investor_infrastructure.model_dump(), investor_real_estate.model_dump()],
    }
    resp = await client.post("/api/v1/match/rank/investors", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    scores = [r["compatibility_score"] for r in data["ranked_matches"]]
    assert scores == sorted(scores, reverse=True)


# ── /api/v1/match/batch-score ─────────────────────────────────────────────────

async def test_batch_score_multiple_pairs(
    client, builder_residential, builder_infra,
    investor_real_estate, investor_infrastructure,
):
    payload = {
        "pairs": [
            {"builder": builder_residential.model_dump(), "investor": investor_real_estate.model_dump()},
            {"builder": builder_infra.model_dump(),       "investor": investor_infrastructure.model_dump()},
        ]
    }
    resp = await client.post("/api/v1/match/batch-score", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["results"]) == 2
    assert "processing_time_ms" in data
    for result in data["results"]:
        assert 0 <= result["compatibility_score"] <= 100


async def test_batch_score_preserves_order(
    client, builder_residential, builder_infra, investor_real_estate
):
    """Results must be returned in the same order as input pairs."""
    payload = {
        "pairs": [
            {"builder": builder_infra.model_dump(),       "investor": investor_real_estate.model_dump()},
            {"builder": builder_residential.model_dump(), "investor": investor_real_estate.model_dump()},
        ]
    }
    resp = await client.post("/api/v1/match/batch-score", json=payload)
    results = resp.json()["results"]
    assert len(results) == 2


# ── Performance test ───────────────────────────────────────────────────────────

async def test_score_endpoint_is_fast(
    client, builder_residential, investor_real_estate
):
    """Endpoint must respond in under 200ms (non-networked, in-process)."""
    import time
    payload = {
        "builder":  builder_residential.model_dump(),
        "investor": investor_real_estate.model_dump(),
    }
    t0 = time.perf_counter()
    resp = await client.post("/api/v1/match/score", json=payload)
    elapsed_ms = (time.perf_counter() - t0) * 1000

    assert resp.status_code == 200
    assert elapsed_ms < 200, f"Response took {elapsed_ms:.1f}ms — exceeds 200ms target"
