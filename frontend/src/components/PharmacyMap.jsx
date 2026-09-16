import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, ExternalLink, ShoppingBag, Clock } from 'lucide-react';
import StockBadge from './StockBadge';
import { formatCurrency, getStockStatusConfig } from '../utils/formatters';

// Helper component to recenter map when items change
function MapRecenter({ items }) {
  const map = useMap();

  useEffect(() => {
    if (!items || items.length === 0) return;
    const validItems = items.filter(
      (item) => typeof item.latitude === 'number' && typeof item.longitude === 'number' && !isNaN(item.latitude) && !isNaN(item.longitude)
    );

    if (validItems.length === 0) return;

    if (validItems.length === 1) {
      map.setView([validItems[0].latitude, validItems[0].longitude], 14);
    } else {
      const bounds = L.latLngBounds(validItems.map((i) => [i.latitude, i.longitude]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [items, map]);

  return null;
}

// Generate custom SVG icon with stock status color
function createCustomMarkerIcon(status) {
  const config = getStockStatusConfig(status);

  const svgHtml = `
    <div style="position: relative; width: 36px; height: 44px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 0C8.05887 0 0 8.05887 0 18C0 28.5 18 44 18 44C18 44 36 28.5 36 18C36 8.05887 27.9411 0 18 0Z" fill="${config.pinColor}" stroke="#ffffff" stroke-width="2.5"/>
        <circle cx="18" cy="18" r="7" fill="#ffffff"/>
      </svg>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-leaflet-marker',
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -40]
  });
}

export default function PharmacyMap({ items = [], onReserve, selectedPharmacyId }) {
  const validItems = items.filter(
    (item) => typeof item.latitude === 'number' && typeof item.longitude === 'number' && !isNaN(item.latitude) && !isNaN(item.longitude)
  );

  const defaultCenter = validItems.length > 0
    ? [validItems[0].latitude, validItems[0].longitude]
    : [23.2599, 77.4126]; // Default Bhopal center

  if (validItems.length === 0) {
    return (
      <div className="w-full h-full min-h-[350px] bg-slate-100 border border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-500">
        <MapPin className="w-10 h-10 text-slate-400 mb-2" />
        <h4 className="font-bold text-slate-700">No Pharmacy Locations to Display</h4>
        <p className="text-xs text-slate-500 max-w-xs mt-1">There are currently no matching pharmacy coordinates available on the map.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[400px] relative rounded-2xl overflow-hidden shadow-sm border border-slate-200">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapRecenter items={validItems} />

        {validItems.map((item) => {
          const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`;
          const isSelected = selectedPharmacyId === item.pharmacy_id;

          return (
            <Marker
              key={item.inventory_id || item.pharmacy_id}
              position={[item.latitude, item.longitude]}
              icon={createCustomMarkerIcon(item.availability)}
            >
              <Popup className="medifind-popup">
                <div className="p-1 max-w-xs space-y-2">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                    <span className="text-xs font-bold text-slate-900">{item.pharmacy_name}</span>
                    <StockBadge status={item.availability} quantity={item.quantity} />
                  </div>

                  <p className="text-[11px] text-slate-600 leading-snug">{item.address}</p>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Price</span>
                      <span className="font-extrabold text-slate-900">{formatCurrency(item.price)}</span>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        item.is_open
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {item.is_open ? 'Open' : 'Closed'}
                    </span>
                  </div>

                  <div className="pt-2 flex items-center gap-1.5 border-t border-slate-100">
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-500 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 rounded-lg text-xs font-medium flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Route</span>
                    </a>

                    {onReserve && (
                      <button
                        onClick={() => onReserve(item)}
                        disabled={item.availability === 'out_of_stock'}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-1 ${
                          item.availability === 'out_of_stock'
                            ? 'bg-slate-300 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Reserve</span>
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
