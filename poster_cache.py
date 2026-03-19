"""
Async TMDB poster resolver with in-memory LRU cache.
Parses year from title strings like "Batman (1989)" and looks up TMDB.
Falls back to a grey placeholder on any error or missing key.
"""
import os
import re
import httpx
from pathlib import Path

# Load .env from the backend directory regardless of import order
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent / ".env")
except ImportError:
    pass

TMDB_API_KEY = os.getenv("TMDB_API_KEY", "")
TMDB_SEARCH_URL = "https://api.themoviedb.org/3/search/movie"
TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500"
PLACEHOLDER = "https://placehold.co/500x750/1a1a2e/6b7280?text=No+Poster"

# Simple in-memory cache: movie_id → full poster URL
_poster_cache: dict[int, str] = {}

_year_re = re.compile(r"\((\d{4})\)\s*$")


def _parse_title_year(raw_title: str):
    """Extract clean title and year from 'Batman (1989)' style strings."""
    match = _year_re.search(raw_title)
    year = int(match.group(1)) if match else None
    title = _year_re.sub("", raw_title).strip()
    return title, year


def _fetch_poster_sync(title: str, year: int | None, api_key: str) -> str:
    """Synchronous TMDB lookup — called once per (movie_id, title)."""
    params: dict = {"api_key": api_key, "query": title, "include_adult": "false"}
    if year:
        params["year"] = year
    try:
        with httpx.Client(timeout=4.0) as client:
            resp = client.get(TMDB_SEARCH_URL, params=params)
            resp.raise_for_status()
            results = resp.json().get("results", [])
            if results and results[0].get("poster_path"):
                return TMDB_IMAGE_BASE + results[0]["poster_path"]
    except Exception:
        pass
    return PLACEHOLDER


def get_poster_url(movie_id: int, raw_title: str) -> str:
    """
    Return a full TMDB poster URL for the given movie.
    Results are cached per movie_id for the lifetime of the process.
    Key is read lazily on every call so it works after uvicorn reloads.
    """
    if movie_id in _poster_cache:
        return _poster_cache[movie_id]

    api_key = os.getenv("TMDB_API_KEY", "")
    if not api_key:
        return PLACEHOLDER

    title, year = _parse_title_year(raw_title)
    url = _fetch_poster_sync(title, year, api_key)
    _poster_cache[movie_id] = url
    return url
