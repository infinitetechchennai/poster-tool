import os
import time
import uuid
import hashlib
import urllib.parse
from typing import List, Dict, Any, Optional
import requests

from backend.app.config.settings import settings
from backend.app.schemas.pollinations import PollinationsModelInfo, PollinationsResponse

class PollinationsService:
    def __init__(self):
        self.api_key = settings.POLLINATIONS_API_KEY
        self.base_url = settings.POLLINATIONS_BASE_URL.rstrip("/")
        self.default_model = settings.POLLINATIONS_DEFAULT_MODEL
        self.output_dir = settings.GENERATED_IMAGES_DIR
        os.makedirs(self.output_dir, exist_ok=True)
        
        # In-memory cache for models catalog
        self._cached_models: List[Dict[str, Any]] = []
        self._models_fetched_at: float = 0
        self._models_ttl_seconds: float = 3600  # 1 hour

    def get_models(self) -> List[PollinationsModelInfo]:
        """Fetch live models catalog from Pollinations API or return cached."""
        now = time.time()
        if self._cached_models and (now - self._models_fetched_at < self._models_ttl_seconds):
            return [self._format_model_info(m) for m in self._cached_models]

        try:
            url = f"{self.base_url}/image/models"
            resp = requests.get(url, timeout=10)
            if resp.status_code == 200:
                raw_models = resp.json()
                # Filter for image generation models
                self._cached_models = [
                    m for m in raw_models
                    if m.get("category") == "image" and "/image/{prompt}" in m.get("supported_endpoints", [])
                ]
                self._models_fetched_at = now
                return [self._format_model_info(m) for m in self._cached_models]
        except Exception as e:
            print(f"Warning: Failed to fetch live Pollinations models: {e}")

        # Fallback catalog if offline or unreachable
        fallback = [
            {
                "name": "black-forest-labs/flux.1-schnell",
                "title": "FLUX.1 Schnell",
                "description": "Fast, high-quality images at a tiny cost",
                "publisher": "Black Forest Labs",
                "paid_only": False,
                "pricing": {"currency": "pollen", "completionImageTokens": "0.002"}
            },
            {
                "name": "tongyi-mai/z-image-turbo",
                "title": "Z-Image Turbo",
                "description": "Instant, budget-friendly images with crisp upscaled output",
                "publisher": "Alibaba",
                "paid_only": False,
                "pricing": {"currency": "pollen", "completionImageTokens": "0.004"}
            },
            {
                "name": "microsoft/mai-image-2.6-flash",
                "title": "MAI Image 2.6 Flash",
                "description": "Photorealistic generation with up to five references",
                "publisher": "Microsoft",
                "paid_only": False,
                "pricing": {"currency": "pollen", "completionImageTokens": "0.00001425"}
            },
            {
                "name": "black-forest-labs/flux.1.1-pro",
                "title": "FLUX 1.1 Pro",
                "description": "Fast text-to-image generation with precise dimensions",
                "publisher": "Black Forest Labs",
                "paid_only": False,
                "pricing": {"currency": "pollen", "completionImageTokens": "0.03"}
            }
        ]
        return [self._format_model_info(m) for m in fallback]

    def _format_model_info(self, raw: Dict[str, Any]) -> PollinationsModelInfo:
        return PollinationsModelInfo(
            name=raw.get("name", ""),
            title=raw.get("title", raw.get("name", "")),
            description=raw.get("description", ""),
            publisher=raw.get("publisher", ""),
            paid_only=raw.get("paid_only", False),
            pricing=raw.get("pricing"),
            aliases=raw.get("aliases", [])
        )

    def build_composition_prompt(
        self,
        topic: str,
        template_id: str = "corporate_services",
        aspect_ratio: str = "4:5",
        custom_style: Optional[str] = None
    ) -> str:
        """Constructs composition-aware image prompt ensuring negative text instruction

        and leaving negative space for overlaying deterministic HTML/CSS copy.
        """
        # Template-specific visual guidance
        template_guidance = {
            "corporate_services": (
                "Cinematic high-end corporate photography, enterprise software architect in a modern minimalist tech office, "
                "laptop and architectural diagram tablets on clean desk, deep teal and charcoal accents, soft studio ambient lighting, "
                "ample breathing space at top for headline text overlay, authentic corporate photography, 8k resolution, no words, no letters, textless"
            ),
            "educational_informational": (
                "Clean editorial technology conceptual visualization, modern neural network node connections and data pipelines, "
                "neutral slate background with subtle brand teal accents, high-contrast, clean minimalist composition, "
                "textless background, completely free of typography and symbols, photorealistic lighting"
            ),
            "product_promotion": (
                "Sleek modern dark-themed SaaS analytics platform floating in an executive studio environment, "
                "clean UI data cards and performance charts, dark navy background #0f172a with glowing teal accents #0fa5a6, "
                "sharp professional 3D perspective, textless UI wireframe, no legible English letters or numbers"
            ),
            "problem_solution": (
                "Conceptual dual-tone visual showing digital efficiency and modern systems engineering, "
                "cool metallic and deep teal lighting, structured geometric grid transition, high-tech enterprise feel, "
                "textless, no badges or text, clean negative space"
            ),
            "announcements_campaigns": (
                "Prestigious executive tech keynote stage atmosphere, dark elegant auditorium with architectural lighting, "
                "subtle teal and cyan spotlights, premium corporate event vibe, wide cinematic composition, "
                "textless stage, no banners, no text, clean backdrop"
            )
        }

        base = template_guidance.get(template_id, template_guidance["corporate_services"])
        prompt = f"{topic}. {base}. Professional enterprise marketing visual, cinematic lighting, photorealistic, no text, no watermarks."
        if custom_style:
            prompt = f"{custom_style}. {prompt}"
        return prompt

    def generate_image(
        self,
        prompt: str,
        model: Optional[str] = None,
        width: int = 1024,
        height: int = 1024,
        seed: Optional[int] = None,
        retries: int = 2,
        timeout: int = 35
    ) -> PollinationsResponse:
        """Calls Pollinations API to generate an authentic image visual, saves locally,

        and returns the local and remote URLs.
        """
        chosen_model = model or self.default_model
        
        # Generate cache key based on prompt and parameters
        cache_str = f"{chosen_model}_{width}_{height}_{seed}_{prompt}"
        cache_hash = hashlib.sha256(cache_str.encode("utf-8")).hexdigest()[:16]
        output_filename = f"pollinations_{cache_hash}.jpg"
        output_path = os.path.join(self.output_dir, output_filename)

        # Check local cache
        if os.path.exists(output_path) and os.path.getsize(output_path) > 1000:
            return PollinationsResponse(
                status="cached_success",
                image_url=f"/assets/generated-images/{output_filename}",
                local_image_path=output_path,
                model=chosen_model,
                cost_estimate="0 (from cache)",
                prompt=prompt
            )

        # Build primary and fallback URLs
        encoded_prompt = urllib.parse.quote(prompt)
        params = {
            "model": chosen_model,
            "width": str(width),
            "height": str(height),
            "nologo": "true"
        }
        if seed:
            params["seed"] = str(seed)

        query_str = urllib.parse.urlencode(params)
        
        # Determine candidate endpoints:
        # 1. gen.pollinations.ai (if api_key provided)
        # 2. image.pollinations.ai (public free endpoint)
        candidate_urls = []
        headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"}
        
        if self.api_key:
            candidate_urls.append((f"{self.base_url}/image/{encoded_prompt}?{query_str}", {"Authorization": f"Bearer {self.api_key}", **headers}))
        
        # Public Pollinations endpoint
        public_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?{query_str}"
        candidate_urls.append((public_url, headers))

        last_error = None
        for req_url, req_headers in candidate_urls:
            for attempt in range(retries + 1):
                try:
                    resp = requests.get(req_url, headers=req_headers, timeout=timeout)
                    if resp.status_code == 200 and len(resp.content) > 1000:
                        with open(output_path, "wb") as f:
                            f.write(resp.content)

                        # Determine cost estimate
                        cost_est = "0.002 Pollen" if self.api_key else "0 (Free Tier)"
                        models_list = self.get_models()
                        for m in models_list:
                            if m.name == chosen_model and m.pricing:
                                cost_est = f"{m.pricing.get('completionImageTokens', '0.002')} {m.pricing.get('currency', 'pollen')}"

                        return PollinationsResponse(
                            status="generated_success",
                            image_url=f"/assets/generated-images/{output_filename}",
                            local_image_path=output_path,
                            model=chosen_model,
                            cost_estimate=cost_est,
                            prompt=prompt
                        )
                    else:
                        last_error = f"HTTP {resp.status_code}: {resp.text[:120]}"
                        if resp.status_code == 401:
                            # Skip to next candidate URL without wasting retries
                            break
                except Exception as e:
                    last_error = str(e)
                    time.sleep(1)

        # If generation failed, fallback gracefully to existing high-res asset
        fallback_hero = os.path.join(settings.ASSETS_DIR, "corporate_hero.jpg")
        fallback_url = "/assets/corporate_hero.jpg"
        
        return PollinationsResponse(
            status="fallback_success",
            image_url=fallback_url,
            local_image_path=fallback_hero,
            model="local_fallback",
            cost_estimate="0 (offline fallback)",
            prompt=f"{prompt} (Failed online generation: {last_error}; using local verified asset)"
        )

pollinations_service = PollinationsService()
