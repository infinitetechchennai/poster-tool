import os
import sys
import pytest

# Ensure project root is in sys.path
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
for p in [root_dir, backend_dir]:
    if p not in sys.path:
        sys.path.insert(0, p)

from engine.poster_models import PosterContentContract
from engine.renderer import PosterRenderer, load_as_data_uri
from backend.app.services.pollinations.pollinations_service import pollinations_service
from backend.app.config.settings import settings

@pytest.fixture
def renderer():
    return PosterRenderer()

@pytest.fixture
def sample_generated_image():
    """Ensure a test image exists in assets/generated-images."""
    img_dir = os.path.join(settings.ASSETS_DIR, "generated-images")
    os.makedirs(img_dir, exist_ok=True)
    test_file = os.path.join(img_dir, "test_regression_asset.jpg")
    if not os.path.exists(test_file):
        with open(test_file, "wb") as f:
            f.write(b"\xff\xd8\xff\xe0\x00\x10JFIF" + b"\x00" * 2000)
    return test_file

def test_default_images_preserved_when_no_custom_image_provided(renderer):
    """When hero_image_path is None, Corporate Services uses default hero and Product Promotion uses default dashboard."""
    # 1. Corporate Services default
    c1 = PosterContentContract(
        keyword_id="KW00001",
        intent_id="INT001",
        intent_phrase="Cloud Migration",
        intent_category="Commercial",
        audience_need="Enterprise",
        buying_stage="Consideration",
        marketing_angle="Agility",
        header="ENTERPRISE ARCHITECTURE",
        title="Modernize Legacy Workflows",
        description="Scalable cloud engineering for high-growth enterprises.",
        bullet_points=["Microservices", "99.99% Uptime", "Zero Lock-In"],
        call_to_action="Get Started",
        image_prompt="Corporate tech office visual",
        seo_alt_text="InfiniteTech AI - Modernize Legacy Workflows",
        template_id="corporate_services",
        aspect_ratio="4:5",
        hero_image_path=None
    )
    html1, _, _ = renderer._render_html(c1)
    default_hero_b64 = renderer.hero_uri
    assert default_hero_b64 in html1
    
    # 2. Product Promotion default
    c2 = PosterContentContract(
        keyword_id="KW00001",
        intent_id="INT002",
        intent_phrase="Analytics Engine",
        intent_category="Commercial",
        audience_need="Enterprise",
        buying_stage="Consideration",
        marketing_angle="Speed",
        header="PRODUCT SPOTLIGHT",
        title="Real-Time Data Intelligence",
        description="Monitor system telemetry across distributed environments.",
        bullet_points=["Sub-second Queries", "Automated Anomaly Detection", "SOC2 Compliant"],
        call_to_action="Explore Platform",
        image_prompt="SaaS dashboard visual",
        seo_alt_text="InfiniteTech AI - Real-Time Data Intelligence",
        template_id="product_promotion",
        aspect_ratio="4:5",
        hero_image_path=None
    )
    html2, _, _ = renderer._render_html(c2)
    default_dash_b64 = renderer.dash_uri
    assert default_dash_b64 in html2

def test_generated_image_web_path_resolution_corporate_services(renderer, sample_generated_image):
    """Web URL format '/assets/generated-images/...' resolves correctly and replaces default in Corporate Services."""
    web_url = f"/assets/generated-images/{os.path.basename(sample_generated_image)}"
    expected_b64 = load_as_data_uri(sample_generated_image)

    contract = PosterContentContract(
        keyword_id="KW00001",
        intent_id="INT001",
        intent_phrase="Cloud Migration",
        intent_category="Commercial",
        audience_need="Enterprise",
        buying_stage="Consideration",
        marketing_angle="Agility",
        header="ENTERPRISE ARCHITECTURE",
        title="Modernize Legacy Workflows",
        description="Scalable cloud engineering for high-growth enterprises.",
        bullet_points=["Microservices", "99.99% Uptime", "Zero Lock-In"],
        call_to_action="Get Started",
        image_prompt="Corporate tech office visual",
        seo_alt_text="InfiniteTech AI - Modernize Legacy Workflows",
        template_id="corporate_services",
        aspect_ratio="4:5",
        hero_image_path=web_url
    )

    html, _, _ = renderer._render_html(contract)
    # The custom base64 string must be inside the rendered HTML
    assert expected_b64 in html
    # The default corporate hero must NOT be inside the rendered HTML
    assert renderer.hero_uri not in html

