from poster_cache import get_poster_url


def format_movie_response(row) -> dict:
    """
    Format a pandas DataFrame row into the required JSON dictionary format.
    Poster URL is resolved via TMDB (cached per movie_id).
    """
    genres_raw = row.get("genres", "")
    if isinstance(genres_raw, str):
        genres = [g for g in genres_raw.replace("|", " ").split() if g]
    else:
        try:
            genres = list(genres_raw)
        except Exception:
            genres = []

    # Remove format-only tags that aren't real genres
    genres = [g for g in genres if g.upper() not in ("IMAX",)]

    movie_id = int(row.get("id", row.get("movieId", 0)))
    title = str(row.get("title", ""))

    # Resolve poster via TMDB (returns cached value on repeated calls)
    poster_path = get_poster_url(movie_id, title)

    return {
        "id": movie_id,
        "title": title,
        "overview": str(row.get("overview", "")),
        "genres": genres,
        "poster_path": poster_path,
    }
