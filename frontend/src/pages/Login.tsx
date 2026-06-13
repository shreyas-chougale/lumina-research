import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { FileText, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/store/AuthContext"
import { api } from "@/services/api"

export function Login({ isSignup = false }: { isSignup?: boolean }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const from = location.state?.from?.pathname || "/dashboard"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (isSignup) {
        const response = await api.post("/auth/signup", {
          email,
          password,
          full_name: fullName
        })
        login(response.data.access_token, response.data.user)
      } else {
        const formData = new URLSearchParams()
        formData.append("username", email)
        formData.append("password", password)
        
        const response = await api.post("/auth/login", formData, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" }
        })
        login(response.data.access_token, response.data.user)
      }
      navigate(from, { replace: true })
    } catch (err: any) {
      setError(err.response?.data?.detail || "An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background relative flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[150px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[150px] -z-10" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="sm:mx-auto sm:w-full sm:max-w-md z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <FileText className="h-7 w-7 text-primary-foreground" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-foreground mb-8">
          {isSignup ? "Create your account" : "Sign in to your account"}
        </h2>

        <Card className="shadow-2xl shadow-primary/10 border-border/50">
          <CardHeader>
            <CardTitle>{isSignup ? "Sign Up" : "Log In"}</CardTitle>
            <CardDescription>
              {isSignup ? "Enter your details to get started." : "Welcome back to Lumina Research."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                  {error}
                </div>
              )}
              
              {isSignup && (
                <div className="space-y-1">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input 
                    placeholder="John Doe" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required 
                  />
                </div>
              )}
              <div className="space-y-1">
                <label className="text-sm font-medium">Email address</label>
                <Input 
                  type="email" 
                  placeholder="john@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Password</label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>

              <Button className="w-full mt-6" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {isSignup ? "Sign up" : "Sign in"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              {isSignup ? "Already have an account? " : "Don't have an account? "}
              <Link to={isSignup ? "/login" : "/signup"} className="font-medium text-primary hover:text-primary/80">
                {isSignup ? "Log in" : "Sign up"}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
