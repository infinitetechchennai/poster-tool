import os
import json
import urllib.request
import urllib.error
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from engine.models import CandidateIntent, IntentCategory, BuyingStage, MarketingAngle
from engine.prompt_templates import SYSTEM_PROMPT, build_expansion_prompt, build_replacement_prompt, PROMPT_VERSION

class BaseLLMProvider(ABC):
    @property
    @abstractmethod
    def model_name(self) -> str:
        pass

    @property
    def prompt_version(self) -> str:
        return PROMPT_VERSION

    @abstractmethod
    def generate_candidate_intents(self, keyword_text: str, cluster_name: str, persona: str, pain_point: str, headlines: List[str]) -> List[CandidateIntent]:
        pass

    @abstractmethod
    def generate_replacement_intents(self, keyword_text: str, cluster_name: str, needed_count: int, rejected_examples: List[Dict[str, Any]], approved_examples: List[str]) -> List[CandidateIntent]:
        pass

class OllamaProvider(BaseLLMProvider):
    def __init__(self, model: str = "qwen2.5:7b-instruct-q4_K_M", base_url: str = "http://localhost:11434"):
        self._model = os.environ.get("OLLAMA_MODEL", model)
        self._base_url = os.environ.get("OLLAMA_BASE_URL", base_url).rstrip("/")

    @property
    def model_name(self) -> str:
        return f"ollama/{self._model}"

    def _call_ollama(self, prompt: str) -> Dict[str, Any]:
        payload = {
            "model": self._model,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            "format": "json",
            "stream": False,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9
            }
        }
        req = urllib.request.Request(
            f"{self._base_url}/api/chat",
            data=json.dumps(payload).encode('utf-8'),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=45) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            content = data.get("message", {}).get("content", "{}")
            return json.loads(content)

    def generate_candidate_intents(self, keyword_text: str, cluster_name: str, persona: str, pain_point: str, headlines: List[str]) -> List[CandidateIntent]:
        prompt = build_expansion_prompt(keyword_text, cluster_name, persona, pain_point, headlines)
        res_json = self._call_ollama(prompt)
        candidates = []
        for item in res_json.get("candidates", []):
            try:
                candidates.append(CandidateIntent(**item))
            except Exception:
                continue
        return candidates

    def generate_replacement_intents(self, keyword_text: str, cluster_name: str, needed_count: int, rejected_examples: List[Dict[str, Any]], approved_examples: List[str]) -> List[CandidateIntent]:
        prompt = build_replacement_prompt(keyword_text, cluster_name, needed_count, rejected_examples, approved_examples)
        res_json = self._call_ollama(prompt)
        replacements = []
        for item in res_json.get("candidates", []):
            try:
                replacements.append(CandidateIntent(**item))
            except Exception:
                continue
        return replacements

