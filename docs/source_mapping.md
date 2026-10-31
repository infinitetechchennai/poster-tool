# InfiniteTechAI — Source-to-Application Mapping
**Phase 0: Architecture Data Layers & Normalization Specification**  
*Date: 2026-10-26 | Auditor: Senior Data Architect & System Engineer*

---

## 1. Architectural Principles & Three-Layer Segregation

To guarantee absolute data preservation, complete provenance, and clean separation of concerns, the InfiniteTechAI data architecture implements three strictly isolated logical layers:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       LAYER A: IMMUTABLE SOURCE DATA                        │
│  - Raw, unparsed workbook imports (JSONB payloads)                          │
│  - File hashes, sheet names, source row numbers, import timestamps          │
│  - Zero data loss, zero mutation, verifiable via cryptographic checksums    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Extracted & Normalized via Read-Only Importer
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      LAYER B: NORMALIZED PROJECT DATA                       │
│  - Canonical keyword registry & Google Ads metrics (3,816 keywords)         │
│  - Thematic taxonomy & cluster strategy (13 clusters)                       │
│  - Existing marketing collateral: 38,160 headline drafts, social, SEO       │
│  - Foreign key references pointing directly back to Layer A source rows     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Seed context for Generative Engines
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LAYER C: GENERATED APP DATA                         │
│  - Expanded search intents (>= 20 validated distinct intents per KW)        │
│  - Structured poster copy contracts (Title, bullets, CTA, style, prompt)    │
│  - Background execution jobs, retry loops, validation logs                  │
│  - Pixel-exact rendered posters (HTML/CSS + SVG -> PNG/JPEG)                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Layer A: Immutable Source Data Schema

Layer A stores the verbatim content of imported files. Even if source data contains anomalies or redundancies, it is captured without modification.

### 2.1 Table: `source_imports`
Tracks workbook file-level ingestion metadata, versioning, and idempotency states.
- `import_id` (`UUID`, PK): Unique import batch identifier.
- `file_name` (`VARCHAR(256)`): e.g., `InfinitetechAI_Keyword_Intent_Analysis.xlsx`.
- `file_hash_sha256` (`CHAR(64)`, NOT NULL): SHA-256 cryptographic hash of source file.
- `file_size_bytes` (`BIGINT`): Source file size.
- `import_version` (`INTEGER`, NOT NULL): Sequential version index per workbook (1 for baseline).
- `is_latest` (`BOOLEAN`, DEFAULT TRUE): Flag indicating the currently active source snapshot.
- `sheet_count` (`INTEGER`): Number of sheets processed.
- `imported_at` (`TIMESTAMPTZ`): Timestamp of import run.
- `import_status` (`VARCHAR(32)`): `completed`, `partial`, `failed`, `skipped_unchanged`.
- `audit_report` (`JSONB`): Summary of row counts, null counts, reconciliation checks, and timing.

### Idempotency & Versioning Rules:
1. **Hash Verification Before Ingestion**: Before reading a workbook, compute its SHA-256 hash. Query `source_imports` for `file_name` and `file_hash_sha256`.
2. **Duplicate Ingestion Skip**: If an import record with the exact matching hash and status `completed` already exists, skip reading and re-ingesting the file entirely. Log `skipped_unchanged`.
3. **Change Detection & Historical Versioning**: If a file with an existing `file_name` has a new hash, increment `import_version`, mark previous version `is_latest = FALSE`, and ingest the new version without mutating or deleting earlier source rows.
4. **Source Immutability**: The importer operates in strictly read-only mode (`openpyxl.load_workbook(..., read_only=True)`), guaranteeing the physical Excel files on disk are never altered.

### 2.2 Table: `source_rows`
Captures raw row data prior to normalization.
- `source_row_id` (`UUID`, PK): Unique row identifier.
- `import_id` (`UUID`, FK `source_imports.import_id`): References import batch.
- `workbook_name` (`VARCHAR(256)`): Exact source workbook filename.
- `sheet_name` (`VARCHAR(64)`): Specific sheet name (e.g., `Master Intent`).
- `source_row_number` (`INTEGER`): 1-indexed Excel row position.
- `raw_data` (`JSONB`): Verbatim key-value dictionary of the Excel row.
- `row_hash_sha256` (`CHAR(64)`): Checksum of normalized row content.

---

## 3. Layer B: Normalized Project Data Schema & Mappings

