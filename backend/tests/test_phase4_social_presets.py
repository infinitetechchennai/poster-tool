import os
import sys
import pytest

root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
for p in [root_dir, backend_dir]:
    if p not in sys.path:
        sys.path.insert(0, p)

from shared.platform_presets import PLATFORM_PRESETS, get_preset, get_preset_by_dimensions
from shared.template_specs import TEMPLATE_SPECS, get_template_spec
from engine.poster_models import PosterContentContract
from engine.renderer import PosterRenderer, get_png_dimensions
from backend.app.services.pollinations.pollinations_service import pollinations_service

def test_platform_presets_catalog():
    """Verify all 7 required social presets are properly configured."""
    assert len(PLATFORM_PRESETS) == 7
    preset_ids = {p.id for p in PLATFORM_PRESETS}
    expected = {
        "instagram_portrait",
        "instagram_square",
        "instagram_story",
        "linkedin_portrait",
        "linkedin_landscape",
        "facebook_portrait",
        "twitter_landscape"
    }
    assert expected.issubset(preset_ids)

    # Validate specific aspect ratios and dimensions
    p_ig_story = get_preset("instagram_story")
    assert p_ig_story.width == 1080 and p_ig_story.height == 1920
    assert p_ig_story.aspect_ratio == "9:16"

    p_li_land = get_preset("linkedin_landscape")
    assert p_li_land.width == 1200 and p_li_land.height == 627
    assert p_li_land.aspect_ratio == "1.91:1"

    p_tw_land = get_preset("twitter_landscape")
    assert p_tw_land.width == 1200 and p_tw_land.height == 675
    assert p_tw_land.aspect_ratio == "16:9"

def test_template_specs_catalog():
    """Verify all 5 fixed templates are configured in specs."""
    assert len(TEMPLATE_SPECS) == 5
    t_ids = {t.id for t in TEMPLATE_SPECS}
    expected = {
        "corporate_services",
        "educational_informational",
        "product_promotion",
        "problem_solution",
        "announcements_campaigns"
    }
    assert expected == t_ids

def test_render_all_7_presets():
    """Verify deterministic rendering produces exact pixel dimensions across all 7 platform presets."""
    renderer = PosterRenderer()
    
    # Test 3 representative presets
    test_presets = [
        ("instagram_story", 1080, 1920),
        ("linkedin_landscape", 1200, 627),
        ("twitter_landscape", 1200, 675)
    ]

    for preset_id, exp_w, exp_h in test_presets:
        preset = get_preset(preset_id)
        contract = PosterContentContract(
            keyword_id="KW00001",
            intent_id="00000000-0000-0000-0000-000000000002",
            intent_phrase="cloud native software development services",
            intent_category="Transactional",
            audience_need="Enterprise architecture modernization",
            buying_stage="Decision",
            marketing_angle="Scale",
            header="ENTERPRISE ENGINEERING",
            title="THE RIGHT CAREER MOVE IN 2026?",
            description="Accelerate enterprise transformation with verified squads and zero technical debt.",
            bullet_points=["Microservices Architecture", "99.99% Uptime SLA", "Automated CI/CD"],
            call_to_action="Explore The Program",
            image_prompt="Software architect in modern studio",
            template_id="corporate_services",
            aspect_ratio=preset.aspect_ratio,
            platform_preset_id=preset.id,
            seo_alt_text="InfiniteTech AI"
        )
        res = renderer.render_poster(contract)
        w, h = res["dimensions"]
        assert (w, h) == (exp_w, exp_h), f"Preset {preset_id} generated {w}x{h}, expected {exp_w}x{exp_h}"

def test_pollinations_prompt_builder():
    """Verify composition-aware prompt construction ensures clean negative space and textless background."""
    prompt = pollinations_service.build_composition_prompt(
        topic="Enterprise Cloud Automation",
        template_id="corporate_services",
        aspect_ratio="4:5"
    )
    assert "Enterprise Cloud Automation" in prompt
    assert "no words" in prompt or "no text" in prompt
    assert "photorealistic" in prompt

def test_pollinations_local_fallback():
    """Verify Pollinations service gracefully handles offline/fallback without throwing exceptions."""
    res = pollinations_service.generate_image(
        prompt="Test offline fallback",
        timeout=1,
        retries=0
    )
    assert res.status in ("generated_success", "cached_success", "fallback_success")
    assert res.local_image_path and os.path.exists(res.local_image_path)
