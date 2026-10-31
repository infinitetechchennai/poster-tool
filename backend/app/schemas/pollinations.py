from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class PollinationsGenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=3, description="Image generation prompt")
    model: Optional[str] = Field(None, description="Model ID (e.g. black-forest-labs/flux.1-schnell)")
    width: Optional[int] = Field(1024, description="Desired image width")
    height: Optional[int] = Field(1024, description="Desired image height")
    seed: Optional[int] = Field(None, description="Optional random seed")
    enhance: Optional[bool] = Field(True, description="Enhance prompt")
    nologo: Optional[bool] = Field(True, description="Suppress provider watermark")
    template_id: Optional[str] = Field(None, description="Template context for prompt framing")
    aspect_ratio: Optional[str] = Field("4:5", description="Aspect ratio")

class PollinationsModelInfo(BaseModel):
    name: str
    title: str
    description: Optional[str] = ""
    publisher: Optional[str] = ""
    paid_only: bool = False
    pricing: Optional[Dict[str, Any]] = None
    aliases: List[str] = []

class PollinationsResponse(BaseModel):
    status: str
    image_url: str
    local_image_path: str
    model: str
    cost_estimate: Optional[str] = None
    prompt: str
