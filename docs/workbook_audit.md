# InfiniteTechAI — Workbook Audit Report
**Phase 0: Source Data Inspection & Integrity Analysis**  
*Date: 2026-10-26 | Auditor: Senior Data Architect & System Engineer*

---

## 1. Executive Summary

This workbook audit provides a comprehensive, empirical examination of the three source Excel workbooks supplied for the InfiniteTechAI AI Poster Generation Platform:
1. `InfinitetechAI_Keyword_Intent_Analysis.xlsx` (497,330 bytes)
2. `InfinitetechAI_Social_SEO_Content.xlsx` (2,404,066 bytes)
3. `InfinitetechAI_Google_Ads_Plan.xlsx` (188,553 bytes)

The inspection was executed using read-only automated scripts in Python (`openpyxl` and `pandas`). **No modifications, updates, or overwrites were performed on the source files.**

### Verified Source Checksums & Baseline Fingerprints
The following cryptographic SHA-256 hashes represent the approved baseline source workbooks:
- **`InfinitetechAI_Keyword_Intent_Analysis.xlsx`**: `b357fb7bc934cd187387fad3c3308b9aabc1a3d21e0ffd9a65843cff577e6d5a` (497,330 bytes)
- **`InfinitetechAI_Social_SEO_Content.xlsx`**: `cf16e84e9b990ea628da54a72d1d8ac19c1674902175b8b85331d63b1c929a74` (2,404,066 bytes)
- **`InfinitetechAI_Google_Ads_Plan.xlsx`**: `8be979b2a62afee03c702dfe2461905a96f5210507591a70559e020802835efa` (188,553 bytes)

### Key Audit Findings Matrix

| Workbook | Sheet Name | Row Count | Column Count | Primary Key / Identifier | Relational Anchor | Status & Integrity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Keyword Intent Analysis** | `Dataset Summary` | 14 | 2 | `Metric` | N/A (Metadata) | Validated source metadata |
| | `Master Intent` | 3,816 | 25 | `Keyword ID` (`KW00001`–`KW03816`) | Core Primary Entity | 100% unique IDs; 0 ID nulls; 363 bid nulls |
| | `Clusters` | 13 | 12 | `Cluster Name` | Cluster Entity | 13 taxonomy clusters |
| | `Duplicate Rows` | 0 | 9 | N/A | Audit check | 0 duplicate rows found in source export |
| **Social SEO Content** | `Social Content` | 78 | 10 | Composite: `(Content ID, Platform)` | `Keyword Cluster` | 13 unique `Content ID`s (`SOC001`–`SOC013`) across 6 platforms |
| | `30 Day Calendar` | 30 | 11 | `Day` / `Content ID` (`CAL01`–`CAL30`) | `Keyword Cluster` | 30 editorial days; distinct ID namespace |
| | `SEO Landing Pages` | 13 | 13 | `Page ID` (`SEO001`–`SEO013`) | `Cluster` (1:1 with Cluster) | 13 cluster pages; universal caution note |
| | `Headlines 10 per KW` | 38,160 | 13 | `Headline ID` (`KW00001-H01`–`KW03816-H10`) | `Keyword ID` (FK to Master Intent) | 100% referential integrity; exactly 10 headlines/KW |
| **Google Ads Plan** | `Campaign Shortlist` | 487 | 15 | `Keyword ID` | `Keyword ID` (FK to Master Intent) | 418 Priority A + 69 Priority B (Test/Validate); 28 bid nulls |
| | `Master Intent` | 3,816 | 6 | `Keyword ID` | Subset of Master Intent | Exact 6-column subset of primary Master Intent |
| | `Cluster Strategy` | 13 | 12 | `Cluster Name` | 1:1 with Clusters sheet | Exact identical duplicate of `Clusters` |

---

## 2. Source Workbook Detailed Inspections

### 2.1 Workbook 1: `InfinitetechAI_Keyword_Intent_Analysis.xlsx`

