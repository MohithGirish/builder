"""
Unit tests for all five scoring algorithms.
Each test is isolated — no I/O, no FastAPI, just pure functions.
"""
import pytest
from app.algorithms.sector     import score_sector_alignment
from app.algorithms.location   import score_location_overlap
from app.algorithms.investment import score_investment_fit
from app.algorithms.roi        import score_roi_compatibility
from app.algorithms.risk       import score_risk_tolerance

# ═══════════════════════════════════════════════════════════════════════════════
# SECTOR ALIGNMENT
# ═══════════════════════════════════════════════════════════════════════════════

class TestSectorAlignment:

    def test_exact_match_gives_full_score(self):
        score = score_sector_alignment(["Real Estate"], ["Real Estate"])
        assert score == 25.0

    def test_case_insensitive_match(self):
        score = score_sector_alignment(["real estate"], ["Real Estate"])
        assert score == 25.0

    def test_substring_containment(self):
        # "Residential" is contained in "Luxury Residential"
        score = score_sector_alignment(["Residential"], ["Luxury Residential"])
        assert score >= 22.0, f"Expected >= 22, got {score}"

    def test_same_parent_category(self):
        # "Luxury Residential" and "Affordable Housing" both map to "real estate"
        score = score_sector_alignment(
            ["Luxury Residential"], ["Affordable Housing"]
        )
        assert 10.0 < score < 25.0, f"Expected partial score, got {score}"

    def test_related_categories(self):
        # "Commercial" and "Real Estate" are related
        score = score_sector_alignment(["Commercial"], ["Real Estate"])
        assert 5.0 < score < 20.0, f"Expected related-category score, got {score}"

    def test_no_overlap_returns_zero(self):
        score = score_sector_alignment(
            ["Infrastructure"], ["PropTech"]
        )
        # These are related (both linked via smart cities) so some partial score
        # but should be significantly lower than perfect match
        assert score < 15.0

    def test_completely_unrelated_sectors(self):
        score = score_sector_alignment(["Roads & Bridges"], ["Luxury Residential"])
        # Different parent categories, not related
        assert score < 12.0

    def test_multiple_investor_sectors_averaged(self):
        # Investor has 3 sectors; builder matches 2 perfectly
        score = score_sector_alignment(
            ["Real Estate", "Commercial", "Infrastructure"],
            ["Luxury Residential", "Office Complexes"],
        )
        assert 12.0 < score < 25.0

    def test_empty_investor_sectors_returns_zero(self):
        score = score_sector_alignment([], ["Real Estate"])
        assert score == 0.0

    def test_empty_builder_sectors_returns_zero(self):
        score = score_sector_alignment(["Real Estate"], [])
        assert score == 0.0

    def test_score_bounded_by_max(self):
        score = score_sector_alignment(
            ["Real Estate", "Commercial"],
            ["Real Estate", "Commercial"],
            max_score=25,
        )
        assert score <= 25.0

    def test_custom_max_score(self):
        score = score_sector_alignment(["Real Estate"], ["Real Estate"], max_score=50)
        assert score == 50.0


# ═══════════════════════════════════════════════════════════════════════════════
# LOCATION OVERLAP
# ═══════════════════════════════════════════════════════════════════════════════

class TestLocationOverlap:

    def test_exact_city_in_preferred_list_gives_full_score(self):
        score = score_location_overlap(
            builder_city="Mumbai",
            builder_state="Maharashtra",
            investor_preferred_locations=["Mumbai", "Pune"],
            investor_location_city="Mumbai",
            investor_location_state="Maharashtra",
        )
        assert score == 20.0

    def test_builder_state_in_preferred_list(self):
        score = score_location_overlap(
            builder_city="Nashik",
            builder_state="Maharashtra",
            investor_preferred_locations=["Maharashtra", "Gujarat"],
            investor_location_city="Mumbai",
            investor_location_state="Maharashtra",
        )
        assert score == 20.0

    def test_same_state_gives_partial_score(self):
        score = score_location_overlap(
            builder_city="Nagpur",
            builder_state="Maharashtra",
            investor_preferred_locations=["Mumbai"],
            investor_location_city="Pune",
            investor_location_state="Maharashtra",
        )
        # Same state tier: 75% of max
        assert score == pytest.approx(20 * 0.75)

    def test_same_region_gives_partial_score(self):
        score = score_location_overlap(
            builder_city="Ahmedabad",
            builder_state="Gujarat",
            investor_preferred_locations=["Mumbai"],
            investor_location_city="Pune",
            investor_location_state="Maharashtra",
        )
        # Same region (West India): 50% of max
        assert score == pytest.approx(20 * 0.50)

    def test_different_regions_gives_low_score(self):
        score = score_location_overlap(
            builder_city="Kolkata",
            builder_state="West Bengal",
            investor_preferred_locations=["Mumbai"],
            investor_location_city="Mumbai",
            investor_location_state="Maharashtra",
        )
        # Pan-India: 25% of max
        assert score == pytest.approx(20 * 0.25)

    def test_case_insensitive(self):
        score = score_location_overlap(
            builder_city="mumbai",
            builder_state="maharashtra",
            investor_preferred_locations=["Mumbai"],
            investor_location_city="Mumbai",
            investor_location_state="Maharashtra",
        )
        assert score == 20.0

    def test_no_state_still_works(self):
        score = score_location_overlap(
            builder_city="Mumbai",
            builder_state=None,
            investor_preferred_locations=["Mumbai"],
            investor_location_city="Pune",
            investor_location_state=None,
        )
        assert score == 20.0


