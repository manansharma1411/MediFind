import React from 'react';
import { MapPin, ExternalLink, ShoppingBag } from 'lucide-react';
import StockBadge from './StockBadge';
import { formatCurrency } from '../utils/formatters';

export default function AvailabilityTable({ items, onReserve }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Pharmacy</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Stock</th>
              <th className="py-3.5 px-4">Price</th>
              <th className="py-3.5 px-4">Distance</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {items.map((item) => {
              const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`;
              return (
                <tr key={item.inventory_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{item.pharmacy_name}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" /> {item.address}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                        item.is_open
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {item.is_open ? 'Open' : 'Closed'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <StockBadge status={item.availability} quantity={item.quantity} />
                  </td>
                  <td className="py-3.5 px-4 font-black text-slate-900">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                    {item.distance_km != null ? `~${item.distance_km} km` : 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-slate-200 transition-colors"
                        title="Directions"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => onReserve(item)}
                        disabled={item.availability === 'out_of_stock'}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          item.availability === 'out_of_stock'
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Reserve</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
