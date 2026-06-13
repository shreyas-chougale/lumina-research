from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from typing import List
from app.models.user import UserResponse
from app.models.chat import ChatCreate, ChatResponse
from app.api.dependencies import get_current_user
from app.db.mongodb import db
from app.services.chat_service import chat_service
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/", response_model=ChatResponse)
async def chat_with_ai(
    chat_request: ChatCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    try:
        # Fetch conversation history from MongoDB (last 10 messages)
        cursor = db.db["chats"].find({"user_id": current_user.id}).sort("updated_at", -1).limit(1)
        recent_chat = await cursor.to_list(length=1)
        
        history = []
        chat_id = None
        if recent_chat:
            chat_doc = recent_chat[0]
            chat_id = chat_doc["_id"]
            history = chat_doc.get("messages", [])[-10:] # last 10 messages for memory
        else:
            # Create a new chat session if none exists
            chat_doc = {
                "user_id": current_user.id,
                "messages": [],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            result = await db.db["chats"].insert_one(chat_doc)
            chat_id = result.inserted_id
            
        # Call LLM Service with RAG
        response_text = await chat_service.generate_chat_response(
            message=chat_request.message,
            user_id=current_user.id,
            paper_ids=chat_request.paper_ids,
            history=history
        )
        
        # Update MongoDB with new messages
        user_msg = {"role": "user", "content": chat_request.message}
        ai_msg = {"role": "assistant", "content": response_text}
        
        await db.db["chats"].update_one(
            {"_id": chat_id},
            {
                "$push": {"messages": {"$each": [user_msg, ai_msg]}},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        # Return updated chat
        updated_chat = await db.db["chats"].find_one({"_id": chat_id})
        updated_chat["_id"] = str(updated_chat["_id"])
        
        return ChatResponse(**updated_chat)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate response: {str(e)}")

@router.post("/stream")
async def stream_chat_with_ai(
    chat_request: ChatCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    try:
        cursor = db.db["chats"].find({"user_id": current_user.id}).sort("updated_at", -1).limit(1)
        recent_chat = await cursor.to_list(length=1)
        
        history = []
        chat_id = None
        if recent_chat:
            chat_doc = recent_chat[0]
            chat_id = chat_doc["_id"]
            history = chat_doc.get("messages", [])[-10:]
        else:
            chat_doc = {
                "user_id": current_user.id,
                "messages": [],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            result = await db.db["chats"].insert_one(chat_doc)
            chat_id = result.inserted_id

        async def generate():
            full_response = ""
            try:
                async for chunk in chat_service.stream_chat_response(
                    message=chat_request.message,
                    user_id=current_user.id,
                    paper_ids=chat_request.paper_ids,
                    history=history
                ):
                    full_response += chunk
                    yield chunk
            finally:
                user_msg = {"role": "user", "content": chat_request.message}
                ai_msg = {"role": "assistant", "content": full_response}
                
                await db.db["chats"].update_one(
                    {"_id": chat_id},
                    {
                        "$push": {"messages": {"$each": [user_msg, ai_msg]}},
                        "$set": {"updated_at": datetime.utcnow()}
                    }
                )

        return StreamingResponse(generate(), media_type="text/event-stream")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to stream response: {str(e)}")

@router.get("/", response_model=List[ChatResponse])
async def list_chats(current_user: UserResponse = Depends(get_current_user)):
    cursor = db.db["chats"].find({"user_id": current_user.id}).sort("updated_at", -1)
    chats = await cursor.to_list(length=50)
    for c in chats:
        c["_id"] = str(c["_id"])
    return chats
