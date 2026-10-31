import re
import math
from typing import List, Tuple, Dict, Set

def tokenize_words(text: str) -> List[str]:
    text = text.lower()
    return re.findall(r'\b[a-z0-9]+\b', text)

def get_char_ngrams(text: str, n: int = 3) -> List[str]:
    cleaned = re.sub(r'\s+', ' ', text.lower().strip())
    if len(cleaned) < n:
        return [cleaned]
    return [cleaned[i:i+n] for i in range(len(cleaned) - n + 1)]

def term_frequency_vector(tokens: List[str]) -> Dict[str, float]:
    counts: Dict[str, float] = {}
    for t in tokens:
        counts[t] = counts.get(t, 0.0) + 1.0
    # normalize to unit vector
    mag = math.sqrt(sum(v * v for v in counts.values()))
    if mag == 0:
        return {}
    return {k: v / mag for k, v in counts.items()}

def cosine_similarity(v1: Dict[str, float], v2: Dict[str, float]) -> float:
    if not v1 or not v2:
        return 0.0
    # iterate over smaller dict
    if len(v1) > len(v2):
        v1, v2 = v2, v1
    dot_product = sum(weight * v2.get(term, 0.0) for term, weight in v1.items())
    return min(1.0, max(0.0, dot_product))

def jaccard_similarity(tokens1: List[str], tokens2: List[str]) -> float:
    s1: Set[str] = set(tokens1)
    s2: Set[str] = set(tokens2)
    if not s1 and not s2:
        return 1.0
    if not s1 or not s2:
        return 0.0
    return len(s1.intersection(s2)) / len(s1.union(s2))

def calculate_similarity(text1: str, text2: str) -> float:
    """
    Computes a composite semantic similarity score between two search intents
    using character n-gram cosine similarity, word cosine similarity, and token Jaccard.
    """
    t1_clean = text1.strip().lower()
    t2_clean = text2.strip().lower()

    if t1_clean == t2_clean:
        return 1.0

    words1 = tokenize_words(t1_clean)
    words2 = tokenize_words(t2_clean)

    char_ngrams1 = get_char_ngrams(t1_clean, n=3)
    char_ngrams2 = get_char_ngrams(t2_clean, n=3)

    v_word1 = term_frequency_vector(words1)
    v_word2 = term_frequency_vector(words2)
    word_cos = cosine_similarity(v_word1, v_word2)

    v_char1 = term_frequency_vector(char_ngrams1)
    v_char2 = term_frequency_vector(char_ngrams2)
    char_cos = cosine_similarity(v_char1, v_char2)

    jaccard = jaccard_similarity(words1, words2)

    # Composite similarity: highest weighted between word and char
    composite = 0.5 * word_cos + 0.3 * char_cos + 0.2 * jaccard
    return round(float(composite), 4)

def find_most_similar(candidate: str, existing_set: List[str]) -> Tuple[float, str]:
    """
    Returns (highest_score, matching_intent_text).
    """
    if not existing_set:
        return 0.0, ""

    max_score = -1.0
    best_match = ""

    for item in existing_set:
        score = calculate_similarity(candidate, item)
        if score > max_score:
            max_score = score
            best_match = item

    return max_score, best_match
