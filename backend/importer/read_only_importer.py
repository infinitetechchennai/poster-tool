import os
import sys
import json
import hashlib
import psycopg2
from psycopg2.extras import execute_values, Json
import pandas as pd
import openpyxl

BASELINE_HASHES = {
    "InfinitetechAI_Keyword_Intent_Analysis.xlsx": "b357fb7bc934cd187387fad3c3308b9aabc1a3d21e0ffd9a65843cff577e6d5a",
    "InfinitetechAI_Social_SEO_Content.xlsx": "cf16e84e9b990ea628da54a72d1d8ac19c1674902175b8b85331d63b1c929a74",
    "InfinitetechAI_Google_Ads_Plan.xlsx": "8be979b2a62afee03c702dfe2461905a96f5210507591a70559e020802835efa"
}

DB_CONFIG = {
    "dbname": os.environ.get("PGDATABASE", "ai_img"),
    "user": os.environ.get("PGUSER", "postgres"),
    "password": os.environ.get("PGPASSWORD", "1234"),
    "host": os.environ.get("PGHOST", "localhost"),
    "port": os.environ.get("PGPORT", "5432")
}

def calculate_sha256(filepath):
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest()

def clean_val(val):
    if pd.isna(val) or val is None:
        return None
    if isinstance(val, (int, float, str, bool)):
        return val
    return str(val)

