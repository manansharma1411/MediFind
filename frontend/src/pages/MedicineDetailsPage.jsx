import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { medicineApi } from '../services/api';
import PharmacyCard from '../components/PharmacyCard';
import AvailabilityTable from '../components/AvailabilityTable';
import PharmacyMap from '../components/PharmacyMap';
import ReservationModal from '../components/ReservationModal';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { formatCurrency } from '../utils/formatters';
import {
  ArrowLeft,
  Pill,
  MapPin,
  Map as MapIcon,
  List,
  Table as TableIcon,
  RefreshCw,
  Filter,
  ArrowUpDown,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function MedicineDetailsPage() {
  const { id } = useParams();
  const [medicine, setMedicine] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI States
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'table'
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState('price_asc'); // 'price_asc' | 'distance_asc' | 'stock_desc'
  const [selectedPharmacyId, setSelectedPharmacyId] = useState(null);
  const [reservationItem, setReservationItem] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await medicineApi.getAvailability(id);
      if (res.success) {
        setMedicine(res.medicine);
        setAvailability(res.data || []);
        setLastRefreshed(new Date());
      } else {
        setError(res.message || 'Failed to load availability data.');
      }
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError('Connection error fetching medicine availability.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Filter & Sort Logic
  const processedItems = availability
    .filter((item) => {
      if (onlyOpen && !item.is_open) return false;
      if (onlyAvailable && item.availability === 'out_of_stock') return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'distance_asc') return (a.distance_km || 0) - (b.distance_km || 0);
      if (sortBy === 'stock_desc') return b.quantity - a.quantity;
      return 0;
    });

  const lowestPrice = availability.length > 0 ? Math.min(...availability.map((i) => i.price)) : null;
  const totalStockCount = availability.reduce((acc, i) => acc + i.quantity, 0);

  if (loading) {
    return <LoadingState message="Checking live inventory across Bhopal pharmacies..." />;
  }

  if (error || !medicine) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Search
        </Link>
        <ErrorState message={error || 'Medicine not found.'} onRetry={fetchData} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Back Link */}
      <div>
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4 text-emerald-600" /> Back to Medicine Search
        </Link>
      </div>

      {/* Medicine Info Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-300 inline-flex items-center gap-1">
              <Pill className="w-3.5 h-3.5" /> {medicine.form}
            </span>
            <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {medicine.strength}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {medicine.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <p><strong className="text-slate-800 font-semibold">Generic:</strong> {medicine.generic_name}</p>
            <span className="text-slate-300">•</span>
            <p><strong className="text-slate-800 font-semibold">Brand:</strong> {medicine.brand_name}</p>
          </div>

          {medicine.description && (
            <p className="text-xs text-slate-500 pt-1 leading-relaxed">
              {medicine.description}
            </p>
          )}
        </div>

        {/* Quick Stats Box */}
        <div className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-around md:justify-end gap-6 text-center shrink-0">
          <div>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Lowest Price</span>
            <span className="text-xl font-black text-emerald-600">
              {lowestPrice != null ? formatCurrency(lowestPrice) : 'N/A'}
            </span>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Pharmacies</span>
            <span className="text-xl font-black text-slate-900">{availability.length}</span>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Total Stock</span>
            <span className="text-xl font-black text-slate-900">{totalStockCount} units</span>
          </div>
        </div>
      </div>

      {/* Control Toolbar: View Toggle, Filters, Refresh */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Left: View Modes & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                viewMode === 'split' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>Map & Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>Table View</span>
            </button>
          </div>

          {/* Toggle Checkboxes */}
          <label className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold cursor-pointer bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={onlyOpen}
              onChange={(e) => setOnlyOpen(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>Open Pharmacies Only</span>
          </label>

          <label className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold cursor-pointer bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>In-Stock Only</span>
          </label>
        </div>

        {/* Right: Sort & Re-fetch */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="price_asc">Lowest Price First</option>
              <option value="distance_asc">Nearest Distance First</option>
              <option value="stock_desc">Highest Stock First</option>
            </select>
          </div>

          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold transition-colors"
            title="Re-fetch live stock status from database"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh DB Availability</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {processedItems.length === 0 ? (
        <EmptyState
          title="No Matching Availability"
          message="No pharmacies matching your selected filter criteria."
        />
      ) : viewMode === 'table' ? (
        /* Table View */
        <AvailabilityTable
          items={processedItems}
          onReserve={(item) => setReservationItem(item)}
        />
      ) : (
        /* Split Map & Cards View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Pharmacy Cards Column (5 cols) */}
          <div className="lg:col-span-5 space-y-4 max-h-[650px] overflow-y-auto pr-1">
            {processedItems.map((item) => (
              <PharmacyCard
                key={item.inventory_id}
                item={item}
                isSelected={selectedPharmacyId === item.pharmacy_id}
                onReserve={(selected) => setReservationItem(selected)}
              />
            ))}
          </div>

          {/* Leaflet Map Column (7 cols) */}
          <div className="lg:col-span-7 h-[500px] lg:h-[650px] sticky top-20">
            <PharmacyMap
              items={processedItems}
              selectedPharmacyId={selectedPharmacyId}
              onReserve={(selected) => setReservationItem(selected)}
            />
          </div>
        </div>
      )}

      {/* Reservation Modal Trigger */}
      {reservationItem && (
        <ReservationModal
          item={reservationItem}
          onClose={() => setReservationItem(null)}
          onSuccess={() => fetchData()}
        />
      )}
    </div>
  );
}
