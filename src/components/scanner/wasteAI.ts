/**
 * wasteAI.ts — Waste analysis via /api/scan serverless function.
 * The browser never touches the Gemini API key directly.
 * All AI calls go through the Vercel serverless proxy at /api/scan.
 */

import type { ScanResult, DetectedObject, WasteCategory, ContaminationLevel } from '../../types';

// ─── Types from Gemini response ───────────────────────────────────────────────
interface GeminiObject {
  label?: string;
  category?: WasteCategory;
  material?: string;
  confidence?: number;
  condition?: ContaminationLevel;
  box?: { x?: number; y?: number; w?: number; h?: number };
  disposalRecommendation?: string[];
  whyExplanation?: string;
}

interface GeminiResponse {
  objects?: GeminiObject[];
  overallSummary?: string;
  zone?: string;
  error?: string;
}

// ─── Convert dataURL to base64 + mimeType ─────────────────────────────────────
function dataUrlToBase64(dataUrl: string): { base64: string; mimeType: string } {
  const [header, base64] = dataUrl.split(',');
  const mimeType = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  return { base64, mimeType };
}

// ─── Resize large images before sending to keep request small ─────────────────
async function resizeDataUrl(dataUrl: string, maxWidth = 1024): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => resolve(dataUrl); // fallback: use original
    img.src = dataUrl;
  });
}

// ─── Call /api/scan proxy ─────────────────────────────────────────────────────
async function callScanAPI(base64: string, mimeType: string): Promise<GeminiResponse> {
  const res = await fetch('/api/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64, mimeType }),
  });

  const data: GeminiResponse = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? `Server error ${res.status}`);
  }
  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}

// ─── Build ScanResult from Gemini parsed response ─────────────────────────────
function buildResult(
  parsed: GeminiResponse,
  imageUrl: string,
  telemetryOptIn: boolean,
  zone: string
): ScanResult {
  const rawObjects: GeminiObject[] = parsed.objects ?? [];

  const objects: DetectedObject[] = rawObjects.map((obj, idx) => ({
    id: `obj-${idx + 1}-${Date.now()}`,
    label: obj.label ?? 'Unknown Item',
    category: obj.category ?? 'Non-Recyclable',
    material: obj.material ?? 'Unknown Material',
    confidence: Math.min(100, Math.max(0, obj.confidence ?? 70)),
    box: {
      x: obj.box?.x ?? 10,
      y: obj.box?.y ?? 10,
      w: obj.box?.w ?? 80,
      h: obj.box?.h ?? 80,
    },
    condition: obj.condition ?? 'Unknown',
    disposalRecommendation: obj.disposalRecommendation?.length
      ? obj.disposalRecommendation
      : ['Dispose in general waste bin'],
    whyExplanation: obj.whyExplanation ?? 'AI classification based on visual analysis.',
  }));

  if (objects.length === 0) {
    objects.push({
      id: `obj-fallback-${Date.now()}`,
      label: 'Unknown Item',
      category: 'Non-Recyclable',
      material: 'Unknown',
      confidence: 0,
      box: { x: 5, y: 5, w: 90, h: 90 },
      condition: 'Unknown',
      disposalRecommendation: ['Could not identify item', 'Try a clearer, closer photo', 'Check material label or packaging'],
      whyExplanation: 'No items were detected. Try better lighting or a closer shot.',
    });
  }

  const primary = [...objects].sort((a, b) => b.confidence - a.confidence)[0];

  return {
    id: `scan-${Date.now()}`,
    timestamp: new Date().toISOString(),
    imageUrl,
    objects,
    primaryCategory: primary.category,
    primaryCondition: primary.condition,
    overallRecommendation: primary.disposalRecommendation,
    explainableAI:
      parsed.overallSummary ??
      `Detected ${objects.length} item(s): ${objects.map((o) => `${o.label} (${o.confidence}%)`).join(', ')}.`,
    anonymizedTelemetryOptIn: telemetryOptIn,
    zone: parsed.zone ?? zone,
  };
}

// ─── Exported: scan a dataURL (from upload or camera capture) ─────────────────
export async function scanDataUrl(
  dataUrl: string,
  telemetryOptIn: boolean,
  zone: string
): Promise<ScanResult> {
  const resized = await resizeDataUrl(dataUrl, 1024);
  const { base64, mimeType } = dataUrlToBase64(resized);
  const parsed = await callScanAPI(base64, mimeType);
  return buildResult(parsed, dataUrl, telemetryOptIn, zone);
}

// ─── Dummy preloadModel (no longer needed, kept for API compatibility) ─────────
export function preloadModel(): Promise<void> {
  return Promise.resolve();
}
