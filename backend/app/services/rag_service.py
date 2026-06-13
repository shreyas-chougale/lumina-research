from langchain_community.vectorstores import Chroma
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from langchain_core.documents import Document
from app.core.config import settings
from typing import List, Dict, Any

class RAGService:
    def __init__(self):
        self.embeddings = FastEmbedEmbeddings(model_name="BAAI/bge-small-en-v1.5")
        self.vector_store = Chroma(
            collection_name="research_papers",
            embedding_function=self.embeddings,
            persist_directory=settings.CHROMA_PERSIST_DIRECTORY
        )

    def add_chunks(self, chunks: List[str], metadatas: List[Dict[str, Any]], ids: List[str]):
        documents = []
        for i, chunk in enumerate(chunks):
            documents.append(Document(page_content=chunk, metadata=metadatas[i]))
        
        self.vector_store.add_documents(documents=documents, ids=ids)

    def retrieve_context(self, query: str, user_id: str, paper_ids: List[str] = None, top_k: int = 5) -> str:
        # Build filter for ChromaDB
        if not paper_ids:
            filter_dict = {"user_id": user_id}
        else:
            if len(paper_ids) == 1:
                filter_dict = {
                    "$and": [
                        {"user_id": user_id},
                        {"paper_id": paper_ids[0]}
                    ]
                }
            else:
                filter_dict = {
                    "$and": [
                        {"user_id": user_id},
                        {"paper_id": {"$in": paper_ids}}
                    ]
                }
                
        # Retrieve documents
        results = self.vector_store.similarity_search(
            query=query,
            k=top_k,
            filter=filter_dict
        )
        
        # Format context with citations
        context = ""
        for i, doc in enumerate(results):
            paper_title = doc.metadata.get("title", "Unknown Paper")
            context += f"--- Source {i+1}: {paper_title} ---\n{doc.page_content}\n\n"
            
        return context

rag_service = RAGService()
