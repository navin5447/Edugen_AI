import os
from functools import lru_cache

from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI


class GeminiAnswerGenerator:
    def __init__(self, model: str = "gemini-2.5-flash"):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is required for answer generation")
        self.model = ChatGoogleGenerativeAI(model=model, google_api_key=api_key, temperature=0.2)
        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "You are EduGenie AI.\n\nAnswer only from the provided context.\nIf the answer is not found in the context, clearly say that the answer is not available in the uploaded documents.",
                ),
                (
                    "human",
                    "Context:\n{retrieved_chunks}\n\nQuestion:\n{user_question}",
                ),
            ]
        )

    def generate(self, question: str, retrieved_chunks: str) -> str:
        messages = self.prompt.format_messages(user_question=question, retrieved_chunks=retrieved_chunks)
        response = self.model.invoke(messages)
        return response.content if hasattr(response, "content") else str(response)


@lru_cache(maxsize=1)
def get_generator() -> GeminiAnswerGenerator:
    return GeminiAnswerGenerator()
