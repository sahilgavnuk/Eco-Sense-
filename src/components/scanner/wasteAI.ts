/**
 * wasteAI.ts — Real waste analysis using Google Gemini Vision API
 * Sends the image to Gemini and gets structured waste classification back.
 */

import type { ScanResult, DetectedObject, WasteCategory, ContaminationLevel } from '../../types';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

// ─── Prompt ──────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are EcoSense AI, an expert waste classification system. Analyze the image and identify all visible waste items or objects.

For each detected object, classify it using these exact waste categories:
- "Dry / Recyclable" — plastic bottles, cardboard, paper, glass bottles, metal cans
- "Wet / Organic" — food scraps, fruit, vegetables, plant matter
- "Non-Recyclable" — composite packaging, styrofoam, dirty wrappers, mixed materials  
- "E-Waste" — phones, laptops, batteries, cables, electronics
- "Hazardous" — chemicals, paint, sharp objects, medical waste
- "Special Handling" — large appliances, furniture, tyres

Respond ONLY with a valid JSON object in this exact structure (no markdown, no explanation):
{
  "objects": [
    {
      "label": "Human-readable object name",
      "category": "one of the 6 categories above",
      "material": "specific material e.g. PET Plastic / Kraft Cardboard / Li-Ion Battery",
      "confidence": 85,
      "condition": "Clean | Slightly Contaminated | Heavily Contaminated | Mixed-material",
      "box": { "x": 10, "y": 10, "w": 80, "h": 80 },
      "disposalRecommendation": ["Step 1", "Step 2", "Step 3"],
      "whyExplanation": "One sentence explaining the classification reasoning."
    }
  ],
  "overallSummary": "Brief summary of what was scanned and key action.",
  "zone": "Zone 2 — Central District"
}

Important rules:
- box values are percentages (0-100) estimating where the object is in the image
- confidence is 0-100 based on how certain you are
- disposalRecommendation must have 2-4 actionable steps
- If image is unclear or no waste found, still return the JSON with a single object with label "No waste detected"
- Detect multiple objects if present, each as a separate entry`;

// ─── Convert image to base64 ──────────────────────────────────────────────────

function imageElementToBase64(
  el: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): { base64: string; mimeType: string } {
  const canvas = document.createElement('canvas');

  if (el instanceof HTMLVideoElement) {
    canvas.width = el.videoWidth || 640;
    canvas.height = el.videoHeight || 480;
    canvas.getContext('2d')?.drawImage(el, 0, 0);
  } else if (el instanceof HTMLImageElement) {
    canvas.width = el.naturalWidth || el.width || 800;
    canvas.height = el.naturalHeight || el.height || 600;
    canvas.getContext('2d')?.drawImage(el, 0, 0);
  } else {
    canvas.width = el.width;
    canvas.height = el.height;
    canvas.getContext('2d')?.drawImage(el, 0, 0);
  }

  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  const base64 = dataUrl.split(',')[1];
  return { base64, mimeType: 'image/jpeg' };
}

// Also supports raw dataURL string (from file upload)
function dataUrlToBase64(dataUrl: string): { base64: string; mimeType: string } {
  const [header, base64] = dataUrl.split(',');
  const mimeType = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  return { base64, mimeType };
}

// ─── Call Gemini API ──────────────────────────────────────────────────────────

async function callGeminiVision(base64: string, mimeType: string): Promise<string> {
  const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: SYSTEM_PROMPT },
            {
              inlineData: {
                mimeType,
                data: base64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topK: 32,
        topP: 1,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      `Gemini API error ${response.status}: ${(err as { error?: { message?: string } }).error?.message ?? response.statusText}`
    );
  }

  const data = await response.json() as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return text;
}

// ─── Parse Gemini Response ────────────────────────────────────────────────────

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
}

function parseGeminiResponse(rawText: string): GeminiResponse {
  // Strip markdown code fences if present
  const cleaned = rawText
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim();

  try {
    return JSON.parse(cleaned) as GeminiResponse;
  } catch {
    // Try to extract JSON from within the text
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]) as GeminiResponse;
    }
    throw new Error('Could not parse Gemini response as JSON');
  }
}

// ─── Main Scan Function ───────────────────────────────────────────────────────

export async function scanImageElement(
  imageEl: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  telemetryOptIn: boolean,
  zone: string
): Promise<ScanResult> {
  const { base64, mimeType } = imageElementToBase64(imageEl);
  return runScan(base64, mimeType, '', telemetryOptIn, zone);
}

export async function scanDataUrl(
  dataUrl: string,
  telemetryOptIn: boolean,
  zone: string
): Promise<ScanResult> {
  const { base64, mimeType } = dataUrlToBase64(dataUrl);
  return runScan(base64, mimeType, dataUrl, telemetryOptIn, zone);
}

async function runScan(
  base64: string,
  mimeType: string,
  imageUrl: string,
  telemetryOptIn: boolean,
  zone: string
): Promise<ScanResult> {
  const rawText = await callGeminiVision(base64, mimeType);
  const parsed = parseGeminiResponse(rawText);

  const rawObjects: GeminiObject[] = parsed.objects ?? [];

  const objects: DetectedObject[] = rawObjects.map((obj, idx) => ({
    id: `obj-${idx + 1}-${Date.now()}`,
    label: obj.label ?? 'Unknown Item',
    category: obj.category ?? 'Non-Recyclable',
    material: obj.material ?? 'Unknown Material',
    confidence: Math.min(100, Math.max(0, obj.confidence ?? 75)),
    box: {
      x: obj.box?.x ?? 10,
      y: obj.box?.y ?? 10,
      w: obj.box?.w ?? 80,
      h: obj.box?.h ?? 80,
    },
    condition: obj.condition ?? 'Unknown',
    disposalRecommendation: obj.disposalRecommendation ?? ['Dispose in General Waste'],
    whyExplanation: obj.whyExplanation ?? 'AI classification based on visual analysis.',
  }));

  // Pick highest-confidence object as primary
  const primary = [...objects].sort((a, b) => b.confidence - a.confidence)[0];

  return {
    id: `scan-${Date.now()}`,
    timestamp: new Date().toISOString(),
    imageUrl,
    primaryCategory: primary?.category ?? 'Non-Recyclable',
    primaryCondition: primary?.condition ?? 'Unknown',
    overallRecommendation: primary?.disposalRecommendation ?? ['Dispose responsibly'],
    explainableAI:
      parsed.overallSummary ??
      `Detected ${objects.length} item(s): ${objects.map((o) => `${o.label} (${o.confidence}%)`).join(', ')}.`,
    anonymizedTelemetryOptIn: telemetryOptIn,
    zone: parsed.zone ?? zone,
    objects,
  };
}
