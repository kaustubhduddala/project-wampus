import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      navigate("/home");
    }
  };

  return (
    <div className="min-h-[80vh] bg-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white neo-brutal-border neo-brutal-shadow p-8">

          {/* Header */}
          <div className="mb-8">
            <Link to="/home" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-[#22C55E] neo-brutal-border flex items-center justify-center neo-brutal-shadow-sm">
                <span className="text-sm font-black text-white">PJW</span>
              </div>
              <span className="font-black text-sm text-gray-600 uppercase tracking-widest">Project Wampus</span>
            </Link>
            <h1 className="text-4xl font-black uppercase leading-none">Sign In</h1>
            <p className="text-gray-600 font-bold mt-2 text-sm">Welcome back. Sign in to your account.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 neo-brutal-border border-red-500 p-3 mb-6">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm font-bold text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-black uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full neo-brutal-border px-4 py-3 font-bold text-sm focus:outline-none focus:ring-0 focus:border-[#22C55E] placeholder:text-gray-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-black uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full neo-brutal-border px-4 py-3 font-bold text-sm focus:outline-none focus:ring-0 focus:border-[#22C55E] placeholder:text-gray-400 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full neo-button bg-[#22C55E] text-white font-black uppercase tracking-wider py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? "Signing In..." : "Sign In"}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-0.5 bg-black" />
            <span className="text-xs font-black uppercase tracking-widest text-gray-500">or</span>
            <div className="flex-1 h-0.5 bg-black" />
          </div>

          {/* Back to home */}
          <div className="text-center">
            <Link
              to="/home"
              className="text-sm font-black uppercase tracking-wider hover:text-[#22C55E] transition-colors"
            >
              ← Back to Home
            </Link>
          </div>

        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-500 font-bold mt-6 uppercase tracking-wider">
          Project Wampus · Fighting Homelessness in Austin
        </p>

      </div>
    </div>
  );
}
