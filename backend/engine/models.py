from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class IntentCategory(str, Enum):
    INFORMATIONAL = "Informational"
    COMMERCIAL_INVESTIGATION = "Commercial Investigation"
    TRANSACTIONAL = "Transactional"
    PROBLEM_AWARE = "Problem-Aware"
    SOLUTION_SEEKING = "Solution-Seeking"
    COMPARISON = "Comparison"

class BuyingStage(str, Enum):
    AWARENESS = "Awareness"
    CONSIDERATION = "Consideration"
    DECISION = "Decision"

class MarketingAngle(str, Enum):
    PAIN_POINT = "Pain point"
    OUTCOME = "Outcome"
    EFFICIENCY = "Efficiency"
    AUTOMATION = "Automation"
    SCALE = "Scale"
    COMPETITIVE_ADVANTAGE = "Competitive advantage"
    CONTROL = "Control"
    INDUSTRY_USE_CASE = "Industry use case"
    DISCOVERY = "Discovery"
    CONSULTATION = "Consultation"

class CandidateIntent(BaseModel):
    intent_phrase: str = Field(..., description="The search query or intent phrasing expressing a distinct user goal")
    intent_category: IntentCategory = Field(..., description="High level search intent archetype")
    audience_need: str = Field(..., description="Underlying business pain point or goal")
    buying_stage: BuyingStage = Field(..., description="Position in customer purchase journey")
    marketing_angle: MarketingAngle = Field(..., description="Marketing angle to address this intent")

class ValidationResult(BaseModel):
    is_valid: bool
    rejection_reason: Optional[str] = None
    similarity_score: Optional[float] = None
    matched_intent: Optional[str] = None

class ValidatedIntent(BaseModel):
    intent_phrase: str
    intent_category: str
    audience_need: str
    buying_stage: str
    marketing_angle: str
    approval_status: str = "approved"  # approved, rejected, needs_review
    rejection_reason: Optional[str] = None
    semantic_similarity_score: Optional[float] = None
    model_name: Optional[str] = None
    prompt_version: Optional[str] = None

class IntentExpansionResult(BaseModel):
    job_id: str
    keyword_id: str
    model_name: str
    prompt_version: str
    total_generated: int
    valid_count: int
    rejected_count: int
    retry_count: int
    status: str  # completed, needs_review, failed
    intents: List[ValidatedIntent]
    execution_metrics: Dict[str, Any] = {}
