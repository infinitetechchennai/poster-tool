import os
import json
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

TEMPLATES_FILE = os.path.join(os.path.dirname(__file__), "template-specs", "templates.json")

class TemplateSpec(BaseModel):
    id: str
    name: str
    category: str
    intended_use: str
    best_for: str
    thumbnail_url: str
    accent_color: str
    theme: str
    default_kicker: str
    default_title: str
    default_description: str
    default_bullets: List[str]
    default_cta: str

def load_template_specs() -> List[TemplateSpec]:
    if os.path.exists(TEMPLATES_FILE):
        with open(TEMPLATES_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return [TemplateSpec(**item) for item in data.get("templates", [])]
    return []

TEMPLATE_SPECS = load_template_specs()
TEMPLATE_SPEC_MAP: Dict[str, TemplateSpec] = {t.id: t for t in TEMPLATE_SPECS}

def get_template_spec(template_id: str) -> Optional[TemplateSpec]:
    return TEMPLATE_SPEC_MAP.get(template_id)