### 3.1 Mapping: Canonical Taxonomy (`clusters`)
**Source**: `InfinitetechAI_Keyword_Intent_Analysis.xlsx` (`Clusters` sheet)
*(Note: `InfinitetechAI_Google_Ads_Plan.xlsx` `Cluster Strategy` is an exact duplicate; importer reconciles checksums and avoids redundant duplicate insertion).*

| Source Sheet Column | Normalized DB Column | Transformation / Cleaning Rule |
| :--- | :--- | :--- |
| `Cluster Name` | `cluster_name` (`VARCHAR(64)`, PK) | String trim, preserve exact capitalization. |
| `Keyword Count` | `keyword_count` (`INTEGER`) | Cast to integer. |
| `Common Intent` | `common_intent` (`VARCHAR(64)`) | Direct copy. |
| `Target Persona (hypothesis)`| `target_persona` (`TEXT`) | Direct copy; tagged as hypothesis. |
| `Main Pain Point (hypothesis)`| `main_pain_point` (`TEXT`) | Direct copy; tagged as hypothesis. |
| `Service Fit` | `service_fit_guidance` (`TEXT`) | Direct copy. |
| `Primary Channel` | `primary_channel` (`VARCHAR(128)`) | Direct copy. |
| `Landing Page Topic` | `landing_page_topic` (`VARCHAR(128)`)| Direct copy. |
| `CTA` | `default_cta` (`VARCHAR(128)`) | Direct copy. |
| `Paid Search Suitability` | `paid_search_suitability` (`TEXT`)| Direct copy. |
| `Organic Content Suitability`| `organic_suitability` (`TEXT`) | Direct copy. |
| `Priority` | `cluster_priority` (`VARCHAR(64)`) | Direct copy. |
| *(Audit Link)* | `source_row_id` (`UUID`, FK) | FK link to Layer A `source_rows`. |

### 3.2 Mapping: Keywords & Intelligence (`keywords`)
**Source**: `InfinitetechAI_Keyword_Intent_Analysis.xlsx` (`Master Intent` sheet, 3,816 rows)

| Source Sheet Column | Normalized DB Column | Transformation / Cleaning Rule |
| :--- | :--- | :--- |
| `Keyword ID` | `keyword_id` (`VARCHAR(32)`, PK) | **Never modify, regenerate, or alter.** Verified format `KW00001`–`KW03816`. |
| `Original Keyword` | `keyword_text` (`TEXT`, NOT NULL) | Verbatim search query. Strip leading/trailing whitespace. |
| `Keyword Cluster` | `cluster_name` (`VARCHAR(64)`, FK) | Foreign key to `clusters.cluster_name`. |
| `Primary Intent (estimated)` | `primary_intent_estimated` (`VARCHAR(64)`)| Rule-based seed hypothesis. |
| `Secondary Intent` | `secondary_intent` (`VARCHAR(64)`) | Secondary hypothesis. |
| `Searcher Persona (hypothesis)`| `searcher_persona` (`TEXT`) | Searcher persona hypothesis. |
| `Business Problem (hypothesis)`| `business_problem` (`TEXT`) | Pain point hypothesis. |
| `Likely Industry` | `likely_industry` (`VARCHAR(128)`)| Industry domain context. |
| `Buying Stage` | `buying_stage` (`VARCHAR(64)`) | Journey stage (`Decision`, `Consideration`, `Awareness`). |
| `Business Relevance Score (1-5)`| `business_relevance_score` (`SMALLINT`)| Numeric integer score. |
| `Commercial Intent Score (1-5)`| `commercial_intent_score` (`SMALLINT`)| Numeric integer score. |
| `Service Fit` | `service_fit` (`VARCHAR(128)`) | Fit status (requires verification). |
| `Priority` | `priority` (`VARCHAR(64)`) | Strategic priority (A, B, C, Exclude). |
| `Research Confidence` | `research_confidence` (`VARCHAR(128)`)| Confidence level string. |
| `Recommended Action` | `recommended_action` (`TEXT`) | Operational recommendation. |
| `Currency` | `currency` (`VARCHAR(8)`) | Default `INR`. |
| `Avg. monthly searches` | `avg_monthly_searches` (`INTEGER`) | Cast to integer. |
| `Three month change` | `three_month_change` (`VARCHAR(16)`) | Percentage string (e.g., `0%`). |
| `YoY change` | `yoy_change` (`VARCHAR(16)`) | Percentage string (e.g., `0%`). |
| `Competition` | `competition_tier` (`VARCHAR(16)`) | `Low`, `Medium`, `High`. |
| `Competition (indexed value)`| `competition_indexed` (`SMALLINT`) | Index 0–100. |
| `Top of page bid (low range)` | `bid_low_range` (`NUMERIC(10,2)`) | Cast float to numeric; store `NULL` if missing. |
| `Top of page bid (high range)`| `bid_high_range` (`NUMERIC(10,2)`)| Cast float to numeric; store `NULL` if missing. |
| *(Audit Link)* | `source_row_id` (`UUID`, FK) | FK link to Layer A `source_rows`. |

