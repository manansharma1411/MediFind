import React from 'react';
import { SearchX } from 'lucide-react';

export default function EmptyState({ title = "No medicines found", message = "Try adjusting your search terms or check spelling." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-3">
        <SearchX className="w-8 h-8 text-slate-500" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-slate-500 text-sm max-w-md">{message}</p>
    </div>
  );
}
