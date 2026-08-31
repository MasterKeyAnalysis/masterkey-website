import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Key, Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { formatApiError } from "@/lib/api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full rounded-xl bg-navy-800 border border-navy-700 px-5 py-3.5 text-sm text-white placeholder:text-white/35 outline-none transition-[border-color] duration-200 focus:border-orange-500";

  return (
    <div className="min-h-screen bg-navy-900 grid place-items-center px-6 grain relative" data-testid="login-page">
      <div className="w-full max-w-md">
        <Link to="/" className="flex justify-center mb-10" data-testid="login-logo">
          <span className="bg-white rounded-xl px-4 py-2 inline-flex">
            <img src="/assets/logo.png" alt="Master Key Analysis" className="h-11 w-auto" />
          </span>
        </Link>
        <form onSubmit={submit} className="rounded-3xl bg-navy-800 border border-navy-700 p-10 space-y-5" data-testid="login-form">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-white">Analytics Dashboard</h1>
            <p className="mt-1 text-sm text-white/50">Sign in with your admin account</p>
          </div>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={inputCls} data-testid="login-email-input" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={inputCls} data-testid="login-password-input" />
          <button
            type="submit"
            disabled={loading}
            data-testid="login-submit-button"
            className="w-full inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl bg-orange-500 text-navy-900 font-bold transition-[background-color] duration-200 hover:bg-orange-400 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <Link to="/" className="block text-center mt-6 text-sm text-white/40 hover:text-orange-400 transition-colors duration-200" data-testid="back-to-site-link">
          Back to website
        </Link>
      </div>
    </div>
  );
}
