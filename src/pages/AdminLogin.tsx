import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, LogIn, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("adminToken", data.token);
        navigate("/admin/dashboard");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-stone-900 rounded-xl flex items-center justify-center mb-4">
            <Lock className="text-white w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold font-serif text-stone-900">Admin Login</h2>
          <p className="mt-2 text-stone-600">Enter your credentials to access the dashboard</p>
        </div>

        <form className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-stone-100" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm border border-red-100">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 focus:border-stone-900 transition-all"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 focus:border-stone-900 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-stone-900 hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-900 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Sign In
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
