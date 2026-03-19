from pydantic import BaseModel
from typing import List, Dict

class MovieResponse(BaseModel):
    id: int
    title: str
    overview: str
    genres: List[str]
    poster_path: str

class BertStats(BaseModel):
    embeddings_count: int
    dimensions: int

class TfidfStats(BaseModel):
    vocab_size: int

class SystemStats(BaseModel):
    total_movies: int
    bert: BertStats
    tfidf: TfidfStats
    genres_distribution: Dict[str, int]
