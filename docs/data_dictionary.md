# InfiniteTechAI — Data Dictionary
**Phase 0: Source-to-Target Data Specification**  
*Date: 2026-10-26 | Auditor: Senior Data Architect & System Engineer*

---

## 1. Overview & Data Types Standard

This Data Dictionary defines every table, column, constraint, data type, and business semantic rule identified across the three source workbooks:
- `InfinitetechAI_Keyword_Intent_Analysis.xlsx`
- `InfinitetechAI_Social_SEO_Content.xlsx`
- `InfinitetechAI_Google_Ads_Plan.xlsx`

### Target Database Mapping Standard
- **Text strings**: `VARCHAR(N)` or `TEXT`.
- **Identifiers**: `VARCHAR(32)` for legacy source IDs (`KW00001`, `CAL01`, `SOC001`, etc.); `UUID` for internal system generated keys.
- **Integers**: `INTEGER` / `SMALLINT`.
- **Monetary / Bids**: `NUMERIC(10, 2)`.
- **Percentages**: `VARCHAR(16)` or `NUMERIC(5, 2)`.
- **Timestamps**: `TIMESTAMPTZ`.

---

## 2. Table Specifications

### 2.1 Table: `keywords` & `keyword_intelligence`
*Source: `InfinitetechAI_Keyword_Intent_Analysis.xlsx` → Sheet: `Master Intent` (3,816 rows)*

