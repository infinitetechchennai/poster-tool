# InfiniteTechAI — Technical Architecture Specification
**Phase 0: System Architecture & Engineering Blueprint**  
*Date: 2026-10-26 | Auditor: Senior Data Architect & System Engineer*

---

## 1. System Overview & Core Objective

The InfiniteTechAI Poster Generation Platform is a specialized, production-grade marketing automation system designed to transform CEO-provided keyword intelligence into high-converting, on-demand visual marketing posters.

### Core Pipeline
1. **Source Context Retrieval**: Load verified keyword metrics (volume, CPC, competition), existing headline drafts (10 angles), and cluster strategy.
2. **Intent Expansion Engine**: Expand the root keyword into 25–30 candidate search intents, execute automated semantic deduplication and claim validation, and produce $\ge 20$ approved, distinct search intents.
3. **Structured Poster Copy Generation**: Transform an approved intent into a validated Poster Content Contract (Title, 3–5 bullets, CTA, style tokens, and text-free image prompt).
4. **Deterministic Rendering Engine**: Render exact poster copy using HTML/CSS/SVG templates captured via Playwright or vector rasterizers—guaranteeing 100% typographic accuracy and zero AI text hallucinations.

---

## 2. Hardware Profile & Resource Budget

The reference deployment environment is a **MacBook Air M2 with 16 GB Unified Memory**. 

### Resource Allocation Budget & Safety Guardrails
| Subsystem | Memory Budget | Processing Allocation | Concurrency / Limits |
| :--- | :--- | :--- | :--- |
| **macOS & Core Services** | 4.0 GB | E-cores | Baseline OS overhead |
| **PostgreSQL Database** | 1.0 GB | Shared | Local Homebrew service; max connections = 20 |
| **FastAPI Backend & Importer**| 1.0 GB | P-cores (1–2) | Single worker process during ingestion |
| **Ollama (LLM Inference)** | 5.5 GB | Apple Silicon GPU (Metal) | Deferred to Phase 2; Batch size = 1; Sequential |
| **Playwright Renderer** | 1.5 GB | P-cores | Deferred to Phase 3; 1 single worker pool |
| **ComfyUI (Image Gen)** | 0.0 GB | Apple Silicon GPU (MPS) | **DISABLED IN PHASES 1–3**; Benchmarked only after Phase 3 |

### Strict M2 Concurrency & Execution Rules:
1. **Sequential Processing by Default**: Ollama, ComfyUI, and multiple Playwright workers must NEVER run simultaneously. The system schedules inference and rendering tasks strictly sequentially on the 16 GB M2.
2. **Phase Isolation**: Image-generation models (ComfyUI / Stable Diffusion) are explicitly excluded from Phase 1 and Phase 2. Zero image generation packages or weights are installed until explicitly scheduled in Phase 3/5.
3. **Telemetry & Memory Probing**: The backend logs resident set size (RSS) memory before and after batch tasks. Concurrency scale-up is blocked if system memory pressure exceeds 70%.

---

## 3. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER (React / Vite)                  │
│  - Keyword Search & Intelligence Explorer                                  │
│  - Intent Expansion Modal & Review Dashboard (20+ validated intents)       │
│  - Interactive Poster Configurator & Live Canvas Preview (Templates 1-3)    │
│  - Export Center (PNG, JPEG, WebP, Metadata JSON)                          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP / REST / Server-Sent Events (SSE)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          APPLICATION BACKEND (FastAPI)                      │
│  - REST API Routing & Auth / Security Middleware                           │
│  - Pydantic Validation & Poster Content Contract Enforcer                   │
│  - Background Task Dispatcher (Job Queue State Machine)                     │
│  - Multi-tier Cache Manager (Intent Cache, Copy Cache, Asset Cache)         │
└───────────────────┬─────────────────────────────────────┬───────────────────┘
                    │                                     │
         ┌──────────▼──────────┐               ┌──────────▼──────────┐
         │ PERSISTENT DATABASE │               │ INFERENCE & RENDERING│
         │    (PostgreSQL)     │               │       SERVICES       │
         ├─────────────────────┤               ├─────────────────────┤
         │ Layer A: Source Rows│               │ Ollama (Local LLM)  │
         │ Layer B: Normalized │               │ - Qwen 2.5 7B Q4    │
         │ Layer C: Generated  │               ├─────────────────────┤
         │ Jobs & Audit Logs   │               │ Playwright Engine   │
         └─────────────────────┘               │ - HTML/CSS to Image │
                                               ├─────────────────────┤
                                               │ ComfyUI (Optional)  │
                                               │ - Background Synth  │
                                               └─────────────────────┘
