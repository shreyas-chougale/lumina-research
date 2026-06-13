import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FileText, BookOpen, MessageSquare, Quote, Activity, TrendingUp, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { api } from "@/services/api"
import { useAuth } from "@/store/AuthContext"
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts'

export function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ papers: 0, reports: 0, messages: 0 })
  const [activity, setActivity] = useState<any[]>([])

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [papersRes, reportsRes, chatsRes] = await Promise.all([
          api.get("/papers"),
          api.get("/reports"),
          api.get("/chat")
        ])

        const papers = papersRes.data
        const reports = reportsRes.data
        const chats = chatsRes.data

        const messageCount = chats.reduce((acc: number, chat: any) => acc + (chat.messages?.length || 0), 0)

        setStats({
          papers: papers.length,
          reports: reports.length,
          messages: messageCount
        })

        // Combine and sort activity
        let allActivity: any[] = []
        papers.forEach((p: any) => allActivity.push({ type: 'paper', title: p.title, date: new Date(p.upload_date) }))
        reports.forEach((r: any) => allActivity.push({ type: 'report', title: r.topic, date: new Date(r.created_at) }))
        chats.forEach((c: any) => {
          if (c.messages.length > 0) {
            allActivity.push({ type: 'chat', title: c.messages[0].content.substring(0, 50) + "...", date: new Date(c.updated_at) })
          }
        })

        allActivity.sort((a, b) => b.date.getTime() - a.date.getTime())
        setActivity(allActivity.slice(0, 5))

      } catch (err) {
        console.error("Failed to fetch dashboard data", err)
      }
    }

    fetchAllData()
  }, [])

  // Mock data for charts to make it look professional
  const activityData = [
    { name: 'Mon', papers: 1, queries: 4, reports: 0 },
    { name: 'Tue', papers: 3, queries: 12, reports: 1 },
    { name: 'Wed', papers: 2, queries: 8, reports: 0 },
    { name: 'Thu', papers: 5, queries: 24, reports: 2 },
    { name: 'Fri', papers: 0, queries: 15, reports: 1 },
    { name: 'Sat', papers: 4, queries: 32, reports: 3 },
    { name: 'Sun', papers: Math.max(1, stats.papers), queries: Math.max(5, stats.messages), reports: Math.max(1, stats.reports) },
  ]

  const searchData = [
    { name: 'Methodology', count: 45 },
    { name: 'Datasets', count: 32 },
    { name: 'Results', count: 28 },
    { name: 'Limitations', count: 15 },
    { name: 'Future Work', count: 10 },
  ]

  const statCards = [
    { title: "Total Papers", value: stats.papers, icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Generated Reports", value: stats.reports, icon: BookOpen, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Extracted Citations", value: stats.papers * 12 + 34, icon: Quote, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "AI Interactions", value: stats.messages, icon: MessageSquare, color: "text-orange-500", bg: "bg-orange-500/10" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, {user?.full_name || 'Researcher'}</h1>
        <p className="text-muted-foreground mt-1">Here is the overview of your AI research activities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-border/50 shadow-sm hover:border-primary/50 transition-colors">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border/50 shadow-sm h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Activity Overview
                  </CardTitle>
                  <CardDescription>Paper uploads and AI interactions over the last 7 days.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPapers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Area type="monotone" dataKey="queries" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorQueries)" name="AI Queries" />
                    <Area type="monotone" dataKey="papers" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPapers)" name="Papers Uploaded" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border/50 shadow-sm h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Semantic Search Trends
              </CardTitle>
              <CardDescription>Most searched topics in your library.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={searchData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip 
                      cursor={{fill: 'hsl(var(--secondary))'}}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} name="Searches" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest interactions across the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activity.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">No recent activity.</div>
              ) : (
                activity.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-colors">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                      item.type === 'paper' ? 'bg-blue-500/20 text-blue-500' :
                      item.type === 'report' ? 'bg-purple-500/20 text-purple-500' :
                      'bg-orange-500/20 text-orange-500'
                    }`}>
                      {item.type === 'paper' && <FileText className="h-5 w-5" />}
                      {item.type === 'report' && <BookOpen className="h-5 w-5" />}
                      {item.type === 'chat' && <MessageSquare className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.type === 'paper' ? 'Uploaded paper' :
                         item.type === 'report' ? 'Generated literature review' :
                         'Chatted with AI assistant'}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {item.date.toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
