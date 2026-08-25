import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, KeyRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/founder", label: "Founder" },
  { to: "/services", label: "Services" },
  { to: "/why-us", label: "Why Us" },
  { to: "/process", label: "Process" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-testid="main-navbar"
      className={`fixed top-0 inset-x-0 z-50 transition-[background-color,border-color] duration-300 backdrop-blur-xl border-b ${
        scrolled ? "bg-navy-900/85 border-white/10" : "bg-navy-900/40 border-white/5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group" data-testid="navbar-logo">
          <span className="w-10 h-10 rounded-lg bg-orange-500 grid place-items-center transition-transform duration-300 group-hover:rotate-12">
            <KeyRound className="w-5 h-5 text-navy-900" strokeWidth={2.5} />
          </span>
          <span className="leading-none">
            <span className="block font-display font-800 font-extrabold tracking-tight text-lg">MASTER KEY</span>
            <span className="block text-[10px] uppercase tracking-[0.45em] text-orange-400">Analysis</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8" data-testid="navbar-links">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm font-medium tracking-wide transition-colors duration-200 ${
                  isActive ? "text-orange-400" : "text-white/70 hover:text-white"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <Link
            to="/dashboard"
            data-testid="navbar-dashboard-link"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors duration-200"
          >
            Dashboard
          </Link>
          <Link
            to="/contact"
            data-testid="navbar-cta-button"
            className="px-6 py-2.5 rounded-full bg-orange-500 text-navy-900 text-sm font-bold transition-[background-color,transform] duration-200 hover:bg-orange-400 hover:-translate-y-0.5"
          >
            Start a Project
          </Link>
        </div>

        <button
          className="lg:hidden text-white"
          onClick={() => setOpen(!open)}
          data-testid="mobile-menu-toggle"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-navy-900/95 backdrop-blur-xl border-b border-white/10 overflow-hidden"
            data-testid="mobile-menu"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    `text-base font-medium ${isActive ? "text-orange-400" : "text-white/80"}`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <Link to="/dashboard" className="text-base font-medium text-white/80">
                Dashboard
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
