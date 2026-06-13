import { useState } from "react"
import { motion } from "framer-motion"
import { Save, User, Bell, Shield, Palette } from "lucide-react"

export function Settings() {
  const [activeTab, setActiveTab] = useState("profile")

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "appearance", name: "Appearance", icon: Palette },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "security", name: "Security", icon: Shield },
  ]

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground mb-8">Manage your account settings and preferences.</p>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <nav className="flex md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {activeTab === "profile" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Full Name</label>
                      <input type="text" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" defaultValue="Lumina User" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Email Address</label>
                      <input type="email" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" defaultValue="user@luminaresearch.com" />
                    </div>
                    <div className="pt-4">
                      <button className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium transition-colors">
                        <Save className="h-4 w-4" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "appearance" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Theme Preferences</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <button className="flex flex-col items-center gap-2 p-4 border-2 border-primary rounded-xl bg-background/50">
                      <div className="h-10 w-10 rounded-full bg-slate-900 border border-slate-700"></div>
                      <span className="text-sm font-medium">Dark (Active)</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 border-2 border-transparent hover:border-border/50 rounded-xl bg-background/50 opacity-50 cursor-not-allowed">
                      <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-300"></div>
                      <span className="text-sm font-medium">Light</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 border-2 border-transparent hover:border-border/50 rounded-xl bg-background/50 opacity-50 cursor-not-allowed">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-slate-900 to-slate-100 border border-slate-300"></div>
                      <span className="text-sm font-medium">System</span>
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">Note: Lumina Research is currently optimized for Dark Mode.</p>
                </div>
              </motion.div>
            )}

            {(activeTab === "notifications" || activeTab === "security") && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm flex flex-col items-center justify-center text-center h-48">
                  <Shield className="h-8 w-8 text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-muted-foreground">More settings coming soon</h3>
                  <p className="text-sm text-muted-foreground/60 mt-1">This panel is under development.</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
