from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ReportCreate(BaseModel):
    topic: str
    paper_ids: List[str]

class ReportResponse(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    topic: str
    content: str
    source_paper_ids: List[str]
    created_at: datetime
