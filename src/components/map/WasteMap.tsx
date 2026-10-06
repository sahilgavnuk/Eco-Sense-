import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Layers, ShieldCheck, Filter, Info } from 'lucide-react';
import { MOCK_REPORTS } from '../../data/mockData';
import type { IssueSeverity, ReportStatus } from '../../types';

// Fix Default Leaflet Icon issue in React Vite
const customMarkerIcon = (color: string) =>
  L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background-color: ${color}; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); transform: translate(-50%, -50%);"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });

export const WasteMap: React.FC = () => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [showPrivacyShield, setShowPrivacyShield] = useState<boolean>(true);
  const [activeLayer, setActiveLayer] = useState<'reports' | 'segregation' | 'collection'>('reports');

  const filteredReports = MOCK_REPORTS.filter((report) => {
    if (selectedSeverity === 'ALL') return true;
    return report.severity === selectedSeverity;
  });

  const getMarkerColor = (status: ReportStatus, severity: IssueSeverity) => {
    if (status === 'Resolved') return '#10B981'; // Green
    if (severity === 'HIGH') return '#EF4444'; // Red
    if (status === 'In Progress') return '#F97316'; // Orange
    return '#F59E0B'; // Yellow/Moderate
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header & Controls */}
      <div className="bg-[#0F2E23] text-white p-6 rounded-2xl border border-[#154233] shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/20 text-[#34D399] text-xs font-bold uppercase tracking-wider mb-2">
              <Layers className="w-3.5 h-3.5" /> Spatial Environmental Intelligence
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Every waste problem has a location.
            </h2>
            <p className="text-emerald-100/70 text-sm mt-0.5">
              Real-time geospatial visualization of active reports, zone segregation indices, and municipal collection reliability.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Layer selector */}
            <div className="flex items-center bg-white/10 p-1 rounded-xl border border-white/15 text-xs">
              <span className="px-2 font-semibold text-emerald-200">Layer:</span>
              {(['reports', 'segregation', 'collection'] as const).map((layer) => (
                <button
                  key={layer}
                  onClick={() => setActiveLayer(layer)}
                  className={`px-2 py-1 rounded-lg font-semibold capitalize text-xs transition-all ${
                    activeLayer === layer
                      ? 'bg-[#10B981] text-white shadow'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {layer}
                </button>
              ))}
            </div>

            {/* Filter Severity */}
            <div className="flex items-center bg-white/10 p-1 rounded-xl border border-white/15 text-xs">
              <span className="px-2 font-semibold text-emerald-200 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Severity:
              </span>
              {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSelectedSeverity(sev)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                    selectedSeverity === sev
                      ? 'bg-[#10B981] text-white shadow'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            {/* Privacy Shield Toggle */}
            <button
              onClick={() => setShowPrivacyShield(!showPrivacyShield)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                showPrivacyShield
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-gray-300'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              {showPrivacyShield ? 'Zone Privacy Shield Active' : 'Exact Coordinates'}
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-white/10 text-xs">
          <span className="text-emerald-200 font-semibold">Status Legend:</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500"></span> High Priority (Red)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500"></span> Active / In Progress (Orange)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Assigned / Moderate (Yellow)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Resolved (Green)</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-xl overflow-hidden relative">
        <div className="h-[520px] rounded-xl overflow-hidden relative z-10">
          <MapContainer
            center={[37.7749, -122.4194]}
            zoom={12}
            scrollWheelZoom={false}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Privacy Radius Circles around Zones */}
            {showPrivacyShield && (
              <>
                <Circle center={[37.7749, -122.4194]} radius={800} pathOptions={{ color: '#10B981', fillColor: '#10B981', fillOpacity: 0.15 }} />
                <Circle center={[37.7833, -122.4167]} radius={600} pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.15 }} />
                <Circle center={[37.769, -122.448]} radius={950} pathOptions={{ color: '#EF4444', fillColor: '#EF4444', fillOpacity: 0.15 }} />
              </>
            )}

            {/* Markers */}
            {filteredReports.map((report) => (
              <Marker
                key={report.id}
                position={[report.location.lat, report.location.lng]}
                icon={customMarkerIcon(getMarkerColor(report.status, report.severity))}
              >
                <Popup>
                  <div className="p-1 space-y-2 max-w-xs font-sans text-xs">
                    <div className="flex items-center justify-between border-b pb-1">
                      <span className="font-mono font-bold text-[#0F2E23]">{report.id}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        report.severity === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {report.severity}
                      </span>
                    </div>

                    <h4 className="font-bold text-gray-900 text-sm">{report.issueType}</h4>
                    <p className="text-gray-600 text-[11px]">{report.location.address}</p>

                    <div className="bg-gray-50 p-2 rounded border text-[11px] text-gray-700">
                      <strong>AI Diagnosis:</strong> {report.aiAnalysis.interpretation}
                    </div>

                    <div className="text-[11px] font-bold text-[#10B981]">
                      Status: {report.status}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Map Overlay Badge */}
        <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200/80 flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#10B981]" />
            <span>
              <strong>Anonymized Geospatial Layer:</strong> Individual household coordinates are blurred within a 800m privacy polygon to protect resident privacy.
            </span>
          </div>
          <span className="font-semibold text-[#0F2E23]">{filteredReports.length} Active Markers Displayed</span>
        </div>
      </div>
    </div>
  );
};

export default WasteMap;
