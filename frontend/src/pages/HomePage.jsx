import React, { useState, useEffect } from 'react';
import { medicineApi } from '../services/api';
import SearchBar from '../components/SearchBar';
import MedicineCard from '../components/MedicineCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { Pill, MapPin, Search, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [didYouMean, setDidYouMean] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchMedicines = async (searchStr = '') => {
    setLoading(true);
    setError(null);
    try {
      const res = await medicineApi.search(searchStr);
      if (res.success) {
        setMedicines(res.data || []);
        setDidYouMean(res.didYouMean || null);
      } else {
        setError(res.message || 'Failed to search medicines.');
      }
    } catch (err) {
      console.error('Error fetching medicines:', err);
      setError('Server connection error. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines('');
  }, []);

  const handleSearchSubmit = (searchVal) => {
    fetchMedicines(searchVal);
  };

  const handleClearSearch = () => {
    setQuery('');
    setDidYouMean(null);
    fetchMedicines('');
  };

  const handleApplySuggestion = (suggestion) => {
    setQuery(suggestion);
    setDidYouMean(null);
    fetchMedicines(suggestion);
  };

  // Filter medicines by form/category tag
  const filteredMedicines = medicines.filter((m) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'tablet') return m.form?.toLowerCase().includes('tablet');
    if (activeFilter === 'capsule') return m.form?.toLowerCase().includes('capsule');
    return true;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
        {/* Background Decorative Blur */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center space-y-4 relative z-10">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Find Your Medicine. <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Find It Nearby.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto font-medium leading-relaxed">
            Real-time medicine inventory and price finder across verified pharmacies in <strong className="text-white">Bhopal, Madhya Pradesh</strong>.
          </p>

          {/* Search Bar */}
          <div className="pt-4">
            <SearchBar
              value={query}
              onChange={setQuery}
              onSearch={handleSearchSubmit}
              onClear={handleClearSearch}
              didYouMean={didYouMean}
              onSelectSuggestion={handleApplySuggestion}
            />
          </div>

          {/* Location Badge */}
          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-400">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Current Search Zone: <strong className="text-slate-200">Bhopal City (462001 - 462042)</strong></span>
          </div>
        </div>
      </section>

      {/* Main Results Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Filter Pills Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {query ? `Search Results for "${query}"` : 'Available Medicines'}
            </h2>
            <p className="text-xs text-slate-500">
              Showing {filteredMedicines.length} medicine records from backend database
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setActiveFilter('tablet')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeFilter === 'tablet'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tablets
            </button>
            <button
              onClick={() => setActiveFilter('capsule')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeFilter === 'capsule'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Capsules
            </button>
          </div>
        </div>

        {/* States: Loading, Error, Empty, Grid */}
        {loading ? (
          <LoadingState message="Fetching medicines from database..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchMedicines(query)} />
        ) : filteredMedicines.length === 0 ? (
          <EmptyState
            title="No matching medicines found"
            message={didYouMean ? `Did you mean "${didYouMean}"?` : "Try searching for Paracetamol, Crocin, Mox, Glycomet, Cetzine, or Azithral."}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedicines.map((med) => (
              <MedicineCard key={med.id} medicine={med} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
