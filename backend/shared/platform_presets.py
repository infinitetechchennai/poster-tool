import os
import json
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

PRESETS_FILE = os.path.join(os.path.dirname(__file__), "platform-presets", "presets.json")

class PlatformPreset(BaseModel):
    id: str
    platform: str
    format_name: str
    width: int
    height: int
    aspect_ratio: str
    orientation: str
    recommended_use: str

def load_presets() -> List[PlatformPreset]:
    if os.path.exists(PRESETS_FILE):
        with open(PRESETS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return [PlatformPreset(**item) for item in data.get("presets", [])]
    return []

PLATFORM_PRESETS = load_presets()
PRESET_MAP: Dict[str, PlatformPreset] = {p.id: p for p in PLATFORM_PRESETS}

def get_preset(preset_id: str) -> Optional[PlatformPreset]:
    return PRESET_MAP.get(preset_id)

def get_preset_by_dimensions(width: int, height: int) -> Optional[PlatformPreset]:
    for p in PLATFORM_PRESETS:
        if p.width == width and p.height == height:
            return p
    return None
