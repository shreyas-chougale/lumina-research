import chromadb
from chromadb.config import Settings as ChromaSettings
from app.core.config import settings

class ChromaDBService:
    def __init__(self):
        self.client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIRECTORY)
        self.collection = self.client.get_or_create_collection("research_papers")

    def add_documents(self, documents: list[str], metadatas: list[dict], ids: list[str]):
        self.collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )

    def query(self, query_texts: list[str], n_results: int = 5):
        return self.collection.query(
            query_texts=query_texts,
            n_results=n_results
        )

chroma_db = ChromaDBService()
