import json
import logging
from datetime import datetime
from typing import Any, Dict, List
from fastapi import HTTPException
from langchain_core.prompts import ChatPromptTemplate
from ..utils.llm_factory import get_llm
from .rag_service import RAGService
from .storage import JsonStore
from os import getenv

logger = logging.getLogger(__name__)


class ConceptService:
    def __init__(self, store: JsonStore, rag_service: RAGService):
        self.store = store
        self.rag_service = rag_service
        self.model: Any | None = None

    @property
    def llm(self) -> Any:
        if self.model is None:
            self.model = get_llm(temperature=0.2)
        return self.model

    def get_graph(self, user: Dict[str, Any], file_id: str) -> Dict[str, Any]:
        user_id = user.get("uid")

        # 1. Check cache first
        cached = self.store.get_graph(file_id, user_id)
        if cached:
            return cached.get("graph", {"nodes": [], "links": []})

        # 2. Check if user has uploads
        uploads = self.rag_service.list_uploads(user_id)
        if not uploads:
            return {"nodes": [], "links": []}

        # 3. Retrieve chunks from Chroma
        collection = self.rag_service.chroma_service.get_collection(user_id)
        if file_id == "workspace":
            results = collection.get(include=["documents", "metadatas"])
        else:
            file_record = next((u for u in uploads if u.get("id") == file_id), None)
            if not file_record:
                raise HTTPException(status_code=404, detail="File not found")
            results = collection.get(where={"file_id": file_id}, include=["documents", "metadatas"])

        documents = results.get("documents", [])
        if not documents:
            return {"nodes": [], "links": []}

        # Take up to first 30 chunks to avoid overflow while ensuring good coverage
        context_text = "\n\n".join(documents[:30])

        # 4. Generate with Gemini
        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "You are an academic concept extraction assistant. Analyze the study materials and extract a list of 7 to 12 key concepts, definitions, and the relationships between them to build a visual knowledge graph.\n"
                    "Return valid JSON only. Do not include markdown code blocks (like ```json), commentary, or extra text.\n"
                    "The JSON schema must be EXACTLY:\n"
                    "{{\n"
                    "  \"nodes\": [\n"
                    "    {{\"id\": \"node_id\", \"label\": \"Concept Name\", \"val\": 12, \"description\": \"Detailed explanation/flashcard of the concept...\", \"subject\": \"General Topic\"}}\n"
                    "  ],\n"
                    "  \"links\": [\n"
                    "    {{\"source\": \"source_node_id\", \"target\": \"target_node_id\", \"label\": \"relationship type (e.g., explains, requires, defines, type of)\"}}\n"
                    "  ]\n"
                    "}}\n"
                    "Node IDs must be short, alphanumeric, and camelCase or snake_case. 'val' is the node visual size representing concept importance (e.g., between 8 and 20)."
                ),
                (
                    "human",
                    "Study material context:\n{context}"
                ),
            ]
        )


        try:
            messages = prompt.format_messages(context=context_text)
            raw_response = self.llm.invoke(messages)
            raw_text = raw_response.content if hasattr(raw_response, "content") else str(raw_response)
            parsed = self._parse_graph_json(raw_text)
        except Exception as exc:
            logger.exception("Failed to generate concept graph")
            raise HTTPException(status_code=502, detail=f"Failed to generate graph: {str(exc)}") from exc

        # Cache the result
        record = {
            "file_id": file_id,
            "uid": user_id,
            "graph": parsed,
            "created_at": datetime.utcnow().isoformat()
        }
        self.store.add_graph(record)
        return parsed

    @staticmethod
    def _parse_graph_json(raw_response: str) -> Dict[str, Any]:
        try:
            cleaned = raw_response.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.strip("`")
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:]
            return json.loads(cleaned)
        except json.JSONDecodeError as exc:
            raise HTTPException(status_code=502, detail="Gemini returned invalid graph JSON") from exc
