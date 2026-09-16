import React from 'react';
import { MapPin, Phone, ExternalLink, ShoppingBag, Clock } from 'lucide-react';
import StockBadge from './StockBadge';
import { formatCurrency } from '../utils/formatters';

export default function PharmacyCard({ item, onReserve, isSelected = false }) {
  const {
    pharmacy_name,
    address,
    phone,
    price,
    quantity,
    availability,
    is_open,
    latitude,
    longitude,
    distance_km
  } = item;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  return (
    <div
      className={`bg-white border rounded-2xl p-5 transition-all shadow-sm flex flex-col justify-between ${
        isSelected
          ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div>
        {/* Top Header: Open/Closed & Stock Badge */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <StockBadge status={availability} quantity={quantity} />
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
              is_open
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}
          >
            <Clock className="w-3 h-3" />
            {is_open ? 'Open Now' : 'Closed'}
          </span>
        </div>

        {/* Pharmacy Name */}
        <h3 className="font-bold text-base text-slate-900 mb-1">{pharmacy_name}</h3>

        {/* Address */}
        <p className="text-xs text-slate-600 flex items-start gap-1.5 mb-2 leading-relaxed">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span>{address}</span>
        </p>

        {/* Phone & Distance */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-4 pt-2 border-t border-slate-100">
          {phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400" /> {phone}
            </span>
          )}
          {distance_km != null && (
            <span className="font-medium text-slate-700">
              ~{distance_km} km away
            </span>
          )}
        </div>
      </div>

      {/* Price & Action Row */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">Price</span>
          <span className="text-lg font-black text-slate-900">{formatCurrency(price)}</span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 rounded-xl transition-colors"
            title="Get Directions on Google Maps"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            onClick={() => onReserve(item)}
            disabled={availability === 'out_of_stock'}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              availability === 'out_of_stock'
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Reserve</span>
          </button>
        </div>
      </div>
    </div>
  );
}