```

---

## 4. Component Deep Dives

### 4.1 Frontend Architecture (React + Vite)
- **Framework**: React 18+ with Vite for rapid HMR and lightweight bundle size.
- **Styling**: Modern Vanilla CSS Design System with CSS Custom Properties (Tokens for typography, spacing, elevations, brand colors) complemented by utility classes.
- **State Management**: Lightweight reactive state (Zustand or React Query) for async keyword search, job progress tracking, and poster preview caching.
- **Live Canvas Preview**: Real-time iframe-based or vector SVG preview mirroring exact Playwright rendering styles before triggering server-side export.

### 4.2 Application Backend & Job Processing (FastAPI)
- **Framework**: Python 3.11+ with FastAPI for high-performance async concurrency.
- **Validation**: Strict Pydantic v2 data models for all request/response contracts and generative payloads.
- **Background Worker**: Database-backed asynchronous worker with atomic state transitions:
  `queued` $\rightarrow$ `processing` $\rightarrow$ `validating` $\rightarrow$ `completed` | `failed` | `needs_review`.
- **Fault Recovery**: Resumable job checkpoints. If the worker restarts, pending jobs are safely re-queued without duplicating already approved intents.

### 4.3 Search-Intent Expansion Engine
- **Inference Provider**: Ollama running locally over HTTP (`http://localhost:11434`).
- **Prompt Architecture**: 
  - Inputs: Root keyword, Cluster name, Target persona, Business pain point, Buying stage, Top 3 existing headline drafts.
  - Phase 1: Generation of 25–30 candidate search intents representing distinct searcher goals.
  - Phase 2: Deduplication & Semantic Filtering. Candidate intents are evaluated against existing intents using embedding cosine similarity ($> 0.82$ threshold rejected as near-duplicates) and exact string matching.
  - Phase 3: Claim & Feasibility Filter. Candidates making unsubstantiated service claims or pricing promises are discarded.
  - Phase 4: Targeted Replacement Loop. If valid intents $< 20$, the engine generates targeted replacements up to a maximum retry limit (default: 3 iterations).
  - Terminal Condition: If 20 valid intents cannot be achieved, job transitions to `needs_review`.

### 4.4 Deterministic Poster Rendering Engine
- **Core Principle**: Text is NEVER rendered inside generative diffusion models. Diffusion models frequently produce spelling glitches, kerning defects, and unreadable fonts.
- **Rendering Stack**: 
  - HTML5 + CSS3 templates rendered inside Headless Chromium via Playwright.
  - High DPI snapshotting (`deviceScaleFactor: 2` or `3`) yielding crisp 1080×1350 (4:5) or 1080×1080 (1:1) production assets.
- **Template Suite**:
  1. `Corporate Minimal`: Crisp typography, high contrast, structured layout, dark/navy theme, executive appeal.
  2. `Tech Gradient`: Cyberpunk/deep tech aesthetic, glassmorphic card overlays, vibrant accent gradients, developer/architect appeal.
  3. `Editorial Bold`: Swiss-style poster layout, oversized typography, asymmetrical framing, punchy bullet hierarchy.
- **Layout Safety Guards**: Automated DOM bounding-box checks prior to capture. If text wraps unexpectedly or exceeds container boundaries, font sizes clamp automatically to prevent overflow.

---

## 5. API Interface Specification

| Endpoint | Method | Description | Request Payload | Response Contract |
| :--- | :--- | :--- | :--- | :--- |
| `/api/keywords` | `GET` | Search and filter canonical keywords | Query params: `q`, `cluster`, `priority`, `page`, `limit` | Paginated `KeywordSummary` list |
| `/api/keywords/{id}` | `GET` | Get full keyword intelligence & source links | None | `KeywordDetailResponse` |
| `/api/keywords/{id}/headlines` | `GET` | Get the 10 source headline drafts | None | List of `SourceHeadline` |
| `/api/keywords/{id}/expand-intents` | `POST` | Launch async intent expansion job | `{ "candidate_count": 28, "target_approved": 20 }` | `{ "job_id": "...", "status": "queued" }` |
| `/api/jobs/{id}` | `GET` | Poll job status, progress %, and errors | None | `JobStatusResponse` |
| `/api/keywords/{id}/intents` | `GET` | List generated & validated intents | None | List of `GeneratedIntent` |
| `/api/intents/{id}/generate-poster` | `POST` | Generate poster copy & trigger rendering | `{ "template_id": "corporate_minimal", "aspect_ratio": "4:5" }` | `{ "poster_id": "...", "status": "rendered" }` |
| `/api/posters/{id}` | `GET` | Retrieve poster metadata & preview URL | None | `PosterMetadataResponse` |
| `/api/posters/{id}/export` | `GET` | Download final image bundle | Query param: `format=png|jpeg` | Binary image stream |

---

## 6. Caching & Performance Controls

To respect the MacBook Air M2 hardware limits and ensure near-instantaneous repeated views:

1. **Intent Generation Cache**:
   - Cache Key: `hash(keyword_id, model_name, prompt_version)`
   - Storage: PostgreSQL `intent_cache` table with JSONB payload.
   - Behavior: If a valid set of 20 approved intents exists for this key, return immediately without invoking Ollama.
2. **Poster Content Copy Cache**:
   - Cache Key: `hash(intent_id, template_id, prompt_version)`
   - Prevents redundant LLM copy generation calls for the same intent.
3. **Image Asset Reuse Cache**:
   - Visual background assets generated by ComfyUI or curated brand SVGs are indexed by visual style and keyword cluster, allowing instant reuse across related posters.