| Source Column Name | Target Column Name | Source Type | Target DB Type | Nullable (Null Count) | Constraints | Allowed Values / Range | Business Definition & Provenance |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Keyword ID` | `keyword_id` | String | `VARCHAR(32)` | No (0) | Primary Key | `KW00001`–`KW03816` | Immutable original keyword identifier. Verified fact. |
| `Original Keyword` | `original_keyword` | String | `TEXT` | No (0) | NOT NULL, INDEX | Clean text phrase | The original keyword phrase as provided by CEO dataset. Verified fact. |
| `Normalized Keyword` | `normalized_keyword` | String | `TEXT` | No (0) | NOT NULL | Clean text phrase | Normalized search term (identical to Original Keyword in source). Verified fact. |
| `Keyword Cluster` | `keyword_cluster` | String | `VARCHAR(64)` | No (0) | FK to `clusters.cluster_name` | 13 taxonomy clusters | High-level business and semantic domain classification. Verified taxonomy. |
| `Primary Intent (estimated)` | `primary_intent_estimated` | String | `VARCHAR(64)` | No (0) | NOT NULL | 9 intent categories | Rule-based estimated intent category. **Hypothesis: Must be expanded & validated.** |
| `Secondary Intent` | `secondary_intent` | String | `VARCHAR(64)` | No (0) | — | 2 categories (`None assigned...`, `Commercial...`) | Secondary intent hypothesis. |
| `Searcher Persona (hypothesis)` | `searcher_persona` | String | `TEXT` | No (0) | — | 4 target persona strings | Inferred audience role (e.g., Founder, CTO, Lead). **Hypothesis.** |
| `Business Problem (hypothesis)` | `business_problem` | String | `TEXT` | No (0) | — | 16 distinct pain point strings | Underlying business challenge that motivated search. **Hypothesis.** |
| `Likely Industry` | `likely_industry` | String | `VARCHAR(128)` | No (0) | — | Typically "Cross-industry..." | Inferred target industry vertical. |
| `Buying Stage` | `buying_stage` | String | `VARCHAR(64)` | No (0) | NOT NULL | `Awareness...`, `Consideration`, `Decision` | Position in the customer purchase journey. Heuristic classification. |
| `Business Relevance Score (1-5)` | `business_relevance_score` | Integer | `SMALLINT` | No (0) | CHECK (score BETWEEN 1 AND 5) | 1, 2, 3, 4, 5 | Relevance score of keyword to InfiniteTechAI service offerings. |
| `Commercial Intent Score (1-5)` | `commercial_intent_score` | Integer | `SMALLINT` | No (0) | CHECK (score BETWEEN 1 AND 5) | 1, 2, 3, 4, 5 | Propensity of search query to convert into revenue. |
| `Service Fit` | `service_fit` | String | `VARCHAR(128)` | No (0) | — | 2 categories (`Potential fit...`, `Unverified...`) | Indicator of match to InfiniteTechAI services. Requires website verification. |
| `Priority` | `priority` | String | `VARCHAR(64)` | No (0) | NOT NULL, INDEX | A, B (SEO), B (Test), C, Exclude | Strategic marketing channel priority designation. |
| `Research Confidence` | `research_confidence` | String | `VARCHAR(128)` | No (0) | — | Uniformly "Medium — rule-based..." | Confidence grade of keyword categorization. |
| `Recommended Action` | `recommended_action` | String | `TEXT` | No (0) | — | 9 action strings | Operational guidance for paid search / SEO deployment. |
| `Keyword` | `keyword_duplicate` | String | `TEXT` | No (0) | — | Matches Original Keyword | Redundant keyword column in source. Preserved in raw layer. |
| `Currency` | `currency` | String | `VARCHAR(8)` | No (0) | DEFAULT 'INR' | Uniformly `INR` | Currency unit for advertising auction bid values. |
| `Avg. monthly searches` | `avg_monthly_searches` | Integer | `INTEGER` | No (0) | NOT NULL | 5,000 – 50,000 | Historical monthly search volume from Google Keyword Planner. |
| `Three month change` | `three_month_change` | String | `VARCHAR(16)` | No (0) | — | `0%`, `+20%`, etc. | Search volume velocity over the trailing 90 days. |
| `YoY change` | `yoy_change` | String | `VARCHAR(16)` | No (0) | — | `0%`, etc. | Year-over-year search volume trend. |
| `Competition` | `competition` | String | `VARCHAR(16)` | No (0) | — | `Low`, `Medium`, `High` | Google Ads advertiser density rating. |
| `Competition (indexed value)` | `competition_indexed_value` | Integer | `SMALLINT` | No (0) | CHECK (val BETWEEN 0 AND 100) | 0–100 | Quantitative competition index from Google Ads. |
| `Top of page bid (low range)` | `top_of_page_bid_low` | Float | `NUMERIC(10, 2)` | Yes (363 nulls) | — | 0.00 – 400.00+ | Minimum bid for first-page ad positioning in INR. Nullable. |
| `Top of page bid (high range)` | `top_of_page_bid_high` | Float | `NUMERIC(10, 2)` | Yes (363 nulls) | — | 0.00 – 1200.00+ | Maximum bid for top-of-page ad positioning in INR. Nullable. |

---

### 2.2 Table: `clusters`
*Source: `InfinitetechAI_Keyword_Intent_Analysis.xlsx` → Sheet: `Clusters` (13 rows) & `Google_Ads_Plan.xlsx` → `Cluster Strategy`*

| Source Column Name | Target Column Name | Source Type | Target DB Type | Nullable (Null Count) | Constraints | Business Definition |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Cluster Name` | `cluster_name` | String | `VARCHAR(64)` | No (0) | Primary Key | The canonical name of the keyword cluster. Primary classification key. |
| `Keyword Count` | `keyword_count` | Integer | `INTEGER` | No (0) | — | Total keywords belonging to this cluster in the CEO dataset. |
| `Common Intent` | `common_intent` | String | `VARCHAR(64)` | No (0) | — | The predominant search intent observed across keywords in the cluster. |
| `Target Persona (hypothesis)` | `target_persona` | String | `TEXT` | No (0) | — | The primary target customer role for this cluster. Hypothesis. |
| `Main Pain Point (hypothesis)` | `main_pain_point` | String | `TEXT` | No (0) | — | The core operational or business struggle addressed by this cluster. |
| `Service Fit` | `service_fit_guidance` | String | `TEXT` | No (0) | — | Guidance: "Validate on official company website before making claims". |
| `Primary Channel` | `primary_channel` | String | `VARCHAR(128)` | No (0) | — | Recommended promotional medium (Search, SEO, Social). |
| `Landing Page Topic` | `landing_page_topic` | String | `VARCHAR(128)` | No (0) | — | Target subject matter for the cluster's landing page. |
| `CTA` | `default_cta` | String | `VARCHAR(128)` | No (0) | — | Default call-to-action phrase recommended for this cluster. |
| `Paid Search Suitability` | `paid_search_suitability` | String | `TEXT` | No (0) | — | Guidelines on bidding and match types for PPC campaigns. |
| `Organic Content Suitability` | `organic_suitability` | String | `TEXT` | No (0) | — | Guidelines on editorial SEO content creation. |
| `Priority` | `cluster_priority` | String | `VARCHAR(64)` | No (0) | — | Overall strategic importance rating (A, B, C, Exclude). |

