from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Dict, List, Tuple

import numpy as np
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

from preprocessing import preprocess_text


TRAINING_DATA: Dict[str, List[str]] = {
    "Sanitation": [
        "garbage not collected near market",
        "overflowing dustbin causing smell",
        "waste piled up on street",
        "unclean public toilet and trash around",
    ],
    "Water Supply": [
        "water pipeline leakage near school",
        "no drinking water supply in colony",
        "water contamination from broken pipe",
        "low water pressure in residential area",
    ],
    "Road": [
        "potholes on main road causing accidents",
        "damaged road surface near bus stand",
        "road repair needed urgently",
        "big cracks and uneven road",
    ],
    "Drainage": [
        "blocked drainage causing waterlogging",
        "sewage overflow on street",
        "open drain emitting foul smell",
        "drain not cleaned before rain",
    ],
    "Streetlight": [
        "streetlight not working at junction",
        "dark road due to fused light",
        "electric pole light broken",
        "street lights off in residential lane",
    ],
    "Public Safety": [
        "stray dogs attacking people",
        "illegal dumping creating health hazard",
        "broken manhole without cover",
        "dangerous debris left on public path",
    ],
}


@dataclass
class AnalysisResult:
    predicted_category: str
    keywords: List[str]
    confidence: float


class ComplaintAIEngine:
    def __init__(self) -> None:
        self.classifier_vectorizer = TfidfVectorizer(max_features=4000, ngram_range=(1, 2))
        self.classifier = LogisticRegression(max_iter=500, solver="lbfgs")
        self._train_classifier()

    def _train_classifier(self) -> None:
        texts: List[str] = []
        labels: List[str] = []

        for category, examples in TRAINING_DATA.items():
            for sample in examples:
                texts.append(preprocess_text(sample))
                labels.append(category)

        vectors = self.classifier_vectorizer.fit_transform(texts)
        self.classifier.fit(vectors, labels)

    def analyze(self, text: str, keyword_count: int = 6) -> AnalysisResult:
        cleaned = preprocess_text(text)
        if not cleaned:
            return AnalysisResult(predicted_category="Other", keywords=[], confidence=0.0)

        vector = self.classifier_vectorizer.transform([cleaned])
        prediction = self.classifier.predict(vector)[0]

        confidence = 0.0
        if hasattr(self.classifier, "predict_proba"):
            probabilities = self.classifier.predict_proba(vector)[0]
            confidence = float(np.max(probabilities))

        keywords = self._extract_keywords(cleaned, limit=keyword_count)
        return AnalysisResult(predicted_category=prediction, keywords=keywords, confidence=confidence)

    def _extract_keywords(self, cleaned_text: str, limit: int = 6) -> List[str]:
        tfidf_matrix = self.classifier_vectorizer.transform([cleaned_text])
        feature_names = np.array(self.classifier_vectorizer.get_feature_names_out())

        if tfidf_matrix.nnz == 0:
            return []

        row = tfidf_matrix.toarray()[0]
        top_indices = row.argsort()[::-1]
        keywords: List[str] = []

        for index in top_indices:
            if row[index] <= 0:
                break
            term = feature_names[index]
            if term not in keywords:
                keywords.append(term)
            if len(keywords) >= limit:
                break

        return keywords

    def cluster(
        self,
        complaints: List[Dict[str, str]],
        max_clusters: int = 8,
    ) -> Tuple[List[Dict[str, int]], List[Dict[str, object]]]:
        if not complaints:
            return [], []

        processed_texts = [preprocess_text(item.get("text", "")) for item in complaints]
        fallback_texts = [text if text else "other" for text in processed_texts]

        if len(fallback_texts) == 1:
            only_id = complaints[0].get("id")
            return [{"id": only_id, "clusterId": 0}], [{"clusterId": 0, "size": 1, "keywords": []}]

        unique_count = len(set(fallback_texts))
        suggested_clusters = max(1, int(math.sqrt(len(fallback_texts))))
        cluster_count = min(max_clusters, len(fallback_texts), unique_count, suggested_clusters)

        vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
        vectors = vectorizer.fit_transform(fallback_texts)

        model = KMeans(n_clusters=cluster_count, random_state=42, n_init=10)
        labels = model.fit_predict(vectors)

        clusters: List[Dict[str, int]] = []
        for idx, complaint in enumerate(complaints):
            clusters.append({"id": complaint.get("id"), "clusterId": int(labels[idx])})

        cluster_summaries = self._cluster_keywords(model, vectorizer, labels)
        return clusters, cluster_summaries

    def _cluster_keywords(
        self,
        model: KMeans,
        vectorizer: TfidfVectorizer,
        labels: np.ndarray,
        top_n: int = 5,
    ) -> List[Dict[str, object]]:
        feature_names = vectorizer.get_feature_names_out()
        summaries: List[Dict[str, object]] = []

        for cluster_id in range(model.n_clusters):
            centroid = model.cluster_centers_[cluster_id]
            top_indices = centroid.argsort()[::-1][:top_n]
            keywords = [feature_names[index] for index in top_indices if centroid[index] > 0]
            size = int(np.sum(labels == cluster_id))
            summaries.append(
                {
                    "clusterId": int(cluster_id),
                    "size": size,
                    "keywords": keywords,
                }
            )

        summaries.sort(key=lambda item: item["size"], reverse=True)
        return summaries
