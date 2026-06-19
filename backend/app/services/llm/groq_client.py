from langchain_groq import ChatGroq
from app.core.config import settings

def get_groq_llm(model_name: str = "llama-3.1-8b-instant", temperature: float = 0.0):
    """
    Get a configured Groq LLM instance using LangChain.
    """
    return ChatGroq(
        temperature=temperature,
        model_name=model_name,
        groq_api_key=settings.GROQ_API_KEY
    )
