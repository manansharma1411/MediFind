import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function MedicalDisclaimer() {
  return (
    <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-500 flex items-start gap-2 max-w-4xl mx-auto my-4">
      <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
      <p>
        <strong className="text-slate-700 font-semibold">Medical Disclaimer:</strong> MediFind is an availability discovery platform prototype for university exhibition demonstration. It does not provide medical diagnosis, treatment, or prescribing advice. Always consult a qualified healthcare professional.
      </p>
    </div>
  );
}
