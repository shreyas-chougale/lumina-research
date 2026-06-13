import { useState, useRef, useEffect } from "react"
import { BookOpen, FileText, Download, Loader2, FileDown, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { api } from "@/services/api"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import html2pdf from 'html2pdf.js'

export function LiteratureReview() {
  const [papers, setPapers] = useState<any[]>([])
  const [selectedPapers, setSelectedPapers] = useState<string[]>([])
  const [topic, setTopic] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [report, setReport] = useState<any>(null)
  const [reportsHistory, setReportsHistory] = useState<any[]>([])
  
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchPapers()
    fetchReports()
  }, [])

  const fetchPapers = async () => {
    try {
      const response = await api.get("/papers")
      setPapers(response.data)
    } catch (err) {
      console.error("Failed to fetch papers", err)
    }
  }

  const fetchReports = async () => {
    try {
      const response = await api.get("/reports")
      setReportsHistory(response.data)
    } catch (err) {
      console.error("Failed to fetch reports", err)
    }
  }

  const togglePaperSelection = (paperId: string) => {
    setSelectedPapers(prev => 
      prev.includes(paperId) 
        ? prev.filter(id => id !== paperId)
        : [...prev, paperId]
    )
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim() || selectedPapers.length === 0 || isGenerating) return

    setIsGenerating(true)
    try {
      const response = await api.post("/reports", {
        topic: topic.trim(),
        paper_ids: selectedPapers
      })
      setReport(response.data)
      fetchReports() // Refresh history
    } catch (error) {
      console.error("Failed to generate report", error)
      alert("Failed to generate report. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadPDF = () => {
    if (!reportRef.current) return
    const element = reportRef.current
    const opt = {
      margin:       0.5,
      filename:     `${topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' as const }
    }
    html2pdf().set(opt).from(element).save()
  }

  const handleDownloadWord = () => {
    if (!reportRef.current) return
    const htmlContent = reportRef.current.innerHTML
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + htmlContent + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Report Generator</h1>
          <p className="text-muted-foreground mt-1">AI-powered literature reviews and summaries from your papers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form */}
        <Card className="lg:col-span-1 border-border/50 shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Configure Report
            </CardTitle>
            <CardDescription>Select sources and define the topic.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Research Topic or Question</label>
                <Input 
                  placeholder="e.g. Comparison of RLHF methodologies..." 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex justify-between">
                  <span>Source Papers</span>
                  <span className="text-muted-foreground">{selectedPapers.length} selected</span>
                </label>
                <ScrollArea className="h-64 border rounded-md p-2 bg-secondary/20">
                  <div className="space-y-2">
                    {papers.map((paper) => (
                      <div 
                        key={paper.id || paper._id}
                        onClick={() => togglePaperSelection(paper.id || paper._id)}
                        className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors text-sm ${
                          selectedPapers.includes(paper.id || paper._id)
                            ? "bg-primary/10 border-primary/30 border text-primary"
                            : "bg-background border-border/50 border hover:bg-accent"
                        }`}
                      >
                        <FileText className="h-4 w-4 shrink-0" />
                        <span className="line-clamp-1">{paper.title}</span>
                      </div>
                    ))}
                    {papers.length === 0 && (
                      <div className="text-sm text-muted-foreground text-center py-4">
                        No papers found. Please upload papers first.
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              <Button 
                type="submit" 
                className="w-full gap-2" 
                disabled={isGenerating || selectedPapers.length === 0 || !topic.trim()}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating multi-agent report...
                  </>
                ) : (
                  <>
                    Generate Report
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Column: Preview */}
        <Card className="lg:col-span-2 border-border/50 shadow-sm flex flex-col h-[calc(100vh-12rem)]">
          <CardHeader className="border-b bg-muted/20 py-4 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Report Preview</CardTitle>
              <CardDescription>
                {report ? `Generated on ${new Date(report.created_at).toLocaleDateString()}` : "Your generated report will appear here."}
              </CardDescription>
            </div>
            {report && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={handleDownloadWord}>
                  <FileDown className="h-4 w-4" /> Word
                </Button>
                <Button variant="default" size="sm" className="gap-2" onClick={handleDownloadPDF}>
                  <Download className="h-4 w-4" /> PDF
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0 relative">
            <ScrollArea className="h-full">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4 py-32 text-center px-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                    <Loader2 className="h-12 w-12 text-primary animate-spin relative" />
                  </div>
                  <h3 className="text-xl font-semibold">AI Agents are collaborating...</h3>
                  <div className="text-muted-foreground max-w-sm space-y-2 text-sm">
                    <p className="flex items-center gap-2 justify-center"><CheckCircle2 className="h-4 w-4 text-green-500"/> Supervisor allocating tasks</p>
                    <p className="flex items-center gap-2 justify-center"><CheckCircle2 className="h-4 w-4 text-green-500"/> Research Agent retrieving facts</p>
                    <p className="flex items-center gap-2 justify-center"><Loader2 className="h-4 w-4 text-primary animate-spin"/> Literature Review Agent synthesizing</p>
                  </div>
                </div>
              ) : report ? (
                <div className="p-8">
                  <div ref={reportRef} className="prose prose-sm sm:prose-base dark:prose-invert max-w-none prose-headings:text-primary prose-a:text-blue-500">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {report.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full space-y-4 py-32 text-center text-muted-foreground px-4">
                  <BookOpen className="h-12 w-12 opacity-20" />
                  <p>Select your sources, enter a topic, and click Generate.</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {reportsHistory.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Recent Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportsHistory.map((h) => (
              <Card key={h.id || h._id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => {
                setReport(h)
                setTopic(h.topic)
                setSelectedPapers(h.source_paper_ids || [])
              }}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm line-clamp-2 mb-1">{h.topic}</h4>
                      <p className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
