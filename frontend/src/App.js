import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";

import MarketingLayout from "@/components/marketing/MarketingLayout";
import Home from "@/pages/marketing/Home";
import About from "@/pages/marketing/About";
import Founder from "@/pages/marketing/Founder";
import Services from "@/pages/marketing/Services";
import WhyUs from "@/pages/marketing/WhyUs";
import Process from "@/pages/marketing/Process";
import Contact from "@/pages/marketing/Contact";

import Login from "@/pages/Login";
import DashboardLayout from "@/pages/dashboard/DashboardLayout";
import Overview from "@/pages/dashboard/Overview";
import Upload from "@/pages/dashboard/Upload";
import Analysis from "@/pages/dashboard/Analysis";
import ChartsPage from "@/pages/dashboard/ChartsPage";
import Results from "@/pages/dashboard/Results";
import Reports from "@/pages/dashboard/Reports";
import Admin from "@/pages/dashboard/Admin";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 grid place-items-center" data-testid="auth-loading">
        <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<MarketingLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/founder" element={<Founder />} />
              <Route path="/services" element={<Services />} />
              <Route path="/why-us" element={<WhyUs />} />
              <Route path="/process" element={<Process />} />
              <Route path="/contact" element={<Contact />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <Protected>
                  <DashboardLayout />
                </Protected>
              }
            >
              <Route index element={<Overview />} />
              <Route path="upload" element={<Upload />} />
              <Route path="analysis" element={<Analysis />} />
              <Route path="charts" element={<ChartsPage />} />
              <Route path="results" element={<Results />} />
              <Route path="reports" element={<Reports />} />
              <Route path="admin" element={<Admin />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </div>
  );
}

export default App;
