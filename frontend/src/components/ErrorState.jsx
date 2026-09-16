import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({ message = "Failed to load data.", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-rose-50 border border-rose-200 rounded-2xl max-w-lg mx-auto my-6">
      <AlertTriangle className="w-10 h-10 text-rose-500 mb-3" />
      <h3 className="text-base font-bold text-rose-900 mb-1">Something went wrong</h3>
      <p className="text-slate-600 text-sm mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
}
