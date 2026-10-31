import os
import sys
import psycopg2
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from engine.models import CandidateIntent, IntentCategory, BuyingStage, MarketingAngle
from engine.similarity import calculate_similarity, find_most_similar
from engine.claims_filter import validate_claims
from engine.llm_provider import SemanticRuleExpansionProvider, BaseLLMProvider
from engine.intent_service import IntentExpansionService, DB_CONFIG

@pytest.fixture(scope="module")
def db_conn():
    conn = psycopg2.connect(**DB_CONFIG)
    yield conn
    conn.close()

def test_semantic_deduplication():
    """Verify that near duplicates exceeding 0.82 are rejected, while distinct queries are approved."""
    base = "custom software development for enterprise healthcare"
    exact = "custom software development for enterprise healthcare"
    near_dup = "custom software development services for enterprise healthcare"
    distinct = "cloud infrastructure disaster recovery cost comparison"

    assert calculate_similarity(base, exact) == 1.0
    sim_near = calculate_similarity(base, near_dup)
    assert sim_near >= 0.82, f"Expected similarity >= 0.82, got {sim_near}"

    sim_distinct = calculate_similarity(base, distinct)
    assert sim_distinct < 0.50, f"Expected similarity < 0.50, got {sim_distinct}"

def test_claims_filter():
    """Verify that forbidden claims (prices, absolute guarantees, superlatives) are caught."""
    valid_cand = CandidateIntent(
        intent_phrase="custom software architecture for enterprise logistics",
        intent_category=IntentCategory.SOLUTION_SEEKING,
        audience_need="Optimizing fleet routing algorithms and inventory tracking",
        buying_stage=BuyingStage.CONSIDERATION,
        marketing_angle=MarketingAngle.EFFICIENCY
    )
    is_valid, reason = validate_claims(valid_cand, "custom software development", "Custom Software Development")
    assert is_valid is True
    assert reason is None

    # Price claim violation
    invalid_price = CandidateIntent(
        intent_phrase="hire custom software developer for $99 flat rate",
        intent_category=IntentCategory.TRANSACTIONAL,
        audience_need="Lowest cost developer",
        buying_stage=BuyingStage.DECISION,
        marketing_angle=MarketingAngle.PAIN_POINT
    )
    is_valid_p, reason_p = validate_claims(invalid_price, "custom software development", "Custom Software Development")
    assert is_valid_p is False
    assert "pricing" in reason_p.lower()

    # Absolute guarantee violation
    invalid_guar = CandidateIntent(
        intent_phrase="zero defects guaranteed software development",
        intent_category=IntentCategory.TRANSACTIONAL,
        audience_need="Guaranteed error free code",
        buying_stage=BuyingStage.DECISION,
        marketing_angle=MarketingAngle.CONTROL
    )
    is_valid_g, reason_g = validate_claims(invalid_guar, "custom software development", "Custom Software Development")
    assert is_valid_g is False
    assert "guarantee" in reason_g.lower()

def test_intent_expansion_sample_keywords(db_conn):
    """
    Test full search-intent expansion across 3 distinct clusters:
    - KW00001 (Custom Software Development)
    - KW00200 (Cloud & DevOps)
    - KW00500 (AI & Machine Learning)
    """
    service = IntentExpansionService()
    test_keywords = ["KW00001", "KW00200", "KW00500"]

    for kw_id in test_keywords:
        res = service.expand_keyword_intents(keyword_id=kw_id, target_approved=20, force=True)

        assert res.status == "completed", f"Job failed for {kw_id}: status={res.status}"
        assert res.valid_count >= 20, f"Expected >= 20 valid intents, got {res.valid_count}"
        assert len(res.intents) >= 20

        # Assert diversity across categories and angles
        categories = set(i.intent_category for i in res.intents)
        angles = set(i.marketing_angle for i in res.intents)
        stages = set(i.buying_stage for i in res.intents)

        assert len(categories) >= 4, f"Low category diversity for {kw_id}: {categories}"
        assert len(angles) >= 5, f"Low angle diversity for {kw_id}: {angles}"
        assert len(stages) >= 2, f"Low stage diversity for {kw_id}: {stages}"

        # Assert database persistence
        cur = db_conn.cursor()
        cur.execute("""
            SELECT COUNT(*) FROM generated_intents
            WHERE keyword_id = %s AND approval_status = 'approved';
        """, (kw_id,))
        saved_count = cur.fetchone()[0]
        cur.close()

        assert saved_count >= 20, f"Expected >= 20 saved intents in DB, found {saved_count}"

def test_intent_caching():
    """Verify that expanding an already processed keyword returns cached results without re-generating."""
    service = IntentExpansionService()
    kw_id = "KW00001"

    cached_res = service.expand_keyword_intents(keyword_id=kw_id, target_approved=20, force=False)
    assert cached_res.job_id == "cached"
    assert cached_res.status == "completed"
    assert cached_res.valid_count >= 20
    assert cached_res.execution_metrics.get("from_cache") is True

def test_needs_review_transition():
    """Verify that if the target of 20 cannot be met, the job transitions to 'needs_review'."""
    class DefectiveMockProvider(BaseLLMProvider):
        @property
        def model_name(self) -> str:
            return "mock/defective"

        def generate_candidate_intents(self, *args, **kwargs):
            # Generates only 5 distinct intents (insufficient to meet target of 20)
            distinct_phrases = [
                "exploring mobile backend architecture options",
                "cost breakdown of native ios vs flutter",
                "enterprise security standards for tablet apps",
                "app store review guidelines and approval timeline",
                "offline data sync patterns for warehouse tablets"
            ]
            return [
                CandidateIntent(
                    intent_phrase=p,
                    intent_category=IntentCategory.INFORMATIONAL,
                    audience_need="Sample operational challenge",
                    buying_stage=BuyingStage.AWARENESS,
                    marketing_angle=MarketingAngle.DISCOVERY
                ) for p in distinct_phrases
            ]

        def generate_replacement_intents(self, *args, **kwargs):
            return []  # No replacements

    defective_service = IntentExpansionService(provider=DefectiveMockProvider())
    res = defective_service.expand_keyword_intents(keyword_id="KW00002", target_approved=20, max_retries=1, force=True)

    assert res.status == "needs_review"
    assert res.valid_count == 5
    assert res.valid_count < 20
