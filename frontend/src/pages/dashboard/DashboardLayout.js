import { useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard, UploadCloud, Search, BarChart3, Table2,
  FileDown, ShieldCheck, LogOut, Menu, X, Globe, TrendingUp,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { to: "/dashboard", end: true, icon: LayoutDashboard, label: "Overview" },
  { to: "/dashboard/upload", icon: UploadCloud, label: "Data Upload" },
  { to: "/dashboard/analysis", icon: Search, label: "Data Analysis" },
  { to: "/dashboard/charts", icon: BarChart3, label: "Charts" },
  { to: "/dashboard/finance", icon: TrendingUp, label: "Financial Insights" },
  { to: "/dashboard/results", icon: Table2, label: "Detailed Results" },
  { to: "/dashboard/reports", icon: FileDown, label: "Reports & Export" },
  { to: "/dashboard/admin", icon: ShieldCheck, label: "Admin" },
];

function SidebarContent({ onNavigate }) {
  return (
    <>
      <Link to="/" className="flex items-center px-5 h-20 border-b border-white/10" data-testid="sidebar-logo">
        <span className="bg-white rounded-lg px-2.5 py-1.5 inline-flex">
          <img src="/assets/logo.png" alt="Master Key Analysis" className="h-8 w-auto" />
        </span>
      </Link>
      <nav className="flex-1 px-3 py-6 space-y-1" data-testid="sidebar-nav">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            onClick={onNavigate}
            data-testid={`nav-${n.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-[background-color,color] duration-200 ${
                isActive ? "bg-orange-500 text-navy-900" : "text-white/65 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <n.icon className="w-4.5 h-4.5 w-5 h-5" strokeWidth={1.75} />
            {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-6 py-5 border-t border-white/10">
        <Link to="/" className="flex items-center gap-2 text-xs text-white/40 hover:text-orange-400 transition-colors duration-200" data-testid="sidebar-site-link">
          <Globe className="w-3.5 h-3.5" /> Back to website
        </Link>
      </div>
    </>
  );
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex" data-testid="dashboard-layout">
      <aside className="hidden lg:flex w-64 flex-col bg-navy-800 fixed inset-y-0 z-40">
        <SidebarContent />
      </aside>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-navy-800 flex flex-col">
            <SidebarContent onNavigate={() => setOpen(false)} />
          </div>
          <div className="flex-1 bg-navy-900/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
        </div>
      )}

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-5 lg:px-8 sticky top-0 z-30" data-testid="dashboard-header">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-navy-800" onClick={() => setOpen(!open)} data-testid="dashboard-menu-toggle" aria-label="Menu">
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <span className="font-display font-bold text-navy-800 tracking-tight hidden sm:block">Analytics Workspace</span>
          </div>
          <div className="flex items-center gap-4">
            <img src="/assets/vasanth-avatar.png" alt="Vasanth" className="w-9 h-9 rounded-full object-cover border-2 border-orange-500" data-testid="header-avatar" />
            <span className="text-sm text-slate-500 hidden md:block" data-testid="dashboard-user-email">{user?.email}</span>
            <button
              onClick={handleLogout}
              data-testid="logout-button"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-[background-color,color] duration-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </header>
        <main className="flex-1 p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