### 3.3 Mapping: Source Headlines (`source_headlines`)
**Source**: `InfinitetechAI_Social_SEO_Content.xlsx` (`Headlines 10 per KW` sheet, 38,160 rows)

| Source Sheet Column | Normalized DB Column | Transformation / Cleaning Rule |
| :--- | :--- | :--- |
| `Headline ID` | `headline_id` (`VARCHAR(32)`, PK) | Unique ID `KW00001-H01` to `KW03816-H10`. Preserve verbatim. |
| `Keyword ID` | `keyword_id` (`VARCHAR(32)`, FK) | Verified FK referencing `keywords.keyword_id`. |
| `Headline Draft` | `headline_draft` (`TEXT`, NOT NULL) | Full draft headline. |
| `Marketing Angle` | `marketing_angle` (`VARCHAR(64)`) | One of 10 angles (Pain point, Outcome, Scale, etc.). |
| `Target Persona` | `target_persona` (`TEXT`) | Persona draft. |
| `Funnel Stage` | `funnel_stage` (`VARCHAR(64)`) | Decision / Consideration / Awareness. |
| `Recommended Channel` | `recommended_channel` (`VARCHAR(128)`)| Usage channel guidance. |
| `CTA` | `call_to_action` (`VARCHAR(128)`) | Proposed CTA. |
| `Google Ads 30-char version`| `google_ads_30_char` (`VARCHAR(30)`)| Pre-condensed ad headline; validate <= 30 chars. |
| `Original Character Count` | `original_char_count` (`SMALLINT`)| Validated original length. |
| `Google Ads Character Count`| `google_ads_char_count` (`SMALLINT`)| Validated condensed length (<= 30). |
| `Note` | `disclaimer_note` (`TEXT`) | Human review requirement notice. |
| *(Audit Link)* | `source_row_id` (`UUID`, FK) | FK link to Layer A `source_rows`. |

### 3.4 Mapping: Social Content (`social_content`)
**Source**: `InfinitetechAI_Social_SEO_Content.xlsx` (`Social Content` sheet, 78 rows)

| Source Sheet Column | Normalized DB Column | Transformation / Cleaning Rule |
| :--- | :--- | :--- |
| *(Auto-generated)* | `id` (`UUID`, PK) | Surrogate primary key. |
| `Content ID` | `source_content_id` (`VARCHAR(32)`)| Preserves `SOC001`–`SOC013` (repeated per platform). |
| `Keyword Cluster` | `cluster_name` (`VARCHAR(64)`, FK) | FK to `clusters.cluster_name`. |
| `Platform` | `platform` (`VARCHAR(32)`) | LinkedIn, Instagram, Facebook, X, Quora, Pinterest. |
| `Headline` | `headline` (`TEXT`) | Post hook / headline. |
| `Copy` | `body_copy` (`TEXT`) | Post body text. |
| `CTA` | `call_to_action` (`VARCHAR(128)`) | Action link. |
| `Format` | `format` (`VARCHAR(64)`) | Content structure format. |
| `Hashtags` | `hashtags` (`TEXT`, NULLABLE) | Comma/space separated tags; `NULL` for Quora. |
| `Destination URL` | `destination_url` (`VARCHAR(256)`)| Target company URL. |
| `Status` | `review_status` (`VARCHAR(128)`) | Validation warning / status. |
| *(Composite Unique)* | `(source_content_id, platform)` | Enforced UNIQUE constraint. |
| *(Audit Link)* | `source_row_id` (`UUID`, FK) | FK link to Layer A `source_rows`. |

