from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class PaperBase(BaseModel):
    title: str
    authors: Optional[str] = None
    summary: Optional[str] = None

class PaperCreate(PaperBase):
    pass

class PaperResponse(PaperBase):
    id: str = Field(alias="_id")
    user_id: str
    file_path: str
    upload_date: datetime
