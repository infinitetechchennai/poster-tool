from typing import List, Optional
from pydantic import BaseModel, Field, field_validator

class PosterContentContract(BaseModel):
    keyword_id: str = Field(..., description="Original CEO keyword ID (e.g. KW00001)")
    intent_id: str = Field(..., description="UUID of the validated intent")
    intent_phrase: str = Field(..., description="The validated search intent phrase")
    intent_category: str = Field(..., description="Search intent category")
    audience_need: str = Field(..., description="Underlying business pain point")
    buying_stage: str = Field(..., description="Awareness, Consideration, or Decision")
    marketing_angle: str = Field(..., description="Marketing angle (e.g. Pain point, Outcome, Scale)")
    header: str = Field(..., max_length=128, description="Kicker or category tag (e.g. ENTERPRISE ENGINEERING)")
    title: str = Field(..., min_length=5, max_length=256, description="Primary compelling poster title")
    description: str = Field(..., min_length=10, max_length=500, description="1-2 sentence supporting value proposition")
    bullet_points: List[str] = Field(..., min_length=3, max_length=5, description="3 to 5 benefit-driven bullet points")
    call_to_action: str = Field(..., min_length=3, max_length=128, description="High-converting call to action")
    image_prompt: str = Field(..., description="Text-free visual art direction prompt")
    template_id: str = Field("corporate_services", description="Template identifier")
    visual_style: str = Field("enterprise_clean", description="Style tokens and color accents")
    aspect_ratio: str = Field("4:5", description="Aspect ratio: '4:5' or '1:1'")
    seo_alt_text: str = Field(..., description="SEO-friendly alt text for web publication")
    validation_status: str = Field("passed", description="'passed' or 'flagged'")
    human_approval_status: str = Field("draft", description="'draft', 'approved', or 'rejected'")
    campaign_label: Optional[str] = Field(None, description="Optional campaign or event label")
    hero_image_path: Optional[str] = Field(None, description="Optional path or data URI for template hero image")

    platform_preset_id: Optional[str] = Field(None, description="Preset ID (e.g. instagram_portrait, twitter_landscape)")
    custom_width: Optional[int] = Field(None, description="Optional custom render pixel width")
    custom_height: Optional[int] = Field(None, description="Optional custom render pixel height")
    image_source: Optional[str] = Field("local", description="'local', 'pollinations', or 'upload'")

    @field_validator('bullet_points')
    @classmethod
    def validate_bullets(cls, v):
        if len(v) < 3 or len(v) > 5:
            raise ValueError("bullet_points must contain between 3 and 5 items")
        for b in v:
            if not b.strip():
                raise ValueError("bullet points cannot be empty")
        return v

    @field_validator('aspect_ratio')
    @classmethod
    def validate_aspect_ratio(cls, v):
        valid_ratios = ("4:5", "1:1", "9:16", "1.91:1", "16:9")
        if v not in valid_ratios:
            raise ValueError(f"aspect_ratio must be one of {valid_ratios}")
        return v

    @field_validator('template_id')
    @classmethod
    def validate_template(cls, v):
        valid_templates = (
            "corporate_services",
            "educational_informational",
            "product_promotion",
            "problem_solution",
            "announcements_campaigns",
            "corporate_minimal",
            "tech_gradient",
            "editorial_modern"
        )
        if v not in valid_templates:
            raise ValueError(f"template_id must be one of {valid_templates}")
        return v
