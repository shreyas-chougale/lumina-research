from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class MessageBase(BaseModel):
    role: str
    content: str

class ChatCreate(BaseModel):
    message: str
    paper_ids: Optional[List[str]] = []

class ChatResponse(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    messages: List[MessageBase]
    created_at: datetime
    updated_at: datetime