#### Sheet: `Dataset Summary`
- **Dimensions**: 14 rows × 2 columns (`Metric`, `Value`).
- **Purpose**: Records the provenance and engineering notes from the initial keyword clustering pipeline.
- **Key Recorded Metadata**:
  - Source file: `Google_Ads_Keywords_Deduplicated(1).csv`
  - Input rows: 3,816 (with 0 duplicate rows).
  - Clusters: 13 distinct thematic clusters.
  - Prioritization split:
    - Priority A (Paid-search candidates): 418
    - Priority B (SEO or controlled test / validate): 1,127 (1,058 SEO + 69 Test)
    - Priority C (Isolated / peripheral): 499
    - Exclude or review: 1,772
  - Headline drafts generated: 38,160.
  - **Explicit Method Warnings**:
    - *Method note*: "Intent/persona/priority labels are rule-based hypotheses, not verified live search behavior."
    - *Service validation*: "The supplied brief lists possible services but says to verify them. All service claims and landing pages require confirmation against the official website."
    - *Social scope*: "Platform content is organized by keyword cluster rather than six promotional posts for every keyword, to avoid repetitive low-quality publishing."

#### Sheet: `Master Intent`
- **Dimensions**: 3,816 rows × 25 columns.
- **Primary Key**: `Keyword ID`. Format: `KW00001` through `KW03816`.
  - Uniqueness: 3,816 unique values across 3,816 rows (100% unique, 0 nulls).
- **Keyword Text Columns Analysis**:
  - `Original Keyword`: 3,816 rows, string.
  - `Normalized Keyword`: 3,816 rows, string.
  - `Keyword`: 3,816 rows, string.
  - *Inspection result*: In all 3,816 rows, `Original Keyword == Normalized Keyword == Keyword`. There are zero discrepancies between these three columns.
- **Categorical & Hypothesis Fields**:
  - `Keyword Cluster` (13 unique values):
    - `Other / Review`: 1,864
    - `AI & Machine Learning`: 846
    - `Cloud & DevOps`: 419
    - `Mobile App Development`: 158
    - `Business Software & Integrations`: 123
    - `Custom Software Development`: 114
    - `Website & Web App Development`: 104
    - `Data Analytics & BI`: 92
    - `Chatbots & Customer Support AI`: 47
    - `Generative AI`: 22
    - `API & Integrations`: 18
    - `Computer Vision`: 5
    - `AI Agents`: 4
  - `Primary Intent (estimated)` (9 categories):
    - `Irrelevant or low relevance / unclear`: 1,772
    - `Problem-aware / mixed intent`: 1,058
    - `Transactional / commercial investigation`: 418
    - `Consumer or personal use`: 169
    - `Navigational / third-party brand`: 167
    - `Informational`: 131
    - `Commercial investigation`: 49
    - `Employment or education`: 32
    - `Commercial investigation / possible integration`: 20
  - `Secondary Intent` (2 categories):
    - `None assigned without further evidence`: 2,627
    - `Commercial investigation possible`: 1,189
  - `Buying Stage` (3 categories):
    - `Awareness / non-buying or unclear`: 2,271
    - `Consideration`: 1,127
    - `Decision`: 418
  - `Business Relevance Score (1-5)`: Integers 1 to 5.
  - `Commercial Intent Score (1-5)`: Integers 1 to 5.
  - `Service Fit`:
    - `Potential fit; verify against official service pages`: 1,952
    - `Unverified / review`: 1,864
  - `Priority` (5 categories):
    - `Exclude or review`: 1,772
    - `B — SEO or controlled test`: 1,058
    - `C / Isolate`: 499
    - `A — Paid-search candidate`: 418
    - `B — Test / validate`: 69
  - `Research Confidence`:
    - `Medium — rule-based keyword inference; not verified live SERP behavior`: 3,816 (100%)
