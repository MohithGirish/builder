"""
main.py — FastAPI application entry point for the Builder AI Matchmaking Microservice.

Creates and configures the FastAPI app with CORS middleware, request-timing
middleware, the match API router, and a /health endpoint. Settings (allowed
origins, environment, etc.) are loaded from the Settings singleton. This
module is the ASGI entry point used by uvicorn/gunicorn.
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import time

from .config import get_settings
from .routers.match import router as match_router

# ── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("builder_ai")

settings = get_settings()

# ── Application ────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Builder AI — Matchmaking Engine",
    description=(
        "AI-powered scoring service for the Builder AI Market platform. "
        "Computes compatibility scores between builders and investors across "
        "five dimensions: Sector, Location, Investment Fit, ROI, and Risk."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request timing middleware ─────────────────────────────────────────────────
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    t0 = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = (time.perf_counter() - t0) * 1000
    response.headers["X-Process-Time-Ms"] = f"{elapsed_ms:.2f}"
    return response


# ── Routes ─────────────────────────────────────────────────────────────────────
app.include_router(match_router)


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "builder-ai-matchmaking",
        "version": "1.0.0",
        "scoring_dimensions": {
            "sector":         {"weight": 25, "description": "Sector alignment"},
            "location":       {"weight": 20, "description": "Geographic overlap"},
            "investment_fit": {"weight": 25, "description": "Investment size fit"},
            "roi":            {"weight": 20, "description": "ROI compatibility"},
            "risk":           {"weight": 10, "description": "Risk tolerance match"},
        },
    }


@app.get("/", include_in_schema=False)
def root():
    return JSONResponse({"message": "Builder AI Matchmaking Engine v1.0 — visit /docs"})
