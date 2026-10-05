import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { reservationApi } from '../services/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { formatCurrency } from '../utils/formatters';
import {
  CheckCircle2,
  Clock,
  XCircle,
  MapPin,
  Phone,
  Pill,
  ExternalLink,
  ArrowLeft,
  FileText
} from 'lucide-react';

export default function ReservationConfirmationPage() {
  const { id } = useParams();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReservation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reservationApi.getById(id);
      if (res.success) {
        setReservation(res.data);
      } else {
        setError(res.message || 'Reservation record not found.');
      }
    } catch (err) {
      console.error('Error fetching reservation:', err);
      setError('Connection error fetching reservation details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservation();
  }, [id]);

  if (loading) return <LoadingState message="Fetching reservation details..." />;
  if (error || !reservation) return <ErrorState message={error || 'Reservation not found.'} onRetry={fetchReservation} />;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${reservation.latitude},${reservation.longitude}`;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Accepted & Stock Reserved
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-full text-xs font-bold">
            <XCircle className="w-4 h-4 text-rose-600" /> Reservation Cancelled
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-xs font-bold">
            <Clock className="w-4 h-4 text-amber-600" /> Pending Admin Review
          </span>
        );
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4 text-emerald-600" /> Back to Home Search
      </Link>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Top Banner */}
        <div className="text-center space-y-3 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Medicine Reservation Details</h1>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Reservation ID: <strong className="text-slate-800">#RES-{reservation.reservation_id}</strong>
            </p>
          </div>
          <div className="pt-1">{getStatusBadge(reservation.status)}</div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Medicine Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-emerald-600" /> Reserved Medicine
            </h3>
            <p className="font-bold text-slate-800 text-base">{reservation.medicine_name}</p>
            <p><span className="text-slate-500">Generic:</span> {reservation.generic_name}</p>
            <p><span className="text-slate-500">Dosage:</span> {reservation.strength} ({reservation.form})</p>
            <p className="pt-2 border-t border-slate-200 font-bold text-slate-900">
              Quantity: <span className="text-emerald-700">{reservation.quantity} unit(s)</span>
            </p>
          </div>

          {/* Pharmacy Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" /> Pick-up Pharmacy
            </h3>
            <p className="font-bold text-slate-800 text-base">{reservation.pharmacy_name}</p>
            <p className="text-slate-600">{reservation.pharmacy_address}</p>
            {reservation.pharmacy_phone && (
              <p className="flex items-center gap-1 text-slate-700 pt-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {reservation.pharmacy_phone}
              </p>
            )}
            <div className="pt-2">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Get Map Directions
              </a>
            </div>
          </div>
        </div>

        {/* Customer & Pricing Summary */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3">
          <div className="flex flex-wrap justify-between gap-4 text-xs">
            <div>
              <span className="text-slate-400 block">Customer Name:</span>
              <span className="font-bold text-slate-100">{reservation.customer_name}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Contact Phone:</span>
              <span className="font-bold text-slate-100">{reservation.customer_phone}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Date Submitted:</span>
              <span className="font-bold text-slate-100">{new Date(reservation.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Estimated Total Cost:</span>
            <span className="text-xl font-black text-emerald-400">{formatCurrency(reservation.total_price)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
