import traceback
from typing import List, Literal

from dotenv import load_dotenv
load_dotenv()

import os
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import MovieResponse, SystemStats
from model import recommender
from utils import format_movie_response

app = FastAPI(
    title="CineMatch API",
    description="AI-powered movie recommendation engine using TF-IDF and BERT embeddings.",
    version="1.0.0",
)

# Read allowed origins from env — supports comma-separated list for multi-origin
_raw_origins = os.getenv("CORS_ORIGIN", "http://localhost:3000")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/stats", response_model=SystemStats)
def get_stats():
    """Returns database and vector space dimensionality metrics."""
    return recommender.get_stats()

@app.get("/debug_error")
def debug_error():
    """Returns the initialization error if any for debugging."""
    if hasattr(recommender, "load_error"):
        return {"error": recommender.load_error}
    return {"error": "No error recorded"}


@app.get("/search", response_model=List[MovieResponse], tags=["Movies"])
def search(q: str = Query(..., min_length=1, description="Movie title to search")):
    """Full-text search across 87k movies ranked by match specificity."""
    results_df = recommender.search_movies(q)
    return [format_movie_response(row) for _, row in results_df.iterrows()]


@app.get("/recommend/similar", response_model=List[MovieResponse], tags=["Recommendations"])
def recommend_similar(
    movie_id: int = Query(..., gt=0, description="Movie ID"),
    model: Literal["tfidf", "bert"] = Query("tfidf", description="Recommendation model"),
):
    """Return movies similar to the given movie using the selected model."""
    results_df = recommender.get_similar_movies(movie_id, model)
    if results_df.empty:
        raise HTTPException(status_code=404, detail="Movie not found or no similar movies available.")
    return [format_movie_response(row) for _, row in results_df.iterrows()]


@app.get("/recommend/user", response_model=List[MovieResponse], tags=["Recommendations"])
def recommend_user(
    user_id: int = Query(..., gt=0, description="User ID"),
    model: Literal["tfidf", "bert"] = Query("tfidf", description="Recommendation model"),
):
    """Return personalised recommendations for a user based on their rating history."""
    try:
        results_df = recommender.get_user_recommendations(user_id, model)
        return [format_movie_response(row) for _, row in results_df.iterrows()]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

