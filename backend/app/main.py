import os
import uuid
import psycopg2
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Query, Body, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from backend.app.config.settings import settings
from shared.platform_presets import PLATFORM_PRESETS, get_preset
from shared.template_specs import TEMPLATE_SPECS, get_template_spec
from backend.app.schemas.posters import PosterContentContract, PosterRenderRequest
from backend.app.schemas.pollinations import PollinationsGenerateRequest, PollinationsResponse
from backend.app.services.pollinations.pollinations_service import pollinations_service
from engine.intent_service import IntentExpansionService
from engine.renderer import PosterRenderer

app = FastAPI(
    title="InfiniteTech AI Poster Studio",
    version=settings.VERSION,
    description="Professional, template-based marketing poster platform for InfiniteTech AI"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

intent_service = IntentExpansionService()
poster_renderer = PosterRenderer(
    templates_dir=settings.TEMPLATES_DIR,
    output_dir=settings.OUTPUT_DIR,
    assets_dir=settings.ASSETS_DIR
)

# -------------------------------------------------------------------------
# Template & Presets Catalog Endpoints
# -------------------------------------------------------------------------
@app.get("/api/templates")
def get_templates():
    """Returns the 5 fixed reusable social media templates."""
    return {"templates": [t.dict() for t in TEMPLATE_SPECS]}

@app.get("/api/presets")
def get_platform_presets():
    """Returns the 7 social media platform format presets."""
    return {"presets": [p.dict() for p in PLATFORM_PRESETS]}

# -------------------------------------------------------------------------
# Database & Keyword Intelligence Endpoints
# -------------------------------------------------------------------------
@app.get("/api/clusters")
def get_clusters():
    """Returns all clusters with commercial keyword counts."""
    conn = psycopg2.connect(**settings.db_config)
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT cluster_name, COUNT(*) as kw_count
            FROM v_commercial_keywords
            GROUP BY cluster_name
            ORDER BY kw_count DESC;
        """)
        rows = cur.fetchall()
        return {"clusters": [{"cluster_name": r[0], "keyword_count": r[1]} for r in rows]}
    finally:
        cur.close()
        conn.close()

@app.get("/api/keywords")
def get_keywords(
    search: Optional[str] = None,
    cluster: Optional[str] = None,
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0)
):
    """Returns commercial intent keywords from the CEO workbooks."""
    conn = psycopg2.connect(**settings.db_config)
    cur = conn.cursor()
    try:
        where_clauses = ["1=1"]
        params = []

        if search:
            where_clauses.append("(keyword_text ILIKE %s OR keyword_id ILIKE %s)")
            params.extend([f"%{search}%", f"%{search}%"])

        if cluster:
            where_clauses.append("cluster_name = %s")
            params.append(cluster)

        where_sql = " AND ".join(where_clauses)

        cur.execute(f"SELECT COUNT(*) FROM v_commercial_keywords WHERE {where_sql};", tuple(params))
        total = cur.fetchone()[0]

        query = f"""
            SELECT keyword_id, keyword_text, cluster_name, avg_monthly_searches,
                   commercial_intent_score, bid_low_range, bid_high_range,
                   primary_intent_estimated, searcher_persona, business_problem
            FROM v_commercial_keywords
            WHERE {where_sql}
            ORDER BY commercial_intent_score DESC, avg_monthly_searches DESC
            LIMIT %s OFFSET %s;
        """
        cur.execute(query, tuple(params + [limit, offset]))
        rows = cur.fetchall()

        keywords = [
            {
                "keyword_id": r[0],
                "keyword_text": r[1],
                "cluster_name": r[2],
                "avg_monthly_searches": r[3],
                "commercial_intent_score": float(r[4]) if r[4] else 0.0,
                "bid_low_range": float(r[5]) if r[5] else None,
                "bid_high_range": float(r[6]) if r[6] else None,
                "primary_intent_estimated": r[7],
                "searcher_persona": r[8],
                "business_problem": r[9]
            }
            for r in rows
        ]
        return {"total": total, "keywords": keywords, "limit": limit, "offset": offset}
    finally:
        cur.close()
        conn.close()

@app.get("/api/keywords/{keyword_id}/intents")
def get_or_expand_intents(keyword_id: str):
    """Retrieves or expands 20+ search intents for the keyword."""
    result = intent_service.expand_keyword_intents(keyword_id)
    return {
        "keyword_id": keyword_id,
        "total_intents": len(result.intents),
        "intents": [i.dict() for i in result.intents]
    }

# -------------------------------------------------------------------------
# Pollinations AI Image Generation Endpoints
# -------------------------------------------------------------------------
@app.get("/api/pollinations/models")
def get_pollinations_models():
    """Lists available image generation models from Pollinations with pricing estimates."""
    models = pollinations_service.get_models()
    return {"models": [m.dict() for m in models]}

@app.post("/api/pollinations/generate")
def generate_ai_image(req: PollinationsGenerateRequest):
    """Generates an image via Pollinations AI without baked-in text."""
    # Ensure composition prompt is built if not provided in detail
    prompt = req.prompt
    if req.template_id and len(prompt) < 80:
        prompt = pollinations_service.build_composition_prompt(
            topic=prompt,
            template_id=req.template_id,
            aspect_ratio=req.aspect_ratio or "4:5"
        )

    res = pollinations_service.generate_image(
        prompt=prompt,
        model=req.model,
        width=req.width or 1024,
        height=req.height or 1024,
        seed=req.seed
    )
    return res.dict()

@app.post("/api/upload-image")
async def upload_custom_image(file: UploadFile = File(...)):
    """Allows uploading a custom image asset."""
    file_ext = os.path.splitext(file.filename)[1].lower() or ".jpg"
    filename = f"upload_{uuid.uuid4().hex[:12]}{file_ext}"
    filepath = os.path.join(settings.GENERATED_IMAGES_DIR, filename)

    contents = await file.read()
    with open(filepath, "wb") as f:
        f.write(contents)

    return {
        "status": "uploaded_success",
        "image_url": f"/assets/generated-images/{filename}",
        "local_image_path": filepath
    }

# -------------------------------------------------------------------------
# Rendering & Preview Endpoints
# -------------------------------------------------------------------------
@app.post("/api/preview")
def preview_poster(req: PosterRenderRequest):
    """Renders HTML for live responsive preview in the canvas iframe."""
    bullets = req.bullet_points
    if len(bullets) < 3:
        bullets = bullets + ["Enterprise Scalability & Reliability", "Seamless Infrastructure Integration"][:3 - len(bullets)]
    elif len(bullets) > 5:
        bullets = bullets[:5]

    # Resolve preset dimensions if preset ID provided
    aspect_ratio = req.aspect_ratio
    preset = get_preset(req.platform_preset_id) if req.platform_preset_id else None
    if preset:
        aspect_ratio = preset.aspect_ratio

    contract = PosterContentContract(
        keyword_id=req.keyword_id or "KW00001",
        intent_id=req.intent_id or str(uuid.uuid4()),
        intent_phrase=req.title,
        intent_category="Commercial Investigation",
        audience_need=req.description,
        buying_stage="Consideration",
        marketing_angle="Enterprise Transformation",
        header=req.header,
        title=req.title,
        description=req.description,
        bullet_points=bullets,
        call_to_action=req.call_to_action,
        image_prompt="Professional enterprise visual",
        template_id=req.template_id,
        aspect_ratio=aspect_ratio,
        platform_preset_id=req.platform_preset_id,
        custom_width=preset.width if preset else None,
        custom_height=preset.height if preset else None,
        seo_alt_text=f"InfiniteTech AI - {req.title}",
        campaign_label=req.campaign_label,
        hero_image_path=req.hero_image_data_uri
    )

    try:
        html_content, w, h = poster_renderer._render_html(contract)
        return HTMLResponse(content=html_content, status_code=200)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate preview: {str(e)}")

@app.post("/api/render")
def render_poster_png(req: PosterRenderRequest):
    """Triggers deterministic headless Chrome rendering and generates high-res PNG."""
    bullets = req.bullet_points
    if len(bullets) < 3:
        bullets = bullets + ["Enterprise Scalability & Reliability", "Seamless Infrastructure Integration"][:3 - len(bullets)]
    elif len(bullets) > 5:
        bullets = bullets[:5]

    aspect_ratio = req.aspect_ratio
    preset = get_preset(req.platform_preset_id) if req.platform_preset_id else None
    if preset:
        aspect_ratio = preset.aspect_ratio

    contract = PosterContentContract(
        keyword_id=req.keyword_id or "KW00001",
        intent_id=req.intent_id or str(uuid.uuid4()),
        intent_phrase=req.title,
        intent_category="Commercial Investigation",
        audience_need=req.description,
        buying_stage="Consideration",
        marketing_angle="Enterprise Transformation",
        header=req.header,
        title=req.title,
        description=req.description,
        bullet_points=bullets,
        call_to_action=req.call_to_action,
        image_prompt="Professional enterprise visual",
        template_id=req.template_id,
        aspect_ratio=aspect_ratio,
        platform_preset_id=req.platform_preset_id,
        custom_width=preset.width if preset else None,
        custom_height=preset.height if preset else None,
        seo_alt_text=f"InfiniteTech AI - {req.title}",
        campaign_label=req.campaign_label,
        hero_image_path=req.hero_image_data_uri
    )

    try:
        render_result = poster_renderer.render_poster(contract)
        return {
            "status": "success",
            "poster_id": render_result["poster_id"],
            "filename": render_result["filename"],
            "dimensions": render_result["dimensions"],
            "aspect_ratio": render_result["aspect_ratio"],
            "file_size_bytes": render_result["file_size_bytes"],
            "download_url": f"/output_posters/{render_result['filename']}"
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to render poster: {str(e)}")

# Static Mounts
app.mount("/assets", StaticFiles(directory=settings.ASSETS_DIR), name="assets")
app.mount("/output_posters", StaticFiles(directory=settings.OUTPUT_DIR), name="output_posters")
app.mount("/static", StaticFiles(directory=os.path.join(settings.BASE_DIR, "static"), html=True), name="static")

@app.get("/logo.png")
def get_logo():
    """Serve official InfiniteTech AI logo asset."""
    logo_file = os.path.join(settings.BASE_DIR, "logo.png")
    return FileResponse(logo_file, media_type="image/png")

@app.get("/")
def read_root():
    """Serve main web application."""
    index_file = os.path.join(settings.BASE_DIR, "static", "index.html")
    return FileResponse(index_file)
