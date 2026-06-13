import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { FileText, Sparkles, Zap } from "lucide-react"

export function Landing() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Background blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[150px] -z-10" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-slate-500/20 blur-[150px] -z-10" />
      
      <header className="px-6 h-20 flex items-center justify-between border-b border-border/40 bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">Lumina Research</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link to="/signup">
            <Button>Sign up</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-8 text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Llama-3 Powered Analysis
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8">
            Research faster with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-slate-400">Multi-Agent AI</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Upload your PDFs, chat with them, and generate comprehensive literature reviews in minutes. Your personal AI research team.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 h-14">
                Start Researching Free
                <Zap className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 h-14">
                View Demo
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
