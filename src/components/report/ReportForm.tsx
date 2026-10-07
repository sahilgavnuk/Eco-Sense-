import { useState, useRef } from 'react';
import {
  Camera, MapPin, Upload, CheckCircle2, ShieldAlert, Sparkles, ThumbsUp,
  Clock, Image as ImageIcon
} from 'lucide-react';
import type { WasteReport, IssueType, IssueSeverity } from '../../types';
import { MOCK_REPORTS } from '../../data/mockData';

interface ReportFormProps {
  onNavigateToMap?: () => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({ onNavigateToMap }) => {
  const [reports, setReports] = useState<WasteReport[]>(MOCK_REPORTS);
  const [issueType, setIssueType] = useState<IssueType>('Garbage Accumulation');
  const [description, setDescription] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80'
  );
  const [locationStatus, setLocationStatus] = useState<string>(
    '37.7749 N, 122.4194 W (Zone 2 — Central District)'
  );
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [gpsLocked, setGpsLocked] = useState<boolean>(false);

  const [analyzingAi, setAnalyzingAi] = useState<boolean>(false);
  const [submittedReport, setSubmittedReport] = useState<WasteReport | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const handleGetLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          setGpsLocked(true);
          setLocationStatus(
            `${pos.coords.latitude.toFixed(4)} N, ${pos.coords.longitude.toFixed(4)} W (GPS Verified)`
          );
        },
        () => {
          setIsLocating(false);
          setGpsLocked(true);
          setLocationStatus('37.7749 N, -122.4194 W (Simulated GPS: Zone 2)');
        },
        { timeout: 8000 }
      );
    } else {
      setIsLocating(false);
      setGpsLocked(true);
      setLocationStatus('37.7749 N, -122.4194 W (Zone 2 — Central District)');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      if (url) setPhotoUrl(url);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzingAi(true);

    setTimeout(() => {
      setAnalyzingAi(false);
      const newId = `ES-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const severity: IssueSeverity =
        issueType === 'Illegal Dumping' || issueType === 'Garbage Accumulation'
          ? 'HIGH'
          : issueType === 'Overflowing Bin' || issueType === 'Missed Collection'
            ? 'MEDIUM'
            : 'LOW';

      const newReport: WasteReport = {
        id: newId,
        timestamp: new Date().toISOString(),
        issueType,
        severity,
        status: 'AI Analysis',
        location: {
          lat: 37.7749 + (Math.random() - 0.5) * 0.02,
          lng: -122.4194 + (Math.random() - 0.5) * 0.02,
          address: 'Market St & 4th Ave, Central District',
          zone: 'Zone 2 — Central District'
        },
        photoUrl,
        description: description.trim() || 'Reported waste issue requiring municipal review.',
        aiAnalysis: {
          detectedIssue: `${issueType} detected`,
          severityScore: severity === 'HIGH' ? 92 : severity === 'MEDIUM' ? 68 : 45,
          confidence: 96,
          interpretation: `AI model identified ${issueType.toLowerCase()} with high volume confidence. Priority dispatch logged for Zone 2 municipal route.`
        },
        residentConfirmed: false,
        clusterCount: Math.floor(Math.random() * 4) + 1
      };

      setSubmittedReport(newReport);
      setReports((prev) => [newReport, ...prev]);
      setDescription('');
    }, 1200);
  };

  const handleConfirmResolved = (reportId: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId ? { ...r, status: 'Resolved', residentConfirmed: true } : r
      )
    );
    if (submittedReport && submittedReport.id === reportId) {
      setSubmittedReport({ ...submittedReport, status: 'Resolved', residentConfirmed: true });
    }
  };

  const filteredReports = reports.filter((r) => {
    if (filterSeverity === 'ALL') return true;
    return r.severity === filterSeverity;
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 text-rose-600" /> Smart Geospatial Waste Reporting
        </div>
        <h2 className="text-3xl font-extrabold text-[#0F2E23] tracking-tight">
          See a problem? Put it on the map.
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-sm">
          Report uncollected garbage, illegal dumping, or bin overflows. EcoSense AI automatically analyzes severity, flags spatial clusters, and dispatches city services.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Container */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#10B981]" />
              New Incident Report
            </h3>
            <span className="text-[11px] font-mono text-gray-500">Form ID: INC-2026</span>
          </div>

          <form onSubmit={handleReportSubmit} className="space-y-5">
            {/* Issue Category */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-gray-700">
                Issue Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value as IssueType)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] outline-none transition-all cursor-pointer"
              >
                <option value="Garbage Accumulation">Garbage Accumulation</option>
                <option value="Overflowing Bin">Overflowing Bin</option>
                <option value="Illegal Dumping">Illegal Dumping</option>
                <option value="Missed Collection">Missed Collection / Collection Truck Skipping</option>
                <option value="Improper Segregation">Improper Segregation</option>
                <option value="Other">Other Waste Problem</option>
              </select>
            </div>

            {/* Photo Attachment with Real Device Camera & File Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase text-gray-700">
                  Incident Photo Proof <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-gray-500 font-medium">Capture or upload real photo</span>
              </div>

              <div className="border-2 border-dashed border-gray-200 hover:border-[#10B981] bg-gray-50 rounded-xl p-4 text-center transition-all space-y-3">
                <div className="relative group overflow-hidden rounded-lg bg-gray-900 aspect-video flex items-center justify-center">
                  <img
                    src={photoUrl}
                    alt="Issue preview"
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="px-3 py-1.5 bg-[#10B981] text-[#0F2E23] font-bold text-xs rounded-lg shadow cursor-pointer flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" /> Retake
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white text-gray-900 font-bold text-xs rounded-lg shadow cursor-pointer flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload
                    </button>
                  </div>
                </div>

                {/* Real Camera & File Upload Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-3.5 py-2 bg-[#0F2E23] hover:bg-[#154233] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#10B981]" /> Take Photo
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 bg-white hover:bg-gray-100 text-gray-800 text-xs font-bold rounded-xl border border-gray-200 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-600" /> Upload File
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setPhotoUrl('https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80')
                    }
                    className="px-2.5 py-2 text-gray-600 hover:text-gray-900 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-all cursor-pointer flex items-center gap-1"
                    title="Use sample overflow photo"
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> Sample
                  </button>
                </div>

                {/* Hidden input elements */}
                <input
                  type="file"
                  ref={cameraInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            {/* Geolocation with Interactive Lock */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-gray-700">
                Geospatial Location
              </label>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 p-3 rounded-xl text-xs text-gray-700">
                <MapPin className={`w-4 h-4 shrink-0 ${gpsLocked ? 'text-[#10B981]' : 'text-amber-500'}`} />
                <span className="flex-1 font-mono truncate text-gray-900 font-semibold">{locationStatus}</span>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="px-3 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white font-bold rounded-lg transition-all text-xs cursor-pointer disabled:opacity-50 shrink-0 shadow-xs flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3" />
                  {isLocating ? 'Locating...' : gpsLocked ? 'GPS Verified ✓' : 'Lock GPS'}
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-gray-700">
                Issue Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details (e.g. 15+ uncollected bags blocking pedestrian ramp near crosswalk)..."
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-[#10B981] outline-none transition-all resize-none"
              ></textarea>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={analyzingAi}
              className="w-full py-3.5 bg-[#0F2E23] hover:bg-[#154233] disabled:opacity-60 text-white font-extrabold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {analyzingAi ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-[#10B981]" /> Running AI Vision Severity Assessment...
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4 text-[#10B981]" /> Submit Report to EcoSense Map
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Status & Recent Reports Feed */}
        <div className="lg:col-span-6 space-y-6">
          {/* Latest Submitted Ticket Banner */}
          {submittedReport && (
            <div className="bg-[#0F2E23] text-white p-6 rounded-2xl border border-[#154233] shadow-xl space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#10B981]/20 text-[#34D399] font-mono text-xs font-bold border border-[#10B981]/30">
                  <Sparkles className="w-3.5 h-3.5" /> Ticket #{submittedReport.id}
                </span>
                <span className="text-xs text-[#10B981] font-bold">AI Priority: {submittedReport.severity}</span>
              </div>

              <div className="bg-white/10 p-3 rounded-xl border border-white/10 text-xs space-y-1">
                <div className="font-bold text-emerald-200">AI Visual Analysis Result</div>
                <p className="text-emerald-100">{submittedReport.aiAnalysis.interpretation}</p>
                <div className="text-[10px] text-emerald-300 font-mono mt-1">
                  Confidence: {submittedReport.aiAnalysis.confidence}% | Severity Score: {submittedReport.aiAnalysis.severityScore}/100
                </div>
              </div>

              {/* TIMELINE PROGRESS TRACKER */}
              <div className="pt-2">
                <div className="text-xs font-bold text-gray-300 mb-3 flex items-center justify-between">
                  <span>Report Resolution Timeline</span>
                  <span className="text-[10px] font-mono text-emerald-400">Live Status</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-center relative">
                  <div className="absolute top-3 inset-x-0 h-0.5 bg-white/20 -z-0"></div>
                  {['Submitted', 'AI Analysis', 'Assigned', 'In Progress', 'Resolved'].map((step, idx) => {
                    const isDone = idx <= 1 || (submittedReport.status === 'Resolved' && idx <= 4);
                    return (
                      <div key={step} className="relative z-10 flex flex-col items-center gap-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                          isDone ? 'bg-[#10B981] text-[#0F2E23]' : 'bg-gray-800 text-gray-400 border border-white/20'
                        }`}>
                          {idx + 1}
                        </div>
                        <span className={isDone ? 'text-emerald-300 font-bold' : 'text-gray-400'}>{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {submittedReport.status !== 'Resolved' ? (
                  <button
                    onClick={() => handleConfirmResolved(submittedReport.id)}
                    className="py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" /> Confirm Resolved
                  </button>
                ) : (
                  <div className="py-2.5 bg-emerald-950/60 text-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-emerald-500/40">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" /> Verified Resolved
                  </div>
                )}

                {onNavigateToMap && (
                  <button
                    onClick={onNavigateToMap}
                    className="py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-white/15 transition-all cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#10B981]" /> View on Waste Map
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Community Reports Feed */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-extrabold text-gray-900 text-base">Active Community Reports</h3>
                <p className="text-xs text-gray-500">{reports.length} total logged incidents</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
                {['ALL', 'HIGH', 'MEDIUM'].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setFilterSeverity(sev)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      filterSeverity === sev
                        ? 'bg-white text-gray-900 font-bold shadow-2xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 hover:border-[#10B981]/50 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#0F2E23]">{report.id}</span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(report.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm mt-0.5">{report.issueType}</h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#10B981]" /> {report.location.address}
                      </p>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        report.severity === 'HIGH'
                          ? 'bg-rose-100 text-rose-800'
                          : report.severity === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {report.severity} PRIORITY
                    </span>
                  </div>

                  <p className="text-xs text-gray-700 bg-white p-2.5 rounded-lg border border-gray-200/60 leading-relaxed">
                    "{report.description}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-200/50">
                    <span className="flex items-center gap-1 text-[#10B981] font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Status: {report.status}
                    </span>

                    {report.status !== 'Resolved' ? (
                      <button
                        onClick={() => handleConfirmResolved(report.id)}
                        className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <ThumbsUp className="w-3 h-3" /> Mark Resolved
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Resolved
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportForm;
