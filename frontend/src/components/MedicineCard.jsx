import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, ChevronRight, Tag, ShieldCheck } from 'lucide-react';

export default function MedicineCard({ medicine }) {
  const { id, name, generic_name, brand_name, strength, form, description } = medicine;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between group">
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <Pill className="w-3 h-3" /> {form || 'Tablet'}
          </span>
          {strength && (
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              {strength}
            </span>
          )}
        </div>

        {/* Title & Names */}
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mb-1">
          {name}
        </h3>
        <div className="space-y-0.5 text-xs text-slate-500 mb-3">
          <p><span className="font-medium text-slate-700">Generic:</span> {generic_name}</p>
          <p><span className="font-medium text-slate-700">Brand:</span> {brand_name}</p>
        </div>

        {/* Description */}
        {description && (
          <p className="text-xs text-slate-600 line-clamp-2 mb-4">
            {description}
          </p>
        )}
      </div>

      {/* Action Button */}
      <Link
        to={`/medicines/${id}`}
        className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
      >
        <span>View Pharmacy Availability</span>
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
