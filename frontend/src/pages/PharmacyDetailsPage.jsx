import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { pharmacyApi } from '../services/api';
import StockBadge from '../components/StockBadge';
import PharmacyMap from '../components/PharmacyMap';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import ReservationModal from '../components/ReservationModal';
import { formatCurrency } from '../utils/formatters';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Clock,
  ExternalLink,
  Pill,
  ShoppingBag,
  Building2
} from 'lucide-react';

export default function PharmacyDetailsPage() {
  const { id } = useParams();
  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reservationItem, setReservationItem] = useState(null);

  const fetchPharmacy = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await pharmacyApi.getById(id);
      if (res.success) {
        setPharmacy(res.data);
      } else {
        setError(res.message || 'Pharmacy not found.');
      }
    } catch (err) {
      console.error('Error fetching pharmacy:', err);
      setError('Failed to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacy();
  }, [id]);

  if (loading) return <LoadingState message="Loading pharmacy profile..." />;
  if (error || !pharmacy) return <ErrorState message={error || 'Pharmacy not found.'} onRetry={fetchPharmacy} />;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4 text-emerald-600" /> Back to Search
      </Link>

      {/* Header Profile Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${
                pharmacy.is_open
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              {pharmacy.is_open ? 'Open Now' : 'Closed'}
            </span>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              Bhopal, MP
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {pharmacy.name}
          </h1>

          <p className="text-sm text-slate-600 flex items-start gap-1.5 leading-relaxed">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{pharmacy.address}, {pharmacy.city}, {pharmacy.state} {pharmacy.postal_code}</span>
          </p>

          {pharmacy.phone && (
            <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{pharmacy.phone}</span>
            </p>
          )}
        </div>

        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-sm transition-colors shrink-0"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Get Directions</span>
        </a>
      </div>

      {/* Main Grid: Inventory List & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Inventory Items List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Pill className="w-5 h-5 text-emerald-600" /> Available Inventory Catalog
            </h3>
            <span className="text-xs text-slate-500 font-semibold">
              {pharmacy.inventory?.length || 0} medicines cataloged
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Medicine</th>
                    <th className="py-3.5 px-4">Stock</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {pharmacy.inventory?.map((item) => (
                    <tr key={item.inventory_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <Link to={`/medicines/${item.medicine_id}`} className="font-bold text-slate-900 hover:text-emerald-600">
                          {item.medicine_name}
                        </Link>
                        <div className="text-xs text-slate-500">
                          {item.generic_name} ({item.strength})
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <StockBadge status={item.availability} quantity={item.quantity} />
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setReservationItem({ ...item, pharmacy_id: pharmacy.id, pharmacy_name: pharmacy.name, address: pharmacy.address })}
                          disabled={item.availability === 'out_of_stock'}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                            item.availability === 'out_of_stock'
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                          }`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Reserve</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Map Column (5 cols) */}
        <div className="lg:col-span-5 h-[450px] sticky top-20">
          <PharmacyMap items={[{ ...pharmacy, pharmacy_id: pharmacy.id, pharmacy_name: pharmacy.name, availability: 'available', quantity: 1 }]} />
        </div>
      </div>

      {reservationItem && (
        <ReservationModal
          item={reservationItem}
          onClose={() => setReservationItem(null)}
          onSuccess={() => fetchPharmacy()}
        />
      )}
    </div>
  );
}
