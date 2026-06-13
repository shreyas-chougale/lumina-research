from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.models.user import UserResponse
from app.models.report import ReportCreate, ReportResponse
from app.api.dependencies import get_current_user
from app.db.mongodb import db
from datetime import datetime
from app.services.agents.graph import multi_agent_graph
from langchain_core.messages import HumanMessage

router = APIRouter(prefix="/reports", tags=["reports"])

@router.post("/", response_model=ReportResponse)
async def generate_report(
    report_request: ReportCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    # Initialize the multi-agent graph state
    initial_state = {
        "messages": [HumanMessage(content=f"Please analyze the uploaded papers and generate a comprehensive literature review on the topic: {report_request.topic}")],
        "user_id": current_user.id,
        "paper_ids": report_request.paper_ids,
        "topic": report_request.topic,
    }
    
    # Run the graph
    try:
        final_state = await multi_agent_graph.ainvoke(initial_state)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Graph execution failed: {str(e)}")
        
    final_content = final_state.get("final_report")
    if not final_content:
        final_content = final_state["messages"][-1].content
    
    report_doc = {
        "user_id": current_user.id,
        "topic": report_request.topic,
        "content": final_content,
        "source_paper_ids": report_request.paper_ids,
        "created_at": datetime.utcnow()
    }
    
    result = await db.db["reports"].insert_one(report_doc)
    report_doc["_id"] = str(result.inserted_id)
    
    return ReportResponse(**report_doc)

@router.get("/", response_model=List[ReportResponse])
async def list_reports(current_user: UserResponse = Depends(get_current_user)):
    cursor = db.db["reports"].find({"user_id": current_user.id}).sort("created_at", -1)
    reports = await cursor.to_list(length=50)
    for r in reports:
        r["_id"] = str(r["_id"])
    return reports