- **Numeric & Advertising Metrics**:
  - `Currency`: `INR` (100% of rows).
  - `Avg. monthly searches`: Range 5,000 to 50,000.
  - `Three month change`: Strings formatted as percentage (e.g., `0%`, `+20%`).
  - `YoY change`: Strings formatted as percentage (e.g., `0%`).
  - `Competition`: Categorical (`Low`, `Medium`, `High`).
  - `Competition (indexed value)`: Integers 0–100.
  - `Top of page bid (low range)`: Float (INR). **363 missing/null values**.
  - `Top of page bid (high range)`: Float (INR). **363 missing/null values**.

#### Sheet: `Clusters`
- **Dimensions**: 13 rows × 12 columns.
- **Primary Key**: `Cluster Name`.
- **Fields**: `Cluster Name`, `Keyword Count`, `Common Intent`, `Target Persona (hypothesis)`, `Main Pain Point (hypothesis)`, `Service Fit`, `Primary Channel`, `Landing Page Topic`, `CTA`, `Paid Search Suitability`, `Organic Content Suitability`, `Priority`.
- **Finding**: Complete coverage of all 13 clusters with 0 nulls.

#### Sheet: `Duplicate Rows`
- **Dimensions**: 0 rows × 9 columns.
- **Finding**: Empty sheet. Corresponds with `Dataset Summary` metric `Duplicate rows found in this input : 0`.

---

### 2.2 Workbook 2: `InfinitetechAI_Social_SEO_Content.xlsx`

#### Sheet: `Social Content`
- **Dimensions**: 78 rows × 10 columns.
- **Identifier Analysis**:
  - Column `Content ID`: Contains values `SOC001` through `SOC013`.
  - **CRITICAL FINDING**: `Content ID` is **NOT globally unique per row**. Each ID is repeated across 6 platforms for a given cluster ($13 \times 6 = 78$ rows).
  - The true composite candidate key is `(Content ID, Platform)` or `(Keyword Cluster, Platform)`.
- **Platforms**: LinkedIn (13), Instagram (13), Facebook (13), X (13), Quora (13), Pinterest (13).
- **Missing Values**:
  - `Hashtags`: Exactly 13 null values, all corresponding to the `Quora` platform where hashtags are deliberately omitted.
  - All other columns have 0 nulls.
- **Review Warnings / Status**:
  - `Draft; validate service availability and destination page` (39 rows)
  - `Draft; review before publishing` (13 rows)
  - `Publish only in response to a genuine question` (13 rows — Quora)
  - `Draft; verify page relevance` (13 rows)
  - Destination URL: Uniformly `https://www.infinitetechai.com/`.

#### Sheet: `30 Day Calendar`
- **Dimensions**: 30 rows × 11 columns.
- **Identifier Analysis**:
  - `Day`: Integers 1 to 30 (unique).
  - `Content ID`: Values `CAL01` through `CAL30` (unique).
  - **Relational Finding**: Content IDs here (`CAL01`–`CAL30`) **do NOT join to `Social Content` (`SOC001`–`SOC013`)**. They represent a distinct editorial schedule covering cluster topics day-by-day.
- **Data Quality**: 0 nulls across all 11 columns.

#### Sheet: `SEO Landing Pages`
- **Dimensions**: 13 rows × 13 columns.
- **Primary Key**: `Page ID`. Format: `SEO001` through `SEO013`.
- **Relationship**: 1-to-1 relationship with the 13 clusters via the `Cluster` column.
- **Universal Caution Note**:
  - Every single row (13 of 13) contains the explicit caveat in `Caution`:
    > *"Service and capability claims must be checked against the official website before publication"*
- **Data Quality**: 0 nulls across all 13 columns.

#### Sheet: `Headlines 10 per KW`
- **Dimensions**: 38,160 rows × 13 columns.
- **Identifier Analysis**:
  - `Headline ID`: Values `KW00001-H01` through `KW03816-H10`. 38,160 unique IDs (100% unique, 0 nulls).
  - `Keyword ID`: Exactly 3,816 distinct keyword IDs, matching the primary `Master Intent` sheet with 100% parity.
  - Cardinality: Exactly 10 headlines per keyword for all 3,816 keywords ($3,816 \times 10 = 38,160$).
