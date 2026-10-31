import re
from typing import Tuple, Optional
from engine.models import CandidateIntent

FORBIDDEN_PRICE_PATTERNS = [
    r'\$\s*\d+',
    r'\b(?:cheapest|dirt cheap|100%\s*free|free forever|lowest price guaranteed)\b',
    r'\b(?:fixed price of|flat fee of \d+)\b'
]

FORBIDDEN_GUARANTEE_PATTERNS = [
    r'\b(?:100%\s*guarantee[d]?|zero defects? guaranteed|guaranteed 10x|money back guarantee)\b',
    r'\b(?:foolproof|magic solution|miracle)\b'
]

FORBIDDEN_SUPERLATIVE_PATTERNS = [
    r'\b(?:#1 in the world|best company in the world|world\'s only|unbeatable ranking)\b',
    r'\b(?:certified by the un|nobel prize)\b'
]

FORBIDDEN_OUT_OF_SCOPE_DOMAINS = [
    r'\b(?:medical diagnosis|prescription drugs|legal defense attorney|cryptocurrency trading signals|gambling)\b'
]

def validate_claims(intent: CandidateIntent, keyword_text: str, cluster_name: str) -> Tuple[bool, Optional[str]]:
    """
    Evaluates candidate intent against marketing guidelines, claim honesty, and relevance.
    Returns (is_valid, rejection_reason).
    """
    phrase = intent.intent_phrase.strip().lower()
    need = intent.audience_need.strip().lower()
    combined = f"{phrase} {need}"

    # 1. Price claims check
    for pat in FORBIDDEN_PRICE_PATTERNS:
        if re.search(pat, combined):
            return False, f"Unsupported pricing promise or unverified discount claim: '{pat}'"

    # 2. Guarantees check
    for pat in FORBIDDEN_GUARANTEE_PATTERNS:
        if re.search(pat, combined):
            return False, f"Unverified outcome guarantee or absolute claim: '{pat}'"

    # 3. Superlative & fake certifications check
    for pat in FORBIDDEN_SUPERLATIVE_PATTERNS:
        if re.search(pat, combined):
            return False, f"Unsupported superlative or unverifiable credential: '{pat}'"

    # 4. Out of scope domain check
    for pat in FORBIDDEN_OUT_OF_SCOPE_DOMAINS:
        if re.search(pat, combined):
            return False, f"Out of scope industry or restricted domain: '{pat}'"

    # 5. Length & clarity check
    if len(phrase.split()) < 3:
        return False, "Intent phrase too brief / ambiguous (minimum 3 words required)"

    if len(phrase) > 200:
        return False, "Intent phrase exceeds maximum allowable length (200 characters)"

    return True, None