def run_import(base_dir=".", force=False):
    print("=== InfiniteTechAI Read-Only Ingestion & Normalization Pipeline ===")
    conn = psycopg2.connect(**DB_CONFIG)
    conn.autocommit = False
    cur = conn.cursor()

    reconciliation = {
        "timestamp": pd.Timestamp.now().isoformat(),
        "files": {},
        "tables": {},
        "integrity_checks": {},
        "status": "in_progress"
    }

    try:
        # Check files
        for fname, expected_hash in BASELINE_HASHES.items():
            fpath = os.path.join(base_dir, fname)
            if not os.path.exists(fpath):
                raise FileNotFoundError(f"Workbook {fname} not found at {fpath}")

            actual_hash = calculate_sha256(fpath)
            fsize = os.path.getsize(fpath)
            print(f"File: {fname} | Hash: {actual_hash[:16]}... | Size: {fsize} bytes")

            # Check if already imported
            cur.execute("""
                SELECT import_id, import_version, import_status 
                FROM source_imports 
                WHERE file_name = %s AND file_hash_sha256 = %s AND import_status = 'completed';
            """, (fname, actual_hash))
            existing = cur.fetchone()

            if existing and not force:
                print(f"-> File {fname} already imported (Import ID: {existing[0]}, v{existing[1]}). Skipping unchanged.")
                reconciliation["files"][fname] = {
                    "hash": actual_hash,
                    "status": "skipped_unchanged",
                    "import_id": str(existing[0]),
                    "version": existing[1]
                }
                continue

            # Determine new version
            cur.execute("""
                SELECT COALESCE(MAX(import_version), 0) + 1 
                FROM source_imports 
                WHERE file_name = %s;
            """, (fname,))
            next_version = cur.fetchone()[0]

            # Mark earlier versions as not latest
            cur.execute("""
                UPDATE source_imports SET is_latest = FALSE WHERE file_name = %s;
            """, (fname,))

            # Insert new import record
            cur.execute("""
                INSERT INTO source_imports (file_name, file_hash_sha256, file_size_bytes, import_version, is_latest, import_status)
                VALUES (%s, %s, %s, %s, TRUE, 'processing')
                RETURNING import_id;
            """, (fname, actual_hash, fsize, next_version))
            import_id = cur.fetchone()[0]

            reconciliation["files"][fname] = {
                "hash": actual_hash,
                "status": "imported",
                "import_id": str(import_id),
                "version": next_version
            }

            # --- Read sheets and store raw source_rows ---
            xl = pd.ExcelFile(fpath)
            for sname in xl.sheet_names:
                df = xl.parse(sname)
                print(f"  Ingesting Sheet: {sname} ({len(df)} rows)")
                raw_rows_data = []
                for idx, row in df.iterrows():
                    row_dict = {k: clean_val(v) for k, v in row.to_dict().items()}
                    row_json = json.dumps(row_dict, sort_keys=True)
                    row_hash = hashlib.sha256(row_json.encode('utf-8')).hexdigest()
                    raw_rows_data.append((
                        import_id, fname, sname, int(idx + 2), Json(row_dict), row_hash
                    ))

                if raw_rows_data:
                    execute_values(cur, """
                        INSERT INTO source_rows (import_id, workbook_name, sheet_name, source_row_number, raw_data, row_hash_sha256)
                        VALUES %s;
                    """, raw_rows_data)

            cur.execute("""
                UPDATE source_imports SET import_status = 'completed', sheet_count = %s 
                WHERE import_id = %s;
            """, (len(xl.sheet_names), import_id))

        # --- Normalize into Layer B (Idempotent Upserts) ---
        print("\n--- Normalizing into Layer B Tables ---")

        # 1. Clusters
        wb_f1 = os.path.join(base_dir, "InfinitetechAI_Keyword_Intent_Analysis.xlsx")
        clusters_df = pd.read_excel(wb_f1, sheet_name="Clusters")
        cluster_records = []
        for _, r in clusters_df.iterrows():
            cluster_records.append((
                clean_val(r["Cluster Name"]),
                int(r["Keyword Count"]),
                clean_val(r["Common Intent"]),
                clean_val(r["Target Persona (hypothesis)"]),
                clean_val(r["Main Pain Point (hypothesis)"]),
                clean_val(r["Service Fit"]),
                clean_val(r["Primary Channel"]),
                clean_val(r["Landing Page Topic"]),
                clean_val(r["CTA"]),
                clean_val(r["Paid Search Suitability"]),
                clean_val(r["Organic Content Suitability"]),
                clean_val(r["Priority"])
            ))
        execute_values(cur, """
            INSERT INTO clusters (
                cluster_name, keyword_count, common_intent, target_persona, main_pain_point,
                service_fit_guidance, primary_channel, landing_page_topic, default_cta,
                paid_search_suitability, organic_suitability, cluster_priority
            ) VALUES %s
            ON CONFLICT (cluster_name) DO UPDATE SET
                keyword_count = EXCLUDED.keyword_count,
                common_intent = EXCLUDED.common_intent,
                target_persona = EXCLUDED.target_persona,
                main_pain_point = EXCLUDED.main_pain_point,
                updated_at = NOW();
        """, cluster_records)
        print(f"Upserted {len(cluster_records)} clusters.")

        # 2. Keywords
        master_df = pd.read_excel(wb_f1, sheet_name="Master Intent")
        kw_records = []
        for _, r in master_df.iterrows():
            bid_low = clean_val(r["Top of page bid (low range)"])
            bid_high = clean_val(r["Top of page bid (high range)"])
            kw_records.append((
                clean_val(r["Keyword ID"]),
                clean_val(r["Original Keyword"]),
                clean_val(r["Keyword Cluster"]),
                clean_val(r["Primary Intent (estimated)"]),
                clean_val(r["Secondary Intent"]),
                clean_val(r["Searcher Persona (hypothesis)"]),
                clean_val(r["Business Problem (hypothesis)"]),
                clean_val(r["Likely Industry"]),
                clean_val(r["Buying Stage"]),
                int(r["Business Relevance Score (1-5)"]),
                int(r["Commercial Intent Score (1-5)"]),
                clean_val(r["Service Fit"]),
                clean_val(r["Priority"]),
                clean_val(r["Research Confidence"]),
                clean_val(r["Recommended Action"]),
                clean_val(r["Currency"]),
                int(r["Avg. monthly searches"]),
                clean_val(r["Three month change"]),
                clean_val(r["YoY change"]),
                clean_val(r["Competition"]),
                int(r["Competition (indexed value)"]),
                float(bid_low) if bid_low is not None else None,
                float(bid_high) if bid_high is not None else None
            ))
        execute_values(cur, """
            INSERT INTO keywords (
                keyword_id, keyword_text, cluster_name, primary_intent_estimated, secondary_intent,
                searcher_persona, business_problem, likely_industry, buying_stage,
                business_relevance_score, commercial_intent_score, service_fit, priority,
                research_confidence, recommended_action, currency, avg_monthly_searches,
                three_month_change, yoy_change, competition_tier, competition_indexed,
                bid_low_range, bid_high_range
            ) VALUES %s
            ON CONFLICT (keyword_id) DO UPDATE SET
                keyword_text = EXCLUDED.keyword_text,
                cluster_name = EXCLUDED.cluster_name,
                primary_intent_estimated = EXCLUDED.primary_intent_estimated,
                priority = EXCLUDED.priority,
                avg_monthly_searches = EXCLUDED.avg_monthly_searches,
                updated_at = NOW();
        """, kw_records)
        print(f"Upserted {len(kw_records)} keywords.")

        # 3. Headlines
        wb_f2 = os.path.join(base_dir, "InfinitetechAI_Social_SEO_Content.xlsx")
        head_df = pd.read_excel(wb_f2, sheet_name="Headlines 10 per KW")
        head_records = []
        for _, r in head_df.iterrows():
            head_records.append((
                clean_val(r["Headline ID"]),
                clean_val(r["Keyword ID"]),
                clean_val(r["Headline Draft"]),
                clean_val(r["Marketing Angle"]),
                clean_val(r["Target Persona"]),
                clean_val(r["Funnel Stage"]),
                clean_val(r["Recommended Channel"]),
                clean_val(r["CTA"]),
                clean_val(r["Google Ads 30-char version"]),
                int(r["Original Character Count"]),
                int(r["Google Ads Character Count"]),
                clean_val(r["Note"])
            ))
        execute_values(cur, """
            INSERT INTO source_headlines (
                headline_id, keyword_id, headline_draft, marketing_angle, target_persona,
                funnel_stage, recommended_channel, call_to_action, google_ads_30_char,
                original_char_count, google_ads_char_count, disclaimer_note
            ) VALUES %s
            ON CONFLICT (headline_id) DO UPDATE SET
                headline_draft = EXCLUDED.headline_draft,
                google_ads_30_char = EXCLUDED.google_ads_30_char;
        """, head_records)
        print(f"Upserted {len(head_records)} headlines.")

        # 4. Social Content
        social_df = pd.read_excel(wb_f2, sheet_name="Social Content")
        social_records = []
        for _, r in social_df.iterrows():
            social_records.append((
                clean_val(r["Content ID"]),
                clean_val(r["Keyword Cluster"]),
                clean_val(r["Platform"]),
                clean_val(r["Headline"]),
                clean_val(r["Copy"]),
                clean_val(r["CTA"]),
                clean_val(r["Format"]),
                clean_val(r["Hashtags"]),
                clean_val(r["Destination URL"]),
                clean_val(r["Status"])
            ))
        execute_values(cur, """
            INSERT INTO social_content (
                source_content_id, cluster_name, platform, headline, body_copy,
                call_to_action, post_format, hashtags, destination_url, review_status
            ) VALUES %s
            ON CONFLICT (source_content_id, platform) DO UPDATE SET
                headline = EXCLUDED.headline,
                body_copy = EXCLUDED.body_copy,
                review_status = EXCLUDED.review_status;
        """, social_records)
        print(f"Upserted {len(social_records)} social posts.")

        # 5. Content Calendar
        cal_df = pd.read_excel(wb_f2, sheet_name="30 Day Calendar")
        cal_records = []
        for _, r in cal_df.iterrows():
            cal_records.append((
                int(r["Day"]),
                clean_val(r["Content ID"]),
                clean_val(r["Keyword Cluster"]),
                clean_val(r["Platform"]),
                clean_val(r["Topic"]),
                clean_val(r["Headline"]),
                clean_val(r["Format"]),
                clean_val(r["CTA"]),
                clean_val(r["Objective"]),
                clean_val(r["Funnel Stage"]),
                clean_val(r["Repurpose"])
            ))
        execute_values(cur, """
            INSERT INTO content_calendar (
                calendar_day, calendar_content_id, cluster_name, platform, topic,
                headline, format, call_to_action, objective, funnel_stage, repurpose_instructions
            ) VALUES %s
            ON CONFLICT (calendar_day) DO UPDATE SET
                headline = EXCLUDED.headline,
                topic = EXCLUDED.topic;
        """, cal_records)
        print(f"Upserted {len(cal_records)} calendar days.")

        # 6. SEO Landing Pages
        seo_df = pd.read_excel(wb_f2, sheet_name="SEO Landing Pages")
        seo_records = []
        for _, r in seo_df.iterrows():
            seo_records.append((
                clean_val(r["Page ID"]),
                clean_val(r["Cluster"]),
                clean_val(r["Primary Keyword Theme"]),
                clean_val(r["Page Type"]),
                clean_val(r["SEO Title"]),
                clean_val(r["Meta Description"]),
                clean_val(r["H1"]),
                clean_val(r["Suggested Slug"]),
                clean_val(r["Sections"]),
                clean_val(r["FAQ Ideas"]),
                clean_val(r["Internal Links"]),
                clean_val(r["CTA"]),
                clean_val(r["Caution"])
            ))
        execute_values(cur, """
            INSERT INTO seo_landing_pages (
                page_id, cluster_name, keyword_theme, page_type, seo_title,
                meta_description, h1_heading, suggested_slug, page_sections,
                faq_ideas, internal_links, call_to_action, caution_caveat
            ) VALUES %s
            ON CONFLICT (cluster_name) DO UPDATE SET
                seo_title = EXCLUDED.seo_title,
                meta_description = EXCLUDED.meta_description;
        """, seo_records)
        print(f"Upserted {len(seo_records)} SEO landing pages.")

        # 7. Campaign Shortlist
        wb_f3 = os.path.join(base_dir, "InfinitetechAI_Google_Ads_Plan.xlsx")
        short_df = pd.read_excel(wb_f3, sheet_name="Campaign Shortlist")
        short_records = []
        for _, r in short_df.iterrows():
            short_records.append((
                clean_val(r["Keyword ID"]),
                clean_val(r["Keyword Cluster"]),
                clean_val(r["Suggested Ad Group"]),
                clean_val(r["Recommended Match Type"]),
                clean_val(r["Negative Keyword Ideas"]),
                clean_val(r["Landing Page Recommendation"]),
                clean_val(r["Conversion Recommendation"])
            ))
        execute_values(cur, """
            INSERT INTO campaign_shortlist (
                keyword_id, cluster_name, suggested_ad_group, recommended_match_type,
                negative_keyword_ideas, landing_page_recommendation, conversion_recommendation
            ) VALUES %s
            ON CONFLICT (keyword_id) DO UPDATE SET
                suggested_ad_group = EXCLUDED.suggested_ad_group,
                recommended_match_type = EXCLUDED.recommended_match_type;
        """, short_records)
        print(f"Upserted {len(short_records)} campaign shortlist keywords.")

        # --- Reconciliation Checks ---
        print("\n--- Running Database Reconciliation Checks ---")
        counts = {}
        for tbl in ["clusters", "keywords", "source_headlines", "social_content", "content_calendar", "seo_landing_pages", "campaign_shortlist"]:
            cur.execute(f"SELECT COUNT(*) FROM {tbl};")
            counts[tbl] = cur.fetchone()[0]

        reconciliation["tables"] = {
            "clusters": {"expected": 13, "actual": counts["clusters"], "match": counts["clusters"] == 13},
            "keywords": {"expected": 3816, "actual": counts["keywords"], "match": counts["keywords"] == 3816},
            "source_headlines": {"expected": 38160, "actual": counts["source_headlines"], "match": counts["source_headlines"] == 38160},
            "social_content": {"expected": 78, "actual": counts["social_content"], "match": counts["social_content"] == 78},
            "content_calendar": {"expected": 30, "actual": counts["content_calendar"], "match": counts["content_calendar"] == 30},
            "seo_landing_pages": {"expected": 13, "actual": counts["seo_landing_pages"], "match": counts["seo_landing_pages"] == 13},
            "campaign_shortlist": {"expected": 487, "actual": counts["campaign_shortlist"], "match": counts["campaign_shortlist"] == 487}
        }

        # Check headlines per keyword
        cur.execute("""
            SELECT COUNT(*) FROM (
                SELECT keyword_id, COUNT(*) as cnt 
                FROM source_headlines 
                GROUP BY keyword_id 
                HAVING COUNT(*) != 10
            ) t;
        """)
        bad_hl_count = cur.fetchone()[0]
        reconciliation["integrity_checks"]["keywords_without_exactly_10_headlines"] = bad_hl_count

        # Check null bids
        cur.execute("SELECT COUNT(*) FROM keywords WHERE bid_low_range IS NULL;")
        null_low_bids = cur.fetchone()[0]
        reconciliation["integrity_checks"]["keywords_null_low_bids"] = {
            "expected": 363, "actual": null_low_bids, "match": null_low_bids == 363
        }

        # Check Quora null hashtags
        cur.execute("SELECT COUNT(*) FROM social_content WHERE hashtags IS NULL;")
        null_hashtags = cur.fetchone()[0]
        reconciliation["integrity_checks"]["social_null_hashtags_quora"] = {
            "expected": 13, "actual": null_hashtags, "match": null_hashtags == 13
        }

        all_matches = all(v["match"] for v in reconciliation["tables"].values()) and bad_hl_count == 0
        reconciliation["status"] = "reconciled_success" if all_matches else "discrepancies_detected"

        conn.commit()
        print("Database transaction successfully committed.")

    except Exception as e:
        conn.rollback()
        reconciliation["status"] = "failed"
        reconciliation["error"] = str(e)
        print(f"ERROR: {e}")
        raise
    finally:
        cur.close()
        conn.close()

    report_path = os.path.join(base_dir, "import_reconciliation_report.json")
    with open(report_path, "w") as rf:
        json.dump(reconciliation, rf, indent=2)
    print(f"Reconciliation report saved to {report_path}")
    return reconciliation

if __name__ == "__main__":
    run_import()
