import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = "Searching availability across pharmacies..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-3" />
      <p className="text-slate-600 font-medium text-sm">{message}</p>
    </div>
  );
}
