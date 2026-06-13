from langgraph.graph import StateGraph, END
from app.services.agents.state import AgentState
from app.services.agents.nodes import (
    supervisor_node,
    research_agent,
    summary_agent,
    citation_agent,
    comparison_agent,
    literature_review_agent
)

# 1. Initialize Graph
workflow = StateGraph(AgentState)

# 2. Add Nodes
workflow.add_node("Supervisor", supervisor_node)
workflow.add_node("ResearchAgent", research_agent)
workflow.add_node("SummaryAgent", summary_agent)
workflow.add_node("CitationAgent", citation_agent)
workflow.add_node("ComparisonAgent", comparison_agent)
workflow.add_node("LiteratureReviewAgent", literature_review_agent)

# 3. Add Edges
# Workers always report back to supervisor
for worker in ["ResearchAgent", "SummaryAgent", "CitationAgent", "ComparisonAgent", "LiteratureReviewAgent"]:
    workflow.add_edge(worker, "Supervisor")

# Conditional edges from supervisor
conditional_map = {
    "ResearchAgent": "ResearchAgent",
    "SummaryAgent": "SummaryAgent",
    "CitationAgent": "CitationAgent",
    "ComparisonAgent": "ComparisonAgent",
    "LiteratureReviewAgent": "LiteratureReviewAgent",
    "FINISH": END
}

workflow.add_conditional_edges("Supervisor", lambda x: x["next_agent"], conditional_map)

# 4. Set Entry Point
workflow.set_entry_point("Supervisor")

# 5. Compile
multi_agent_graph = workflow.compile()
