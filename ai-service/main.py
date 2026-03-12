from typing import Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from model import ComplaintAIEngine


class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=1)


class ComplaintItem(BaseModel):
    id: str
    text: str


class ClusterRequest(BaseModel):
    complaints: List[ComplaintItem]
    max_clusters: Optional[int] = 8


engine = ComplaintAIEngine()

app = FastAPI(
    title="Municipal Complaint AI Service",
    version="1.0.0",
    description="AI microservice for complaint classification, keyword extraction and clustering",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok", "service": "ai-service"}


@app.post("/analyze")
def analyze(request: AnalyzeRequest) -> Dict[str, object]:
    try:
        result = engine.analyze(request.text)
        return {
            "predictedCategory": result.predicted_category,
            "keywords": result.keywords,
            "confidence": round(result.confidence, 4),
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {exc}") from exc


@app.post("/cluster")
def cluster(request: ClusterRequest) -> Dict[str, object]:
    try:
        payload = [{"id": item.id, "text": item.text} for item in request.complaints]
        clusters, summaries = engine.cluster(payload, max_clusters=request.max_clusters or 8)
        return {
            "clusters": clusters,
            "clusterSummaries": summaries,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Clustering failed: {exc}") from exc