### 3.5 Mapping: Editorial Calendar (`content_calendar`)
**Source**: `InfinitetechAI_Social_SEO_Content.xlsx` (`30 Day Calendar` sheet, 30 rows)
- `calendar_day` (`SMALLINT`, PK): 1–30.
- `calendar_content_id` (`VARCHAR(32)`, UNIQUE): `CAL01`–`CAL30`.
- `cluster_name` (`VARCHAR(64)`, FK `clusters.cluster_name`): Thematic topic.
- `platform`, `topic`, `headline`, `format`, `call_to_action`, `objective`, `funnel_stage`, `repurpose_instructions`.
- `source_row_id` (`UUID`, FK `source_rows`).

### 3.6 Mapping: SEO Landing Pages (`seo_landing_pages`)
**Source**: `InfinitetechAI_Social_SEO_Content.xlsx` (`SEO Landing Pages` sheet, 13 rows)
- `page_id` (`VARCHAR(32)`, PK): `SEO001`–`SEO013`.
- `cluster_name` (`VARCHAR(64)`, FK `clusters.cluster_name`, UNIQUE): 1:1 with Cluster.
- `keyword_theme`, `page_type`, `seo_title`, `meta_description`, `h1_heading`, `suggested_slug`, `page_sections`, `faq_ideas`, `internal_links`, `call_to_action`, `caution_caveat`.
- `source_row_id` (`UUID`, FK `source_rows`).

### 3.7 Mapping: Google Ads Shortlist (`campaign_shortlist`)
**Source**: `InfinitetechAI_Google_Ads_Plan.xlsx` (`Campaign Shortlist` sheet, 487 rows)
- `keyword_id` (`VARCHAR(32)`, PK, FK `keywords.keyword_id`): Verified 1:1 join with Master Intent.
- `suggested_ad_group` (`VARCHAR(64)`), `recommended_match_type` (`VARCHAR(128)`), `negative_keyword_ideas` (`TEXT`), `landing_page_recommendation` (`TEXT`), `conversion_recommendation` (`TEXT`).
- `source_row_id` (`UUID`, FK `source_rows`).

---

## 4. Layer C: Generated Application Data Schema

Layer C contains all runtime-generated assets created during on-demand workflow executions.

### 4.1 Table: `generation_jobs`
Tracks async execution lifecycle for intent expansions and poster renderings.
- `job_id` (`UUID`, PK): Unique background job identifier.
- `job_type` (`VARCHAR(32)`): `intent_expansion`, `poster_generation`.
- `keyword_id` (`VARCHAR(32)`, FK `keywords.keyword_id`): Target keyword.
- `status` (`VARCHAR(32)`): State machine: `queued` → `processing` → `validating` → `completed` | `failed` | `needs_review` | `cancelled`.
- `progress_percent` (`SMALLINT`): 0 to 100.
- `model_name` (`VARCHAR(64)`): e.g., `qwen2.5:7b-instruct-q4_K_M`.
- `prompt_version` (`VARCHAR(32)`): Semantic version of system prompt.
- `error_message` (`TEXT`): Error details if failed.
- `execution_metrics` (`JSONB`): Duration, token usage, retry counts, deduplication stats.
- `created_at`, `updated_at`, `completed_at` (`TIMESTAMPTZ`).

### 4.2 Table: `generated_intents`
Stores validated search intents expanded from a CEO keyword.
- `intent_id` (`UUID`, PK): Unique internal intent ID (never replaces CEO keyword ID).
- `keyword_id` (`VARCHAR(32)`, FK `keywords.keyword_id`): Preserves parent keyword reference.
- `intent_phrase` (`VARCHAR(256)`, NOT NULL): Clear, distinct search query / user goal.
- `intent_category` (`VARCHAR(64)`): e.g., Informational, Transactional, Problem-Aware, Comparison.
- `audience_need` (`TEXT`): Specific operational struggle or goal driving this search.
- `buying_stage` (`VARCHAR(64)`): Awareness, Consideration, Decision.
- `marketing_angle` (`VARCHAR(64)`): Angle (e.g., Efficiency, Cost-Reduction, Reliability).
- `candidate_batch_number` (`SMALLINT`): Which generation loop iteration produced this.
- `semantic_similarity_score` (`FLOAT`): Similarity score against existing intent set (deduplication audit).
- `approval_status` (`VARCHAR(32)`): `approved`, `rejected`, `needs_review`.
- `rejection_reason` (`TEXT`): If rejected during validation loop.
- `model_name` (`VARCHAR(64)`), `prompt_version` (`VARCHAR(32)`).
- `created_at` (`TIMESTAMPTZ`).