---

### 2.3 Table: `source_headlines`
*Source: `InfinitetechAI_Social_SEO_Content.xlsx` → Sheet: `Headlines 10 per KW` (38,160 rows)*

| Source Column Name | Target Column Name | Source Type | Target DB Type | Nullable (Null Count) | Constraints | Business Definition & Validation Rules |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Keyword ID` | `keyword_id` | String | `VARCHAR(32)` | No (0) | FK to `keywords.keyword_id` | Foreign key referencing the parent keyword. Verified 100% match. |
| `Keyword` | `keyword_text` | String | `TEXT` | No (0) | — | Keyword text associated with headline. |
| `Headline ID` | `headline_id` | String | `VARCHAR(32)` | No (0) | Primary Key | Unique headline identifier (`KW00001-H01` to `KW03816-H10`). |
| `Headline Draft` | `headline_draft` | String | `TEXT` | No (0) | NOT NULL | Draft headline generated for marketing and poster inspiration. Template draft. |
| `Marketing Angle` | `marketing_angle` | String | `VARCHAR(64)` | No (0) | NOT NULL, INDEX | One of 10 angles: Pain point, Outcome, Efficiency, Automation, Scale, etc. |
| `Target Persona` | `target_persona` | String | `TEXT` | No (0) | — | Target persona for this specific headline draft. |
| `Funnel Stage` | `funnel_stage` | String | `VARCHAR(64)` | No (0) | — | Stage: `Decision`, `Consideration`, or `Awareness`. |
| `Recommended Channel` | `recommended_channel` | String | `VARCHAR(128)` | No (0) | — | Recommended usage channel: "Social/SEO draft; adapt for Google Ads". |
| `CTA` | `call_to_action` | String | `VARCHAR(128)` | No (0) | — | Call to action (e.g., "Request a custom quote", "Explore the right solution"). |
| `Google Ads 30-char version`| `google_ads_30_char` | String | `VARCHAR(30)` | No (0) | CHECK (LENGTH <= 30) | Condensed version strictly adhering to 30 character limit. |
| `Original Character Count` | `original_char_count` | Integer | `SMALLINT` | No (0) | — | Exact character count of the original draft headline. |
| `Google Ads Character Count`| `google_ads_char_count` | Integer | `SMALLINT` | No (0) | CHECK (val <= 30) | Exact character count of 30-char version (verified <= 30). |
| `Note` | `disclaimer_note` | String | `TEXT` | No (0) | — | Standard caveat: "Draft generated from a template; human review required." |

---

### 2.4 Table: `social_content`
*Source: `InfinitetechAI_Social_SEO_Content.xlsx` → Sheet: `Social Content` (78 rows)*

| Source Column Name | Target Column Name | Source Type | Target DB Type | Nullable (Null Count) | Constraints | Business Definition |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Content ID` | `source_content_id` | String | `VARCHAR(32)` | No (0) | Composite PK (with Platform) | Source ID (`SOC001`–`SOC013`). **Repeated 6 times per cluster.** |
| `Keyword Cluster` | `keyword_cluster` | String | `VARCHAR(64)` | No (0) | FK to `clusters.cluster_name` | The thematic cluster associated with the post. |
| `Platform` | `platform` | String | `VARCHAR(32)` | No (0) | Composite PK (with Content ID)| Target network: LinkedIn, Instagram, Facebook, X, Quora, Pinterest. |
| `Headline` | `headline` | String | `TEXT` | No (0) | NOT NULL | Social post header or hook text. |
| `Copy` | `body_copy` | String | `TEXT` | No (0) | NOT NULL | Body narrative, framework, or discussion text. |
| `CTA` | `call_to_action` | String | `VARCHAR(128)` | No (0) | — | Action link or inquiry prompt. |
| `Format` | `post_format` | String | `VARCHAR(64)` | No (0) | — | Content type (Carousel, Static poster, Infographic, Text). |
| `Hashtags` | `hashtags` | String | `TEXT` | **Yes (13 nulls)** | Null for Quora | Hashtag metadata list. Nullable by design for platforms without hashtags. |
| `Destination URL` | `destination_url` | String | `VARCHAR(256)` | No (0) | — | Target URL: `https://www.infinitetechai.com/`. |
| `Status` | `review_status` | String | `VARCHAR(128)` | No (0) | — | Publishing readiness flag and service verification warnings. |

