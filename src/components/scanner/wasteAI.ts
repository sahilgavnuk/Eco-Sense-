/**
 * wasteAI.ts — Client-side waste analysis using TensorFlow.js COCO-SSD
 * Runs entirely in the browser — no API key, no server, works on Vercel.
 */

import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import type { ScanResult, DetectedObject, WasteCategory, ContaminationLevel } from '../../types';

// ─── Singleton model cache ────────────────────────────────────────────────────

let modelPromise: Promise<cocoSsd.ObjectDetection> | null = null;

function getModel(): Promise<cocoSsd.ObjectDetection> {
  if (!modelPromise) {
    modelPromise = cocoSsd.load({ base: 'mobilenet_v2' });
  }
  return modelPromise;
}

// ─── COCO label → Waste category mapping ─────────────────────────────────────

interface WasteProfile {
  category: WasteCategory;
  material: string;
  condition: ContaminationLevel;
  disposal: string[];
  why: string;
}

const LABEL_MAP: Record<string, WasteProfile> = {
  // ── Dry / Recyclable ──────────────────────────────────────────────────
  bottle: {
    category: 'Dry / Recyclable',
    material: 'PET Plastic / Glass',
    condition: 'Clean',
    disposal: [
      'Rinse the bottle to remove residue',
      'Remove caps and labels if possible',
      'Place in the blue recycling bin',
    ],
    why: 'Bottles are typically made of recyclable PET plastic or glass.',
  },
  'wine glass': {
    category: 'Dry / Recyclable',
    material: 'Glass',
    condition: 'Clean',
    disposal: ['Wrap in newspaper to prevent breakage', 'Place in glass recycling bin'],
    why: 'Glass is 100% recyclable without quality loss.',
  },
  cup: {
    category: 'Non-Recyclable',
    material: 'Paper + Plastic Lining',
    condition: 'Slightly Contaminated',
    disposal: [
      'Disposable cups have a plastic lining — do not recycle',
      'Dispose in general waste bin',
    ],
    why: 'Most disposable cups have a plastic lining making them non-recyclable.',
  },
  book: {
    category: 'Dry / Recyclable',
    material: 'Paper / Cardboard',
    condition: 'Clean',
    disposal: ['Donate if in good condition', 'Otherwise place in paper recycling bin'],
    why: 'Paper and cardboard are among the most commonly recycled materials.',
  },
  'cell phone': {
    category: 'E-Waste',
    material: 'Mixed Electronics (Li-Ion, Glass, Aluminium)',
    condition: 'Mixed-material',
    disposal: [
      'Do NOT throw in regular bin',
      'Remove SIM card and wipe personal data',
      'Drop at an authorized e-waste collection centre',
    ],
    why: 'Phones contain toxic materials like lithium and heavy metals that require special handling.',
  },
  laptop: {
    category: 'E-Waste',
    material: 'Mixed Electronics (Li-Ion, PCB, Aluminium)',
    condition: 'Mixed-material',
    disposal: [
      'Back up and wipe all data',
      'Remove battery if possible',
      'Drop at certified e-waste recycler',
    ],
    why: 'Laptops contain hazardous materials and valuable recoverable metals.',
  },
  keyboard: {
    category: 'E-Waste',
    material: 'ABS Plastic + PCB',
    condition: 'Mixed-material',
    disposal: ['Drop at an e-waste collection point', 'Check manufacturer take-back programs'],
    why: 'Electronics contain heavy metals not suitable for landfill.',
  },
  mouse: {
    category: 'E-Waste',
    material: 'ABS Plastic + PCB',
    condition: 'Mixed-material',
    disposal: ['Drop at an e-waste collection point'],
    why: 'Contains circuit boards with hazardous materials.',
  },
  remote: {
    category: 'E-Waste',
    material: 'ABS Plastic + Batteries',
    condition: 'Mixed-material',
    disposal: ['Remove batteries and recycle separately', 'Take plastic casing to e-waste point'],
    why: 'Batteries require separate hazardous waste disposal.',
  },
  tv: {
    category: 'E-Waste',
    material: 'Mixed Electronics (LCD, PCB, Metals)',
    condition: 'Mixed-material',
    disposal: [
      'Do NOT place at kerbside',
      'Contact municipal bulk waste or e-waste pickup',
      'Check retailer take-back schemes',
    ],
    why: 'TVs contain hazardous materials including lead and mercury in older models.',
  },
  microwave: {
    category: 'Special Handling',
    material: 'Mixed Metal + Electronics',
    condition: 'Mixed-material',
    disposal: [
      'Contact municipal large-item collection',
      'Many retailers offer appliance take-back',
    ],
    why: 'Large appliances require special collection due to size and material complexity.',
  },
  oven: {
    category: 'Special Handling',
    material: 'Steel + Electronics',
    condition: 'Mixed-material',
    disposal: ['Contact municipal bulk waste collection', 'Scrap metal dealers may accept it'],
    why: 'Large appliances need special disposal routes.',
  },
  refrigerator: {
    category: 'Special Handling',
    material: 'Steel + Refrigerant Gases',
    condition: 'Mixed-material',
    disposal: [
      'Do NOT puncture — refrigerant gases are harmful',
      'Contact licensed appliance disposal service',
    ],
    why: 'Refrigerants are potent greenhouse gases requiring certified removal.',
  },
  chair: {
    category: 'Special Handling',
    material: 'Wood / Fabric / Metal',
    condition: 'Clean',
    disposal: [
      'Donate if in good condition',
      'Contact bulk waste collection for pick-up',
      'Disassemble and sort materials for recycling',
    ],
    why: 'Furniture is too large for regular bins and materials need sorting.',
  },
  couch: {
    category: 'Special Handling',
    material: 'Fabric + Foam + Wood Frame',
    condition: 'Clean',
    disposal: ['Donate if usable', 'Book a bulk-waste collection with your municipality'],
    why: 'Sofas are bulky items that need separate large-item collection.',
  },
  bed: {
    category: 'Special Handling',
    material: 'Fabric + Metal Springs + Wood',
    condition: 'Clean',
    disposal: [
      'Some mattress recyclers accept beds',
      'Book a bulk-waste collection service',
    ],
    why: 'Beds contain mixed materials requiring specialized recycling.',
  },
  // ── Wet / Organic ─────────────────────────────────────────────────────
  banana: {
    category: 'Wet / Organic',
    material: 'Fruit / Organic Matter',
    condition: 'Clean',
    disposal: ['Place in green composting bin', 'Can be home-composted'],
    why: 'Fruit peels are biodegradable organic waste.',
  },
  apple: {
    category: 'Wet / Organic',
    material: 'Fruit / Organic Matter',
    condition: 'Clean',
    disposal: ['Place in green composting bin', 'Can be home-composted'],
    why: 'Fruit is biodegradable and ideal for composting.',
  },
  orange: {
    category: 'Wet / Organic',
    material: 'Fruit / Organic Matter',
    condition: 'Clean',
    disposal: ['Place in green composting bin'],
    why: 'Citrus peels are organic matter suitable for composting.',
  },
  broccoli: {
    category: 'Wet / Organic',
    material: 'Vegetable / Organic Matter',
    condition: 'Clean',
    disposal: ['Place in green composting bin'],
    why: 'Vegetables are biodegradable organic waste.',
  },
  carrot: {
    category: 'Wet / Organic',
    material: 'Vegetable / Organic Matter',
    condition: 'Clean',
    disposal: ['Place in green composting bin'],
    why: 'Root vegetables compost efficiently.',
  },
  sandwich: {
    category: 'Wet / Organic',
    material: 'Food Waste',
    condition: 'Slightly Contaminated',
    disposal: ['Place in food-waste / green bin', 'Avoid contaminating dry recyclables with food'],
    why: 'Food waste is organic and should be composted or sent to biogas plants.',
  },
  pizza: {
    category: 'Wet / Organic',
    material: 'Food Waste',
    condition: 'Slightly Contaminated',
    disposal: ['Place in food-waste bin', 'Greasy pizza boxes go in general waste, not recycling'],
    why: 'Food waste is organic; greasy boxes contaminate paper recycling.',
  },
  cake: {
    category: 'Wet / Organic',
    material: 'Food Waste',
    condition: 'Clean',
    disposal: ['Place in food-waste / green composting bin'],
    why: 'Food scraps are organic waste best composted.',
  },
  // ── Hazardous ─────────────────────────────────────────────────────────
  scissors: {
    category: 'Hazardous',
    material: 'Stainless Steel',
    condition: 'Clean',
    disposal: [
      'Wrap in thick tape or cardboard to cover blades',
      'Take to a metal recycling facility',
    ],
    why: 'Sharp objects pose injury risk to waste handlers.',
  },
  knife: {
    category: 'Hazardous',
    material: 'Steel',
    condition: 'Clean',
    disposal: [
      'Wrap blade securely in cardboard and tape',
      'Take to a metal recycler or knife amnesty bin',
    ],
    why: 'Bladed items are hazardous and require safe packaging.',
  },
  // ── Default / Non-Recyclable ───────────────────────────────────────────
  default: {
    category: 'Non-Recyclable',
    material: 'Mixed / Unknown Material',
    condition: 'Unknown',
    disposal: [
      'Identify the material type before disposal',
      'When in doubt, place in general waste bin',
    ],
    why: 'Object could not be matched to a specific waste category.',
  },
};