### 4.3 Table: `poster_content`
Stores structured JSON copy for an approved intent adhering to the Poster Content Contract.
- `poster_content_id` (`UUID`, PK): Unique content draft ID.
- `intent_id` (`UUID`, FK `generated_intents.intent_id`): References validated intent.
- `keyword_id` (`VARCHAR(32)`, FK `keywords.keyword_id`): Preserves parent keyword.
- `header` (`VARCHAR(128)`): Category / contextual kicker (e.g., "ENTERPRISE CLOUD ARCHITECTURE").
- `title` (`VARCHAR(256)`): Primary compelling poster headline.
- `description` (`TEXT`): 1–2 sentence supporting value proposition.
- `bullet_points` (`JSONB`): Array of 3 to 5 benefit-driven bullet strings.
- `call_to_action` (`VARCHAR(128)`): Direct CTA (e.g., "Schedule an Architecture Audit").
- `image_prompt` (`TEXT`): Clean, descriptive visual prompt (text-free art direction).
- `template_id` (`VARCHAR(64)`): `corporate_minimal`, `tech_neon`, `editorial_modern`.
- `visual_style` (`VARCHAR(64)`): Color palette, aesthetic mode (dark/light), typography tokens.
- `aspect_ratio` (`VARCHAR(16)`): `1:1`, `4:5`, `16:9`.
- `seo_alt_text` (`TEXT`): Accessible, keyword-rich image description.
- `validation_status` (`VARCHAR(32)`): `passed`, `failed_overflow`, `flagged_claims`.
- `human_approval_status` (`VARCHAR(32)`): `draft`, `approved`, `rejected`.
- `created_at` (`TIMESTAMPTZ`).

### 4.4 Table: `image_assets`
Manages visual background elements and generative artwork.
- `asset_id` (`UUID`, PK): Unique image identifier.
- `source_type` (`VARCHAR(32)`): `local_ai_generated`, `curated_brand_asset`, `template_background`.
- `file_path` (`TEXT`): Local filesystem storage path.
- `prompt_used` (`TEXT`): Generation prompt if AI-generated.
- `model_engine` (`VARCHAR(64)`): e.g., `ComfyUI/SDXL`, `SVG_Procedural`.
- `license_type` (`VARCHAR(64)`): `proprietary`, `creative_commons`, `open_source`.
- `attribution` (`TEXT`): Required license attribution if external.
- `created_at` (`TIMESTAMPTZ`).

### 4.5 Table: `posters`
Tracks final rendered poster artifacts.
- `poster_id` (`UUID`, PK): Unique rendered poster ID.
- `poster_content_id` (`UUID`, FK `poster_content.poster_content_id`).
- `asset_id` (`UUID`, FK `image_assets.asset_id`, NULLABLE).
- `render_engine` (`VARCHAR(32)`): `playwright_html_css`, `resvg_svg`.
- `output_format` (`VARCHAR(8)`): `PNG`, `JPEG`, `SVG`.
- `output_path` (`TEXT`): Storage path of finished graphic.
- `dimensions_width` (`INTEGER`): e.g., 1080.
- `dimensions_height` (`INTEGER`): e.g., 1350.
- `rendered_at` (`TIMESTAMPTZ`).

---

## 5. Deduplication, Normalization & Redundancy Rules

1. **Workbook Deduplication**:
   - `InfinitetechAI_Google_Ads_Plan.xlsx` contains redundant sheets (`Master Intent` 6 cols, `Cluster Strategy` 12 cols). The importer will ingest these into Layer A `source_rows` for complete provenance, but will mark them as mirrored references, normalizing canonical project entities solely from `InfinitetechAI_Keyword_Intent_Analysis.xlsx`.
2. **Social Content Composite Uniqueness**:
   - `Content ID` `SOC001` through `SOC013` is repeated 6 times. Layer B enforces a composite unique constraint `UNIQUE (source_content_id, platform)`.
3. **Character Limits & Pre-truncation**:
   - `Google Ads 30-char version` in `source_headlines` is verified to never exceed 30 characters. PostgreSQL check constraint `CHECK (LENGTH(google_ads_30_char) <= 30)` guarantees ongoing compliance.
4. **Preservation of Hypotheses**:
   - In Layer B, fields tagged with `(hypothesis)` in the source (`searcher_persona`, `business_problem`, `primary_intent_estimated`) are explicitly stored with metadata indicating their unverified status. The intent engine must treat them as seeds, not verified facts.
