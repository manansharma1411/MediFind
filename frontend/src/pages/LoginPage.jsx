import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Pill, Lock, Mail, AlertCircle, Loader2, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@medifind.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Pill className="w-7 h-7 rotate-45" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Admin Portal Login</h2>
          <p className="text-xs text-slate-500">Sign in to manage inventory and fulfill reservations</p>
        </div>

        {/* Demo Credentials Box */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-emerald-950">
            <KeyRound className="w-4 h-4 text-emerald-600" />
            <span>Demo Admin Credentials:</span>
          </div>
          <p><strong className="text-slate-800">Email:</strong> <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">admin@medifind.com</code></p>
          <p><strong className="text-slate-800">Password:</strong> <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">admin123</code></p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@medifind.com"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{loading ? 'Authenticating...' : 'Sign In as Admin'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