- **Marketing Angles (Uniform Coverage)**:
  Every keyword has exactly one headline for each of the 10 defined marketing angles:
  1. `Pain point`
  2. `Outcome`
  3. `Efficiency`
  4. `Automation`
  5. `Scale`
  6. `Competitive advantage`
  7. `Control`
  8. `Industry use case`
  9. `Discovery`
  10. `Consultation`
- **Character Count Verification**:
  - `Google Ads 30-char version`: All 38,160 rows have been pre-truncated/condensed.
  - Max `Google Ads Character Count`: 30 characters.
  - Violations (> 30 chars): **0**.
- **Review Caveat Note**:
  - Every single row contains the exact note:
    > *"Draft generated from a template; human review required. Do not use automatically as final ad copy."*

---

### 2.3 Workbook 3: `InfinitetechAI_Google_Ads_Plan.xlsx`

#### Sheet: `Campaign Shortlist`
- **Dimensions**: 487 rows × 15 columns.
- **Primary Key**: `Keyword ID`. All 487 values are unique and exist in `Master Intent`.
- **Selection Logic Verified**:
  - Exactly corresponds to `Master Intent` rows where:
    - `Priority == 'A — Paid-search candidate'` (418 rows)
    - `Priority == 'B — Test / validate'` (69 rows)
    - Total = $418 + 69 = 487$ rows.
- **Ad Groups & Clusters**: Distributed across 12 clusters (excludes `Other / Review` as a targeted ad group; clustered under specific themes).
- **Missing Values**:
  - `Top of page bid (low range)`: 28 nulls.
  - `Top of page bid (high range)`: 28 nulls.
  - All other columns have 0 nulls.

#### Sheet: `Master Intent`
- **Dimensions**: 3,816 rows × 6 columns.
- **Columns**: `Keyword ID`, `Original Keyword`, `Keyword Cluster`, `Primary Intent (estimated)`, `Priority`, `Recommended Action`.
- **Finding**: Exact 6-column projection of the `Master Intent` sheet from `InfinitetechAI_Keyword_Intent_Analysis.xlsx`. Row order and IDs are identical.

#### Sheet: `Cluster Strategy`
- **Dimensions**: 13 rows × 12 columns.
- **Finding**: Exact identical duplicate of the `Clusters` sheet from `InfinitetechAI_Keyword_Intent_Analysis.xlsx`.

---

## 3. Entity-Relationship & Joinability Verification

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Master Intent (3,816)                           │
│  PK: Keyword ID [KW00001 - KW03816]                                    │
│  Attributes: Keyword text, intent, buying stage, scores, bids, INR     │
└──────────────┬──────────────────────────────────────────┬──────────────┘
               │ 1:10                                     │ 1:1 (subset 487)
               ▼                                          ▼
┌─────────────────────────────────┐      ┌───────────────────────────────┐
│     Headlines 10 per KW         │      │      Campaign Shortlist       │
│  PK: Headline ID (KWxxxxx-Hxx)  │      │  PK: Keyword ID               │
│  FK: Keyword ID                 │      │  FK: Keyword ID               │
│  Attributes: Angle, Persona,    │      │  Attributes: Ad Group, Match, │
│  Draft, CTA, 30-char version    │      │  Negatives, Landing Page      │
└─────────────────────────────────┘      └───────────────────────────────┘

               ▲ Joined via Keyword Cluster
               │
┌──────────────┴─────────────────────────────────────────────────────────┐
│                          Clusters (13)                                 │
│  PK: Cluster Name (e.g., "Custom Software Development", ...)           │
│  Attributes: Persona, Pain point, Channels, CTA, Suitability           │
└──────┬──────────────────────────┬───────────────────────────────┬──────┘
       │ 1:6                      │ 1:1                           │ 1:N
       ▼                          ▼                               ▼
