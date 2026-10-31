import os
import sys
import json
import hashlib
import psycopg2
import pandas as pd
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

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

@pytest.fixture(scope="module")
def db_conn():
    conn = psycopg2.connect(**DB_CONFIG)
    yield conn
    conn.close()

def calculate_sha256(filepath):
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest()

def test_immutability():
    """Verify that source Excel files have never been altered and match baseline SHA-256."""
    for fname, expected_hash in BASELINE_HASHES.items():
        assert os.path.exists(fname), f"File {fname} is missing"
        actual_hash = calculate_sha256(fname)
        assert actual_hash == expected_hash, f"Hash mismatch for {fname}: expected {expected_hash}, got {actual_hash}"

def test_id_preservation(db_conn):
    """Verify all 3,816 KW IDs from source workbook exist intact in DB keywords table."""
    cur = db_conn.cursor()
    cur.execute("SELECT keyword_id FROM keywords ORDER BY keyword_id;")
    db_ids = [r[0] for r in cur.fetchall()]
    cur.close()

    wb = pd.read_excel("InfinitetechAI_Keyword_Intent_Analysis.xlsx", sheet_name="Master Intent")
    source_ids = wb["Keyword ID"].tolist()

    assert len(db_ids) == 3816
    assert len(source_ids) == 3816
    assert set(db_ids) == set(source_ids)

def test_headline_foreign_keys(db_conn):
    """Verify all 38,160 headlines join to a valid keyword and each keyword has exactly 10 angles."""
    cur = db_conn.cursor()
    cur.execute("SELECT COUNT(*) FROM source_headlines;")
    total_hl = cur.fetchone()[0]
    assert total_hl == 38160

    # Test orphan headlines
    cur.execute("""
        SELECT COUNT(*) 
        FROM source_headlines h
        LEFT JOIN keywords k ON h.keyword_id = k.keyword_id
        WHERE k.keyword_id IS NULL;
    """)
    orphan_count = cur.fetchone()[0]
    assert orphan_count == 0, f"Found {orphan_count} orphan headlines"

    # Test exactly 10 headlines per keyword
    cur.execute("""
        SELECT COUNT(*) FROM (
            SELECT keyword_id, COUNT(DISTINCT marketing_angle) as angle_cnt, COUNT(*) as total_cnt
            FROM source_headlines
            GROUP BY keyword_id
            HAVING COUNT(DISTINCT marketing_angle) != 10 OR COUNT(*) != 10
        ) t;
    """)
    non_conforming_kw = cur.fetchone()[0]
    cur.close()
    assert non_conforming_kw == 0, f"Found {non_conforming_kw} keywords without exactly 10 angles"

def test_social_composite_key(db_conn):
    """Verify 78 social content records with composite uniqueness."""
    cur = db_conn.cursor()
    cur.execute("SELECT COUNT(*) FROM social_content;")
    total_social = cur.fetchone()[0]
    assert total_social == 78

    cur.execute("SELECT COUNT(DISTINCT (source_content_id, platform)) FROM social_content;")
    unique_pairs = cur.fetchone()[0]
    cur.close()
    assert unique_pairs == 78

def test_google_ads_char_limits(db_conn):
    """Verify that 100% of google_ads_30_char values do not exceed 30 characters."""
    cur = db_conn.cursor()
    cur.execute("SELECT COUNT(*) FROM source_headlines WHERE LENGTH(google_ads_30_char) > 30;")
    exceed_count = cur.fetchone()[0]
    cur.close()
    assert exceed_count == 0, f"Found {exceed_count} headlines exceeding 30 characters"

def test_reconciliation_report():
    """Verify import_reconciliation_report.json exists and reports reconciled_success."""
    report_file = "import_reconciliation_report.json"
    assert os.path.exists(report_file), "Reconciliation report was not generated"

    with open(report_file) as f:
        rep = json.load(f)

    assert rep["status"] == "reconciled_success", f"Reconciliation failed with status {rep.get('status')}"
    for tbl, info in rep["tables"].items():
        assert info["match"] is True, f"Mismatch in table {tbl}: expected {info['expected']}, got {info['actual']}"

def test_idempotency_rerun(db_conn):
    """Run importer a second time to verify idempotency and zero duplicate insertions."""
    from importer.read_only_importer import run_import
    
    # Capture counts before rerun
    cur = db_conn.cursor()
    cur.execute("SELECT COUNT(*) FROM keywords;")
    kw_count_before = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM source_headlines;")
    hl_count_before = cur.fetchone()[0]
    cur.close()

    # Second run
    rep = run_import()
    for fname, finfo in rep["files"].items():
        assert finfo["status"] == "skipped_unchanged", f"File {fname} was not skipped on rerun"

    # Capture counts after rerun
    cur = db_conn.cursor()
    cur.execute("SELECT COUNT(*) FROM keywords;")
    kw_count_after = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM source_headlines;")
    hl_count_after = cur.fetchone()[0]
    cur.close()

    assert kw_count_before == kw_count_after == 3816
    assert hl_count_before == hl_count_after == 38160