---

### 2.5 Table: `content_calendar`
*Source: `InfinitetechAI_Social_SEO_Content.xlsx` → Sheet: `30 Day Calendar` (30 rows)*

| Source Column Name | Target Column Name | Source Type | Target DB Type | Nullable (Null Count) | Constraints | Business Definition |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Day` | `calendar_day` | Integer | `SMALLINT` | No (0) | Primary Key / Unique | Day index (1 to 30) of editorial campaign schedule. |
| `Content ID` | `calendar_content_id` | String | `VARCHAR(32)` | No (0) | Unique | `CAL01` through `CAL30`. Distinct from `SOC` series. |
| `Keyword Cluster` | `keyword_cluster` | String | `VARCHAR(64)` | No (0) | FK to `clusters.cluster_name` | The topic cluster featured on this calendar day. |
| `Platform` | `platform` | String | `VARCHAR(32)` | No (0) | — | Primary platform allocated for this day's publication. |
| `Topic` | `topic` | String | `TEXT` | No (0) | — | Educational or promotional subject matter. |
| `Headline` | `headline` | String | `TEXT` | No (0) | — | Working post headline. |
| `Format` | `format` | String | `VARCHAR(64)` | No (0) | — | Format type (Text post, Carousel, etc.). |
| `CTA` | `call_to_action` | String | `VARCHAR(128)` | No (0) | — | Call to action. |
| `Objective` | `objective` | String | `VARCHAR(128)` | No (0) | — | Marketing objective (e.g., "Education and qualified enquiry"). |
| `Funnel Stage` | `funnel_stage` | String | `VARCHAR(64)` | No (0) | — | Stage: "Awareness / consideration". |
| `Repurpose` | `repurpose_instructions` | String | `TEXT` | No (0) | — | Guidelines on adapting copy for secondary platforms without duplicate posting. |

---

### 2.6 Table: `seo_landing_pages`
*Source: `InfinitetechAI_Social_SEO_Content.xlsx` → Sheet: `SEO Landing Pages` (13 rows)*

| Source Column Name | Target Column Name | Source Type | Target DB Type | Nullable (Null Count) | Constraints | Business Definition |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Page ID` | `page_id` | String | `VARCHAR(32)` | No (0) | Primary Key | `SEO001` through `SEO013`. Unique identifier. |
| `Cluster` | `keyword_cluster` | String | `VARCHAR(64)` | No (0) | FK to `clusters.cluster_name`, Unique | The 1-to-1 cluster associated with this landing page. |
| `Primary Keyword Theme` | `keyword_theme` | String | `VARCHAR(128)` | No (0) | — | High-level focus keyword theme. |
| `Page Type` | `page_type` | String | `VARCHAR(128)` | No (0) | — | Conditional guidance: "Service page only if service is verified..." |
| `SEO Title` | `seo_title` | String | `VARCHAR(256)` | No (0) | — | HTML title tag draft. |
| `Meta Description` | `meta_description` | String | `TEXT` | No (0) | — | Meta description tag draft. |
| `H1` | `h1_heading` | String | `VARCHAR(256)` | No (0) | — | Suggested H1 primary heading. |
| `Suggested Slug` | `suggested_slug` | String | `VARCHAR(128)` | No (0) | — | URL slug path (e.g., `custom-software-development`). |
| `Sections` | `page_sections` | String | `TEXT` | No (0) | — | Outline of page structure and content modules. |
| `FAQ Ideas` | `faq_ideas` | String | `TEXT` | No (0) | — | Frequently asked questions for schema markup. |
| `Internal Links` | `internal_links` | String | `TEXT` | No (0) | — | Internal linking recommendations. |
| `CTA` | `call_to_action` | String | `VARCHAR(128)` | No (0) | — | Lead conversion CTA. |
| `Caution` | `caution_caveat` | String | `TEXT` | No (0) | — | Strict warning: "Service and capability claims must be checked..." |

