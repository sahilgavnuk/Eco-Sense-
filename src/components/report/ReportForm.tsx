import { useState } from 'react';
import { Camera, MapPin, Upload, CheckCircle2, ShieldAlert, Sparkles, ThumbsUp } from 'lucide-react';
import type { WasteReport, IssueType, IssueSeverity } from '../../types';
import { MOCK_REPORTS } from '../../data/mockData';

export const ReportForm: React.FC = () => {
  const [reports, setReports] = useState<WasteReport[]>(MOCK_REPORTS);
  const [issueType, setIssueType] = useState<IssueType>('Garbage Accumulation');
  const [description, setDescription] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80');
  const [locationStatus, setLocationStatus] = useState<string>('37.7749 N, 122.4194 W (Zone 2 — Central District)');
  const [isLocating, setIsLocating] = useState<boolean>(false);

  const [analyzingAi, setAnalyzingAi] = useState<boolean>(false);
  const [submittedReport, setSubmittedReport] = useState<WasteReport | null>(null);

  const handleGetLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          setLocationStatus(`${pos.coords.latitude.toFixed(4)} N, ${pos.coords.longitude.toFixed(4)} W (Zone 2 — Verified GPS)`);
        },
        () => {
          setIsLocating(false);
          setLocationStatus('37.7749 N, -122.4194 W (GPS Permission default: Zone 2)');
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzingAi(true);

    setTimeout(() => {
      setAnalyzingAi(false);
      const newId = `ES-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const severity: IssueSeverity = issueType === 'Illegal Dumping' || issueType === 'Garbage Accumulation' ? 'HIGH' : 'MEDIUM';

      const newReport: WasteReport = {
        id: newId,
        timestamp: new Date().toISOString(),
        issueType,
        severity,
        status: 'AI Analysis',
        location: {
          lat: 37.7749,
          lng: -122.4194,
          address: 'Market St & 4th Ave, Central District',
          zone: 'Zone 2 — Central District'
        },
        photoUrl,
        description: description || 'Reported waste issue requiring municipal review.',
        aiAnalysis: {
          detectedIssue: `${issueType} detected`,
          severityScore: severity === 'HIGH' ? 92 : 65,
          confidence: 94,
          interpretation: `AI model identified ${issueType.toLowerCase()} with high volume confidence. Priority dispatch logged.`
        },
        residentConfirmed: false,
        clusterCount: Math.floor(Math.random() * 5) + 1
      };

      setSubmittedReport(newReport);
      setReports([newReport, ...reports]);
      setDescription('');
    }, 1200);
  };

  const handleConfirmResolved = (reportId: string) => {
    setReports(reports.map(r => r.id === reportId ? { ...r, status: 'Resolved', residentConfirmed: true } : r));
    if (submittedReport && submittedReport.id === reportId) {
      setSubmittedReport({ ...submittedReport, status: 'Resolved', residentConfirmed: true });
    }
  };

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
          <form onSubmit={handleReportSubmit} className="space-y-5">
            {/* Issue Category */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-gray-700">
                Issue Category
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value as IssueType)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] outline-none"
              >
                <option value="Garbage Accumulation">Garbage Accumulation</option>
                <option value="Overflowing Bin">Overflowing Bin</option>
                <option value="Illegal Dumping">Illegal Dumping</option>
                <option value="Missed Collection">Missed Collection / Collection Truck Skipping</option>
                <option value="Improper Segregation">Improper Segregation</option>
                <option value="Other">Other Waste Problem</option>
              </select>
            </div>

            {/* Photo Attachment */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-gray-700">
                Attach Issue Photo
              </label>
              <div className="border-2 border-dashed border-gray-200 hover:border-[#10B981] bg-gray-50 rounded-xl p-4 text-center transition-all">
                <img
                  src={photoUrl}
                  alt="Issue preview"
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80')}
                    className="px-3 py-1.5 bg-[#0F2E23] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" /> Sample Photo A
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80')}
                    className="px-3 py-1.5 bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg hover:bg-gray-300 flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" /> Sample Photo B
                  </button>
                </div>
              </div>
            </div>

            {/* Geolocation */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-gray-700">
                Geospatial Location
              </label>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 p-3 rounded-xl text-xs text-gray-700">
                <MapPin className="w-4 h-4 text-[#10B981] shrink-0" />
                <span className="flex-1 font-mono truncate">{locationStatus}</span>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="px-3 py-1 bg-[#10B981] text-white font-semibold rounded-lg hover:bg-[#059669] transition-all text-xs"
                >
                  {isLocating ? 'Locating...' : 'GPS Lock'}
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
                placeholder="Provide details (e.g. 15+ uncollected bags blocking pedestrian ramp)..."
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-[#10B981] outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={analyzingAi}
              className="w-full py-3.5 bg-[#0F2E23] hover:bg-[#154233] text-white font-extrabold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
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
            <div className="bg-[#0F2E23] text-white p-6 rounded-2xl border border-[#154233] shadow-xl space-y-4">
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
                <div className="text-xs font-bold text-gray-300 mb-3">Report Resolution Timeline</div>
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

              {submittedReport.status !== 'Resolved' && (
                <button
                  onClick={() => handleConfirmResolved(submittedReport.id)}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow"
                >
                  <ThumbsUp className="w-4 h-4" /> Confirm Issue Resolved
                </button>
              )}
            </div>
          )}

          {/* Community Reports Feed */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md space-y-4">
            <h3 className="font-bold text-gray-900 text-base flex items-center justify-between">
              <span>Active Community Reports</span>
              <span className="text-xs text-gray-500 font-normal">{reports.length} reports logged</span>
            </h3>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {reports.map((report) => (
                <div key={report.id} className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 hover:border-[#10B981]/50 transition-all space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#0F2E23]">{report.id}</span>
                      <h4 className="font-bold text-gray-900 text-sm mt-0.5">{report.issueType}</h4>
                      <p className="text-xs text-gray-500">{report.location.address}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      report.severity === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {report.severity} PRIORITY
                    </span>
                  </div>

                  <p className="text-xs text-gray-700 bg-white p-2.5 rounded-lg border border-gray-200/60">
                    "{report.description}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                    <span className="flex items-center gap-1 text-[#10B981] font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Status: {report.status}
                    </span>
                    {report.clusterCount && report.clusterCount > 1 && (
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium">
                        🔥 Cluster: {report.clusterCount} reports in area
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