function getProfile(label: string): WasteProfile {
  const key = label.toLowerCase();
  return LABEL_MAP[key] ?? LABEL_MAP['default'];
}

// ─── Convert image source to HTMLImageElement ─────────────────────────────────

function dataUrlToImageElement(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

// ─── Main exported scan functions ─────────────────────────────────────────────

export async function scanDataUrl(
  dataUrl: string,
  telemetryOptIn: boolean,
  zone: string
): Promise<ScanResult> {
  const [model, imgEl] = await Promise.all([getModel(), dataUrlToImageElement(dataUrl)]);

  const predictions = await model.detect(imgEl);

  // Map raw detections → DetectedObject
  const objects: DetectedObject[] = predictions.map((pred, idx) => {
    const [bx, by, bw, bh] = pred.bbox; // pixel values
    const imgW = imgEl.naturalWidth || imgEl.width || 640;
    const imgH = imgEl.naturalHeight || imgEl.height || 480;

    const profile = getProfile(pred.class);

    return {
      id: `obj-${idx + 1}-${Date.now()}`,
      label: pred.class.replace(/^\w/, (c) => c.toUpperCase()),
      category: profile.category,
      material: profile.material,
      confidence: Math.round(pred.score * 100),
      box: {
        x: Math.round((bx / imgW) * 100),
        y: Math.round((by / imgH) * 100),
        w: Math.round((bw / imgW) * 100),
        h: Math.round((bh / imgH) * 100),
      },
      condition: profile.condition,
      disposalRecommendation: profile.disposal,
      whyExplanation: profile.why,
    };
  });

  // If nothing detected, return a fallback
  if (objects.length === 0) {
    const fallback: DetectedObject = {
      id: `obj-1-${Date.now()}`,
      label: 'No Waste Detected',
      category: 'Non-Recyclable',
      material: 'Unknown',
      confidence: 0,
      box: { x: 10, y: 10, w: 80, h: 80 },
      condition: 'Unknown',
      disposalRecommendation: ['Could not detect a specific waste object — try a clearer photo'],
      whyExplanation: 'No objects were detected with sufficient confidence. Try uploading a clearer image.',
    };
    objects.push(fallback);
  }

  const primary = [...objects].sort((a, b) => b.confidence - a.confidence)[0];

  return {
    id: `scan-${Date.now()}`,
    timestamp: new Date().toISOString(),
    imageUrl: dataUrl,
    objects,
    primaryCategory: primary.category,
    primaryCondition: primary.condition,
    overallRecommendation: primary.disposalRecommendation,
    explainableAI: `Detected ${objects.length} item(s) using TensorFlow COCO-SSD: ${objects.map((o) => `${o.label} (${o.confidence}%)`).join(', ')}.`,
    anonymizedTelemetryOptIn: telemetryOptIn,
    zone,
  };
}

export async function scanImageElement(
  imageEl: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  telemetryOptIn: boolean,
  zone: string
): Promise<ScanResult> {
  const model = await getModel();
  const predictions = await model.detect(imageEl);

  const w =
    imageEl instanceof HTMLVideoElement
      ? imageEl.videoWidth || 640
      : imageEl instanceof HTMLImageElement
        ? imageEl.naturalWidth || imageEl.width || 640
        : imageEl.width || 640;
  const h =
    imageEl instanceof HTMLVideoElement
      ? imageEl.videoHeight || 480
      : imageEl instanceof HTMLImageElement
        ? imageEl.naturalHeight || imageEl.height || 480
        : imageEl.height || 480;

  const objects: DetectedObject[] = predictions.map((pred, idx) => {
    const [bx, by, bw, bh] = pred.bbox;
    const profile = getProfile(pred.class);
    return {
      id: `obj-${idx + 1}-${Date.now()}`,
      label: pred.class.replace(/^\w/, (c) => c.toUpperCase()),
      category: profile.category,
      material: profile.material,
      confidence: Math.round(pred.score * 100),
      box: {
        x: Math.round((bx / w) * 100),
        y: Math.round((by / h) * 100),
        w: Math.round((bw / w) * 100),
        h: Math.round((bh / h) * 100),
      },
      condition: profile.condition,
      disposalRecommendation: profile.disposal,
      whyExplanation: profile.why,
    };
  });

  if (objects.length === 0) {
    objects.push({
      id: `obj-1-${Date.now()}`,
      label: 'No Waste Detected',
      category: 'Non-Recyclable',
      material: 'Unknown',
      confidence: 0,
      box: { x: 10, y: 10, w: 80, h: 80 },
      condition: 'Unknown',
      disposalRecommendation: ['No object detected — move closer or improve lighting'],
      whyExplanation: 'No objects detected with sufficient confidence.',
    });
  }

  const primary = [...objects].sort((a, b) => b.confidence - a.confidence)[0];

  return {
    id: `scan-${Date.now()}`,
    timestamp: new Date().toISOString(),
    imageUrl: '',
    objects,
    primaryCategory: primary.category,
    primaryCondition: primary.condition,
    overallRecommendation: primary.disposalRecommendation,
    explainableAI: `Detected ${objects.length} item(s) using TensorFlow COCO-SSD: ${objects.map((o) => `${o.label} (${o.confidence}%)`).join(', ')}.`,
    anonymizedTelemetryOptIn: telemetryOptIn,
    zone,
  };
}
