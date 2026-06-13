import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UploadCloud, Search, Filter, Trash2, FileText, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { api } from "@/services/api"

interface UploadItem {
  id: string
  file: File
  progress: number
  status: 'uploading' | 'processing' | 'success' | 'error'
  error?: string
}

export function Library() {
  const [papers, setPapers] = useState<any[]>([])
  const [uploads, setUploads] = useState<UploadItem[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchPapers()
  }, [])

  const fetchPapers = async () => {
    try {
      const response = await api.get("/papers")
      setPapers(response.data)
    } catch (err) {
      console.error("Failed to fetch papers", err)
    }
  }

  const handleDelete = async (paperId: string) => {
    if (!window.confirm("Are you sure you want to delete this paper?")) return;
    try {
      await api.delete(`/papers/${paperId}`)
      fetchPapers()
    } catch (err) {
      console.error("Failed to delete paper", err)
      alert("Failed to delete paper")
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    
    const newFiles = Array.from(e.target.files)
    
    const newUploads = newFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      progress: 0,
      status: 'uploading' as const
    }))
    
    setUploads(prev => [...newUploads, ...prev])
    
    // Process each upload sequentially or parallel
    for (const uploadItem of newUploads) {
      await processUpload(uploadItem)
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const processUpload = async (uploadItem: UploadItem) => {
    const formData = new FormData()
    formData.append("file", uploadItem.file)
    formData.append("title", uploadItem.file.name.replace('.pdf', ''))
    
    try {
      await api.post("/papers/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100))
          setUploads(prev => prev.map(u => 
            u.id === uploadItem.id ? { ...u, progress: percentCompleted, status: percentCompleted === 100 ? 'processing' : 'uploading' } : u
          ))
        }
      })
      
      setUploads(prev => prev.map(u => 
        u.id === uploadItem.id ? { ...u, status: 'success' } : u
      ))
      fetchPapers()
    } catch (error: any) {
      setUploads(prev => prev.map(u => 
        u.id === uploadItem.id ? { ...u, status: 'error', error: error.response?.data?.detail || "Upload failed" } : u
      ))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Library</h1>
          <p className="text-muted-foreground mt-1">Manage and organize your research papers.</p>
        </div>
      </div>

      <input 
        type="file" 
        multiple 
        accept=".pdf" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <Card 
        className="border-dashed border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group shadow-none"
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="p-10 flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <UploadCloud className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Click to upload or drag and drop</h3>
          <p className="text-sm text-muted-foreground mb-4">PDF documents only (max 50MB)</p>
          <Button variant="outline" className="glass pointer-events-none">Select Files</Button>
        </CardContent>
      </Card>

      {uploads.length > 0 && (
        <div className="space-y-3 mt-4">
          <h4 className="text-sm font-medium">Uploads</h4>
          {uploads.map(upload => (
            <div key={upload.id} className="flex items-center gap-4 p-3 bg-card rounded-lg border border-border/50 shadow-sm">
              <FileText className="h-8 w-8 text-blue-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-1">
                  <p className="text-sm font-medium truncate pr-4">{upload.file.name}</p>
                  <span className="text-xs font-medium text-muted-foreground shrink-0">
                    {upload.status === 'uploading' && `${upload.progress}%`}
                    {upload.status === 'processing' && 'Processing...'}
                    {upload.status === 'success' && 'Done'}
                    {upload.status === 'error' && 'Failed'}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${
                      upload.status === 'error' ? 'bg-destructive' :
                      upload.status === 'success' ? 'bg-green-500' :
                      'bg-primary transition-all duration-300'
                    }`} 
                    style={{ width: `${upload.status === 'processing' || upload.status === 'success' ? 100 : upload.progress}%` }}
                  ></div>
                </div>
                {upload.status === 'error' && <p className="text-xs text-destructive mt-1">{upload.error}</p>}
              </div>
              <div className="shrink-0 pl-2">
                {upload.status === 'processing' && <Loader2 className="h-5 w-5 text-primary animate-spin" />}
                {upload.status === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                {upload.status === 'error' && <XCircle className="h-5 w-5 text-destructive" />}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-8 mb-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by title, author, or keyword..." />
        </div>
        <Button variant="outline" className="w-full sm:w-auto gap-2">
          <Filter className="h-4 w-4" /> Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {papers.map((paper, i) => (
          <motion.div
            key={paper.id || paper._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="hover:border-primary/50 transition-colors group h-full flex flex-col">
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-blue-500" />
                  </div>
                  <button 
                    onClick={() => handleDelete(paper._id || paper.id)}
                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Paper"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <h4 className="font-semibold text-base mb-1 line-clamp-2 flex-1">{paper.title}</h4>
                <div className="mt-auto pt-4">
                  <p className="text-sm text-muted-foreground truncate">{paper.authors || "Unknown Authors"}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground font-medium">
                    <span className="bg-secondary px-2 py-1 rounded-md">{new Date(paper.upload_date).getFullYear()}</span>
                    <span>Processed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {papers.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No papers found. Upload your first PDF to get started.
          </div>
        )}
      </div>
    </div>
  )
}
