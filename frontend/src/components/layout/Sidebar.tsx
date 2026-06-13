import { NavLink } from "react-router-dom"
import { Home, Library, MessageSquare, FileText, BarChart, Settings, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { PricingModal } from "./PricingModal"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Library", href: "/library", icon: Library },
  { name: "AI Chat", href: "/chat", icon: MessageSquare },
  { name: "Literature Review", href: "/literature-review", icon: BookOpen },
  { name: "Reports", href: "/reports", icon: BarChart },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const [isPricingOpen, setIsPricingOpen] = useState(false)

  return (
    <>
      <div className="flex h-full w-64 flex-col bg-background/40 backdrop-blur-xl border-r border-border/50">
        <div className="flex h-16 shrink-0 items-center px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">Lumina Research</span>
          </div>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
          <nav className="flex-1 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )
                }
              >
                <item.icon
                  className="mr-3 h-5 w-5 flex-shrink-0"
                  aria-hidden="true"
                />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="p-4">
          <div className="rounded-xl bg-gradient-to-tr from-primary/10 to-primary/5 p-4 border border-primary/20 backdrop-blur-md">
            <h4 className="font-semibold text-sm mb-1 text-foreground">Hobby Plan Active</h4>
            <p className="text-xs text-muted-foreground mb-3">You have 12 AI credits remaining.</p>
            <button 
              onClick={() => setIsPricingOpen(true)}
              className="text-xs font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-md w-full hover:bg-primary/90 transition-colors"
            >
              Upgrade Plan
            </button>
          </div>
        </div>
      </div>

      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
    </>
  )
}
