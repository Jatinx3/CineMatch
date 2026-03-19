---
title: CineMatch API
emoji: 🎬
colorFrom: blue
colorTo: indigo
sdk: docker
---

<div align="center">


# 🎬 CineMatch

**AI-powered movie discovery using TF-IDF and BERT neural embeddings**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11%2B-blue?logo=python)](https://python.org/)
[![BERT](https://img.shields.io/badge/BERT-all--MiniLM--L6--v2-orange?logo=huggingface)](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)

</div>

---

## Overview

CineMatch is a full-stack movie recommendation engine that serves personalised suggestions for 87,000+ movies via two selectable AI models — a classic TF-IDF lexical approach and a BERT-powered neural embedding model. Users search for a movie, pick a model, and instantly receive a curated list of semantically similar titles with poster art pulled from TMDB.

The documentation page exposes live ML system stats (embedding dimensions, vocabulary size, genre distributions) pulled directly from the backend.

---

## Features

- 🔍 **Full-text search** across 87,000+ movies with ranked result specificity
- 🤖 **Dual AI models** — switch between TF-IDF (fast, precise) and BERT (deep, semantic)
- 🎯 **Personalised user recommendations** based on rating history
- 📊 **Live ML documentation** page with real system statistics
- 🌙 **Dark / Light mode** with smooth transitions
- ⚡ **Shimmer skeleton loaders** and staggered card animations
- 🎨 **Responsive design** with a cinematic dark aesthetic

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React, Tailwind CSS v4, Recharts |
| Backend | FastAPI, Pydantic, Uvicorn |
| ML — Lexical | scikit-learn TF-IDF (15k vocab, bigrams, L2-normalised) |
| ML — Semantic | `sentence-transformers/all-MiniLM-L6-v2` (384d BERT embeddings) |
| Data | MovieLens 32M + TMDB metadata, 87k movies |
| Posters | TMDB API with in-memory LRU cache |
| State | TanStack Query (React Query) |

---

## Setup

### Prerequisites

- Node.js ≥ 18
- Python ≥ 3.11
- A [TMDB API key](https://developer.themoviedb.org/docs/getting-started) (free)
- Pre-generated data files (see below)

### 1. Clone & install

```bash
git clone https://github.com/yourusername/cinematch.git
cd cinematch
npm install
```

### 2. Frontend environment

```bash
cp .env.example .env.local
# .env.local is already pre-filled with defaults for local dev
```

### 3. Backend environment

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env and add your TMDB_API_KEY
```

### 4. Generate data (first time only)

The ML data files are not committed to the repo (they are large binary files). Generate them from the notebook or scripts:

```bash
# From the backend/ directory with your venv active
python scripts/rebuild_dataset.py   # builds movies.pkl, train_ratings.pkl
python scripts/generate_embeddings.py  # builds bert_embeddings_full.npy
```

### 5. Run

```bash
# Terminal 1 — Backend
cd backend && uvicorn main:app --reload

# Terminal 2 — Frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/stats` | Live system stats (movie count, embedding shape, genres) |
| `GET` | `/search?q=<query>` | Search movies by title |
| `GET` | `/recommend/similar?movie_id=<id>&model=<tfidf\|bert>` | Similar movies |
| `GET` | `/recommend/user?user_id=<id>&model=<tfidf\|bert>` | User recommendations |

Interactive docs available at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## ML Architecture

### TF-IDF
- `TfidfVectorizer` with `max_features=15000`, `ngram_range=(1,2)`, `min_df=2`
- Built on `final_features`: front-loaded genres/keywords + plot overview
- L2-normalised sparse matrix — dot product = cosine similarity

### BERT
- `all-MiniLM-L6-v2` via `sentence-transformers` (384 dimensions)
- Encodes `final_features` in batches with `max_seq_length=512`
- L2-normalised dense matrix — stored in `data/bert_embeddings_full.npy`

### Popularity Rebalancing
Both models apply a weighted blend of semantic score and log-normalised popularity:

```
final_score = 0.7 × sim_score + 0.3 × (sim_score × log_pop_norm)
```

This keeps niche gems discoverable while surfacing well-validated blockbusters.

---

## Project Structure

```
cinematch/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout with global footer
│   ├── page.tsx                # Home page (search + recommendations)
│   └── documentation/          # Live ML stats dashboard
├── components/
│   ├── layout/                 # ThemeToggle
│   ├── movie/                  # MovieCard, MovieGrid (with skeleton loader)
│   ├── recommendation/         # RecommendationSection, ModelToggle
│   └── search/                 # SearchSection, SearchBar
├── lib/
│   ├── api.ts                  # Typed API fetch functions
│   ├── hooks.ts                # React Query hooks
│   └── types.ts                # Shared TypeScript interfaces
├── backend/
│   ├── main.py                 # FastAPI app + route definitions
│   ├── model.py                # RecommenderSystem singleton (TF-IDF + BERT)
│   ├── schemas.py              # Pydantic response models
│   ├── utils.py                # Movie response formatter
│   ├── poster_cache.py         # TMDB poster resolver with LRU cache
│   ├── data/                   # Data files (gitignored)
│   └── scripts/                # Data generation scripts (offline use only)
│       ├── rebuild_dataset.py
│       └── generate_embeddings.py
├── notebook/                   # Model training and exploration
│   └── cinematchv1.ipynb       # Final notebook (BERT 512-token context)
└── .gitignore                  # Covers Node, Python, ML artifacts, env files
```

---

## Notebooks

The heavy-lifting and token analysis is documented in our core notebook:

| File | Purpose |
|---|---|
| `notebook/cinematchv1.ipynb` | **Final model** — BERT with 512-token context window achieving 0.290 precision |

---

Built with ♥ by **Jatin**
