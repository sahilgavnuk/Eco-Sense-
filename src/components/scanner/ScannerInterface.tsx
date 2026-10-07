import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera, Upload, Sparkles, ShieldCheck, RefreshCw, Eye,
  AlertCircle, X, ZoomIn
} from 'lucide-react';
import type { ScanResult } from '../../types';
import ScanResultCard from './ScanResultCard';
import { scanDataUrl } from './wasteAI';

interface ScannerInterfaceProps {
  onScanComplete?: (result: ScanResult) => void;
  compactMode?: boolean;
  onNavigate?: (tab: string) => void;
}

export const ScannerInterface: React.FC<ScannerInterfaceProps> = ({
  onScanComplete,
  compactMode: _compactMode = false,
  onNavigate,
}) => {
  const [isScanning, setIsScanning]           = useState(false);
  const [scanStepText, setScanStepText]       = useState('');
  const [currentResult, setCurrentResult]     = useState<ScanResult | null>(null);
  const [selectedObjectId, setSelectedId]     = useState<string | null>(null);
  const [activeImageUrl, setActiveImageUrl]   = useState<string | null>(null);
  const [telemetryOptIn, setTelemetryOptIn]   = useState(true);
  const [scanError, setScanError]             = useState<string | null>(null);
  const [cameraOpen, setCameraOpen]           = useState(false);
  const [cameraStream, setCameraStream]       = useState<MediaStream | null>(null);

  const fileInputRef   = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef       = useRef<HTMLVideoElement | null>(null);

  // ── Sync camera stream to video element ───────────────────────────────────
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  // ── Stop camera on unmount ─────────────────────────────────────────────────
  useEffect(() => {
    return () => { cameraStream?.getTracks().forEach((t) => t.stop()); };
  }, [cameraStream]);

  // ── Step animation ─────────────────────────────────────────────────────────
  const startSteps = () => {
    const steps = [
      'Sending image to Gemini Vision AI…',
      'Detecting and classifying objects…',
      'Evaluating materials & contamination…',
      'Generating disposal guide…',
    ];
    let i = 0;
    setScanStepText(steps[0]);
    const iv = setInterval(() => {
      i = Math.min(i + 1, steps.length - 1);
      setScanStepText(steps[i]);
    }, 800);
    return iv;
  };

  // ── Core scan ──────────────────────────────────────────────────────────────
  const runScan = useCallback(async (dataUrl: string) => {
    setIsScanning(true);
    setScanError(null);
    setCurrentResult(null);
    const iv = startSteps();
    try {
      const result = await scanDataUrl(dataUrl, telemetryOptIn, 'Zone 2 — Central District');
      result.imageUrl = dataUrl;
      clearInterval(iv);
      setIsScanning(false);
      setCurrentResult(result);
      setSelectedId(result.objects[0]?.id ?? null);
      onScanComplete?.(result);
    } catch (err) {
      clearInterval(iv);
      setIsScanning(false);
      setScanError(`Scan failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [telemetryOptIn, onScanComplete]);

  // ── File upload / camera photo taken ────────────────────────────────────────
  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    stopCamera();
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      if (!url) return;
      setActiveImageUrl(url);
      runScan(url);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ── Live Camera Mode ───────────────────────────────────────────────────────
  const openLiveCamera = async () => {
    try {
      setCurrentResult(null);
      setScanError(null);
      setActiveImageUrl(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setCameraStream(stream);
      setCameraOpen(true);
    } catch {
      // If live WebRTC camera is blocked (permissions or browser), fall back to native device camera photo input
      cameraInputRef.current?.click();
    }
  };

  const stopCamera = () => {
    cameraStream?.getTracks().forEach((t) => t.stop());
    setCameraStream(null);
    setCameraOpen(false);
  };

  const capturePhotoFromLiveCamera = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const url = canvas.toDataURL('image/jpeg', 0.92);
    setActiveImageUrl(url);
    stopCamera();
    runScan(url);
  };

  const resetForRescan = () => {
    setCurrentResult(null);
    setScanError(null);
    setActiveImageUrl(null);
    stopCamera();
  };

  const activeObjects = currentResult?.objects ?? [];
  const selectedObject = activeObjects.find((o) => o.id === selectedObjectId) ?? activeObjects[0];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="bg-[#0F2E23] text-white p-5 sm:p-6 rounded-2xl shadow-xl border border-[#154233] relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#10B981]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/20 border border-[#10B981]/30 text-[#34D399] text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Gemini Vision AI · Real-Time Waste Detection
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Point. Scan. Understand.</h2>
            <p className="text-emerald-100/70 text-sm mt-1">
              Choose <strong>Open Camera</strong> to snap live, or <strong>Upload Photo</strong> from your device to analyze waste and get certified disposal protocols.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border shrink-0 bg-emerald-500/20 border-emerald-400/30 text-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-[#34D399]" />
            AI Scanner Ready
          </div>
        </div>
      </div>

      {/* ── Main layout ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* ── Left: image / camera viewport ─────────────────────────────── */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">

          {/* Viewport */}
          <div className="relative aspect-[4/3] bg-gray-900 flex items-center justify-center overflow-hidden">

            {/* Live Camera Feed */}
            {cameraOpen && (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            )}

            {/* Captured or Uploaded photo */}
            {!cameraOpen && activeImageUrl && (
              <img src={activeImageUrl} alt="Scan target" className="w-full h-full object-cover" />
            )}

            {/* Empty state — Prominent Dual Action Buttons */}
            {!cameraOpen && !activeImageUrl && !isScanning && (
              <div className="flex flex-col items-center gap-4 text-center px-6 py-8">
                <div className="w-20 h-20 rounded-full bg-[#10B981]/20 border-2 border-[#10B981]/40 flex items-center justify-center shadow-lg">
                  <ZoomIn className="w-9 h-9 text-[#10B981]" />
                </div>
                <div className="space-y-1">
                  <p className="text-white font-bold text-lg">Ready to scan waste</p>
                  <p className="text-white/60 text-xs max-w-sm">
                    Open your camera to snap a photo or select an existing image from your phone or computer.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={openLiveCamera}
                    className="px-5 py-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#0F2E23] font-black text-xs flex items-center gap-2 shadow-lg transform hover:scale-105 transition-all cursor-pointer"
                  >
                    <Camera className="w-4 h-4" /> Open Camera
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-2 border border-white/20 transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4" /> Choose from Gallery
                  </button>
                </div>
              </div>
            )}

            {/* Scanning Laser Animation */}
            {isScanning && (
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#10B981] to-transparent shadow-[0_0_20px_#10B981] animate-scan-laser z-20">
                <div className="absolute left-1/2 -top-6 -translate-x-1/2 px-3 py-1 bg-[#0F2E23]/90 backdrop-blur text-emerald-300 text-xs font-mono rounded-full border border-emerald-500/40 whitespace-nowrap shadow-md">
                  {scanStepText}
                </div>
              </div>
            )}

            {/* Bounding boxes overlay */}
            {!isScanning && currentResult && (
              <div className="absolute inset-0 pointer-events-none">
                {currentResult.objects.map((obj) => {
                  const active = obj.id === selectedObjectId;
                  return (
                    <div
                      key={obj.id}
                      onClick={() => setSelectedId(obj.id)}
                      style={{ left: `${obj.box.x}%`, top: `${obj.box.y}%`, width: `${obj.box.w}%`, height: `${obj.box.h}%` }}
                      className={`absolute border-2 rounded-lg transition-all pointer-events-auto cursor-pointer ${
                        active
                          ? 'border-[#10B981] bg-[#10B981]/15 shadow-[0_0_20px_rgba(16,185,129,0.5)] z-30'
                          : 'border-white/60 bg-black/20 hover:border-[#10B981]/70'
                      }`}
                    >
                      <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-[#10B981]" />
                      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-[#10B981]" />
                      <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-[#10B981]" />
                      <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-[#10B981]" />
                      <div className="absolute -top-8 left-0 flex items-center gap-1.5 px-2.5 py-1 bg-[#0F2E23]/90 backdrop-blur text-white text-xs font-semibold rounded-md border border-[#10B981]/40 shadow-lg whitespace-nowrap">
                        <span>{obj.label}</span>
                        <span className="text-[#34D399] font-mono text-[11px]">{obj.confidence}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Live Camera Viewfinder Shutter Button */}
            {cameraOpen && !isScanning && (
              <div className="absolute bottom-6 inset-x-0 flex items-center justify-center gap-4 z-30">
                <button
                  onClick={capturePhotoFromLiveCamera}
                  className="px-6 py-3.5 rounded-full bg-[#10B981] hover:bg-[#059669] text-[#0F2E23] font-black shadow-2xl flex items-center gap-2 transform hover:scale-105 transition-all cursor-pointer text-sm"
                >
                  <Sparkles className="w-5 h-5" />
                  Take Photo & Analyze
                </button>
                <button
                  onClick={stopCamera}
                  className="w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer transition-all shadow-lg"
                  title="Close camera"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* ── Action Buttons Control Strip ──────────────────────────────── */}
          <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-3">
            <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
              {/* Button 1: Camera button (explicitly opens camera view) */}
              <button
                onClick={cameraOpen ? stopCamera : openLiveCamera}
                disabled={isScanning}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50 ${
                  cameraOpen
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-[#10B981] hover:bg-[#059669] text-[#0F2E23]'
                }`}
              >
                <Camera className="w-4 h-4" />
                {cameraOpen ? 'Close Camera' : 'Open Camera'}
              </button>

              {/* Button 2: Upload photo file picker */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
                className="flex-1 py-3 px-4 rounded-xl bg-white hover:bg-gray-100 text-gray-800 font-bold text-xs sm:text-sm border border-gray-200 flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-4 h-4 text-blue-600" />
                Upload Photo
              </button>

              {/* Button 3: Rescan reset button (visible when a result is loaded) */}
              {currentResult && (
                <button
                  onClick={resetForRescan}
                  disabled={isScanning}
                  className="py-3 px-4 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  New Scan
                </button>
              )}
            </div>

            {/* Telemetry settings */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={telemetryOptIn}
                  onChange={(e) => setTelemetryOptIn(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#10B981] cursor-pointer"
                />
                Contribute anonymized scan data to Community Intelligence
              </label>
              <span className="inline-flex items-center gap-1 text-[#154233] font-medium shrink-0">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" /> Privacy Secured
              </span>
            </div>
          </div>

          {/* Hidden inputs: One for regular gallery files, one for mobile camera direct capture */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFilePicked}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFilePicked}
            accept="image/*"
            capture="environment"
            className="hidden"
          />
        </div>

        {/* ── Right: results panel ───────────────────────────────────────── */}
        <div className="lg:col-span-5 space-y-4">

          {/* Scanning indicator */}
          {isScanning && (
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-md text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#10B981]/10 flex items-center justify-center text-[#10B981] animate-spin">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">Gemini AI Analyzing Waste…</h4>
                <p className="text-sm text-gray-500 mt-1">{scanStepText}</p>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#10B981] h-full animate-pulse w-3/4" />
              </div>
            </div>
          )}

          {/* Error display */}
          {scanError && !isScanning && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-sm text-amber-800">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
              <div className="space-y-1">
                <span className="font-bold">Scan Notice:</span>
                <p>{scanError}</p>
              </div>
            </div>
          )}

          {/* Multi-object selector */}
          {!isScanning && currentResult && currentResult.objects.length > 1 && (
            <div className="bg-[#0F2E23]/5 p-3 rounded-xl border border-[#0F2E23]/10">
              <div className="text-xs font-bold uppercase text-[#0F2E23] mb-2 flex items-center justify-between">
                <span>{currentResult.objects.length} Objects Detected</span>
                <span className="text-gray-500 font-normal">Tap to inspect</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentResult.objects.map((obj) => (
                  <button
                    key={obj.id}
                    onClick={() => setSelectedId(obj.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      selectedObjectId === obj.id
                        ? 'bg-[#0F2E23] text-white shadow'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <span>{obj.label}</span>
                    <span className="text-emerald-500 font-mono">({obj.confidence}%)</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Result card */}
          {!isScanning && currentResult && selectedObject && (
            <ScanResultCard
              result={currentResult}
              activeObject={selectedObject}
              onScanAnother={resetForRescan}
              onFindCollectionPoint={() => onNavigate ? onNavigate('map') : undefined}
            />
          )}

          {/* Idle state */}
          {!isScanning && !currentResult && !scanError && (
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-md text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 flex items-center justify-center text-[#10B981]">
                <Eye className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-gray-900 text-lg">
                  Ready to Scan
                </h3>
                <p className="text-sm text-gray-500">
                  Tap <strong>"Open Camera"</strong> to view your live camera, or <strong>"Upload Photo"</strong> from your phone or PC.
                </p>
              </div>
              <div className="flex justify-center gap-2 pt-1">
                <button
                  onClick={openLiveCamera}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] text-[#0F2E23] font-black rounded-xl shadow transition-all cursor-pointer text-xs"
                >
                  <Camera className="w-4 h-4" />
                  Open Camera
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-all cursor-pointer text-xs"
                >
                  <Upload className="w-4 h-4 text-blue-600" />
                  Upload Photo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScannerInterface;
