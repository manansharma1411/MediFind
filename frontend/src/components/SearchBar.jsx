import React from 'react';
import { Search, X, Sparkles } from 'lucide-react';

export default function SearchBar({
  value,
  onChange,
  onSearch,
  onClear,
  didYouMean,
  onSelectSuggestion,
  placeholder = "Search medicine name (e.g., Crocin, Paracetamol, Mox, Glycomet)..."
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(value);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-4 text-slate-400 pointer-events-none">
          <Search className="w-5 h-5 text-emerald-600" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-24 py-3.5 bg-white border border-slate-300 rounded-2xl shadow-sm text-slate-900 text-base placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
        />
        <div className="absolute right-3 flex items-center gap-1.5">
          {value && (
            <button
              type="button"
              onClick={onClear}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
          >
            Find
          </button>
        </div>
      </form>

      {/* Did You Mean Suggestion Banner */}
      {didYouMean && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-2.5 rounded-xl shadow-sm animate-fade-in">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Did you mean <strong className="font-bold underline cursor-pointer" onClick={() => onSelectSuggestion(didYouMean)}>{didYouMean}</strong>?</span>
          <button
            type="button"
            onClick={() => onSelectSuggestion(didYouMean)}
            className="ml-auto text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg transition-colors"
          >
            Apply Suggestion
          </button>
        </div>
      )}
    </div>
  );
}
