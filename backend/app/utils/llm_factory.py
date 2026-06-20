import os
import logging
from os import getenv
from fastapi import HTTPException

logger = logging.getLogger(__name__)


def get_llm(temperature: float = 0.2, model_override: str | None = None):
    """Get the configured LLM based on the LLM_PROVIDER environment variable.

    Supported providers: 'gemini' (default), 'ollama'.
    """
    provider = getenv("LLM_PROVIDER", "gemini").lower()

    if provider == "ollama":
        # Defer import — langchain-ollama is not installed on cloud deployments
        from langchain_ollama import ChatOllama  # type: ignore

        model_name = model_override or getenv("OLLAMA_MODEL", "llama3")
        base_url = getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        logger.info("Initializing local Ollama model: %s at %s", model_name, base_url)

        try:
            return ChatOllama(
                model=model_name,
                base_url=base_url,
                temperature=temperature,
            )
        except Exception as exc:
            logger.exception("Failed to initialize ChatOllama")
            raise HTTPException(
                status_code=503,
                detail=f"Could not connect to Ollama. Please ensure Ollama is running at {base_url} and the model '{model_name}' is pulled.",
            ) from exc

    else:  # Default to 'gemini'
        from langchain_google_genai import ChatGoogleGenerativeAI  # type: ignore

        api_key = getenv("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=503,
                detail="GEMINI_API_KEY is required when LLM_PROVIDER is set to 'gemini'",
            )
        model_name = model_override or "gemini-2.5-flash"
        logger.info("Initializing cloud Gemini model: %s", model_name)
        return ChatGoogleGenerativeAI(
            model=model_name,
            google_api_key=api_key,
            temperature=temperature,
        )
