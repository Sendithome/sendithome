import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icons broken by webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const originIcon = new L.DivIcon({
  className: '',
  html: `<div style="background:#1a1f2e;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">✈️</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const destIcon = new L.DivIcon({
  className: '',
  html: `<div style="background:#ff0066;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">🏠</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const packageIcon = new L.DivIcon({
  className: '',
  html: `<div style="background:#f59e0b;color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid white;box-shadow:0 3px 12px rgba(245,158,11,0.5);animation:pulse 1.5s infinite;">📦</div>
  <style>@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}</style>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Country → approx coordinates
const COUNTRY_COORDS = {
  'India': [20.5937, 78.9629],
  'United Kingdom': [51.5074, -0.1278],
  'United States': [37.0902, -95.7129],
  'Saudi Arabia': [23.8859, 45.0792],
  'Qatar': [25.2854, 51.5310],
  'Kuwait': [29.3759, 47.9774],
  'Bahrain': [26.0667, 50.5577],
  'Oman': [21.4735, 55.9754],
  'Jordan': [30.5852, 36.2384],
  'Egypt': [26.8206, 30.8025],
  'Lebanon': [33.8547, 35.8623],
  'Pakistan': [30.3753, 69.3451],
  'Bangladesh': [23.6850, 90.3563],
  'Philippines': [12.8797, 121.7740],
  'China': [35.8617, 104.1954],
  'Japan': [36.2048, 138.2529],
  'Singapore': [1.3521, 103.8198],
  'Malaysia': [4.2105, 101.9758],
  'Thailand': [15.8700, 100.9925],
  'Indonesia': [-0.7893, 113.9213],
  'Australia': [-25.2744, 133.7751],
  'Canada': [56.1304, -106.3468],
  'Germany': [51.1657, 10.4515],
  'France': [46.2276, 2.2137],
  'Italy': [41.8719, 12.5674],
  'Spain': [40.4637, -3.7492],
  'Netherlands': [52.1326, 5.2913],
  'Sweden': [60.1282, 18.6435],
  'Norway': [60.4720, 8.4689],
  'Switzerland': [46.8182, 8.2275],
  'Russia': [61.5240, 105.3188],
  'Turkey': [38.9637, 35.2433],
  'South Africa': [-30.5595, 22.9375],
  'Nigeria': [9.0820, 8.6753],
  'Kenya': [-0.0236, 37.9062],
  'Brazil': [-14.2350, -51.9253],
  'Mexico': [23.6345, -102.5528],
};

const ORIGIN = [25.2048, 55.2708]; // Dubai, UAE

// Interpolate current position based on step progress (0–1)
function interpolatePosition(origin, dest, progress) {
  return [
    origin[0] + (dest[0] - origin[0]) * progress,
    origin[1] + (dest[1] - origin[1]) * progress,
  ];
}

// Status → progress along route (0 = at origin, 1 = at destination)
const STATUS_PROGRESS = {
  pending: 0,
  receipt_uploaded: 0,
  payment_pending: 0,
  paid: 0.05,
  packed: 0.15,
  picked_up: 0.3,
  in_transit: 0.65,
  delivered: 1,
};

function FitBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [48, 48] });
  }, [bounds, map]);
  return null;
}

export default function ShipmentMap({ order }) {
  const destCoords = order?.destination_country ? COUNTRY_COORDS[order.destination_country] : null;
  const progress = STATUS_PROGRESS[order?.status] ?? 0;
  const currentPos = destCoords ? interpolatePosition(ORIGIN, destCoords, progress) : ORIGIN;

  const routePoints = destCoords ? [ORIGIN, currentPos, destCoords] : [ORIGIN];
  const completedRoute = destCoords ? [ORIGIN, currentPos] : [ORIGIN];
  const remainingRoute = destCoords ? [currentPos, destCoords] : [];

  const bounds = destCoords
    ? L.latLngBounds([ORIGIN, destCoords]).pad(0.2)
    : null;

  const isDelivered = order?.status === 'delivered';

  return (
    <div className="rounded-2xl overflow-hidden border border-border" style={{ height: 300 }}>
      <MapContainer
        center={currentPos}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        {bounds && <FitBounds bounds={bounds} />}

        {/* Completed route (solid) */}
        {completedRoute.length > 1 && (
          <Polyline positions={completedRoute} color="#ff0066" weight={3} opacity={0.9} />
        )}
        {/* Remaining route (dashed) */}
        {remainingRoute.length > 1 && !isDelivered && (
          <Polyline positions={remainingRoute} color="#aaaaaa" weight={2} opacity={0.5} dashArray="8,8" />
        )}

        {/* Origin marker */}
        <Marker position={ORIGIN} icon={originIcon}>
          <Popup>
            <strong>Origin</strong><br />Dubai, UAE<br />
            <span style={{ fontSize: 11, color: '#666' }}>SENDITHOME collection point</span>
          </Popup>
        </Marker>

        {/* Destination marker */}
        {destCoords && (
          <Marker position={destCoords} icon={destIcon}>
            <Popup>
              <strong>Destination</strong><br />
              {[order?.destination_city, order?.destination_country].filter(Boolean).join(', ')}<br />
              {order?.destination_address && <span style={{ fontSize: 11, color: '#666' }}>{order.destination_address}</span>}
            </Popup>
          </Marker>
        )}

        {/* Package current location */}
        {!isDelivered && destCoords && progress > 0 && (
          <Marker position={currentPos} icon={packageIcon}>
            <Popup>
              <strong>Your Package</strong><br />
              <span style={{ fontSize: 12, color: '#666' }}>
                {order?.status === 'in_transit' ? 'In transit to destination' : 'Preparing for shipment'}
              </span>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}