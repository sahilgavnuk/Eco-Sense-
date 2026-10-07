import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera, Upload, Sparkles, ShieldCheck, RefreshCw, Eye,
  AlertCircle, X, ZoomIn,
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

  // ── File / camera-capture upload ───────────────────────────────────────────
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // ── Camera ────────────────────────────────────────────────────────────────
  const openCamera = async () => {
    try {
      setCurrentResult(null);
      setScanError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setCameraStream(stream);
      setCameraOpen(true);
      setActiveImageUrl(null);
    } catch {
      alert('Camera access denied. Please upload an image instead.');
    }
  };

  const stopCamera = () => {
    cameraStream?.getTracks().forEach((t) => t.stop());
    setCameraStream(null);
    setCameraOpen(false);
  };

  const captureAndScan = () => {
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

  const scanAgain = () => {
    setCurrentResult(null);
    setScanError(null);
    setActiveImageUrl(null);
    fileInputRef.current?.click();
  };

  const activeObjects = currentResult?.objects ?? [];
  const selectedObject = activeObjects.find((o) => o.id === selectedObjectId) ?? activeObjects[0];

  // ── Render ─────────────────────────────────────────────────────────────────
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
              Tap <strong>Scan Waste</strong> — your camera opens instantly. Gemini AI identifies every object and gives accurate disposal guidance.
            </p>
          </div>

          {/* Model status pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border shrink-0 bg-emerald-500/20 border-emerald-400/30 text-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-[#34D399]" />
            Gemini Vision AI
          </div>
        </div>
      </div>

      {/* ── Main layout ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* ── Left: image / camera viewport ─────────────────────────────── */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">

          {/* Viewport */}
          <div className="relative aspect-[4/3] bg-gray-900 flex items-center justify-center overflow-hidden">

            {/* Camera live feed */}
            {cameraOpen && (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            )}

            {/* Captured / uploaded image */}
            {!cameraOpen && activeImageUrl && (
              <img src={activeImageUrl} alt="Scan target" className="w-full h-full object-cover" />
            )}

            {/* Empty state — big 1-click button */}
            {!cameraOpen && !activeImageUrl && !isScanning && (
              <div className="flex flex-col items-center gap-4 text-center px-6">
                <div className="w-20 h-20 rounded-full bg-[#10B981]/20 border-2 border-[#10B981]/40 flex items-center justify-center">
                  <ZoomIn className="w-9 h-9 text-[#10B981]" />
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">Ready to scan</p>
                  <p className="text-white/50 text-sm mt-1">
                    Use the buttons below to start scanning
                  </p>
                </div>
              </div>
            )}

            {/* Scanning laser animation */}
            {isScanning && (
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#10B981] to-transparent shadow-[0_0_20px_#10B981] animate-scan-laser z-20">
                <div className="absolute left-1/2 -top-6 -translate-x-1/2 px-3 py-1 bg-[#0F2E23]/90 backdrop-blur text-emerald-300 text-xs font-mono rounded-full border border-emerald-500/40 whitespace-nowrap shadow-md">
                  {scanStepText}
                </div>
              </div>
            )}

            {/* Bounding boxes */}
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
                      {/* Corner marks */}
                      <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-[#10B981]" />
                      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-[#10B981]" />
                      <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-[#10B981]" />
                      <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-[#10B981]" />
                      {/* Label */}
                      <div className="absolute -top-8 left-0 flex items-center gap-1.5 px-2.5 py-1 bg-[#0F2E23]/90 backdrop-blur text-white text-xs font-semibold rounded-md border border-[#10B981]/40 shadow-lg whitespace-nowrap">
                        <span>{obj.label}</span>
                        <span className="text-[#34D399] font-mono text-[11px]">{obj.confidence}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Camera capture button */}
            {cameraOpen && !isScanning && (
              <div className="absolute bottom-6 inset-x-0 flex items-center justify-center gap-4 z-30">
                <button
                  onClick={captureAndScan}
                  className="px-6 py-3 rounded-full bg-[#10B981] hover:bg-[#059669] text-white font-bold shadow-2xl flex items-center gap-2 transform hover:scale-105 transition-all"
                >
                  <Sparkles className="w-5 h-5" />
                  Capture & Scan
                </button>
                <button
                  onClick={stopCamera}
                  className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* ── Action buttons below viewport ────────────────────────────── */}
          <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-3">

            {/* PRIMARY: 1-click Scan button */}
            <div className="flex gap-3">
              {/* On mobile: capture="environment" opens camera directly in 1 tap */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
                className="flex-1 py-3 rounded-xl bg-[#0F2E23] hover:bg-[#154233] disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Upload className="w-4 h-4" />
                {isScanning ? 'Scanning…' : 'Scan Waste'}
              </button>

              {/* Live camera (desktop) */}
              <button
                onClick={cameraOpen ? stopCamera : openCamera}
                disabled={isScanning}
                className={`px-4 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-md disabled:opacity-50 ${
                  cameraOpen
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300'
                }`}
              >
                <Camera className="w-4 h-4" />
                {cameraOpen ? 'Close' : 'Camera'}
              </button>

              {currentResult && (
                <button
                  onClick={scanAgain}
                  disabled={isScanning}
                  className="px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  Rescan
                </button>
              )}
            </div>

            {/* Telemetry */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={telemetryOptIn}
                  onChange={(e) => setTelemetryOptIn(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#10B981]"
                />
                Contribute anonymized scan data to Community Intelligence
              </label>
              <span className="inline-flex items-center gap-1 text-[#154233] font-medium">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" /> Privacy Secured
              </span>
            </div>
          </div>

          {/* Hidden file input — capture="environment" opens camera on mobile */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFile}
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
                <h4 className="text-lg font-bold text-gray-900">AI Analyzing…</h4>
                <p className="text-sm text-gray-500 mt-1">{scanStepText}</p>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#10B981] h-full animate-pulse w-3/4" />
              </div>
            </div>
          )}

          {/* Error */}
          {scanError && !isScanning && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-sm text-amber-800">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
              <span>{scanError}</span>
            </div>
          )}

          {/* Multi-object selector */}
          {!isScanning && currentResult && currentResult.objects.length > 1 && (
            <div className="bg-[#0F2E23]/5 p-3 rounded-xl border border-[#0F2E23]/10">
              <div className="text-xs font-bold uppercase text-[#0F2E23] mb-2 flex items-center justify-between">
                <span>{currentResult.objects.length} Objects Detected</span>
                <span className="text-gray-500 font-normal">Tap to switch</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentResult.objects.map((obj) => (
                  <button
                    key={obj.id}
                    onClick={() => setSelectedId(obj.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
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
              onScanAnother={scanAgain}
              onFindCollectionPoint={() => onNavigate ? onNavigate('map') : undefined}
            />
          )}

          {/* Idle state */}
          {!isScanning && !currentResult && !scanError && (
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-md text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 flex items-center justify-center text-[#10B981]">
                <Eye className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  Ready to Scan
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Tap "Scan Waste" — snap or upload any photo and Gemini AI will identify every item with full disposal details!
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mx-auto flex items-center gap-2 px-6 py-3 bg-[#0F2E23] hover:bg-[#154233] text-white font-bold rounded-xl shadow transition-all"
              >
                <Upload className="w-4 h-4" />
                Scan Waste Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScannerInterface;
