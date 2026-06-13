from typing import Annotated, TypedDict, List, Sequence, Optional
import operator
from langchain_core.messages import BaseMessage

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    next_agent: str
    user_id: str
    paper_ids: List[str]
    topic: str
    research_data: Optional[str]
    summary_data: Optional[str]
    citation_data: Optional[str]
    comparison_data: Optional[str]
    final_report: Optional[str]
