import React from 'react';
import { getStockStatusConfig } from '../utils/formatters';

export default function StockBadge({ status, quantity, showQuantity = true }) {
  const config = getStockStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.badgeBg}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
      <span>{config.label}</span>
      {showQuantity && quantity !== undefined && quantity !== null && (
        <span className="opacity-80 font-semibold ml-0.5">({quantity})</span>
      )}
    </span>
  );
}
