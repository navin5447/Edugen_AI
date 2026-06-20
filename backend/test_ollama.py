import os
import sys
from dotenv import load_dotenv

# Load env variables from backend/.env
load_dotenv()

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.utils.llm_factory import get_llm
from langchain_core.messages import HumanMessage


def main():
    print("--- Ollama Integration Test ---")
    provider = os.getenv("LLM_PROVIDER", "gemini")
    model = os.getenv("OLLAMA_MODEL", "llama3")
    print(f"Active LLM Provider: {provider.upper()}")
    if provider == "ollama":
        print(f"Configured Ollama Model: {model}")

    try:
        print("\nInitializing model...")
        llm = get_llm(temperature=0.7)
        print("Model initialized successfully.")

        print("\nSending a test prompt: 'Explain the difference between a list and a tuple in Python in 1 sentence.'")
        messages = [HumanMessage(content="Explain the difference between a list and a tuple in Python in 1 sentence.")]
        response = llm.invoke(messages)
        content = response.content if hasattr(response, "content") else str(response)

        print("\nResponse:")
        print(content)
        print("\n--- Test Passed Successfully! ---")
    except Exception as exc:
        print(f"\n--- Test Failed: {exc} ---")
        print("\nCheck if Ollama is running on your machine by visiting http://localhost:11434 in a browser, or run 'ollama run llama3' in a terminal.")


if __name__ == "__main__":
    main()
