"""
algorithms/__init__.py — Public API for the scoring algorithm package.

Re-exports the five dimension scoring functions for convenient import
by the matching engine: score_sector_alignment, score_location_overlap,
score_investment_fit, score_roi_compatibility, and score_risk_tolerance.
Each function returns a float score within its configured maximum point value.
"""
from .sector     import score_sector_alignment
from .location   import score_location_overlap
from .investment import score_investment_fit
from .roi        import score_roi_compatibility
from .risk       import score_risk_tolerance

__all__ = [
    "score_sector_alignment",
    "score_location_overlap",
    "score_investment_fit",
    "score_roi_compatibility",
    "score_risk_tolerance",
]
