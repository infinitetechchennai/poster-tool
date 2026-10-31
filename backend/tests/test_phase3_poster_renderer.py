import os
import sys
import hashlib
import psycopg2
import pytest
from pydantic import ValidationError

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from engine.poster_models import PosterContentContract
from engine.poster_service import PosterContentService, DB_CONFIG
from engine.renderer import PosterRenderer, get_png_dimensions

BASELINE_HASHES = {
    "InfinitetechAI_Keyword_Intent_Analysis.xlsx": "b357fb7bc934cd187387fad3c3308b9aabc1a3d21e0ffd9a65843cff577e6d5a",
    "InfinitetechAI_Social_SEO_Content.xlsx": "cf16e84e9b990ea628da54a72d1d8ac19c1674902175b8b85331d63b1c929a74",
    "InfinitetechAI_Google_Ads_Plan.xlsx": "8be979b2a62afee03c702dfe2461905a96f5210507591a70559e020802835efa"
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

def test_poster_contract_validation():
    """Verify PosterContentContract strict validation (3-5 bullets, aspect ratios, templates)."""
    # Valid contract
    valid = PosterContentContract(
        keyword_id="KW00001",
        intent_id="11111111-1111-1111-1111-111111111111",
        intent_phrase="custom software development services for enterprise",
        intent_category="Transactional",
        audience_need="Enterprise scaling",
        buying_stage="Decision",
        marketing_angle="Outcome",
        header="ENTERPRISE ENGINEERING",
        title="Scalable Custom Software Development",
        description="Transform operations with tailored software architecture.",
        bullet_points=["Robust API architecture", "Enterprise governance and security", "Dedicated agile squads"],
        call_to_action="Schedule an Architecture Audit",
        image_prompt="Dark minimalist background render",
        template_id="corporate_minimal",
        visual_style="dark_modern",
        aspect_ratio="4:5",
        seo_alt_text="Custom software development poster"
    )
    assert valid.keyword_id == "KW00001"
    assert len(valid.bullet_points) == 3

    # Reject less than 3 bullets
    with pytest.raises(ValidationError):
        data = valid.model_dump()
        data["bullet_points"] = ["Only one bullet", "Only two bullets"]
        PosterContentContract(**data)

    # Reject more than 5 bullets
    with pytest.raises(ValidationError):
        data = valid.model_dump()
        data["bullet_points"] = [f"Bullet {i}" for i in range(6)]
        PosterContentContract(**data)

    # Reject invalid aspect ratio (e.g. 21:9 or invalid)
    with pytest.raises(ValidationError):
        data = valid.model_dump()
        data["aspect_ratio"] = "21:9"
        PosterContentContract(**data)

    # Reject unknown template
    with pytest.raises(ValidationError):
        data = valid.model_dump()
        data["template_id"] = "non_existent_template"
        PosterContentContract(**data)

def test_poster_content_generation_from_intent(db_conn):
    """Test generating and saving poster content from an approved intent."""
    cur = db_conn.cursor()
    cur.execute("""
        SELECT intent_id FROM generated_intents 
        WHERE approval_status = 'approved' LIMIT 1;
    """)
    row = cur.fetchone()
    cur.close()
    assert row is not None, "No approved intent found in DB"
    intent_id = str(row[0])

    service = PosterContentService()
    contract = service.generate_poster_content(
        intent_id=intent_id,
        template_id="corporate_minimal",
        aspect_ratio="4:5"
    )

    assert contract.intent_id == intent_id
    assert 3 <= len(contract.bullet_points) <= 5
    assert len(contract.title) > 5
    assert len(contract.call_to_action) > 3

    # Verify database persistence in poster_content
    cur = db_conn.cursor()
    cur.execute("""
        SELECT header, title, bullet_points FROM poster_content 
        WHERE intent_id = %s;
    """, (intent_id,))
    saved = cur.fetchone()
    cur.close()

    assert saved is not None
    assert saved[0] == contract.header
    assert saved[1] == contract.title

def test_rendering_all_templates_4x5(db_conn):
    """Render poster across all 5 fixed professional templates in 4:5 aspect ratio and assert 1080x1350 output."""
    cur = db_conn.cursor()
    cur.execute("SELECT intent_id FROM generated_intents WHERE approval_status = 'approved' LIMIT 1;")
    intent_id = str(cur.fetchone()[0])
    cur.close()

    service = PosterContentService()
    renderer = PosterRenderer()

    templates = [
        "corporate_services",
        "educational_informational",
        "product_promotion",
        "problem_solution",
        "announcements_campaigns"
    ]
    for tpl in templates:
        contract = service.generate_poster_content(
            intent_id=intent_id,
            template_id=tpl,
            aspect_ratio="4:5"
        )
        res = renderer.render_poster(contract)

        assert res["status"] == "rendered_success"
        assert os.path.exists(res["output_path"])
        assert res["file_size_bytes"] > 10000

        # Verify pixel dimensions 1080x1350
        w, h = get_png_dimensions(res["output_path"])
        assert (w, h) == (1080, 1350), f"Template {tpl} rendered invalid dimensions ({w}, {h})"

def test_rendering_square_1x1(db_conn):
    """Render poster in 1:1 aspect ratio and assert 1080x1080 output."""
    cur = db_conn.cursor()
    cur.execute("SELECT intent_id FROM generated_intents WHERE approval_status = 'approved' LIMIT 1;")
    intent_id = str(cur.fetchone()[0])
    cur.close()

    service = PosterContentService()
    renderer = PosterRenderer()

    contract = service.generate_poster_content(
        intent_id=intent_id,
        template_id="corporate_minimal",
        aspect_ratio="1:1"
    )
    res = renderer.render_poster(contract)

    assert res["status"] == "rendered_success"
    w, h = get_png_dimensions(res["output_path"])
    assert (w, h) == (1080, 1080), f"Expected (1080, 1080), got ({w}, {h})"

def test_database_persistence_posters(db_conn):
    """Verify that rendered posters persist to PostgreSQL posters table."""
    cur = db_conn.cursor()
    cur.execute("SELECT poster_content_id FROM poster_content LIMIT 1;")
    pc_id = str(cur.fetchone()[0])
    cur.close()

    service = PosterContentService()
    renderer = PosterRenderer()

    contract = PosterContentContract(
        keyword_id="KW00001",
        intent_id="11111111-1111-1111-1111-111111111111",
        intent_phrase="cloud architecture modernization",
        intent_category="Solution-Seeking",
        audience_need="Legacy migration",
        buying_stage="Consideration",
        marketing_angle="Scale",
        header="INFINITETECH AI • CLOUD",
        title="Modern Cloud Architecture",
        description="High availability and automated scalability.",
        bullet_points=["Elastic auto-scaling", "Multi-region redundancy", "Zero-downtime deployment"],
        call_to_action="Consult an Architect",
        image_prompt="Clean server cluster render",
        template_id="corporate_minimal",
        visual_style="dark_modern",
        aspect_ratio="4:5",
        seo_alt_text="Cloud architecture poster"
    )

    res = renderer.render_poster(contract, poster_content_id=pc_id)
    poster_id = res["poster_id"]

    cur = db_conn.cursor()
    cur.execute("SELECT dimensions_width, dimensions_height, output_format FROM posters WHERE poster_id = %s;", (poster_id,))
    p_row = cur.fetchone()
    cur.close()

    assert p_row is not None
    assert p_row[0] == 1080
    assert p_row[1] == 1350
    assert p_row[2] == "PNG"

def test_immutability_of_source_files():
    """Verify source Excel files remain 100% byte-for-byte untouched throughout Phase 3."""
    for fname, orig_hash in BASELINE_HASHES.items():
        assert os.path.exists(fname)
        curr_hash = calculate_sha256(fname)
        assert curr_hash == orig_hash, f"Source workbook {fname} was modified!"
