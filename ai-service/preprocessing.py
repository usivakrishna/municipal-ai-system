import re
from typing import List

from nltk.stem import PorterStemmer
from nltk.tokenize import RegexpTokenizer
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS

stemmer = PorterStemmer()
tokenizer = RegexpTokenizer(r"[a-zA-Z]+")

CUSTOM_STOPWORDS = set(ENGLISH_STOP_WORDS).union(
    {
        "municipal",
        "complaint",
        "issue",
        "problem",
        "please",
        "urgent",
        "area",
        "ward",
        "road",
    }
)


def preprocess_text(text: str) -> str:
    if not text:
        return ""

    text = text.lower()
    text = re.sub(r"[^a-zA-Z\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()

    tokens = tokenizer.tokenize(text)
    cleaned_tokens: List[str] = []
    for token in tokens:
        if len(token) <= 2 or token in CUSTOM_STOPWORDS:
            continue
        cleaned_tokens.append(stemmer.stem(token))

    return " ".join(cleaned_tokens)
