import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Sparkles, ShieldCheck, RefreshCw, Layers, Eye } from 'lucide-react';
import type { ScanResult, WasteCategory, ContaminationLevel, DetectedObject } from '../../types';
import { SAMPLE_SCANS } from '../../data/mockData';
import ScanResultCard from './ScanResultCard';

interface ScannerInterfaceProps {
  onScanComplete?: (result: ScanResult) => void;
  onNavigateToMap?: () => void;
  compactMode?: boolean;
}

const GENERATE_CUSTOM_SCAN = (imageSource: string, telemetryOptIn: boolean): ScanResult => {
  const dynamicPresets: Array<{
    primaryCategory: WasteCategory;
    primaryCondition: ContaminationLevel;
    overallRecommendation: string[];
    explainableAI: string;
    objects: DetectedObject[];
  }> = [
    {
      primaryCategory: 'Dry / Recyclable',
      primaryCondition: 'Slightly Contaminated',
      overallRecommendation: ['Empty liquid contents', 'Rinse gently with water', 'Place in Dry Recyclables Bin'],
      explainableAI: 'AI identified a polymer structure (93% confidence) based on edge density, surface reflectance, and container contour.',
      objects: [
        {
          id: `custom-obj-1-${Date.now()}`,
          label: 'Plastic Container / Bottle',
          category: 'Dry / Recyclable',
          material: 'HDPE / PET Polymer',
          confidence: 93,
          box: { x: 20, y: 18, w: 60, h: 62 },
          condition: 'Slightly Contaminated',
          disposalRecommendation: ['Rinse residual liquids with clean water', 'Secure cap', 'Recycle in Dry Waste container'],
          whyExplanation: 'Standard recyclable polymer structure detected with high surface reflectance.'
        }
      ]
    },
    {
      primaryCategory: 'Dry / Recyclable',
      primaryCondition: 'Clean',
      overallRecommendation: ['Flatten packaging box', 'Remove synthetic tape', 'Deposit in paper recycling'],
      explainableAI: 'High confidence detection of corrugated fiberboard (96% confidence). Clean fiber material ready for repulping.',
      objects: [
        {
          id: `custom-obj-2-${Date.now()}`,
          label: 'Corrugated Shipping Packaging',
          category: 'Dry / Recyclable',
          material: 'Kraft Cellulose Fiber',
          confidence: 96,
          box: { x: 15, y: 15, w: 70, h: 68 },
          condition: 'Clean',
          disposalRecommendation: ['Flatten container', 'Remove tape', 'Place in dry cardboard collection'],
          whyExplanation: 'Cellulose pulp material with minimal contamination detected.'
        }
      ]
    },
    {
      primaryCategory: 'Wet / Organic',
      primaryCondition: 'Mixed-material',
      overallRecommendation: ['Separate organic waste into Compost/Wet bin', 'Rinse container and place in Recyclables'],
      explainableAI: 'Detected perishable food residue (90% confidence) alongside rigid packaging.',
      objects: [
        {
          id: `custom-obj-3-${Date.now()}`,
          label: 'Organic Food Waste',
          category: 'Wet / Organic',
          material: 'Compostable Organic Matter',
          confidence: 90,
          box: { x: 25, y: 22, w: 50, h: 50 },
          condition: 'Mixed-material',
          disposalRecommendation: ['Scrape food scraps into Green/Wet Waste Bin or Home Compost'],
          whyExplanation: 'Perishable organic content suitable for composting or biomethanation.'
        }
      ]
    }
  ];

  const selected = dynamicPresets[Math.floor(Math.random() * dynamicPresets.length)];

  return {
    id: `scan-${Date.now()}`,
    timestamp: new Date().toISOString(),
    imageUrl: imageSource,
    zone: 'Zone 2 — Central District',
    anonymizedTelemetryOptIn: telemetryOptIn,
    ...selected
  };
};

