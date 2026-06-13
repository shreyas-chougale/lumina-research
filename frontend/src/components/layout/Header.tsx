import { useState, useRef, useEffect } from "react"
import { Search, Bell, User, LogOut, Settings, CreditCard } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/store/AuthContext"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"

export function Header() {
  const { user, logout } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 items-center gap-x-4 border-b border-border/50 bg-background/40 backdrop-blur-xl px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1 items-center" action="#" method="GET" onSubmit={(e) => e.preventDefault()}>
          <Search
            className="absolute left-3 h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="search-field"
            className="pl-9 w-full max-w-md bg-background/40"
            placeholder="Search papers, reports, or queries..."
            type="search"
            name="search"
          />
        </form>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications)
                setShowProfile(false)
              }}
              className="relative -m-2.5 p-2.5 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary/50"
            >
              <span className="sr-only">View notifications</span>
              <Bell className="h-5 w-5" aria-hidden="true" />
              {/* Notification dot */}
              <span className="absolute top-2.5 right-2.5 block h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-xl z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-border/50 font-semibold text-sm">Notifications</div>
                  <div className="max-h-80 overflow-y-auto p-2">
                    <div className="flex gap-3 p-3 hover:bg-secondary/40 rounded-lg cursor-pointer transition-colors mb-1">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Bell className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-foreground">Your report on <span className="font-semibold">AI Efficiency</span> is ready.</p>
                        <p className="text-xs text-muted-foreground mt-1">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-3 hover:bg-secondary/40 rounded-lg cursor-pointer transition-colors">
                      <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm text-foreground">Welcome to Lumina Research! Try chatting with your first paper.</p>
                        <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 border-t border-border/50 text-center">
                    <button className="text-xs text-primary hover:underline p-1">Mark all as read</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border/50" aria-hidden="true" />

          {/* Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setShowProfile(!showProfile)
                setShowNotifications(false)
              }}
              className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-secondary/50 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-sm">
                {user?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <span className="text-sm font-medium text-foreground hidden sm:block">
                {user?.full_name || user?.email || "User"}
              </span>
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-xl z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-border/50">
                    <p className="text-sm font-semibold truncate">{user?.full_name || "Lumina User"}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <Link to="/settings" onClick={() => setShowProfile(false)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-secondary/50 rounded-lg transition-colors">
                      <Settings className="h-4 w-4" />
                      Account Settings
                    </Link>
                    <button onClick={() => {
                      setShowProfile(false)
                      alert("Billing portal opening...")
                    }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-secondary/50 rounded-lg transition-colors">
                      <CreditCard className="h-4 w-4" />
                      Billing & Plans
                    </button>
                  </div>
                  <div className="p-2 border-t border-border/50">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </header>
  )
}
