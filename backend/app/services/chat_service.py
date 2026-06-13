from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from app.services.llm.groq_client import get_groq_llm
from app.services.rag_service import rag_service
from typing import List, Dict, AsyncGenerator

class ChatService:
    def __init__(self):
        self.llm = get_groq_llm(temperature=0.3)

    async def generate_chat_response(
        self, 
        message: str, 
        user_id: str, 
        paper_ids: List[str], 
        history: List[Dict[str, str]]
    ) -> str:
        # 1. Retrieve RAG context
        context = rag_service.retrieve_context(
            query=message, 
            user_id=user_id, 
            paper_ids=paper_ids, 
            top_k=5
        )
        
        # 2. Build Memory
        chat_history = []
        for msg in history:
            if msg["role"] == "user":
                chat_history.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                chat_history.append(AIMessage(content=msg["content"]))
                
        # 3. Build Prompt
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an expert AI research assistant. Use the following extracted context from research papers to answer the user's question. If the answer is not in the context, say that you cannot find it in the provided papers, but offer your best general knowledge. Always cite your sources when referring to the context.\n\nContext:\n{context}"),
            MessagesPlaceholder(variable_name="history"),
            ("human", "{question}")
        ])
        
        # 4. Create chain
        chain = prompt | self.llm
        
        # 5. Invoke asynchronously
        response = await chain.ainvoke({
            "context": context,
            "history": chat_history,
            "question": message
        })
        
        return response.content

    async def stream_chat_response(
        self, 
        message: str, 
        user_id: str, 
        paper_ids: List[str], 
        history: List[Dict[str, str]]
    ) -> AsyncGenerator[str, None]:
        context = rag_service.retrieve_context(
            query=message, 
            user_id=user_id, 
            paper_ids=paper_ids, 
            top_k=5
        )
        
        chat_history = []
        for msg in history:
            if msg["role"] == "user":
                chat_history.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                chat_history.append(AIMessage(content=msg["content"]))
                
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an expert AI research assistant. Use the following extracted context from research papers to answer the user's question. If the answer is not in the context, say that you cannot find it in the provided papers, but offer your best general knowledge. Always cite your sources when referring to the context.\n\nContext:\n{context}"),
            MessagesPlaceholder(variable_name="history"),
            ("human", "{question}")
        ])
        
        chain = prompt | self.llm
        
        async for chunk in chain.astream({
            "context": context,
            "history": chat_history,
            "question": message
        }):
            yield chunk.content

chat_service = ChatService()
