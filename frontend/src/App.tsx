import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./store/AuthContext"
import { ProtectedRoute } from "./components/layout/ProtectedRoute"
import { DashboardLayout } from "./components/layout/DashboardLayout"
import { Landing } from "./pages/Landing"
import { Login } from "./pages/Login"
import { Dashboard } from "./pages/Dashboard"
import { Chat } from "./pages/Chat"
import { Library } from "./pages/Library"
import { LiteratureReview } from "./pages/LiteratureReview"
import { Reports } from "./pages/Reports"
import { Settings } from "./pages/Settings"

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Login isSignup />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/library" element={<Library />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/literature-review" element={<LiteratureReview />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
