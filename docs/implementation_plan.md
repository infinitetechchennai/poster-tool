# InfiniteTechAI — Phased Implementation Plan
**Phase 0: Master Roadmap, Verification Gates & Migration Strategy**  
*Date: 2026-10-26 | Auditor: Senior Data Architect & System Engineer*

---

## 1. Executive Roadmap Summary

This document outlines the end-to-end phased execution roadmap for constructing the InfiniteTechAI AI Poster Generation Platform. Each phase specifies concrete technical deliverables, acceptance criteria, automated verification tests, and risk controls.

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   PHASE 0    │     │   PHASE 1    │     │   PHASE 2    │     │   PHASE 3    │     │   PHASE 4    │
│ Analysis &   │ ──► │  Schema &    │ ──► │ Intent Engine│ ──► │ Poster Copy  │ ──► │ Frontend &   │
│ Audit Docs   │     │  Read Importer│    │ & Validation │     │ & Playwright │     │ On-Demand UI │
│ (CURRENT)    │     │              │     │              │     │  Renderer    │     │              │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                                                                           │
                                                                                           ▼
                                                                                    ┌──────────────┐
                                                                                    │   PHASE 5    │
                                                                                    │ Production,  │
                                                                                    │ Performance  │
                                                                                    │ & Hardening  │
                                                                                    └──────────────┘
