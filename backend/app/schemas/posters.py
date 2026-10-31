from typing import List, Optional
from pydantic import BaseModel, Field
from engine.poster_models import PosterContentContract

class PosterRenderRequest(BaseModel):
    template_id: str
    keyword_id: Optional[str] = "KW00001"
    intent_id: Optional[str] = None
    header: str
    title: str
    description: str
    bullet_points: List[str]
    call_to_action: str
    aspect_ratio: str = "4:5"
    platform_preset_id: Optional[str] = "instagram_portrait"
    campaign_label: Optional[str] = "Strategic Tech Initiative"
    hero_image_data_uri: Optional[str] = None
    image_prompt: Optional[str] = None
    image_source: Optional[str] = "local"

__all__ = ["PosterContentContract", "PosterRenderRequest"]
