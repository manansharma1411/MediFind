import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { inventoryApi, reservationApi, adminApi } from '../services/api';
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
  Database,
  ShoppingBag,
  Building2,
  TrendingDown,
  LogOut,
  Check,
  XCircle,
  Clock,
  UserCheck
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'inventory' | 'reservations' | 'pharmacies' | 'medicines'

  // Data States
  const [stats, setStats] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Edit States
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editQuantity, setEditQuantity] = useState(0);
  const [editPrice, setEditPrice] = useState(0);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, invRes, resRes] = await Promise.all([
        adminApi.getStats().catch(() => ({ success: false })),
        inventoryApi.getAll(),
        reservationApi.getAll()
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (invRes.success) setInventory(invRes.data || []);
      if (resRes.success) setReservations(resRes.data || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to fetch admin dashboard records. Ensure admin session is active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

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
        await fetchDashboardData();
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

  const handleUpdateReservationStatus = async (reservationId, newStatus) => {
    setStatusUpdatingId(reservationId);
    setFeedback(null);
    try {
      const res = await reservationApi.updateStatus(reservationId, newStatus);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: res.message || `Reservation #${reservationId} updated to ${newStatus}.`
        });
        await fetchDashboardData();
      } else {
        setFeedback({ type: 'error', message: res.message || 'Failed to update status.' });
      }
    } catch (err) {
      console.error('Error updating reservation:', err);
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Error processing reservation update.'
      });
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const filteredInventory = inventory.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.medicine_name.toLowerCase().includes(q) ||
      item.pharmacy_name.toLowerCase().includes(q) ||
      item.generic_name.toLowerCase().includes(q)
    );
  });

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-400/30">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Admin: {user?.name || 'System Admin'}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Pharmacy Inventory & Reservation Admin
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Manage inventory stock counts, update unit prices, and fulfill user medicine reservations. All changes persist in PostgreSQL/SQLite.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            <span>Reload</span>
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-sm font-bold text-slate-600">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-colors border-b-2 ${
            activeTab === 'overview'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" /> Overview & Stats
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-colors border-b-2 ${
            activeTab === 'inventory'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4" /> Inventory Management ({inventory.length})
        </button>

        <button
          onClick={() => setActiveTab('reservations')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-colors border-b-2 ${
            activeTab === 'reservations'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> Reservations ({reservations.length})
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
          <button onClick={() => setFeedback(null)} className="p-1 hover:bg-black/5 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading ? (
        <LoadingState message="Loading dashboard database records..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchDashboardData} />
      ) : (
        <>
          {/* TAB 1: OVERVIEW & STATS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Analytics Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Medicines</div>
                  <div className="text-2xl font-black text-slate-900">{stats?.total_medicines || 6}</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pharmacies</div>
                  <div className="text-2xl font-black text-slate-900">{stats?.total_pharmacies || 4}</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
                  <div className="text-amber-600 text-xs font-bold uppercase tracking-wider">Low Stock Items</div>
                  <div className="text-2xl font-black text-amber-600">{stats?.low_stock_count || 0}</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
                  <div className="text-rose-600 text-xs font-bold uppercase tracking-wider">Out of Stock</div>
                  <div className="text-2xl font-black text-rose-600">{stats?.out_of_stock_count || 0}</div>
                </div>
              </div>

              {/* Quick Actions & Low Stock Focus */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-amber-500" /> Low Stock Inventory Items
                  </h3>
                  <div className="space-y-2">
                    {inventory.filter(i => i.availability === 'low_stock').map(item => (
                      <div key={item.inventory_id} className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-900">{item.medicine_name}</p>
                          <p className="text-slate-600">{item.pharmacy_name}</p>
                        </div>
                        <span className="font-extrabold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-lg">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-600" /> Pending Reservation Requests
                  </h3>
                  <div className="space-y-2">
                    {reservations.filter(r => r.status === 'pending').length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">No pending reservation requests.</p>
                    ) : (
                      reservations.filter(r => r.status === 'pending').map(res => (
                        <div key={res.reservation_id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-slate-900">#RES-{res.reservation_id} • {res.customer_name}</p>
                            <p className="text-slate-600">{res.medicine_name} x{res.quantity} at {res.pharmacy_name}</p>
                          </div>
                          <button
                            onClick={() => handleUpdateReservationStatus(res.reservation_id, 'accepted')}
                            className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg text-xs hover:bg-emerald-700"
                          >
                            Accept
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INVENTORY MANAGEMENT */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-96">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search by medicine or pharmacy name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="text-xs text-slate-500 font-semibold">
                  Showing <strong>{filteredInventory.length}</strong> items
                </div>
              </div>

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
                            <div className="text-xs text-slate-500">{item.generic_name} ({item.strength})</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800">{item.pharmacy_name}</div>
                            <div className="text-xs text-slate-500">{item.pharmacy_address}</div>
                          </td>
                          <td className="py-3.5 px-4 font-black text-slate-900">{formatCurrency(item.price)}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-800">{item.quantity} units</td>
                          <td className="py-3.5 px-4">
                            <StockBadge status={item.availability} quantity={item.quantity} />
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                to={`/medicines/${item.medicine_id}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Verify User View</span>
                              </Link>

                              <button
                                onClick={() => handleStartEdit(item)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm"
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
            </div>
          )}

          {/* TAB 3: RESERVATIONS MANAGEMENT */}
          {activeTab === 'reservations' && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900">User Medicine Reservation Requests</h3>
                <span className="text-xs text-slate-500 font-semibold">{reservations.length} total records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4">ID / Date</th>
                      <th className="py-3.5 px-4">Customer Details</th>
                      <th className="py-3.5 px-4">Medicine & Pharmacy</th>
                      <th className="py-3.5 px-4">Qty / Total</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm">
                    {reservations.map((res) => (
                      <tr key={res.reservation_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <Link to={`/reservation/${res.reservation_id}`} className="font-bold text-slate-900 hover:text-emerald-600">
                            #RES-{res.reservation_id}
                          </Link>
                          <div className="text-xs text-slate-500">{new Date(res.created_at).toLocaleDateString()}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{res.customer_name}</div>
                          <div className="text-xs text-slate-500">{res.customer_phone}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{res.medicine_name}</div>
                          <div className="text-xs text-slate-500">{res.pharmacy_name}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{res.quantity} unit(s)</div>
                          <div className="text-xs font-black text-emerald-600">{formatCurrency(res.total_price)}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              res.status === 'accepted'
                                ? 'bg-emerald-100 text-emerald-800'
                                : res.status === 'cancelled'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {res.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {res.status !== 'accepted' && (
                              <button
                                onClick={() => handleUpdateReservationStatus(res.reservation_id, 'accepted')}
                                disabled={statusUpdatingId === res.reservation_id}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" /> Accept
                              </button>
                            )}
                            {res.status !== 'cancelled' && (
                              <button
                                onClick={() => handleUpdateReservationStatus(res.reservation_id, 'cancelled')}
                                disabled={statusUpdatingId === res.reservation_id}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-1"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
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
              <button onClick={() => setEditingItem(null)} className="p-1 text-slate-400 hover:text-white rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs space-y-1">
                <p><strong className="text-slate-900">Medicine:</strong> {editingItem.medicine_name}</p>
                <p><strong className="text-slate-900">Pharmacy:</strong> {editingItem.pharmacy_name}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quantity (Units in Stock)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Unit Price (INR ₹)</label>
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
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save to DB'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
