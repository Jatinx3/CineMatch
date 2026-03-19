---
title: CineMatch API
emoji: 🎬
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
---

# CineMatch API 🎬

FastAPI backend for the CineMatch AI Movie Recommendation engine, leveraging TF-IDF and BERT neural embeddings for hybrid lexical/semantic search pipelines.

## 🚀 Live Deployment
This folder's logic is hosted on **Hugging Face Spaces (CPU Basic Node)**.
- **API Endpoint**: `https://jatinx3-cinematch-api.hf.space`
- **Interactive Swagger Docs**: `/docs`

---

## 🛠️ Local setup
1. Create a `.venv`:
   ```bash
   python -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   ```
2. Configure `.env` with your `TMDB_API_KEY`.
3. Start the node server:
   ```bash
   uvicorn main:app --reload
   ```

## 🔌 Core Routes
| Route | Description |
|---|---|
| `/stats` | Live system count dynamics and matrix dimensions |
| `/search` | Full-text title specificity scoring |
| `/recommend/similar` | Item-item vector dot product correlation |

---
Built with FastAPI.