def test_generated_image_web_path_resolution_product_promotion(renderer, sample_generated_image):
    """Web URL format '/assets/generated-images/...' correctly binds to dashboard_image_data_uri in Product Promotion."""
    web_url = f"/assets/generated-images/{os.path.basename(sample_generated_image)}"
    expected_b64 = load_as_data_uri(sample_generated_image)

    contract = PosterContentContract(
        keyword_id="KW00001",
        intent_id="INT002",
        intent_phrase="Analytics Engine",
        intent_category="Commercial",
        audience_need="Enterprise",
        buying_stage="Consideration",
        marketing_angle="Speed",
        header="PRODUCT SPOTLIGHT",
        title="Real-Time Data Intelligence",
        description="Monitor system telemetry across distributed environments.",
        bullet_points=["Sub-second Queries", "Automated Anomaly Detection", "SOC2 Compliant"],
        call_to_action="Explore Platform",
        image_prompt="SaaS dashboard visual",
        seo_alt_text="InfiniteTech AI - Real-Time Data Intelligence",
        template_id="product_promotion",
        aspect_ratio="4:5",
        hero_image_path=web_url
    )

    html, _, _ = renderer._render_html(contract)
    # Custom image is bound to dashboard image
    assert expected_b64 in html
    # Default dashboard image is not used
    assert renderer.dash_uri not in html

def test_missing_file_raises_error_without_silent_replacement(renderer):
    """When a non-existent image path is requested, FileNotFoundError must be raised rather than silently falling back."""
    missing_path = "/assets/generated-images/completely_non_existent_file_987654.jpg"
    contract = PosterContentContract(
        keyword_id="KW00001",
        intent_id="INT001",
        intent_phrase="Cloud Migration",
        intent_category="Commercial",
        audience_need="Enterprise",
        buying_stage="Consideration",
        marketing_angle="Agility",
        header="ENTERPRISE ARCHITECTURE",
        title="Modernize Legacy Workflows",
        description="Scalable cloud engineering for high-growth enterprises.",
        bullet_points=["Microservices", "99.99% Uptime", "Zero Lock-In"],
        call_to_action="Get Started",
        image_prompt="Corporate tech office visual",
        seo_alt_text="InfiniteTech AI - Modernize Legacy Workflows",
        template_id="corporate_services",
        aspect_ratio="4:5",
        hero_image_path=missing_path
    )

    with pytest.raises(FileNotFoundError) as exc_info:
        renderer._render_html(contract)
    assert "Requested image asset not found" in str(exc_info.value)
    assert missing_path in str(exc_info.value)

def test_exported_poster_with_custom_image(renderer, sample_generated_image):
    """Renders a full poster PNG to disk with a custom image and validates output dimensions."""
    web_url = f"/assets/generated-images/{os.path.basename(sample_generated_image)}"
    contract = PosterContentContract(
        keyword_id="KW00001",
        intent_id="INT_CUSTOM_EXPORT",
        intent_phrase="AI Strategy",
        intent_category="Commercial",
        audience_need="Enterprise",
        buying_stage="Consideration",
        marketing_angle="Leadership",
        header="EXECUTIVE BRIEFING",
        title="AI Operational Blueprint",
        description="Accelerate enterprise delivery with verified automated governance.",
        bullet_points=["Rapid Prototyping", "Full Compliance", "Deterministic Guardrails"],
        call_to_action="Download Framework",
        image_prompt="Corporate strategy visual",
        seo_alt_text="InfiniteTech AI - AI Operational Blueprint",
        template_id="corporate_services",
        aspect_ratio="4:5",
        platform_preset_id="instagram_portrait",
        hero_image_path=web_url
    )

    result = renderer.render_poster(contract)
    assert os.path.exists(result["output_path"])
    assert result["dimensions"] == (1080, 1350)
    assert result["file_size_bytes"] > 50000

def test_live_pollinations_request_distinction():
    """Verify that live requests with valid key produce generated_success, not fallback."""
    if not settings.POLLINATIONS_API_KEY:
        pytest.skip("No POLLINATIONS_API_KEY configured")

    res = pollinations_service.generate_image(
        prompt="Modern minimalist corporate tech workspace with laptop, clean ambient lighting, textless",
        model="tongyi-mai/z-image-turbo",
        width=512,
        height=512,
        timeout=30
    )

    # Must clearly be real generation, not fallback
    assert res.status in ("generated_success", "cached_success"), f"Expected real generation but got {res.status}: {res.prompt}"
    assert res.status != "fallback_success"
    assert res.model == "tongyi-mai/z-image-turbo"
    assert os.path.exists(res.local_image_path)
    assert os.path.getsize(res.local_image_path) > 10000