```

---

## 2. Phase Breakdown & Deliverables

### Phase 0: Analysis, Discovery & Formal Documentation *(Complete)*
- **Objective**: Thoroughly audit all three Excel workbooks without modifying source data or installing packages.
- **Deliverables**:
  1. `docs/workbook_audit.md` — Verified row counts, keys, duplicates, nulls, and caveats.
  2. `docs/data_dictionary.md` — Target types, constraints, and business definitions.
  3. `docs/source_mapping.md` — 3-layer architecture mapping and provenance specifications.
  4. `docs/architecture.md` — System components, M2 hardware budget, and API contracts.
  5. `docs/implementation_plan.md` — Master roadmap and verification checklist.
- **Milestone Gate**: User review and sign-off on Phase 0 audit findings.

---

### Phase 1: Database Schema & Read-Only Importer *(In Progress)*
- **Objective**: Build the PostgreSQL relational schema and an idempotent, read-only Excel ingestion pipeline that preserves every source row and original ID.
- **Detailed Tasks**:
  1. Initialize database migrations establishing:
     - **Layer A**: `source_imports` (with SHA-256 hash tracking and versioning) and `source_rows` (with row-level provenance and raw JSONB).
     - **Layer B**: `clusters`, `keywords`, `source_headlines`, `social_content` (with composite key `(source_content_id, platform)`), `content_calendar`, `seo_landing_pages`, and `campaign_shortlist`.
     - **Layer C (Schema Only)**: `generation_jobs`, `generated_intents`, `poster_content`, `image_assets`, and `posters`.
  2. Implement `importer/read_only_importer.py`:
     - Verifies SHA-256 hashes against approved baseline fingerprints.
     - Detects unchanged workbooks and cleanly skips duplicate ingestion (`skipped_unchanged`).
     - Detects updated workbooks and creates a traceable new import version (`import_version += 1`) while keeping previous snapshots.
     - Reads workbooks strictly in read-only mode (`openpyxl.load_workbook(..., read_only=True)`).
     - Inserts raw records into Layer A `source_rows` before normalizing into Layer B.
     - Avoids duplicate records in Layer B on rerun.
  3. Generate `import_reconciliation_report.json`:
     - Contains: expected row counts, actual imported row counts, ID match status, null count comparison, mismatch details, and timestamped import status.
- **Automated Verification Test Suite**:
  - `test_immutability`: Verify SHA-256 hashes of all 3 workbooks before and after import; assert 100% byte-for-byte equality.
  - `test_id_preservation`: Verify all 3,816 `KW00001`–`KW03816` IDs exist in the database and match source rows.
  - `test_headline_foreign_keys`: Assert all 38,160 headline rows link to valid keywords, and every keyword has exactly 10 headlines across the 10 defined angles.
  - `test_social_composite_key`: Assert 78 social content records exist with composite key `(source_content_id, platform)`.
  - `test_google_ads_char_limits`: Assert all 38,160 condensed headlines are $\le 30$ characters.
  - `test_idempotency_rerun`: Run the importer a second time; assert no records are duplicated, existing records remain untouched, and the run logs `skipped_unchanged`.
  - `test_reconciliation_report`: Assert `import_reconciliation_report.json` passes with zero discrepancies and status `reconciled`.

---

### Phase 2: Search-Intent Expansion Engine
- **Objective**: Develop the LLM-driven intent expansion service to reliably generate $\ge 20$ validated, distinct search intents per keyword.
- **Detailed Tasks**:
  1. Configure Ollama client interfacing with local quantized model (`qwen2.5:7b-instruct-q4_K_M` or `llama3.2:3b`).
  2. Implement strict prompt engineering injecting keyword intelligence, cluster pain point, buying stage, and existing headline context.
  3. Generate candidate batches (25–30 candidate intents).
  4. Implement multi-stage validation pipeline:
     - **Exact string deduplication**: Case-insensitive normalization.
     - **Semantic similarity check**: Reject candidates exceeding 0.82 cosine similarity against accepted candidates.
     - **Scope & claims guard**: Reject invalid pricing, fake certifications, or unverified capability claims.
  5. Targeted replacement loop: If approved intents $< 20$, invoke targeted replacement prompt with negative examples up to configured retry limit (default: 3).
  6. If 20 valid intents cannot be achieved, flag job status as `needs_review`.
  7. Implement intent response caching by `(keyword_id, model, prompt_version)`.
- **Automated Tests**:
  - `test_intent_diversity`: Assert generated intent set contains at least 20 distinct intents with semantic distance $> 0.18$.
  - `test_retry_mechanism`: Simulate rejected candidates and assert replacement generation restores pool to 20.
  - `test_caching`: Assert identical keyword requests return cached intents without re-invoking LLM.

---

### Phase 3: Poster Copy Generation & Deterministic Renderer
- **Objective**: Generate validated structured poster copy contracts and render exact, pixel-perfect posters via HTML/CSS/SVG templates.
- **Detailed Tasks**:
  1. Define Pydantic `PosterContentContract`:
     - Header, Title, Description, 3–5 Bullets, CTA, Image Prompt, Alt Text, Template ID.
  2. Implement poster copy generation service with claim verification against approved cluster guidelines.
  3. Create three responsive HTML/CSS/SVG templates:
     - `corporate_minimal.html`: Professional, high-contrast navy/slate palette, structured typography.
     - `tech_gradient.html`: Modern cyber/developer aesthetic with vibrant accents and glassmorphism.
     - `editorial_modern.html`: Swiss-style layout with bold typography and asymmetrical visual balance.
  4. Implement Playwright rendering service:
     - Launch headless Chromium with device scale factor 2.
     - Check DOM bounding boxes for text overflow before capturing.
     - Export 1080×1350 (4:5 portrait) and 1080×1080 (1:1 square) PNG/JPEG images.
  5. Integrate curated background graphics and optional ComfyUI local image generation (queued sequentially).
- **Automated Tests**:
  - `test_poster_contract_validation`: Assert invalid bullet counts (< 3 or > 5) fail validation.
  - `test_rendering_dimensions`: Assert generated PNGs exactly match specified aspect ratios and dimensions.
  - `test_no_text_overflow`: Validate that Playwright catches and handles overflow gracefully.

---

### Phase 4: Frontend UI & On-Demand Workflow
- **Objective**: Deliver a web interface allowing marketing managers to search keywords, inspect context, expand intents, review drafts, and export posters.
- **Detailed Tasks**:
  1. Initialize React + Vite project in `frontend/`.
  2. Develop Keyword Explorer:
     - Instant search, cluster filtering, priority tags (A/B/C/Exclude).
     - Keyword detail modal displaying Google Ads metrics (Searches, Competition, Bid Range) and existing headline drafts.
  3. Build Intent Expansion Experience:
     - 1-click trigger button with real-time status tracker (queued $\rightarrow$ processing $\rightarrow$ validating $\rightarrow$ completed).
     - Intent Review Grid showing approved intents with category and persona badges.
  4. Develop Poster Studio:
     - Live visual canvas preview reflecting selected template and copy.
     - Interactive controls: Template switcher, aspect ratio toggle, copy editor for manual fine-tuning.
  5. Export Center:
     - High-res PNG/JPEG download with embedded metadata JSON.
     - Support for explicit user-selected batch queues (never auto-generating for all keywords).
- **Automated Tests**:
  - Frontend component tests (Vitest / React Testing Library) for search and modal interactions.
  - End-to-end integration test (Playwright) covering: Select Keyword $\rightarrow$ Expand Intents $\rightarrow$ Choose Intent $\rightarrow$ Render Poster $\rightarrow$ Download.

---

### Phase 5: Production Hardening, Quality & Hardware Benchmarking
- **Objective**: Validate performance, stability, and resource consumption on Apple Silicon M2.
- **Detailed Tasks**:
  1. Benchmark Ollama inference latency and RAM usage on MacBook Air M2 (16 GB).
  2. Test Playwright headless rendering pool under consecutive export requests.
  3. Implement error recovery and worker health monitors.
  4. Finalize licensing audit confirming all fonts, icons, and background assets are strictly free/open-source or proprietary to InfiniteTechAI.
  5. Assemble project deployment documentation and runbooks.

---

## 3. Risk Management & Mitigation Matrix

| Identified Risk | Probability | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **M2 RAM Saturation (16 GB)** | Medium | High | Allocate strict memory quotas; run Ollama with Q4 quantization; enforce sequential batch size = 1; defer ComfyUI behind explicit hardware toggle. |
| **LLM Output Formatting Drift** | Medium | Medium | Enforce Pydantic schema validation with Instructor/JSON-mode; auto-retry upon malformed JSON. |
| **Near-Duplicate Intent Hallucinations** | High | Medium | Execute automated semantic similarity clustering ($>0.82$ threshold rejection); enforce diverse prompt seed angles. |
| **Typography Overflow on Long Headings** | Medium | Low | CSS clamp functions and automated DOM bounding-box overflow detection in Playwright prior to snapshot. |
| **Accidental Source Workbook Overwrite** | Low | Critical | Set source files to read-only OS permissions (`chmod 444`); enforce Layer A immutable ingestion architecture. |