┌──────────────────────────┐ ┌──────────────────────────┐ ┌──────────────┐
│     Social Content       │ │    SEO Landing Pages     │ │30 Day Cal    │
│  PK: (Content ID, Plat.) │ │  PK: Page ID (SEO001..)  │ │PK: Day / CAL │
│  FK: Keyword Cluster     │ │  FK: Cluster             │ │FK: Cluster   │
│  13 IDs x 6 platforms    │ │  13 cluster pages        │ │30 sched days │
└──────────────────────────┘ └──────────────────────────┘ └──────────────┘
```

### Relational Findings & Constraints:
1. **Primary Join Anchor**: `Keyword ID` is completely reliable, 100% unique, and verified across all workbooks (`Master Intent`, `Headlines 10 per KW`, `Campaign Shortlist`).
2. **Cluster Join Anchor**: `Keyword Cluster` (or `Cluster Name`) provides clean foreign key mapping between keywords and marketing cluster strategies, SEO landing pages, and social content.
3. **ID Non-Uniqueness Trap**:
   - `Content ID` in `Social Content` (`SOC001`–`SOC013`) cannot serve as a single-column primary key. In a relational database, it must either be paired with `Platform` as a composite key or assigned a surrogate UUID/serial key while preserving `content_id` and `platform`.
   - `Content ID` in `30 Day Calendar` (`CAL01`–`CAL30`) belongs to a completely separate sequence from `SOC001`–`SOC013`.

---

## 4. Distinction Between Verified Facts vs. Hypotheses

To maintain documentation integrity and comply with Section 4 of the project brief, the system must explicitly separate verified facts from heuristic estimates:

| Category | Field / Element | Source Designation | Verification Status in Application |
| :--- | :--- | :--- | :--- |
| **Verified Fact** | `Keyword ID`, `Original Keyword` | Raw data input | Immutable truth; never modify or regenerate. |
| **Verified Fact** | `Avg. monthly searches`, `Competition`, `Bids` | Google Keyword Planner | Historical telemetry; treat as reference metrics. |
| **Verified Fact** | `Google Ads 30-char version` | Character counted copy | Length verified; <= 30 chars. |
| **Hypothesis** | `Primary Intent (estimated)` | Rule-based tag | **Hypothesis**: Must be re-evaluated and expanded into 20+ validated intents by LLM. |
| **Hypothesis** | `Searcher Persona (hypothesis)` | Rule-based tag | **Hypothesis**: Persona assumption to guide framing, not confirmed user identity. |
| **Hypothesis** | `Business Problem (hypothesis)` | Rule-based tag | **Hypothesis**: Baseline problem space for poster copy inspiration. |
| **Draft Copy** | `Headline Draft` | Template generated | **Draft**: Requires human review; not approved marketing truth. |
| **Service Claim** | `Service Fit`, Capabilities | Marketing draft | **Unverified**: Must NOT be treated as verified company offerings without human confirmation. |

---

## 5. Data Quality & Risk Register

1. **Missing Bid Data**:
   - 363 rows in `Master Intent` and 28 rows in `Campaign Shortlist` lack low/high bid values.
   - *Resolution*: DB columns must be nullable `NUMERIC(10, 2)`. Application UI must gracefully handle `N/A` bid display.
2. **Duplicate Sheets Across Workbooks**:
   - `InfinitetechAI_Google_Ads_Plan.xlsx` duplicates `Master Intent` (partially) and `Clusters` (identically).
   - *Resolution*: Importer must treat `InfinitetechAI_Keyword_Intent_Analysis.xlsx` as canonical for `Master Intent` and `Clusters`, avoiding duplicate insertion while auditing checksums.
3. **Unverified Service Claims Warning**:
   - All 13 SEO landing pages and all 38,160 headline drafts feature explicit review warnings.
   - *Resolution*: Poster generator must adhere strictly to approved product capabilities and provide an explicit human review stage before marking any generated poster as approved.
