import React, { useState } from 'react';
import { X, CheckCircle2, ShoppingBag, MapPin, Pill, AlertCircle, Loader2 } from 'lucide-react';
import { reservationApi } from '../services/api';
import { formatCurrency } from '../utils/formatters';

export default function ReservationModal({ item, onClose, onSuccess }) {
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  if (!item) return null;

  const maxQty = item.quantity || 1;
  const unitPrice = Number(item.price) || 0;
  const totalPrice = Math.round(unitPrice * quantity * 100) / 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!customerPhone.trim()) {
      setError('Please enter your contact phone number.');
      return;
    }
    if (quantity < 1 || quantity > maxQty) {
      setError(`Quantity must be between 1 and ${maxQty}.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        medicine_id: item.medicine_id,
        pharmacy_id: item.pharmacy_id,
        quantity: Number(quantity),
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        notes: notes.trim()
      };

      const res = await reservationApi.create(payload);
      if (res.success) {
        setConfirmation(res.data);
        if (onSuccess) onSuccess(res.data);
      } else {
        setError(res.message || 'Failed to submit reservation.');
      }
    } catch (err) {
      console.error('Reservation submit error:', err);
      setError(err.response?.data?.message || 'Error submitting reservation request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden relative">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Reserve Medicine</h3>
              <p className="text-xs text-slate-400">Reserve medicine at your chosen pharmacy</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {confirmation ? (
            /* Confirmation Success State */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-extrabold text-slate-900">Reservation Recorded!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Reservation ID: <strong className="text-slate-800 font-mono">#RES-{confirmation.reservation_id}</strong>
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Medicine:</span>
                  <span className="font-bold text-slate-900">{confirmation.medicine_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pharmacy:</span>
                  <span className="font-bold text-slate-900">{confirmation.pharmacy_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reserved Quantity:</span>
                  <span className="font-bold text-slate-900">{confirmation.quantity} unit(s)</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                  <span className="font-semibold text-slate-700">Estimated Total:</span>
                  <span className="font-black text-emerald-600">{formatCurrency(confirmation.total_estimated_price)}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors shadow-sm"
                >
                  Close Confirmation
                </button>
              </div>
            </div>
          ) : (
            /* Reservation Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Medicine & Pharmacy Card Banner */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-emerald-600" /> {item.medicine_name}
                  </span>
                  <span className="font-extrabold text-emerald-800">{formatCurrency(unitPrice)} / unit</span>
                </div>
                <div className="flex items-center gap-1 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{item.pharmacy_name} — {item.address}</span>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-xl text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Quantity (Max {maxQty})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={maxQty}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(maxQty, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estimated Total
                  </label>
                  <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm font-black text-slate-900">
                    {formatCurrency(totalPrice)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Customer Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Dr. Rajesh Kumar"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g., +91 98260 12345"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pickup Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Will pick up by 6 PM"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{loading ? 'Submitting...' : 'Confirm Reservation'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
