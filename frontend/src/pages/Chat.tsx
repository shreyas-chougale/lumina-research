import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Bot, User, Paperclip, StopCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { api } from "@/services/api"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  role: "user" | "assistant"
  content: string
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [papers, setPapers] = useState<any[]>([])
  const [selectedPapers, setSelectedPapers] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    fetchHistory()
    fetchPapers()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const fetchHistory = async () => {
    try {
      const response = await api.get("/chat")
      if (response.data && response.data.length > 0) {
        setMessages(response.data[0].messages || [])
      }
    } catch (err) {
      console.error("Failed to load chat history", err)
    }
  }

  const fetchPapers = async () => {
    try {
      const response = await api.get("/papers")
      setPapers(response.data)
    } catch (err) {
      console.error("Failed to fetch papers", err)
    }
  }

  const togglePaperSelection = (paperId: string) => {
    setSelectedPapers(prev => 
      prev.includes(paperId) 
        ? prev.filter(id => id !== paperId)
        : [...prev, paperId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    setMessages(prev => [...prev, { role: "assistant", content: "" }])

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api"
      const response = await fetch(`${apiUrl}/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          message: userMessage,
          paper_ids: selectedPapers
        })
      })

      if (!response.body) throw new Error("No response body")

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let done = false

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone
        if (value) {
          const chunk = decoder.decode(value, { stream: true })
          setMessages(prev => {
            const newMessages = [...prev]
            newMessages[newMessages.length - 1].content += chunk
            return newMessages
          })
        }
      }
    } catch (error) {
      console.error("Chat error:", error)
      setMessages(prev => {
        const newMessages = [...prev]
        newMessages[newMessages.length - 1].content = "Sorry, an error occurred while processing your request."
        return newMessages
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col sm:flex-row gap-6">
      <div className="w-full sm:w-64 flex flex-col gap-4 bg-card rounded-xl border border-border/50 p-4 shadow-sm shrink-0">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Context Source</h3>
        <p className="text-xs text-muted-foreground mb-2">Select papers to chat with</p>
        <ScrollArea className="flex-1 -mx-2 px-2">
          <div className="space-y-2">
            {papers.map((paper) => (
              <button
                key={paper.id || paper._id}
                onClick={() => togglePaperSelection(paper.id || paper._id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors text-sm ${
                  selectedPapers.includes(paper.id || paper._id)
                    ? "bg-primary/10 border-primary/30 text-primary font-medium"
                    : "bg-background border-border/50 hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                }`}
              >
                <div className="line-clamp-2">{paper.title}</div>
              </button>
            ))}
            {papers.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-4">
                No papers uploaded yet.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden relative">
        <div className="absolute top-[-10%] right-[-5%] w-[30%] h-[30%] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
        
        <ScrollArea className="flex-1 p-4 sm:p-6">
          <div className="space-y-6 max-w-3xl mx-auto">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">How can I help with your research?</h3>
                <p className="text-muted-foreground max-w-sm">
                  Select papers from the sidebar and ask me anything about their methodology, datasets, or results.
                </p>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((message, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 ${message.role === "assistant" ? "" : "flex-row-reverse"}`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                    message.role === "assistant" ? "bg-primary/20 text-primary" : "bg-blue-500/20 text-blue-500"
                  }`}>
                    {message.role === "assistant" ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                  </div>
                  <div className={`flex flex-col gap-2 max-w-[80%] ${message.role === "user" ? "items-end" : ""}`}>
                    <span className="text-sm font-medium text-muted-foreground px-1">
                      {message.role === "assistant" ? "Lumina Research" : "You"}
                    </span>
                    <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm ${
                      message.role === "assistant" 
                        ? "bg-secondary text-secondary-foreground rounded-tl-none prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed" 
                        : "bg-primary text-primary-foreground rounded-tr-none"
                    }`}>
                      {message.role === "assistant" ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 bg-background/50 backdrop-blur-sm border-t border-border/50">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative flex items-center">
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="absolute left-2 text-muted-foreground hover:text-foreground"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input 
              placeholder={selectedPapers.length > 0 ? `Chatting with ${selectedPapers.length} selected paper(s)...` : "Send a message..."}
              className="pl-12 pr-12 py-6 rounded-full bg-secondary/50 border-transparent focus-visible:ring-1 focus-visible:bg-secondary transition-all"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="absolute right-2 h-8 w-8 rounded-full"
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? <StopCircle className="h-4 w-4" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
              AI generated content may be inaccurate
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
