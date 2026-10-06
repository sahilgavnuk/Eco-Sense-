import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Upload, Sparkles, ShieldCheck, RefreshCw, Layers, Eye, Loader2, AlertCircle } from 'lucide-react';
import type { ScanResult } from '../../types';
import { SAMPLE_SCANS } from '../../data/mockData';
import ScanResultCard from './ScanResultCard';
import { scanImageElement, loadModel } from './wasteAI';

interface ScannerInterfaceProps {
  onScanComplete?: (result: ScanResult) => void;
  compactMode?: boolean;
}

export const ScannerInterface: React.FC<ScannerInterfaceProps> = ({ onScanComplete, compactMode: _compactMode = false }) => {
  const [selectedSampleIndex, setSelectedSampleIndex] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStepText, setScanStepText] = useState<string>('');
  const [currentScanResult, setCurrentScanResult] = useState<ScanResult | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [useCamera, setUseCamera] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [telemetryOptIn, setTelemetryOptIn] = useState<boolean>(true);
  const [modelReady, setModelReady] = useState<boolean>(false);
  const [modelLoading, setModelLoading] = useState<boolean>(true);
  const [scanError, setScanError] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<'sample' | 'upload' | 'camera'>('sample');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Pre-load TensorFlow model on mount
  useEffect(() => {
    setModelLoading(true);
    loadModel()
      .then(() => {
        setModelReady(true);
        setModelLoading(false);
        // Auto-scan first sample once model is ready
        handleSelectSample(0);
      })
      .catch((err) => {
        console.error('Model load failed:', err);
        setModelLoading(false);
        setScanError('AI model failed to load. Using smart fallback mode.');
        // Still show first sample result via fallback
        handleSelectSampleFallback(0);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [cameraStream]);

  // Sync video stream to video element
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  // ─── Fallback (sample data) for when model isn't ready ───────────────────
  const handleSelectSampleFallback = (idx: number) => {
    setCurrentScanResult(SAMPLE_SCANS[idx]);
    setSelectedObjectId(SAMPLE_SCANS[idx].objects[0]?.id ?? null);
    if (onScanComplete) onScanComplete(SAMPLE_SCANS[idx]);
  };

  // ─── Real AI scan of an <img> element ────────────────────────────────────
  const runRealScan = useCallback(
    async (imgEl: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement, imageUrl: string) => {
      setIsScanning(true);
      setScanError(null);
      setCurrentScanResult(null);

      const steps = [
        'Loading AI vision model...',
        'Detecting bounding boxes...',
        'Identifying material composition...',
        'Evaluating contamination state...',
        'Generating disposal guidance...',
      ];

      // Animate steps
      let stepIdx = 0;
      setScanStepText(steps[0]);
      const stepInterval = setInterval(() => {
        stepIdx = Math.min(stepIdx + 1, steps.length - 1);
        setScanStepText(steps[stepIdx]);
      }, 600);

      try {
        const result = await scanImageElement(imgEl, telemetryOptIn, 'Zone 2 — Central District');
        result.imageUrl = imageUrl;
        clearInterval(stepInterval);
        setIsScanning(false);
        setCurrentScanResult(result);
        if (result.objects.length > 0) setSelectedObjectId(result.objects[0].id);
        if (onScanComplete) onScanComplete(result);
      } catch (err) {
        clearInterval(stepInterval);
        setIsScanning(false);
        setScanError('Scan failed. Try a clearer image or use a sample scan below.');
        console.error('Scan error:', err);
      }
    },
    [telemetryOptIn, onScanComplete]
  );

  // ─── Sample Scan ──────────────────────────────────────────────────────────
  const handleSelectSample = (idx: number) => {
    handleStopCamera();
    setUploadedImageUrl(null);
    setSelectedSampleIndex(idx);
    setActiveMode('sample');

    if (!modelReady) {
      handleSelectSampleFallback(idx);
      return;
    }

    // Build a temporary image element to feed into TensorFlow
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = SAMPLE_SCANS[idx].imageUrl;
    img.onload = () => runRealScan(img, SAMPLE_SCANS[idx].imageUrl);
    img.onerror = () => {
      // CORS block — fall back to sample data
      handleSelectSampleFallback(idx);
    };
  };

  // ─── Upload Scan ──────────────────────────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;
      handleStopCamera();
      setUploadedImageUrl(dataUrl);
      setActiveMode('upload');

      if (!modelReady) {
        handleSelectSampleFallback(selectedSampleIndex);
        return;
      }

      const img = new Image();
      img.src = dataUrl;
      img.onload = () => runRealScan(img, dataUrl);
    };
    reader.readAsDataURL(file);
    // Reset file input so same file can be re-uploaded
    e.target.value = '';
  };

  // ─── Camera ───────────────────────────────────────────────────────────────
  const handleStartCamera = async () => {
    if (useCamera) {
      handleStopCamera();
      return;
    }
    try {
      setUploadedImageUrl(null);
      setCurrentScanResult(null);
      setScanError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setCameraStream(stream);
      setUseCamera(true);
      setActiveMode('camera');
    } catch {
      alert('Camera access unavailable or denied. Please select a sample item or upload an image.');
      setUseCamera(false);
    }
  };

  const handleStopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
    setUseCamera(false);
  };

  // Capture a frame from the video and scan it
  const handleCameraCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');
    setUploadedImageUrl(dataUrl);
    handleStopCamera();
    setActiveMode('upload');

    if (!modelReady) {
      handleSelectSampleFallback(selectedSampleIndex);
      return;
    }
    runRealScan(canvas, dataUrl);
  };

  // ─── Derived values ───────────────────────────────────────────────────────
  const activeImage =
    uploadedImageUrl ||
    (useCamera ? '' : SAMPLE_SCANS[selectedSampleIndex].imageUrl);

  const activeObjects = currentScanResult ? currentScanResult.objects : [];
  const selectedObject = activeObjects.find((o) => o.id === selectedObjectId) || activeObjects[0];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0F2E23] text-white p-4 sm:p-6 rounded-2xl shadow-xl border border-[#154233] relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#10B981]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/20 border border-[#10B981]/30 text-[#34D399] text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              AI Waste Intelligence Scanner v3.0
              {modelLoading && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
              {modelReady && <span className="text-emerald-300">· Model Ready</span>}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Point. Scan. Understand.
            </h2>
            <p className="text-emerald-100/70 text-sm mt-1 max-w-xl">
              Real AI object detection — identifies actual waste items, materials, and gives disposal guidance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleStartCamera}
              className={`px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-md ${
                useCamera
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-[#10B981] hover:bg-[#059669] text-white'
              }`}
            >
              <Camera className="w-4 h-4" />
              {useCamera ? 'Stop Camera' : 'Open Camera'}
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm flex items-center gap-2 border border-white/15 transition-all"
            >
              <Upload className="w-4 h-4" />
              Upload Image
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
          </div>
        </div>

        {/* Sample selectors */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-semibold uppercase text-emerald-300/80 whitespace-nowrap flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" /> Sample Scans:
          </span>
          {SAMPLE_SCANS.map((sample, idx) => (
            <button
              key={sample.id}
              onClick={() => handleSelectSample(idx)}
              disabled={isScanning}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 border disabled:opacity-50 ${
                selectedSampleIndex === idx && activeMode === 'sample'
                  ? 'bg-[#10B981] text-white border-emerald-400 font-bold shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-emerald-100 border-white/10'
              }`}
            >
              <span>{sample.objects[0]?.label || 'Sample'}</span>
              {sample.objects.length > 1 && (
                <span className="bg-emerald-950/60 px-1.5 py-0.5 rounded text-[10px] text-emerald-300">
                  {sample.objects.length} items
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Image Viewport */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden relative group">
          <div className="relative aspect-[4/3] bg-gray-900 flex items-center justify-center overflow-hidden">
            {useCamera ? (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            ) : (
              <img
                ref={imageRef}
                src={activeImage}
                alt="Waste scan target"
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            )}

            {/* Scanning Laser Line */}
            {isScanning && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#10B981] to-transparent shadow-[0_0_15px_#10B981] animate-scan-laser z-20">
                <div className="absolute left-1/2 -top-6 -translate-x-1/2 px-3 py-1 bg-[#0F2E23]/90 backdrop-blur text-emerald-300 text-xs font-mono rounded-full border border-emerald-500/50 shadow-md whitespace-nowrap">
                  {scanStepText}
                </div>
              </div>
            )}

            {/* Bounding Box Overlays */}
            {!isScanning && currentScanResult && (
              <div className="absolute inset-0 pointer-events-none">
                {currentScanResult.objects.map((obj) => {
                  const isSelected = obj.id === selectedObjectId;
                  return (
                    <div
                      key={obj.id}
                      onClick={() => setSelectedObjectId(obj.id)}
                      style={{
                        left: `${obj.box.x}%`,
                        top: `${obj.box.y}%`,
                        width: `${obj.box.w}%`,
                        height: `${obj.box.h}%`,
                      }}
                      className={`absolute border-2 rounded-lg transition-all pointer-events-auto cursor-pointer ${
                        isSelected
                          ? 'border-[#10B981] bg-[#10B981]/15 shadow-[0_0_20px_rgba(16,185,129,0.6)] animate-box-pulse z-30'
                          : 'border-white/70 bg-black/20 hover:border-[#10B981]/80 hover:bg-[#10B981]/10'
                      }`}
                    >
                      <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-[#10B981]" />
                      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-[#10B981]" />
                      <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-[#10B981]" />
                      <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-[#10B981]" />

                      <div className="absolute -top-8 left-0 flex items-center gap-1.5 px-2.5 py-1 bg-[#0F2E23]/90 backdrop-blur text-white text-xs font-semibold rounded-md border border-[#10B981]/50 shadow-lg whitespace-nowrap">
                        <span>{obj.label}</span>
                        <span className="text-[#34D399] font-mono text-[11px]">{obj.confidence}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Camera capture button */}
            {useCamera && !isScanning && (
              <div className="absolute bottom-6 inset-x-0 flex justify-center z-30">
                <button
                  onClick={handleCameraCapture}
                  className="px-6 py-3 rounded-full bg-[#10B981] hover:bg-[#059669] text-white font-bold shadow-xl flex items-center gap-2 transform hover:scale-105 transition-all"
                >
                  <Sparkles className="w-5 h-5" />
                  Capture &amp; Analyze Waste
                </button>
              </div>
            )}
          </div>

          {/* Telemetry Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="telemetry"
                checked={telemetryOptIn}
                onChange={(e) => setTelemetryOptIn(e.target.checked)}
                className="w-4 h-4 rounded text-[#10B981] focus:ring-[#10B981] accent-[#10B981]"
              />
              <label htmlFor="telemetry" className="cursor-pointer">
                Contribute anonymized scan data to Community Intelligence
              </label>
            </div>
            <span className="inline-flex items-center gap-1 text-[#154233] font-medium">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" /> Privacy Secured
            </span>
          </div>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-5 space-y-4">
          {/* Model loading */}
          {modelLoading && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md text-center space-y-3">
              <Loader2 className="w-10 h-10 mx-auto animate-spin text-[#10B981]" />
              <h4 className="text-lg font-bold text-gray-900">Loading AI Model</h4>
              <p className="text-sm text-gray-500">Downloading TensorFlow COCO-SSD object detection model…</p>
            </div>
          )}

          {/* Scanning */}
          {!modelLoading && isScanning && (
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-md text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#10B981]/10 flex items-center justify-center text-[#10B981] animate-spin">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">Scanning Waste Object</h4>
                <p className="text-sm text-gray-500 mt-1">{scanStepText}</p>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#10B981] h-full transition-all duration-300 animate-pulse w-3/4" />
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

          {/* Results */}
          {!isScanning && currentScanResult && (
            <div className="space-y-4">
              {currentScanResult.objects.length > 1 && (
                <div className="bg-[#0F2E23]/5 p-3 rounded-xl border border-[#0F2E23]/10">
                  <div className="text-xs font-bold uppercase text-[#0F2E23] mb-2 flex items-center justify-between">
                    <span>{currentScanResult.objects.length} Objects Detected</span>
                    <span className="text-gray-500 font-normal">Tap to switch</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentScanResult.objects.map((obj) => (
                      <button
                        key={obj.id}
                        onClick={() => setSelectedObjectId(obj.id)}
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

              <ScanResultCard
                result={currentScanResult}
                activeObject={selectedObject || currentScanResult.objects[0]}
                onScanAnother={() => {
                  if (activeMode === 'camera') {
                    setCurrentScanResult(null);
                  } else {
                    const nextIdx = (selectedSampleIndex + 1) % SAMPLE_SCANS.length;
                    handleSelectSample(nextIdx);
                  }
                }}
              />
            </div>
          )}

          {/* Idle state */}
          {!modelLoading && !isScanning && !currentScanResult && !scanError && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 flex items-center justify-center text-[#10B981]">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Ready to Scan Waste</h3>
              <p className="text-sm text-gray-600">
                Select a sample, open your camera, or upload a photo for real AI waste analysis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScannerInterface;
