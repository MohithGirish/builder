"""
location.py — Geographic overlap scoring algorithm (max 20 points).

Scores geographic alignment between a builder's city/state and an investor's
preferred locations list and headquarters using a four-tier system:
  20 — builder city is in investor's preferred_locations list
  15 — same state (builder.state == investor.location.state)
  10 — same broad region of India (West, South, North, East, Central)
   5 — anywhere in India (pan-India fallback)
   0 — foreign / no location data
"""

MAX_SCORE = 20

# ── India geography ────────────────────────────────────────────────────────────

_REGIONS: dict[str, dict[str, list[str]]] = {
    "west": {
        "states": ["maharashtra", "gujarat", "goa", "rajasthan"],
        "cities": [
            "mumbai", "navi mumbai", "worli", "pune", "baner", "nashik",
            "ahmedabad", "surat", "jaipur", "jodhpur", "udaipur",
        ],
    },
    "south": {
        "states": [
            "karnataka", "tamil nadu", "kerala", "telangana",
            "andhra pradesh",
        ],
        "cities": [
            "bangalore", "bengaluru", "whitefield", "electronic city",
            "mysore", "chennai", "coimbatore", "hyderabad", "secunderabad",
            "kochi", "thiruvananthapuram", "vizag", "vijayawada",
        ],
    },
    "north": {
        "states": [
            "delhi", "uttar pradesh", "haryana", "punjab",
            "himachal pradesh", "uttarakhand",
        ],
        "cities": [
            "delhi", "ncr", "new delhi", "noida", "gurgaon", "gurugram",
            "faridabad", "lucknow", "agra", "chandigarh", "dehradun",
        ],
    },
    "east": {
        "states": ["west bengal", "odisha", "bihar", "jharkhand", "assam"],
        "cities": [
            "kolkata", "bhubaneswar", "patna", "ranchi", "guwahati",
        ],
    },
    "central": {
        "states": ["madhya pradesh", "chhattisgarh"],
        "cities": ["nagpur", "bhopal", "indore", "raipur", "jabalpur"],
    },
}


def _norm(s: str) -> str:
    return s.strip().lower()


def _get_region(city_or_state: str) -> str | None:
    """Return the broad region name for a city or state, or None."""
    v = _norm(city_or_state)
    for region, data in _REGIONS.items():
        if v in data["cities"] or v in data["states"]:
            return region
    return None


def score_location_overlap(
    builder_city: str,
    builder_state: str | None,
    investor_preferred_locations: list[str],
    investor_location_city: str,
    investor_location_state: str | None,
    max_score: int = MAX_SCORE,
) -> float:
    """
    Score geographic alignment between builder and investor.

    Returns a float in [0, max_score].
    """
    b_city  = _norm(builder_city)
    b_state = _norm(builder_state) if builder_state else ""
    pref    = [_norm(l) for l in investor_preferred_locations]
    i_city  = _norm(investor_location_city)
    i_state = _norm(investor_location_state) if investor_location_state else ""

    # Tier 1 — builder's city explicitly in investor's preferred list
    if b_city in pref or b_state in pref:
        return float(max_score)

    # Tier 2 — same state between builder and investor headquarters
    if b_state and i_state and b_state == i_state:
        return round(max_score * 0.75, 2)

    # Tier 3 — same broad India region
    b_region = _get_region(b_city) or _get_region(b_state)
    i_region = _get_region(i_city) or _get_region(i_state)
    if b_region and i_region and b_region == i_region:
        return round(max_score * 0.50, 2)

    # Tier 4 — pan-India (both in India, different regions)
    if b_region or i_region:
        return round(max_score * 0.25, 2)

    # Tier 5 — no location overlap
    return 0.0
