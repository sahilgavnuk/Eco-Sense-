import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera, Upload, Sparkles, ShieldCheck, RefreshCw, Eye,
  AlertCircle, X, ZoomIn, CheckCircle2, SwitchCamera
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
  const [cameraFacing, setCameraFacing]       = useState<'environment' | 'user'>('environment');
  const [cameraStream, setCameraStream]       = useState<MediaStream | null>(null);

  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef  = useRef<HTMLInputElement | null>(null);
  const videoRef        = useRef<HTMLVideoElement | null>(null);

  // ── Sync camera stream to video element ───────────────────────────────────
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraStream, cameraOpen]);

  // ── Stop camera on unmount ─────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      cameraStream?.getTracks().forEach((t) => t.stop());
    };
  }, [cameraStream]);

  // ── Step animation ─────────────────────────────────────────────────────────
  const startSteps = () => {
    const steps = [
      'Sending image to Gemini Vision AI…',
      'Detecting visible waste objects…',
      'Classifying materials & resin types…',
      'Evaluating contamination state…',
      'Generating certified disposal protocol…',
    ];
    let i = 0;
    setScanStepText(steps[0]);
    const iv = setInterval(() => {
      i = Math.min(i + 1, steps.length - 1);
      setScanStepText(steps[i]);
    }, 700);
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

  // ── File upload / camera photo handler ────────────────────────────────────
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    stopLiveCamera();
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

  // ── Live Camera Stream ────────────────────────────────────────────────────
  const startLiveCamera = async (facing: 'environment' | 'user' = cameraFacing) => {
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }
      setCurrentResult(null);
      setScanError(null);
      setActiveImageUrl(null);

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      setCameraFacing(facing);
      setCameraOpen(true);
    } catch {
      // Fallback: prompt native device camera input
      cameraInputRef.current?.click();
    }
  };

  const stopLiveCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
    setCameraOpen(false);
  };

  const switchCameraFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    startLiveCamera(nextFacing);
  };

  const captureLiveFrameAndScan = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width  = video.videoWidth  || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const url = canvas.toDataURL('image/jpeg', 0.95);
    setActiveImageUrl(url);
    stopLiveCamera();
    runScan(url);
  };

  const rescan = () => {
    setCurrentResult(null);
    setScanError(null);
    setActiveImageUrl(null);
    stopLiveCamera();
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
              Gemini Vision AI · Real-Time Precision Engine
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Point. Scan. Understand.</h2>
            <p className="text-emerald-100/70 text-sm mt-1">
              Capture or upload any real waste item — Gemini AI inspects material composition, contamination, and gives certified disposal guidance.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border shrink-0 bg-emerald-500/20 border-emerald-400/30 text-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
            AI Precision Active
          </div>
        </div>
      </div>

      {/* ── Main layout ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ── Left: Viewport ─────────────────────────────────────────────── */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="relative aspect-[4/3] bg-gray-900 flex items-center justify-center overflow-hidden">
            {/* Live Camera Feed */}
            {cameraOpen && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}

            {/* Uploaded / Captured Image Preview */}
            {!cameraOpen && activeImageUrl && (
              <img
                src={activeImageUrl}
                alt="Scan target"
                className="w-full h-full object-cover"
              />
            )}

            {/* Empty State */}
            {!cameraOpen && !activeImageUrl && !isScanning && (
              <div className="flex flex-col items-center gap-4 text-center px-6">
                <div className="w-20 h-20 rounded-full bg-[#10B981]/20 border-2 border-[#10B981]/40 flex items-center justify-center">
                  <ZoomIn className="w-9 h-9 text-[#10B981]" />
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">Ready to scan waste</p>
                  <p className="text-white/60 text-xs mt-1 max-w-xs mx-auto">
                    Take a live photo using Camera or upload an image from your files
                  </p>
                </div>
              </div>
            )}

            {/* Scanning Laser Animation */}
            {isScanning && (
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#10B981] to-transparent shadow-[0_0_20px_#10B981] animate-scan-laser z-20">
                <div className="absolute left-1/2 -top-6 -translate-x-1/2 px-3.5 py-1 bg-[#0F2E23]/95 backdrop-blur text-emerald-300 text-xs font-mono rounded-full border border-emerald-500/40 whitespace-nowrap shadow-md">
                  {scanStepText}
                </div>
              </div>
            )}

            {/* Detected Bounding Boxes */}
            {!isScanning && currentResult && (
              <div className="absolute inset-0 pointer-events-none">
                {currentResult.objects.map((obj) => {
                  const active = obj.id === selectedObjectId;
                  return (
                    <div
                      key={obj.id}
                      onClick={() => setSelectedId(obj.id)}
                      style={{
                        left: `${obj.box.x}%`,
                        top: `${obj.box.y}%`,
                        width: `${obj.box.w}%`,
                        height: `${obj.box.h}%`,
                      }}
                      className={`absolute border-2 rounded-lg transition-all pointer-events-auto cursor-pointer ${
                        active
                          ? 'border-[#10B981] bg-[#10B981]/20 shadow-[0_0_20px_rgba(16,185,129,0.6)] z-30'
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

            {/* Live Camera Control Overlays */}
            {cameraOpen && !isScanning && (
              <div className="absolute bottom-5 inset-x-0 flex items-center justify-center gap-3 z-30 px-4">
                <button
                  onClick={captureLiveFrameAndScan}
                  className="px-6 py-3 rounded-full bg-[#10B981] hover:bg-[#059669] text-[#0F2E23] font-black text-sm shadow-2xl flex items-center gap-2 transform hover:scale-105 transition-all cursor-pointer"
                >
                  <Camera className="w-5 h-5 text-[#0F2E23]" />
                  Capture & Analyze
                </button>

                <button
                  onClick={switchCameraFacing}
                  className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer"
                  title="Switch Front/Rear Camera"
                >
                  <SwitchCamera className="w-5 h-5" />
                </button>

                <button
                  onClick={stopLiveCamera}
                  className="w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer"
                  title="Close Camera"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* ── Action Buttons ────────────────────────────────────────────── */}
          <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* BUTTON 1: Open Live Camera */}
              <button
                onClick={() => (cameraOpen ? stopLiveCamera() : startLiveCamera())}
                disabled={isScanning}
                className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50 ${
                  cameraOpen
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-[#10B981] hover:bg-[#059669] text-[#0F2E23]'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>{cameraOpen ? 'Close Camera' : 'Live Camera'}</span>
              </button>

              {/* BUTTON 2: Upload or Snap Photo */}
              <button
                onClick={() => galleryInputRef.current?.click()}
                disabled={isScanning}
                className="py-3 px-4 rounded-xl bg-[#0F2E23] hover:bg-[#154233] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-4 h-4 text-[#10B981]" />
                <span>Upload / Snap Photo</span>
              </button>
            </div>

            {/* Quick Actions when image scanned */}
            {(activeImageUrl || currentResult) && !cameraOpen && (
              <div className="flex justify-end pt-1">
                <button
                  onClick={rescan}
                  disabled={isScanning}
                  className="text-xs text-gray-600 hover:text-gray-900 font-semibold flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-gray-200 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Clear & Scan New Item
                </button>
              </div>
            )}

            {/* Telemetry */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-200/60">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={telemetryOptIn}
                  onChange={(e) => setTelemetryOptIn(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#10B981]"
                />
                Contribute anonymized scan to Community Intelligence
              </label>
              <span className="inline-flex items-center gap-1 text-[#154233] font-medium">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" /> Privacy Secured
              </span>
            </div>
          </div>

          {/* Hidden inputs */}
          <input
            type="file"
            ref={galleryInputRef}
            onChange={handleFile}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFile}
            accept="image/*"
            capture="environment"
            className="hidden"
          />
        </div>

        {/* ── Right: Results panel ───────────────────────────────────────── */}
        <div className="lg:col-span-5 space-y-4">
          {/* Scanning Animation */}
          {isScanning && (
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-md text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#10B981]/10 flex items-center justify-center text-[#10B981] animate-spin">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">Gemini Vision AI Inspecting…</h4>
                <p className="text-sm text-gray-500 mt-1">{scanStepText}</p>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#10B981] h-full animate-pulse w-3/4" />
              </div>
            </div>
          )}

          {/* Error Banner */}
          {scanError && !isScanning && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-sm text-amber-800">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
              <div className="space-y-1">
                <p className="font-semibold">{scanError}</p>
                <p className="text-xs text-amber-700">Please take a clearer photo with good lighting or try another image.</p>
              </div>
            </div>
          )}

          {/* Multi-object detected selector */}
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

          {/* Result Card */}
          {!isScanning && currentResult && selectedObject && (
            <ScanResultCard
              result={currentResult}
              activeObject={selectedObject}
              onScanAnother={rescan}
              onFindCollectionPoint={() => (onNavigate ? onNavigate('map') : undefined)}
            />
          )}

          {/* Idle state */}
          {!isScanning && !currentResult && !scanError && (
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-md text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 flex items-center justify-center text-[#10B981]">
                <Eye className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Ready to Scan</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                  Click <strong>Live Camera</strong> for a live video scanner, or <strong>Upload / Snap Photo</strong> to analyze any picture.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScannerInterface;
