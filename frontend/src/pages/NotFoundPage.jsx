import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-16 px-4 text-center">
      <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-10 h-10" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 mb-2">404 — Page Not Found</h1>
      <p className="text-slate-600 text-sm max-w-md mb-6">
        The requested page does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Return to Home Search</span>
      </Link>
    </div>
  );
}
