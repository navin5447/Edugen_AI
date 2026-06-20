import os
import sys
from dotenv import load_dotenv

# Load env variables from backend/.env
load_dotenv()

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.rag.local_embeddings import get_embedding_service


def main():
    print("--- Embedding Service Resolution Test ---")
    provider = os.getenv("LLM_PROVIDER", "gemini")
    print(f"Active LLM Provider: {provider.upper()}")

    try:
        print("\nInitializing embedding service...")
        # Force provider = gemini to test cloud resolution
        original_provider = os.environ.get("LLM_PROVIDER")
        os.environ["LLM_PROVIDER"] = "gemini"

        service = get_embedding_service()
        print(f"Embedding service class: {service.__class__.__name__}")

        print("\nTesting cloud embed_query with: 'Hello, world!'")
        embedding = service.embed_query("Hello, world!")
        print(f"Embedding vector dimension: {len(embedding)}")
        print(f"Embedding snippet (first 5 elements): {embedding[:5]}")
        print("\n--- Cloud Embeddings Verified Successfully! ---")

        # Restore original provider
        if original_provider:
            os.environ["LLM_PROVIDER"] = original_provider
        else:
            del os.environ["LLM_PROVIDER"]

    except Exception as exc:
        print(f"\n--- Embedding Test Failed: {exc} ---")
        print("Please check if GEMINI_API_KEY is configured in backend/.env")


if __name__ == "__main__":
    main()
