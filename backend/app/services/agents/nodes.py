from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from app.services.llm.groq_client import get_groq_llm
from app.services.rag_service import rag_service
from langchain_core.messages import HumanMessage, AIMessage
from pydantic import BaseModel, Field
from typing import Literal

llm = get_groq_llm(temperature=0.2)

members = ["ResearchAgent", "SummaryAgent", "CitationAgent", "ComparisonAgent", "LiteratureReviewAgent"]
options = ["FINISH"] + members

class RouteResponse(BaseModel):
    next: Literal["FINISH", "ResearchAgent", "SummaryAgent", "CitationAgent", "ComparisonAgent", "LiteratureReviewAgent"]

supervisor_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a supervisor managing a team of AI agents for research paper analysis.\n"
               "The team consists of:\n"
               "- ResearchAgent: Analyzes raw paper content from the vector store.\n"
               "- SummaryAgent: Creates concise summaries of papers.\n"
               "- CitationAgent: Extracts references and metadata.\n"
               "- ComparisonAgent: Compares methodologies, datasets, and results across multiple papers.\n"
               "- LiteratureReviewAgent: Synthesizes findings into a formal literature review.\n\n"
               "Based on the user's request, delegate tasks to the appropriate worker.\n"
               "If the requested task is complete or the user needs a direct response, respond with 'FINISH'.\n"
               "Current topic/request: {topic}"),
    MessagesPlaceholder(variable_name="messages"),
    ("system", "Who should act next? Select one of: {options}")
])

supervisor_chain = supervisor_prompt | llm.with_structured_output(RouteResponse)

async def supervisor_node(state):
    result = await supervisor_chain.ainvoke({
        "messages": state["messages"],
        "topic": state.get("topic", ""),
        "options": options
    })
    return {"next_agent": result.next}

async def research_agent(state):
    context = rag_service.retrieve_context(state.get("topic", "general research"), state["user_id"], state.get("paper_ids", []))
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a Research Agent. Analyze the provided context and extract key findings relevant to the topic.\n\nContext:\n{context}"),
        MessagesPlaceholder(variable_name="messages")
    ])
    chain = prompt | llm
    response = await chain.ainvoke({"messages": state["messages"], "context": context})
    return {"messages": [AIMessage(content="Extracted key research findings.", name="ResearchAgent")], "research_data": response.content}

async def summary_agent(state):
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a Summary Agent. Summarize the research data provided. Make it concise and highlighting the main points.\n\nPrevious data:\n{data}"),
        MessagesPlaceholder(variable_name="messages")
    ])
    chain = prompt | llm
    data = state.get("research_data", "") or "No prior research data found."
    response = await chain.ainvoke({"messages": state["messages"], "data": data})
    return {"messages": [AIMessage(content="Summarized the research data.", name="SummaryAgent")], "summary_data": response.content}

async def citation_agent(state):
    context = rag_service.retrieve_context("references and methodology", state["user_id"], state.get("paper_ids", []))
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a Citation Agent. Extract references, authors, datasets, and metadata from the context. Format properly.\n\nContext:\n{context}"),
        MessagesPlaceholder(variable_name="messages")
    ])
    chain = prompt | llm
    response = await chain.ainvoke({"messages": state["messages"], "context": context})
    return {"messages": [AIMessage(content="Extracted citations and metadata.", name="CitationAgent")], "citation_data": response.content}

async def comparison_agent(state):
    context = rag_service.retrieve_context(state.get("topic", "comparison"), state["user_id"], state.get("paper_ids", []))
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a Comparison Agent. Compare the methodologies, datasets, and results of the papers provided in the context.\n\nContext:\n{context}"),
        MessagesPlaceholder(variable_name="messages")
    ])
    chain = prompt | llm
    response = await chain.ainvoke({"messages": state["messages"], "context": context})
    return {"messages": [AIMessage(content="Compared methodologies and results.", name="ComparisonAgent")], "comparison_data": response.content}

async def literature_review_agent(state):
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a Literature Review Agent. Using the accumulated data (research, summaries, comparisons), write a comprehensive formal literature review.\n\nData:\nResearch: {research}\nSummary: {summary}\nComparison: {comparison}"),
        MessagesPlaceholder(variable_name="messages")
    ])
    chain = prompt | llm
    response = await chain.ainvoke({
        "messages": state["messages"],
        "research": state.get("research_data", ""),
        "summary": state.get("summary_data", ""),
        "comparison": state.get("comparison_data", "")
    })
    return {"messages": [AIMessage(content="Final literature review generated.", name="LiteratureReviewAgent")], "final_report": response.content}
