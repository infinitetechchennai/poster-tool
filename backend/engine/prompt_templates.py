import json
from typing import List, Dict, Any

PROMPT_VERSION = "v1.0.0"

SYSTEM_PROMPT = """You are a senior search marketing strategist, SEO director, and enterprise solution architect for InfiniteTechAI.

Your mission is to expand a CEO-provided keyword into 25 to 30 candidate search intents.

CRITICAL INSTRUCTIONS:
1. DISTINCTION OVER WORDING: A search intent must represent a genuinely distinct user need, goal, or problem. Do NOT merely reword the same headline or shuffle synonyms.
2. DIVERSITY REQUIREMENT: Ensure candidates span distinct intent archetypes:
   - Problem-Aware (e.g. diagnosing bottlenecks, legacy technical debt, performance limits)
   - Informational (e.g. architecture principles, best practices, frameworks)
   - Commercial Investigation (e.g. scoping criteria, vendor evaluation, build vs buy)
   - Transactional (e.g. requesting proposals, scoping sprints, hiring specialized engineering teams)
   - Solution-Seeking (e.g. integrating APIs, automated CI/CD pipelines, custom AI microservices)
   - Comparison (e.g. internal development vs specialized agency, off-the-shelf vs custom)
3. ZERO UNSUPPORTED CLAIMS: Do not manufacture pricing promises, false guarantees, fake certifications, or unverified statistical claims.
4. STRICT JSON OUTPUT: Return ONLY a valid JSON object matching this schema:
{
  "candidates": [
    {
      "intent_phrase": "Clear search phrase or query representing user goal (minimum 3 words)",
      "intent_category": "Informational" | "Commercial Investigation" | "Transactional" | "Problem-Aware" | "Solution-Seeking" | "Comparison",
      "audience_need": "Specific operational challenge or objective driving this search",
      "buying_stage": "Awareness" | "Consideration" | "Decision",
      "marketing_angle": "Pain point" | "Outcome" | "Efficiency" | "Automation" | "Scale" | "Competitive advantage" | "Control" | "Industry use case" | "Discovery" | "Consultation"
    }
  ]
}
"""

def build_expansion_prompt(keyword_text: str, cluster_name: str, persona: str, pain_point: str, headlines: List[str]) -> str:
    headlines_sample = "\n".join([f"- {h}" for h in headlines[:3]])
    return f"""Target Keyword: "{keyword_text}"
Keyword Cluster: {cluster_name}
Target Persona (hypothesis): {persona or 'Enterprise Leader / Technology Decision Maker'}
Primary Business Challenge: {pain_point or 'Modernizing digital operations and accelerating delivery'}

Existing Headline Inspiration (for context):
{headlines_sample}

Generate exactly 28 distinct, high-relevance candidate search intents representing genuine, differentiated user goals for this keyword. Output strictly valid JSON."""

def build_replacement_prompt(keyword_text: str, cluster_name: str, needed_count: int, rejected_examples: List[Dict[str, Any]], approved_examples: List[str]) -> str:
    approved_list = "\n".join([f"- {a}" for a in approved_examples[-5:]])
    rejected_list = "\n".join([f"- '{r.get('intent_phrase')}': {r.get('reason')}" for r in rejected_examples[-4:]])

    return f"""Target Keyword: "{keyword_text}" (Cluster: {cluster_name})
We need {needed_count} additional distinct, non-duplicate search intents.

ALREADY APPROVED INTENTS (Do NOT duplicate these):
{approved_list}

REJECTED EXAMPLES & REASONS (Avoid these mistakes):
{rejected_list}

Generate exactly {needed_count} new, distinct, highly specific search intents. Output strictly valid JSON matching the schema."""