# ═══════════════════════════════════════════════════════════════════════════════
# INVESTMENT FIT
# ═══════════════════════════════════════════════════════════════════════════════

class TestInvestmentFit:

    def test_perfect_fit_midpoint(self):
        # Exactly in the middle → near-full score
        score = score_investment_fit(50, 10, 90)  # mid = 50
        assert score == pytest.approx(25.0)

    def test_within_range_edges(self):
        # At edges of range → slightly lower than full
        score_low  = score_investment_fit(10, 10, 90)
        score_high = score_investment_fit(90, 10, 90)
        assert score_low < 25.0
        assert score_high < 25.0
        assert score_low  >= 25 * 0.85

    def test_below_minimum_partial_score(self):
        score = score_investment_fit(5, 10, 100)  # 50% below min
        assert 0 < score < 25.0

    def test_far_below_minimum_returns_zero(self):
        # Funding is only 10% of the minimum → shortfall > 80% → 0
        score = score_investment_fit(1, 100, 200)
        assert score == 0.0

    def test_above_maximum_partial_score(self):
        # 50% above max
        score = score_investment_fit(150, 10, 100)
        assert 0 < score < 25.0

    def test_way_above_maximum_returns_zero(self):
        # More than 2× max
        score = score_investment_fit(300, 10, 100)
        assert score == 0.0

    def test_zero_funding_returns_zero(self):
        assert score_investment_fit(0, 10, 100) == 0.0

    def test_exact_point_range(self):
        # min == max, funding == both
        score = score_investment_fit(50, 50, 50)
        assert score == 25.0

    def test_score_never_exceeds_max(self):
        for funding in [10, 50, 100, 200]:
            score = score_investment_fit(funding, 10, 100, max_score=25)
            assert score <= 25.0, f"Score {score} exceeded max for funding={funding}"


# ═══════════════════════════════════════════════════════════════════════════════
# ROI COMPATIBILITY
# ═══════════════════════════════════════════════════════════════════════════════

class TestRoiCompatibility:

    def test_exceeds_requirement_with_headroom_gives_full_score(self):
        # 30% above min = full outperformance bonus
        score = score_roi_compatibility(expected_roi=19.5, min_roi_required=15.0)
        assert score == pytest.approx(20.0)

    def test_exactly_meets_requirement(self):
        score = score_roi_compatibility(expected_roi=15.0, min_roi_required=15.0)
        assert score == pytest.approx(20 * 0.75)

    def test_slightly_above_gives_near_full(self):
        score = score_roi_compatibility(expected_roi=16.0, min_roi_required=15.0)
        assert score > 20 * 0.75

    def test_slightly_below_requirement(self):
        # 93% of min
        score = score_roi_compatibility(expected_roi=14.0, min_roi_required=15.0)
        assert 0 < score < 20 * 0.75

    def test_at_floor_returns_zero(self):
        # 80% of min = 0
        score = score_roi_compatibility(expected_roi=12.0, min_roi_required=15.0)
        assert score == 0.0

    def test_below_floor_returns_zero(self):
        score = score_roi_compatibility(expected_roi=5.0, min_roi_required=15.0)
        assert score == 0.0

    def test_zero_roi_returns_zero(self):
        assert score_roi_compatibility(0.0, 15.0) == 0.0

    def test_zero_requirement_gives_neutral(self):
        score = score_roi_compatibility(18.0, 0.0)
        assert score == pytest.approx(20 * 0.60)

    def test_score_never_exceeds_max(self):
        score = score_roi_compatibility(100.0, 10.0, max_score=20)
        assert score <= 20.0


# ═══════════════════════════════════════════════════════════════════════════════
# RISK TOLERANCE
# ═══════════════════════════════════════════════════════════════════════════════

class TestRiskTolerance:

    def test_exact_match_gives_full_score(self):
        for level in ["low", "medium", "high"]:
            score = score_risk_tolerance(level, level)
            assert score == 10.0, f"Failed for level={level}"

    def test_low_investor_high_project_gives_zero(self):
        score = score_risk_tolerance("low", "high")
        assert score == pytest.approx(2.0)

    def test_very_low_investor_high_project_gives_zero(self):
        score = score_risk_tolerance("very_low", "high")
        assert score == 0.0

    def test_conservative_investor_gets_points_for_low_risk_project(self):
        score = score_risk_tolerance("low", "very_low")
        assert score >= 8.0  # slightly below perfect, but still high

    def test_high_risk_investor_medium_project(self):
        score = score_risk_tolerance("high", "medium")
        assert score >= 8.0

    def test_case_insensitive(self):
        assert score_risk_tolerance("MEDIUM", "medium") == 10.0
        assert score_risk_tolerance("Low", "LOW") == 10.0

    def test_unknown_level_defaults_to_medium(self):
        # "unknown" → defaults to medium (2)
        score = score_risk_tolerance("unknown", "medium")
        assert score == 10.0  # medium vs medium = 10

    def test_score_bounded_by_max(self):
        score = score_risk_tolerance("medium", "medium", max_score=10)
        assert score <= 10.0

    def test_custom_max_score(self):
        score = score_risk_tolerance("medium", "medium", max_score=20)
        assert score == 20.0
