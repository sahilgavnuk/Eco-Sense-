import React, { useState, useRef } from 'react';
import {
  Camera, MapPin, Upload, CheckCircle2, ShieldAlert, Sparkles, ThumbsUp,
  Clock, Image as ImageIcon, Database
} from 'lucide-react';
import type { WasteReport, IssueType, IssueSeverity } from '../../types';
import { useEco } from '../../context/EcoContext';
import { AVAILABLE_ZONES } from '../../data/mockData';
import {
  getTranslatedZone,
  getTranslatedIssueType,
  getTranslatedSeverity,
  getTranslatedStatus
} from '../../data/translations';

export const ReportForm: React.FC = () => {
  const { reports, addReport, updateReportStatus, currentUser, t } = useEco();

  const [issueType, setIssueType] = useState<IssueType>('Garbage Accumulation');
  const [description, setDescription] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<string>(currentUser.zone || AVAILABLE_ZONES[1]);
  const [photoUrl, setPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80'
  );
  const [locationStatus, setLocationStatus] = useState<string>(
    '19.4184 N, 72.8123 E (Zone 2 — NSP East Station Sector)'
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
            `${pos.coords.latitude.toFixed(4)} N, ${pos.coords.longitude.toFixed(4)} E (${t.reportGpsVerified} · ${getTranslatedZone(selectedZone, t)})`
          );
        },
        () => {
          setIsLocating(false);
          setGpsLocked(true);
          setLocationStatus(
            selectedZone.includes('Kokan')
              ? '18.1500 N, 73.0000 E (GPS: Kokan Region)'
              : '19.4184 N, 72.8123 E (GPS: NSP/Virar)'
          );
        },
        { timeout: 8000 }
      );
    } else {
      setIsLocating(false);
      setGpsLocked(true);
      setLocationStatus('19.4184 N, 72.8123 E (Zone Verified)');
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
          lat: selectedZone.includes('Kokan') ? 18.15 : 19.42,
          lng: selectedZone.includes('Kokan') ? 73.0 : 72.81,
          address: selectedZone.includes('Kokan') ? 'Coastal Main Road, Kokan' : 'Station Road & Bypass, NSP/Virar',
          zone: selectedZone
        },
        photoUrl,
        description: description.trim() || 'Reported waste issue requiring municipal review.',
        aiAnalysis: {
          detectedIssue: `${issueType} detected`,
          severityScore: severity === 'HIGH' ? 92 : severity === 'MEDIUM' ? 68 : 45,
          confidence: 96,
          interpretation: `AI model confirmed ${issueType.toLowerCase()} with high volume density. Priority alert dispatched for ${getTranslatedZone(selectedZone, t)}.`
        },
        residentConfirmed: false,
        clusterCount: Math.floor(Math.random() * 4) + 1
      };

      // Add to global state & persistent localStorage
      addReport(newReport);
      setSubmittedReport(newReport);
      setDescription('');
    }, 1000);
  };

  const handleConfirmResolved = (reportId: string) => {
    updateReportStatus(reportId, 'Resolved');
    if (submittedReport && submittedReport.id === reportId) {
      setSubmittedReport({ ...submittedReport, status: 'Resolved', residentConfirmed: true });
    }
  };

  const filteredReports = reports.filter((r) => {
    if (filterSeverity === 'ALL') return true;
    return r.severity === filterSeverity;
  });

  const timelineSteps = [
    t.timelineStep1,
    t.timelineStep2,
    t.timelineStep3,
    t.timelineStep4,
    t.timelineStep5
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 text-rose-600" /> {t.reportBadge}
        </div>
        <h2 className="text-3xl font-extrabold text-[#0F2E23] tracking-tight">
          {t.reportTitle}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-sm">
          {t.reportDesc}
        </p>
      </div>

      {/* Storage Architecture Clarification Box */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-emerald-950 shadow-xs">
        <Database className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-emerald-900 flex items-center gap-1.5">
            <span>{t.reportStorageTitle}</span>
          </div>
          <p className="text-emerald-800 leading-relaxed">
            {t.reportStorageNotice}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Container */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#10B981]" />
              {t.reportFormTitle}
            </h3>
            <span className="text-[11px] font-mono text-gray-500">{t.reportFormSubtitle}</span>
          </div>

          <form onSubmit={handleReportSubmit} className="space-y-5">
            {/* Zone Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-gray-700">
                {t.loginZoneLabel} <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#10B981] outline-none cursor-pointer"
              >
                {AVAILABLE_ZONES.map((z) => (
                  <option key={z} value={z}>
                    {getTranslatedZone(z, t)}
                  </option>
                ))}
              </select>
            </div>

            {/* Issue Category */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-gray-700">
                {t.reportCategory} <span className="text-rose-500">*</span>
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value as IssueType)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] outline-none transition-all cursor-pointer"
              >
                <option value="Garbage Accumulation">{t.issueGarbage}</option>
                <option value="Overflowing Bin">{t.issueOverflow}</option>
                <option value="Illegal Dumping">{t.issueDumping}</option>
                <option value="Missed Collection">{t.issueMissed}</option>
                <option value="Improper Segregation">{t.issueSegregation}</option>
                <option value="Other">{t.issueOther}</option>
              </select>
            </div>

            {/* Photo Attachment */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase text-gray-700">
                  {t.reportPhoto} <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-gray-500 font-medium">{t.reportPhotoNote}</span>
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
                      <Camera className="w-3.5 h-3.5" /> {t.reportRetake}
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white text-gray-900 font-bold text-xs rounded-lg shadow cursor-pointer flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" /> {t.reportUploadFile}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-3.5 py-2 bg-[#0F2E23] hover:bg-[#154233] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#10B981]" /> {t.reportTakePhoto}
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 bg-white hover:bg-gray-100 text-gray-800 text-xs font-bold rounded-xl border border-gray-200 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-600" /> {t.reportUploadFile}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setPhotoUrl('https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80')
                    }
                    className="px-2.5 py-2 text-gray-600 hover:text-gray-900 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> {t.reportSample}
                  </button>
                </div>

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

            {/* Geolocation */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-gray-700">
                {t.reportLocation}
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
                  {isLocating ? t.reportLocating : gpsLocked ? t.reportGpsVerified : t.reportLocateBtn}
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-gray-700">
                {t.reportDescription}
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.reportDescPlaceholder}
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
                  <Sparkles className="w-4 h-4 animate-spin text-[#10B981]" /> {t.reportAnalyzingBtn}
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4 text-[#10B981]" /> {t.reportSubmitBtn}
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
                  <Sparkles className="w-3.5 h-3.5" /> {t.reportTicketBadge} #{submittedReport.id}
                </span>
                <span className="text-xs text-[#10B981] font-bold">{t.reportAiPriority}: {getTranslatedSeverity(submittedReport.severity, t)}</span>
              </div>

              <div className="bg-white/10 p-3 rounded-xl border border-white/10 text-xs space-y-1">
                <div className="font-bold text-emerald-200">{t.reportAiAnalysisResult}</div>
                <p className="text-emerald-100">{submittedReport.aiAnalysis.interpretation}</p>
                <div className="text-[10px] text-emerald-300 font-mono mt-1">
                  {t.scannerConfidence}: {submittedReport.aiAnalysis.confidence}% | {t.loginZoneLabel}: {getTranslatedZone(submittedReport.location.zone, t)}
                </div>
              </div>

              {/* TIMELINE PROGRESS TRACKER */}
              <div className="pt-2">
                <div className="text-xs font-bold text-gray-300 mb-3 flex items-center justify-between">
                  <span>{t.reportTimelineTitle}</span>
                  <span className="text-[10px] font-mono text-emerald-400">{t.reportLiveStatus}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-center relative">
                  <div className="absolute top-3 inset-x-0 h-0.5 bg-white/20 -z-0"></div>
                  {timelineSteps.map((step, idx) => {
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

              <div className="pt-1">
                {submittedReport.status !== 'Resolved' ? (
                  <button
                    onClick={() => handleConfirmResolved(submittedReport.id)}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" /> {t.reportConfirmResolved}
                  </button>
                ) : (
                  <div className="py-2.5 bg-emerald-950/60 text-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-emerald-500/40">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" /> {t.reportResolved}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Community Reports Feed */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-extrabold text-gray-900 text-base">{t.reportFeedTitle}</h3>
                <p className="text-xs text-gray-500">{reports.length} {t.reportFeedSubtitle}</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
                {[
                  { key: 'ALL', label: t.reportFilterAll },
                  { key: 'HIGH', label: t.reportFilterHigh },
                  { key: 'MEDIUM', label: t.reportFilterMedium }
                ].map((sev) => (
                  <button
                    key={sev.key}
                    onClick={() => setFilterSeverity(sev.key)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      filterSeverity === sev.key
                        ? 'bg-white text-gray-900 font-bold shadow-2xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {sev.label}
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
                      <h4 className="font-bold text-gray-900 text-sm mt-0.5">{getTranslatedIssueType(report.issueType, t)}</h4>
                      <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5 font-medium">
                        <MapPin className="w-3 h-3 text-[#10B981]" /> {report.location.address} ({getTranslatedZone(report.location.zone, t)})
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
                      {getTranslatedSeverity(report.severity, t)}
                    </span>
                  </div>

                  <p className="text-xs text-gray-700 bg-white p-2.5 rounded-lg border border-gray-200/60 leading-relaxed">
                    "{report.description}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-200/50">
                    <span className="flex items-center gap-1 text-[#10B981] font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {getTranslatedStatus(report.status, t)}
                    </span>

                    {report.status !== 'Resolved' ? (
                      <button
                        onClick={() => handleConfirmResolved(report.id)}
                        className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" /> {t.reportConfirmResolved}
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {t.reportResolved}
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