export const ScannerInterface: React.FC<ScannerInterfaceProps> = ({ onScanComplete, onNavigateToMap, compactMode: _compactMode = false }) => {
  const [selectedSampleIndex, setSelectedSampleIndex] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStepText, setScanStepText] = useState<string>('');
  const [currentScanResult, setCurrentScanResult] = useState<ScanResult | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [useCamera, setUseCamera] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [telemetryOptIn, setTelemetryOptIn] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera when unmounted
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  // Bind camera stream to video element whenever camera is active
  useEffect(() => {
    if (useCamera && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(() => {});
    }
  }, [useCamera, cameraStream]);

  // Start Camera
  const handleStartCamera = async () => {
    try {
      setUploadedImageUrl(null);
      setCurrentScanResult(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setCameraStream(stream);
      setUseCamera(true);
    } catch (err) {
      alert('Camera access unavailable or denied. Please select a sample item or upload an image.');
      setUseCamera(false);
    }
  };

  const handleStopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setUseCamera(false);
  };

  // Capture snapshot frame from live camera stream
  const captureCameraSnapshot = (): string | null => {
    if (videoRef.current && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.85);
      }
    }
    return null;
  };

  const handleCaptureCamera = () => {
    const snapshotUrl = captureCameraSnapshot();
    handleStopCamera();
    if (snapshotUrl) {
      setUploadedImageUrl(snapshotUrl);
      triggerScanSimulation(snapshotUrl, null);
    } else {
      triggerScanSimulation('camera-capture', null);
    }
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleStopCamera();
          const imgUrl = event.target.result as string;
          setUploadedImageUrl(imgUrl);
          triggerScanSimulation(imgUrl, null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger Scanning Sequence
  const triggerScanSimulation = (imageSource: string, sampleData: ScanResult | null) => {
    setIsScanning(true);
    setCurrentScanResult(null);

    const steps = [
      'Detecting bounding boxes...',
      'Identifying material composition...',
      'Evaluating contamination state...',
      'Determining disposal category...',
      'Generating explainable AI recommendation...'
    ];

    let stepIdx = 0;
    setScanStepText(steps[0]);

    const interval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setScanStepText(steps[stepIdx]);
      } else {
        clearInterval(interval);
        setIsScanning(false);

        const activeResult: ScanResult = sampleData || GENERATE_CUSTOM_SCAN(imageSource, telemetryOptIn);

        setCurrentScanResult(activeResult);
        if (activeResult.objects.length > 0) {
          setSelectedObjectId(activeResult.objects[0].id);
        }
        if (onScanComplete) {
          onScanComplete(activeResult);
        }
      }
    }, 400);
  };

  const handleSelectSample = (idx: number) => {
    handleStopCamera();
    setUploadedImageUrl(null);
    setSelectedSampleIndex(idx);
    triggerScanSimulation(SAMPLE_SCANS[idx].imageUrl, SAMPLE_SCANS[idx]);
  };

  const activeImage = uploadedImageUrl || (useCamera ? '' : SAMPLE_SCANS[selectedSampleIndex].imageUrl);
  const activeObjects = currentScanResult ? currentScanResult.objects : [];
  const selectedObject = activeObjects.find((o) => o.id === selectedObjectId) || activeObjects[0];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Banner Control */}
      <div className="bg-[#0F2E23] text-white p-4 sm:p-6 rounded-2xl shadow-xl border border-[#154233] relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#10B981]/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/20 border border-[#10B981]/30 text-[#34D399] text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              AI Waste Intelligence Scanner v2.6
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Point. Scan. Understand.
            </h2>
            <p className="text-emerald-100/70 text-sm mt-1 max-w-xl">
              Instant multi-object identification, material analysis, contamination rating, and actionable disposal guidance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={useCamera ? handleStopCamera : handleStartCamera}
              className={`px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-md cursor-pointer ${
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
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm flex items-center gap-2 border border-white/15 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Upload Image
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        {/* Sample Item Selectors */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-semibold uppercase text-emerald-300/80 whitespace-nowrap flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" /> Sample Scans:
          </span>
          {SAMPLE_SCANS.map((sample, idx) => (
            <button
              key={sample.id}
              onClick={() => handleSelectSample(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 border cursor-pointer ${
                selectedSampleIndex === idx && !useCamera && !uploadedImageUrl
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

      {/* Main Vision Stage & Bounding Box Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center Image Viewport */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden relative group">
          <div className="relative aspect-[4/3] bg-gray-900 flex items-center justify-center overflow-hidden">
            {useCamera ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={activeImage}
                alt="Waste scan target"
                className="w-full h-full object-cover"
              />
            )}

            {/* Scanning Laser Line */}
            {isScanning && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#10B981] to-transparent shadow-[0_0_15px_#10B981] animate-scan-laser z-20">
                <div className="absolute left-1/2 -top-6 -translate-x-1/2 px-3 py-1 bg-[#0F2E23]/90 backdrop-blur text-emerald-300 text-xs font-mono rounded-full border border-emerald-500/50 shadow-md">
                  {scanStepText}
                </div>
              </div>
            )}

            {/* Bounding Box Overlays */}
            {!isScanning && currentScanResult && (
              <div className="absolute inset-0 pointer-events-none">
                {currentScanResult.objects.map((obj) => {
                  const isSelected = obj.id === selectedObjectId;
                  const tagPosition = obj.box.y < 16 ? 'top-1 left-1' : '-top-8 left-0';
                  return (
                    <div
                      key={obj.id}
                      onClick={() => setSelectedObjectId(obj.id)}
                      style={{
                        left: `${obj.box.x}%`,
                        top: `${obj.box.y}%`,
                        width: `${obj.box.w}%`,
                        height: `${obj.box.h}%`
                      }}
                      className={`absolute border-2 rounded-lg transition-all pointer-events-auto cursor-pointer ${
                        isSelected
                          ? 'border-[#10B981] bg-[#10B981]/15 shadow-[0_0_20px_rgba(16,185,129,0.6)] animate-box-pulse z-30'
                          : 'border-white/70 bg-black/20 hover:border-[#10B981]/80 hover:bg-[#10B981]/10'
                      }`}
                    >
                      {/* Box Corner Indicators */}
                      <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-[#10B981]"></div>
                      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-[#10B981]"></div>
                      <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-[#10B981]"></div>
                      <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-[#10B981]"></div>

                      {/* Label Tag */}
                      <div className={`absolute ${tagPosition} flex items-center gap-1.5 px-2.5 py-1 bg-[#0F2E23]/90 backdrop-blur text-white text-xs font-semibold rounded-md border border-[#10B981]/50 shadow-lg whitespace-nowrap z-40`}>
                        <span>{obj.label}</span>
                        <span className="text-[#34D399] font-mono text-[11px]">
                          {obj.confidence}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty state capture prompt button if camera active */}
            {useCamera && !isScanning && !currentScanResult && (
              <div className="absolute bottom-6 inset-x-0 flex justify-center z-30">
                <button
                  onClick={handleCaptureCamera}
                  className="px-6 py-3 rounded-full bg-[#10B981] hover:bg-[#059669] text-white font-bold shadow-xl flex items-center gap-2 transform hover:scale-105 transition-all cursor-pointer"
                >
                  <Sparkles className="w-5 h-5" />
                  Capture & Analyze Waste
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
          {isScanning && (
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-md text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#10B981]/10 flex items-center justify-center text-[#10B981] animate-spin">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">Scanning Waste Object</h4>
                <p className="text-sm text-gray-500 mt-1">{scanStepText}</p>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#10B981] h-full transition-all duration-300 animate-pulse w-3/4"></div>
              </div>
            </div>
          )}

          {!isScanning && currentScanResult && (
            <div className="space-y-4">
              {/* Multi-object Tab Header if > 1 items */}
              {currentScanResult.objects.length > 1 && (
                <div className="bg-[#0F2E23]/5 p-3 rounded-xl border border-[#0F2E23]/10">
                  <div className="text-xs font-bold uppercase text-[#0F2E23] mb-2 flex items-center justify-between">
                    <span>{currentScanResult.objects.length} Objects Detected in Image</span>
                    <span className="text-gray-500 font-normal">Tap object to switch recommendation</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentScanResult.objects.map((obj) => (
                      <button
                        key={obj.id}
                        onClick={() => setSelectedObjectId(obj.id)}
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

              {/* Detailed Scan Result Component */}
              <ScanResultCard
                result={currentScanResult}
                activeObject={selectedObject || currentScanResult.objects[0]}
                onNavigateToMap={onNavigateToMap}
                onScanAnother={() => {
                  if (useCamera) {
                    setCurrentScanResult(null);
                  } else {
                    const nextIdx = (selectedSampleIndex + 1) % SAMPLE_SCANS.length;
                    handleSelectSample(nextIdx);
                  }
                }}
              />
            </div>
          )}

          {!isScanning && !currentScanResult && !useCamera && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 flex items-center justify-center text-[#10B981]">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Ready to Scan Waste</h3>
              <p className="text-sm text-gray-600">
                Select a sample scan above, open your camera, or upload a photo to experience AI Waste Intelligence.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScannerInterface;