---

### 2.7 Table: `campaign_shortlist`
*Source: `InfinitetechAI_Google_Ads_Plan.xlsx` → Sheet: `Campaign Shortlist` (487 rows)*

| Source Column Name | Target Column Name | Source Type | Target DB Type | Nullable (Null Count) | Constraints | Business Definition |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Keyword ID` | `keyword_id` | String | `VARCHAR(32)` | No (0) | Primary Key, FK to `keywords.keyword_id` | Keyword identifier. Matches Priority A (418) + Priority B Test (69). |
| `Original Keyword` | `original_keyword` | String | `TEXT` | No (0) | — | Keyword search phrase. |
| `Keyword Cluster` | `keyword_cluster` | String | `VARCHAR(64)` | No (0) | FK to `clusters.cluster_name` | Thematic cluster. |
| `Primary Intent (estimated)` | `primary_intent_estimated` | String | `VARCHAR(64)` | No (0) | — | Estimated intent. |
| `Priority` | `priority` | String | `VARCHAR(64)` | No (0) | — | Priority status: 'A — Paid-search candidate' or 'B — Test / validate'. |
| `Avg. monthly searches` | `avg_monthly_searches` | Integer | `INTEGER` | No (0) | — | Monthly search volume. |
| `Competition` | `competition` | String | `VARCHAR(16)` | No (0) | — | Competition tier (Low/Medium/High). |
| `Competition (indexed value)` | `competition_indexed_value` | Integer | `SMALLINT` | No (0) | — | Indexed value 0–100. |
| `Top of page bid (low range)` | `top_of_page_bid_low` | Float | `NUMERIC(10, 2)` | **Yes (28 nulls)** | — | Low range bid in INR. Nullable. |
| `Top of page bid (high range)` | `top_of_page_bid_high` | Float | `NUMERIC(10, 2)` | **Yes (28 nulls)** | — | High range bid in INR. Nullable. |
| `Suggested Ad Group` | `suggested_ad_group` | String | `VARCHAR(64)` | No (0) | — | Target Google Ads ad group categorization. |
| `Recommended Match Type` | `recommended_match_type` | String | `VARCHAR(128)` | No (0) | — | Strategy: "Exact and phrase initially; broaden only after search-term review". |
| `Negative Keyword Ideas` | `negative_keyword_ideas` | String | `TEXT` | No (0) | — | Negative keywords list (jobs, salary, free, etc.). |
| `Landing Page Recommendation`| `landing_page_recommendation` | String | `TEXT` | No (0) | — | Destination page alignment guidelines. |
| `Conversion Recommendation` | `conversion_recommendation` | String | `TEXT` | No (0) | — | Recommended conversion tracking goals. |
