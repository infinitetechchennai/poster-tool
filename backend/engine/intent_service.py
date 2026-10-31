import os
import time
import psycopg2
from psycopg2.extras import Json, execute_values
from typing import List, Dict, Any, Optional

from engine.models import (
    CandidateIntent, ValidatedIntent, IntentExpansionResult,
    IntentCategory, BuyingStage, MarketingAngle
)
from engine.similarity import calculate_similarity, find_most_similar
from engine.claims_filter import validate_claims
from engine.llm_provider import get_llm_provider, BaseLLMProvider

DB_CONFIG = {
    "dbname": os.environ.get("PGDATABASE", "ai_img"),
    "user": os.environ.get("PGUSER", "postgres"),
    "password": os.environ.get("PGPASSWORD", "1234"),
    "host": os.environ.get("PGHOST", "localhost"),
    "port": os.environ.get("PGPORT", "5432")
}

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)

class IntentExpansionService:
    def __init__(self, provider: Optional[BaseLLMProvider] = None, similarity_threshold: float = 0.82):
        self.provider = provider or get_llm_provider()
        self.similarity_threshold = similarity_threshold

    def get_cached_intents(self, keyword_id: str, target_count: int = 20) -> Optional[List[ValidatedIntent]]:
        conn = get_db_connection()
        cur = conn.cursor()
        try:
            cur.execute("""
                SELECT intent_phrase, intent_category, audience_need, buying_stage, marketing_angle,
                       approval_status, rejection_reason, semantic_similarity_score, model_name, prompt_version
                FROM generated_intents
                WHERE keyword_id = %s AND approval_status = 'approved'
                ORDER BY created_at ASC;
            """, (keyword_id,))
            rows = cur.fetchall()
            if len(rows) >= target_count:
                intents = []
                for r in rows:
                    intents.append(ValidatedIntent(
                        intent_phrase=r[0],
                        intent_category=r[1] or "Informational",
                        audience_need=r[2] or "",
                        buying_stage=r[3] or "Consideration",
                        marketing_angle=r[4] or "Discovery",
                        approval_status=r[5],
                        rejection_reason=r[6],
                        semantic_similarity_score=r[7],
                        model_name=r[8],
                        prompt_version=r[9]
                    ))
                return intents
            return None
        finally:
            cur.close()
            conn.close()

    def expand_keyword_intents(
        self,
        keyword_id: str,
        target_approved: int = 20,
        max_retries: int = 3,
        force: bool = False
    ) -> IntentExpansionResult:
        start_time = time.time()

        # 1. Check cache unless forced
        if not force:
            cached = self.get_cached_intents(keyword_id, target_approved)
            if cached:
                print(f"Keyword {keyword_id}: returning {len(cached)} cached intents.")
                return IntentExpansionResult(
                    job_id="cached",
                    keyword_id=keyword_id,
                    model_name=cached[0].model_name or self.provider.model_name,
                    prompt_version=cached[0].prompt_version or self.provider.prompt_version,
                    total_generated=len(cached),
                    valid_count=len(cached),
                    rejected_count=0,
                    retry_count=0,
                    status="completed",
                    intents=cached,
                    execution_metrics={"from_cache": True}
                )

        # 2. Fetch keyword intelligence and source context
        conn = get_db_connection()
        conn.autocommit = False
        cur = conn.cursor()

        try:
            cur.execute("""
                SELECT keyword_text, cluster_name, searcher_persona, business_problem, primary_intent_estimated
                FROM keywords WHERE keyword_id = %s;
            """, (keyword_id,))
            kw_row = cur.fetchone()
            if not kw_row:
                raise ValueError(f"Keyword ID {keyword_id} not found in database.")

            kw_text, cluster_name, persona, pain_point, primary_intent_est = kw_row

            # Fetch top headline drafts for marketing inspiration
            cur.execute("""
                SELECT headline_draft FROM source_headlines
                WHERE keyword_id = %s LIMIT 5;
            """, (keyword_id,))
            headlines = [r[0] for r in cur.fetchall()]

            # 3. Create job record
            cur.execute("""
                INSERT INTO generation_jobs (job_type, keyword_id, status, progress_percent, model_name, prompt_version)
                VALUES ('intent_expansion', %s, 'processing', 15, %s, %s)
                RETURNING job_id;
            """, (keyword_id, self.provider.model_name, self.provider.prompt_version))
            job_id = str(cur.fetchone()[0])
            conn.commit()

            # 4. Generate candidate batch
            print(f"Generating candidate intents for '{kw_text}' via {self.provider.model_name}...")
            candidates = self.provider.generate_candidate_intents(
                kw_text, cluster_name, persona or "", pain_point or "", headlines
            )

            approved_intents: List[ValidatedIntent] = []
            rejected_intents: List[ValidatedIntent] = []
            accepted_phrases: List[str] = []
            rejected_examples: List[Dict[str, Any]] = []

            def process_candidate(cand: CandidateIntent):
                phrase = cand.intent_phrase.strip()
                norm_phrase = phrase.lower()

                # Exact duplicate check
                if norm_phrase in [p.lower() for p in accepted_phrases]:
                    rejected_intents.append(ValidatedIntent(
                        intent_phrase=phrase,
                        intent_category=cand.intent_category.value if hasattr(cand.intent_category, 'value') else str(cand.intent_category),
                        audience_need=cand.audience_need,
                        buying_stage=cand.buying_stage.value if hasattr(cand.buying_stage, 'value') else str(cand.buying_stage),
                        marketing_angle=cand.marketing_angle.value if hasattr(cand.marketing_angle, 'value') else str(cand.marketing_angle),
                        approval_status="rejected",
                        rejection_reason="Exact duplicate of existing candidate",
                        semantic_similarity_score=1.0,
                        model_name=self.provider.model_name,
                        prompt_version=self.provider.prompt_version
                    ))
                    rejected_examples.append({"intent_phrase": phrase, "reason": "exact duplicate"})
                    return

                # Claims and policy filter
                is_valid_claim, claim_reason = validate_claims(cand, kw_text, cluster_name)
                if not is_valid_claim:
                    rejected_intents.append(ValidatedIntent(
                        intent_phrase=phrase,
                        intent_category=cand.intent_category.value if hasattr(cand.intent_category, 'value') else str(cand.intent_category),
                        audience_need=cand.audience_need,
                        buying_stage=cand.buying_stage.value if hasattr(cand.buying_stage, 'value') else str(cand.buying_stage),
                        marketing_angle=cand.marketing_angle.value if hasattr(cand.marketing_angle, 'value') else str(cand.marketing_angle),
                        approval_status="rejected",
                        rejection_reason=claim_reason or "Policy violation",
                        semantic_similarity_score=0.0,
                        model_name=self.provider.model_name,
                        prompt_version=self.provider.prompt_version
                    ))
                    rejected_examples.append({"intent_phrase": phrase, "reason": claim_reason})
                    return

                # Semantic similarity check
                sim_score, matched_phrase = find_most_similar(phrase, accepted_phrases)
                if sim_score >= self.similarity_threshold:
                    rejected_intents.append(ValidatedIntent(
                        intent_phrase=phrase,
                        intent_category=cand.intent_category.value if hasattr(cand.intent_category, 'value') else str(cand.intent_category),
                        audience_need=cand.audience_need,
                        buying_stage=cand.buying_stage.value if hasattr(cand.buying_stage, 'value') else str(cand.buying_stage),
                        marketing_angle=cand.marketing_angle.value if hasattr(cand.marketing_angle, 'value') else str(cand.marketing_angle),
                        approval_status="rejected",
                        rejection_reason=f"Near-duplicate of '{matched_phrase}' (similarity: {sim_score:.2f} >= {self.similarity_threshold})",
                        semantic_similarity_score=sim_score,
                        model_name=self.provider.model_name,
                        prompt_version=self.provider.prompt_version
                    ))
                    rejected_examples.append({"intent_phrase": phrase, "reason": f"near duplicate of {matched_phrase}"})
                    return

                # Candidate approved!
                accepted_phrases.append(phrase)
                approved_intents.append(ValidatedIntent(
                    intent_phrase=phrase,
                    intent_category=cand.intent_category.value if hasattr(cand.intent_category, 'value') else str(cand.intent_category),
                    audience_need=cand.audience_need,
                    buying_stage=cand.buying_stage.value if hasattr(cand.buying_stage, 'value') else str(cand.buying_stage),
                    marketing_angle=cand.marketing_angle.value if hasattr(cand.marketing_angle, 'value') else str(cand.marketing_angle),
                    approval_status="approved",
                    rejection_reason=None,
                    semantic_similarity_score=sim_score,
                    model_name=self.provider.model_name,
                    prompt_version=self.provider.prompt_version
                ))

            for c in candidates:
                process_candidate(c)

            # 5. Replacement loop if below target
            retries = 0
            while len(approved_intents) < target_approved and retries < max_retries:
                retries += 1
                needed = target_approved - len(approved_intents)
                print(f"Retrying ({retries}/{max_retries}): need {needed} additional intents...")
                replacements = self.provider.generate_replacement_intents(
                    kw_text, cluster_name, needed, rejected_examples, accepted_phrases
                )
                if not replacements:
                    break
                for rep in replacements:
                    process_candidate(rep)
                    if len(approved_intents) >= target_approved:
                        break

            # 6. Determine final job status
            if len(approved_intents) >= target_approved:
                final_status = "completed"
            else:
                final_status = "needs_review"
                print(f"Warning: Only {len(approved_intents)} approved intents achieved (< {target_approved}). Marking needs_review.")

            elapsed_sec = round(time.time() - start_time, 2)
            metrics = {
                "duration_seconds": elapsed_sec,
                "total_generated": len(candidates) + len(rejected_intents) + len(approved_intents),
                "approved_count": len(approved_intents),
                "rejected_count": len(rejected_intents),
                "retries": retries,
                "similarity_threshold": self.similarity_threshold
            }

            # 7. Persist to database
            cur.execute("""
                UPDATE generation_jobs
                SET status = %s, progress_percent = 100, completed_at = NOW(), execution_metrics = %s
                WHERE job_id = %s;
            """, (final_status, Json(metrics), job_id))

            # Store approved intents
            all_to_store = approved_intents + rejected_intents
            records_to_insert = []
            for item in all_to_store:
                records_to_insert.append((
                    keyword_id,
                    job_id,
                    item.intent_phrase,
                    item.intent_category,
                    item.audience_need,
                    item.buying_stage,
                    item.marketing_angle,
                    item.semantic_similarity_score,
                    item.approval_status,
                    item.rejection_reason,
                    item.model_name,
                    item.prompt_version
                ))

            execute_values(cur, """
                INSERT INTO generated_intents (
                    keyword_id, job_id, intent_phrase, intent_category, audience_need,
                    buying_stage, marketing_angle, semantic_similarity_score, approval_status,
                    rejection_reason, model_name, prompt_version
                ) VALUES %s;
            """, records_to_insert)

            conn.commit()

            return IntentExpansionResult(
                job_id=job_id,
                keyword_id=keyword_id,
                model_name=self.provider.model_name,
                prompt_version=self.provider.prompt_version,
                total_generated=len(all_to_store),
                valid_count=len(approved_intents),
                rejected_count=len(rejected_intents),
                retry_count=retries,
                status=final_status,
                intents=approved_intents,
                execution_metrics=metrics
            )

        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cur.close()
            conn.close()
