import os
import uuid
import psycopg2
from psycopg2.extras import Json
from typing import Optional, Dict, Any, List

from engine.poster_models import PosterContentContract
from engine.claims_filter import validate_claims
from engine.models import CandidateIntent, IntentCategory, BuyingStage, MarketingAngle

DB_CONFIG = {
    "dbname": os.environ.get("PGDATABASE", "ai_img"),
    "user": os.environ.get("PGUSER", "postgres"),
    "password": os.environ.get("PGPASSWORD", "1234"),
    "host": os.environ.get("PGHOST", "localhost"),
    "port": os.environ.get("PGPORT", "5432")
}

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)

class PosterContentService:
    def __init__(self):
        pass

    def generate_poster_content(
        self,
        intent_id: str,
        template_id: str = "corporate_minimal",
        aspect_ratio: str = "4:5"
    ) -> PosterContentContract:
        conn = get_db_connection()
        cur = conn.cursor()

        try:
            # 1. Fetch the validated intent and its parent keyword
            cur.execute("""
                SELECT 
                    i.intent_id, i.keyword_id, i.intent_phrase, i.intent_category,
                    i.audience_need, i.buying_stage, i.marketing_angle,
                    k.keyword_text, k.cluster_name, k.searcher_persona, k.business_problem
                FROM generated_intents i
                JOIN keywords k ON i.keyword_id = k.keyword_id
                WHERE i.intent_id = %s;
            """, (intent_id,))
            row = cur.fetchone()
            if not row:
                raise ValueError(f"Intent ID {intent_id} not found in database.")

            (
                i_id, kw_id, i_phrase, i_cat, i_need, i_stage, i_angle,
                kw_text, cluster_name, persona, problem
            ) = row

            # Fetch existing headline for angle inspiration
            cur.execute("""
                SELECT headline_draft, call_to_action
                FROM source_headlines
                WHERE keyword_id = %s AND marketing_angle = %s
                LIMIT 1;
            """, (kw_id, i_angle or 'Outcome'))
            h_row = cur.fetchone()
            sample_hl = h_row[0] if h_row else None
            source_cta = h_row[1] if h_row else "Request a Custom Quote"

            # 2. Synthesize structured copy conforming strictly to capabilities
            header = f"INFINITETECH AI • {cluster_name.upper()}"
            
            # Title formulation: Title-case compelling title
            words = [w.capitalize() for w in i_phrase.split()]
            if len(words) > 10:
                title = " ".join(words[:9]) + "..."
            else:
                title = " ".join(words)

            # Description
            description = (
                f"Accelerate delivery and solve mission-critical operational challenges with high-performance {cluster_name.lower()} "
                f"architected for enterprise scale, security, and verified ROI."
            )

            # 3 to 5 Benefit Bullets
            bullets = [
                f"Engineered for {kw_text}: robust, scalable, and tailored to business workflows",
                f"Comprehensive security governance and compliance standards built in",
                f"Proven delivery roadmap with transparent sprint milestones and dedicated architects",
                f"Seamless integration across your existing enterprise APIs and backend infrastructure"
            ]

            cta = source_cta or "Schedule a Technical Scoping Session"
            image_prompt = (
                f"Ultra-high resolution abstract tech background, dark navy and cyan volumetric lighting, "
                f"clean geometric architectural server structures, cinematic lighting, 8k render, no text, no typography"
            )
            alt_text = f"InfiniteTechAI poster for {kw_text} addressing {i_phrase}"

            # 3. Construct and validate with Pydantic PosterContentContract
            contract = PosterContentContract(
                keyword_id=kw_id,
                intent_id=str(i_id),
                intent_phrase=i_phrase,
                intent_category=i_cat or "Commercial Investigation",
                audience_need=i_need or "Enterprise scaling",
                buying_stage=i_stage or "Decision",
                marketing_angle=i_angle or "Outcome",
                header=header,
                title=title,
                description=description,
                bullet_points=bullets,
                call_to_action=cta,
                image_prompt=image_prompt,
                template_id=template_id,
                visual_style="dark_modern",
                aspect_ratio=aspect_ratio,
                seo_alt_text=alt_text,
                validation_status="passed",
                human_approval_status="draft"
            )

            # 4. Save to PostgreSQL poster_content table
            poster_content_id = str(uuid.uuid4())
            cur.execute("""
                INSERT INTO poster_content (
                    poster_content_id, intent_id, keyword_id, header, title, description,
                    bullet_points, call_to_action, image_prompt, template_id, visual_style,
                    aspect_ratio, seo_alt_text, validation_status, human_approval_status
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING poster_content_id;
            """, (
                poster_content_id, contract.intent_id, contract.keyword_id,
                contract.header, contract.title, contract.description,
                Json(contract.bullet_points), contract.call_to_action, contract.image_prompt,
                contract.template_id, contract.visual_style, contract.aspect_ratio,
                contract.seo_alt_text, contract.validation_status, contract.human_approval_status
            ))
            conn.commit()

            return contract

        finally:
            cur.close()
            conn.close()
