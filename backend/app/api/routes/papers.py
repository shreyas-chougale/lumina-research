from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from typing import List, Optional
from app.models.user import UserResponse
from app.models.paper import PaperResponse
from app.api.dependencies import get_current_user
from app.db.mongodb import db
from app.services.pdf_processor import pdf_processor
from app.services.rag_service import rag_service
from datetime import datetime
import shutil
import os
import uuid

router = APIRouter(prefix="/papers", tags=["papers"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=PaperResponse)
async def upload_paper(
    title: str = Form(...),
    authors: Optional[str] = Form(None),
    file: UploadFile = File(...),
    current_user: UserResponse = Depends(get_current_user)
):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}.pdf")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # Extract and chunk text
        text = pdf_processor.extract_text(file_path)
        chunks = pdf_processor.chunk_text(text)
    except ValueError as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail="An error occurred while processing the PDF")
        
    # Generate summary (mocked for now, in real app use LLM)
    summary = text[:500] + "..." if len(text) > 500 else text
    
    # Insert metadata to MongoDB
    paper_doc = {
        "title": title,
        "authors": authors,
        "summary": summary,
        "user_id": current_user.id,
        "file_path": file_path,
        "upload_date": datetime.utcnow()
    }
    
    result = await db.db["papers"].insert_one(paper_doc)
    paper_id = str(result.inserted_id)
    paper_doc["_id"] = paper_id
    
    # Insert chunks to ChromaDB using LangChain wrapper
    chunk_metadatas = []
    chunk_ids = []
    for i in range(len(chunks)):
        chunk_metadatas.append({"title": title, "user_id": current_user.id, "paper_id": paper_id, "chunk_index": i})
        chunk_ids.append(f"{paper_id}_chunk_{i}")
        
    if chunks:
        rag_service.add_chunks(
            chunks=chunks,
            metadatas=chunk_metadatas,
            ids=chunk_ids
        )
    
    return PaperResponse(**paper_doc)

@router.get("/", response_model=List[PaperResponse])
async def list_papers(current_user: UserResponse = Depends(get_current_user)):
    cursor = db.db["papers"].find({"user_id": current_user.id}).sort("upload_date", -1)
    papers = await cursor.to_list(length=100)
    for p in papers:
        p["_id"] = str(p["_id"])
    return papers

@router.get("/search")
async def semantic_search(query: str, current_user: UserResponse = Depends(get_current_user)):
    # Semantic search utilizing RAG service
    results = rag_service.vector_store.similarity_search_with_score(
        query=query,
        k=5,
        filter={"user_id": current_user.id}
    )
    
    formatted_results = []
    for doc, score in results:
        formatted_results.append({
            "paper_id": doc.metadata.get("paper_id"),
            "title": doc.metadata.get("title"),
            "snippet": doc.page_content,
            "distance": score
        })
                
    return {"results": formatted_results}

from bson import ObjectId

@router.delete("/{paper_id}")
async def delete_paper(paper_id: str, current_user: UserResponse = Depends(get_current_user)):
    try:
        paper = await db.db["papers"].find_one({"_id": ObjectId(paper_id), "user_id": current_user.id})
        if not paper:
            raise HTTPException(status_code=404, detail="Paper not found")
            
        # Delete PDF
        if os.path.exists(paper.get("file_path", "")):
            os.remove(paper["file_path"])
            
        # Delete from MongoDB
        await db.db["papers"].delete_one({"_id": ObjectId(paper_id)})
        
        # Delete from ChromaDB
        try:
            rag_service.vector_store._collection.delete(where={"paper_id": paper_id})
        except Exception:
            pass
            
        return {"message": "Paper deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