class SemanticRuleExpansionProvider(BaseLLMProvider):
    """
    High-fidelity deterministic semantic expansion engine.
    Decomposes keywords across search archetypes, angles, and operational pain points
    to guarantee diverse, validated intents even without an active GPU/daemon.
    """
    @property
    def model_name(self) -> str:
        return "infinite_semantic_engine/v1.0"

    def _generate_pool(self, keyword_text: str, cluster_name: str, persona: str, pain_point: str) -> List[CandidateIntent]:
        kw = keyword_text.strip()
        
        # Archetype templates combining search intent, angle, and audience need
        templates = [
            # 1. Problem-Aware
            ("how to solve operational bottlenecks with {kw}", IntentCategory.PROBLEM_AWARE, "Diagnosing workflow inefficiencies and technical debt", BuyingStage.AWARENESS, MarketingAngle.PAIN_POINT),
            ("common pitfalls and risks in implementing {kw}", IntentCategory.PROBLEM_AWARE, "Risk mitigation and legacy system failure prevention", BuyingStage.AWARENESS, MarketingAngle.PAIN_POINT),
            ("identifying hidden operational costs in {kw}", IntentCategory.PROBLEM_AWARE, "Auditing cost leaks and manual overhead", BuyingStage.AWARENESS, MarketingAngle.EFFICIENCY),
            ("security and compliance audit checklist for {kw}", IntentCategory.PROBLEM_AWARE, "Ensuring data privacy, governance, and regulatory compliance", BuyingStage.AWARENESS, MarketingAngle.CONTROL),

            # 2. Informational
            ("comprehensive architectural guide to {kw}", IntentCategory.INFORMATIONAL, "Understanding modern modular engineering standards", BuyingStage.CONSIDERATION, MarketingAngle.DISCOVERY),
            ("best practices for enterprise {kw} integration", IntentCategory.INFORMATIONAL, "Structuring robust APIs and seamless system interoperability", BuyingStage.CONSIDERATION, MarketingAngle.AUTOMATION),
            ("technology stack comparison for scalable {kw}", IntentCategory.INFORMATIONAL, "Evaluating programming languages, frameworks, and cloud stacks", BuyingStage.CONSIDERATION, MarketingAngle.DISCOVERY),
            ("step by step deployment roadmap for {kw}", IntentCategory.INFORMATIONAL, "Planning delivery phases, milestones, and testing cycles", BuyingStage.CONSIDERATION, MarketingAngle.CONTROL),

            # 3. Commercial Investigation
            ("how to evaluate and select the right partner for {kw}", IntentCategory.COMMERCIAL_INVESTIGATION, "Setting partner qualification criteria and technical vetting", BuyingStage.CONSIDERATION, MarketingAngle.CONSULTATION),
            ("key criteria for hiring specialized {kw} engineers", IntentCategory.COMMERCIAL_INVESTIGATION, "Securing senior engineering talent with verified domain expertise", BuyingStage.CONSIDERATION, MarketingAngle.COMPETITIVE_ADVANTAGE),
            ("build versus buy analysis for enterprise {kw}", IntentCategory.COMMERCIAL_INVESTIGATION, "Evaluating long term TCO, agility, and proprietary IP ownership", BuyingStage.CONSIDERATION, MarketingAngle.OUTCOME),
            ("budget estimation and timeline scoping for {kw} project", IntentCategory.COMMERCIAL_INVESTIGATION, "Accurately forecasting development resources and sprint budgets", BuyingStage.CONSIDERATION, MarketingAngle.EFFICIENCY),
            ("roi calculation and business case framework for {kw}", IntentCategory.COMMERCIAL_INVESTIGATION, "Demonstrating stakeholder value and capital expenditure payback", BuyingStage.CONSIDERATION, MarketingAngle.OUTCOME),

            # 4. Transactional / Decision
            ("request a technical consultation and quote for {kw}", IntentCategory.TRANSACTIONAL, "Initiating project scoping and architectural feasibility study", BuyingStage.DECISION, MarketingAngle.CONSULTATION),
            ("scoping a dedicated sprint team for custom {kw}", IntentCategory.TRANSACTIONAL, "Accelerating development velocity with dedicated agile squads", BuyingStage.DECISION, MarketingAngle.SCALE),
            ("rfp template and technical requirements specification for {kw}", IntentCategory.TRANSACTIONAL, "Issuing procurement specifications for enterprise vendor selection", BuyingStage.DECISION, MarketingAngle.CONTROL),
            ("hire experienced technology firm for {kw} deployment", IntentCategory.TRANSACTIONAL, "Contracting end to end full lifecycle development partner", BuyingStage.DECISION, MarketingAngle.CONSULTATION),

            # 5. Solution-Seeking / Strategic Value
            ("automating mission critical business workflows using {kw}", IntentCategory.SOLUTION_SEEKING, "Eliminating repetitive manual data entry and human error", BuyingStage.CONSIDERATION, MarketingAngle.AUTOMATION),
            ("scaling high traffic infrastructure and databases with {kw}", IntentCategory.SOLUTION_SEEKING, "Handling elastic traffic surges with high availability", BuyingStage.DECISION, MarketingAngle.SCALE),
            ("achieving competitive differentiation through bespoke {kw}", IntentCategory.SOLUTION_SEEKING, "Developing unique proprietary capabilities competitors cannot match", BuyingStage.DECISION, MarketingAngle.COMPETITIVE_ADVANTAGE),
            ("modernizing legacy monolithic systems with cloud native {kw}", IntentCategory.SOLUTION_SEEKING, "Migrating monolithic codebases to microservices architectures", BuyingStage.CONSIDERATION, MarketingAngle.OUTCOME),
            ("integrating real time analytics and dashboard reporting into {kw}", IntentCategory.SOLUTION_SEEKING, "Empowering executive decision making with telemetry insights", BuyingStage.CONSIDERATION, MarketingAngle.CONTROL),

            # 6. Comparison & Vertical Use Cases
            ("in house team versus outsourced agency for {kw}", IntentCategory.COMPARISON, "Comparing delivery speed, talent retention, and management overhead", BuyingStage.CONSIDERATION, MarketingAngle.EFFICIENCY),
            ("custom development versus commercial off the shelf software for {kw}", IntentCategory.COMPARISON, "Avoiding vendor lock in and tailoring workflows to business needs", BuyingStage.CONSIDERATION, MarketingAngle.CONTROL),
            ("healthcare and fintech regulatory considerations in {kw}", IntentCategory.COMPARISON, "Satisfying stringent industry standards and audit trails", BuyingStage.CONSIDERATION, MarketingAngle.INDUSTRY_USE_CASE),
            ("manufacturing and supply chain optimization using {kw}", IntentCategory.COMPARISON, "Optimizing production scheduling, inventory visibility, and logistics", BuyingStage.CONSIDERATION, MarketingAngle.INDUSTRY_USE_CASE),
            ("retail and ecommerce omnichannel personalization with {kw}", IntentCategory.COMPARISON, "Increasing conversion rates and customer retention via tailored UX", BuyingStage.CONSIDERATION, MarketingAngle.INDUSTRY_USE_CASE),
            ("enterprise software integration and api orchestration for {kw}", IntentCategory.SOLUTION_SEEKING, "Connecting ERP, CRM, and bespoke backend services seamlessly", BuyingStage.DECISION, MarketingAngle.AUTOMATION),
        ]

        candidates = []
        for pattern, cat, need, stage, angle in templates:
            phrase = pattern.format(kw=kw)
            candidates.append(CandidateIntent(
                intent_phrase=phrase,
                intent_category=cat,
                audience_need=need,
                buying_stage=stage,
                marketing_angle=angle
            ))
        return candidates

    def generate_candidate_intents(self, keyword_text: str, cluster_name: str, persona: str, pain_point: str, headlines: List[str]) -> List[CandidateIntent]:
        return self._generate_pool(keyword_text, cluster_name, persona, pain_point)

    def generate_replacement_intents(self, keyword_text: str, cluster_name: str, needed_count: int, rejected_examples: List[Dict[str, Any]], approved_examples: List[str]) -> List[CandidateIntent]:
        kw = keyword_text.strip()
        additional_templates = [
            ("optimizing latency and throughput for {kw}", IntentCategory.SOLUTION_SEEKING, "High performance tuning and server responsiveness", BuyingStage.CONSIDERATION, MarketingAngle.EFFICIENCY),
            ("disaster recovery and multi region backup strategy for {kw}", IntentCategory.PROBLEM_AWARE, "Business continuity and zero data loss architecture", BuyingStage.CONSIDERATION, MarketingAngle.CONTROL),
            ("developer experience and cicd automation pipeline in {kw}", IntentCategory.SOLUTION_SEEKING, "Accelerating code releases with automated testing pipelines", BuyingStage.CONSIDERATION, MarketingAngle.AUTOMATION),
            ("user experience design and accessibility standards for {kw}", IntentCategory.INFORMATIONAL, "Creating intuitive, compliant, and accessible customer interfaces", BuyingStage.CONSIDERATION, MarketingAngle.OUTCOME),
            ("multi tenant cloud architecture patterns for {kw}", IntentCategory.INFORMATIONAL, "Partitioning enterprise tenant data securely and cost efficiently", BuyingStage.CONSIDERATION, MarketingAngle.SCALE),
            ("executive roadmap presentation and milestone tracking for {kw}", IntentCategory.COMMERCIAL_INVESTIGATION, "Aligning boardroom stakeholders and engineering deliverables", BuyingStage.CONSIDERATION, MarketingAngle.CONSULTATION),
            ("penetration testing and vulnerability assessment for {kw}", IntentCategory.PROBLEM_AWARE, "Hardening attack surfaces and safeguarding proprietary data", BuyingStage.DECISION, MarketingAngle.CONTROL),
            ("service level agreements and production maintenance for {kw}", IntentCategory.TRANSACTIONAL, "Securing 24 7 tier 1 support and uptime guarantees", BuyingStage.DECISION, MarketingAngle.CONSULTATION)
        ]
        replacements = []
        for pattern, cat, need, stage, angle in additional_templates[:needed_count + 2]:
            phrase = pattern.format(kw=kw)
            replacements.append(CandidateIntent(
                intent_phrase=phrase,
                intent_category=cat,
                audience_need=need,
                buying_stage=stage,
                marketing_angle=angle
            ))
        return replacements

def get_llm_provider() -> BaseLLMProvider:
    provider_pref = os.environ.get("LLM_PROVIDER", "").lower()
    if provider_pref == "ollama":
        return OllamaProvider()
    elif provider_pref == "rule_based":
        return SemanticRuleExpansionProvider()

    # Auto-detect if Ollama is running
    try:
        req = urllib.request.Request("http://localhost:11434/api/tags")
        with urllib.request.urlopen(req, timeout=1):
            return OllamaProvider()
    except Exception:
        return SemanticRuleExpansionProvider()
