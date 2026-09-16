import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { inventoryApi } from '../services/api';
import StockBadge from '../components/StockBadge';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { formatCurrency } from '../utils/formatters';
import {
  LayoutDashboard,
  Search,
  Edit,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Pill,
  MapPin,
  Database
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Editing state
  const [editingItem, setEditingItem] = useState(null);
  const [editQuantity, setEditQuantity] = useState(0);
  const [editPrice, setEditPrice] = useState(0);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await inventoryApi.getAll();
      if (res.success) {
        setInventory(res.data || []);
      } else {
        setError(res.message || 'Failed to load inventory.');
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Connection error fetching inventory records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleStartEdit = (item) => {
    setEditingItem(item);
    setEditQuantity(item.quantity);
    setEditPrice(item.price);
    setFeedback(null);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (editQuantity < 0) {
      setFeedback({ type: 'error', message: 'Quantity cannot be negative.' });
      return;
    }
    if (editPrice < 0) {
      setFeedback({ type: 'error', message: 'Price cannot be negative.' });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      const res = await inventoryApi.update(editingItem.inventory_id, {
        quantity: Number(editQuantity),
        price: Number(editPrice)
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Database updated! ${editingItem.medicine_name} at ${editingItem.pharmacy_name} set to Qty: ${editQuantity} (${res.data.availability.replace('_', ' ')}).`
        });
        setEditingItem(null);
        await fetchInventory();
      } else {
        setFeedback({ type: 'error', message: res.message || 'Failed to update database.' });
      }
    } catch (err) {
      console.error('Error saving inventory edit:', err);
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Server error persisting database update.'
      });
    } finally {
      setSaving(false);
    }
  };

  // Filter inventory list
  const filteredInventory = inventory.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.medicine_name.toLowerCase().includes(q) ||
      item.pharmacy_name.toLowerCase().includes(q) ||
      item.generic_name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-400/30">
            <Database className="w-3.5 h-3.5" />
            <span>Database Source of Truth</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Pharmacy Inventory Admin Dashboard
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Update pharmacy inventory quantities and prices directly in PostgreSQL/SQLite. All changes immediately propagate to user search and map availability views.
          </p>
        </div>

        <button
          onClick={fetchInventory}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-bold transition-colors shrink-0"
        >
          <RefreshCw className="w-4 h-4 text-emerald-400" />
          <span>Reload Database</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center justify-between gap-3 p-4 rounded-2xl text-xs font-semibold shadow-sm animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 hover:bg-black/5 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Stats Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search inventory by medicine or pharmacy name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="text-xs text-slate-500 font-semibold self-end sm:self-center">
          Showing <strong>{filteredInventory.length}</strong> of {inventory.length} inventory records
        </div>
      </div>

      {/* Inventory Table */}
      {loading ? (
        <LoadingState message="Loading inventory database records..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchInventory} />
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Medicine</th>
                  <th className="py-3.5 px-4">Pharmacy</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Quantity</th>
                  <th className="py-3.5 px-4">Calculated Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredInventory.map((item) => (
                  <tr key={item.inventory_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Pill className="w-4 h-4 text-emerald-600" /> {item.medicine_name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {item.generic_name} ({item.strength})
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{item.pharmacy_name}</div>
                      <div className="text-xs text-slate-500">{item.pharmacy_address}</div>
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {item.quantity} units
                    </td>
                    <td className="py-3.5 px-4">
                      <StockBadge status={item.availability} quantity={item.quantity} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/medicines/${item.medicine_id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                          title="Verify availability in user search view"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Verify User View</span>
                        </Link>

                        <button
                          onClick={() => handleStartEdit(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit Stock</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal Dialog */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden relative">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">Update Inventory Item</h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs space-y-1">
                <p><strong className="text-slate-900">Medicine:</strong> {editingItem.medicine_name}</p>
                <p><strong className="text-slate-900">Pharmacy:</strong> {editingItem.pharmacy_name}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quantity (Units in Stock)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Rules: Qty &gt; 10 = Available, 1–10 = Low Stock, 0 = Out of Stock
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Unit Price (INR ₹)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  required
                  value={editPrice}
                  onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving to DB...' : 'Save to DB'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
