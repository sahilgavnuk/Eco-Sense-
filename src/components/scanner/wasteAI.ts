/**
 * wasteAI.ts — Real object detection using TensorFlow COCO-SSD
 * Maps detected objects → waste categories + disposal guidance
 */

import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import type { ScanResult, DetectedObject, WasteCategory, ContaminationLevel } from '../../types';

// ─── Waste Intelligence Mapping ──────────────────────────────────────────────

interface WasteProfile {
  category: WasteCategory;
  material: string;
  condition: ContaminationLevel;
  disposalRecommendation: string[];
  whyExplanation: string;
}

const WASTE_PROFILES: Record<string, WasteProfile> = {
  // Plastic / Recyclable
  bottle: {
    category: 'Dry / Recyclable',
    material: 'PET (Polyethylene Terephthalate)',
    condition: 'Slightly Contaminated',
    disposalRecommendation: ['Empty liquid contents', 'Rinse with water', 'Replace cap', 'Place in Blue/Recyclable Bin'],
    whyExplanation: 'PET plastic bottles are Grade-1 recyclable polymers. Rinsing removes residue that causes contamination at sorting facilities.',
  },
  cup: {
    category: 'Non-Recyclable',
    material: 'Polycoat Paper / Plastic Liner',
    condition: 'Slightly Contaminated',
    disposalRecommendation: ['Do not recycle (has plastic liner)', 'Dispose in Black/Non-Recyclable Bin'],
    whyExplanation: 'Disposable cups have a thin plastic polyethylene lining that prevents standard paper recycling.',
  },
  bowl: {
    category: 'Non-Recyclable',
    material: 'Polycoat Paper / PS Foam',
    condition: 'Slightly Contaminated',
    disposalRecommendation: ['Discard food residue', 'Place in Non-Recyclable Bin'],
    whyExplanation: 'Food-contaminated bowls typically cannot be recycled. PS foam is non-recyclable in most facilities.',
  },

  // Food / Organic
  apple: {
    category: 'Wet / Organic',
    material: 'Compostable Organic Matter',
    condition: 'Mixed-material',
    disposalRecommendation: ['Place in Green/Wet Waste Bin', 'Compost at home if available'],
    whyExplanation: 'Fruit waste is 100% compostable and generates valuable biogas or compost when processed correctly.',
  },
  orange: {
    category: 'Wet / Organic',
    material: 'Compostable Organic Matter',
    condition: 'Clean',
    disposalRecommendation: ['Place in Green/Wet Waste Bin', 'Compost at home if available'],
    whyExplanation: 'Citrus peels are compostable and rich in nitrogen for organic processing.',
  },
  banana: {
    category: 'Wet / Organic',
    material: 'Compostable Organic Matter',
    condition: 'Clean',
    disposalRecommendation: ['Place in Green/Wet Waste Bin', 'Use as compost or worm feed'],
    whyExplanation: 'Banana peels decompose rapidly and are excellent compost material.',
  },
  broccoli: {
    category: 'Wet / Organic',
    material: 'Compostable Organic Matter',
    condition: 'Clean',
    disposalRecommendation: ['Scrape into Green/Wet Waste Bin'],
    whyExplanation: 'Vegetable matter is fully compostable. Avoid mixing with non-organic waste.',
  },
  carrot: {
    category: 'Wet / Organic',
    material: 'Compostable Organic Matter',
    condition: 'Clean',
    disposalRecommendation: ['Scrape into Green/Wet Waste Bin'],
    whyExplanation: 'Root vegetables compost quickly and add nutrients to soil.',
  },
  sandwich: {
    category: 'Wet / Organic',
    material: 'Mixed Food Waste',
    condition: 'Mixed-material',
    disposalRecommendation: ['Discard in Wet/Organic Bin', 'Remove any packaging first'],
    whyExplanation: 'Food waste should be separated from packaging before composting.',
  },
  pizza: {
    category: 'Wet / Organic',
    material: 'Mixed Food Waste',
    condition: 'Mixed-material',
    disposalRecommendation: ['Dispose of food in Wet Waste Bin', 'Recycle clean cardboard box separately'],
    whyExplanation: 'Greasy pizza boxes are not recyclable but the food itself is compostable.',
  },
  'hot dog': {
    category: 'Wet / Organic',
    material: 'Organic Food Waste',
    condition: 'Mixed-material',
    disposalRecommendation: ['Discard in Wet/Organic Waste Bin'],
    whyExplanation: 'Processed food waste is compostable.',
  },
  cake: {
    category: 'Wet / Organic',
    material: 'Organic Food Waste',
    condition: 'Mixed-material',
    disposalRecommendation: ['Scrape food into Wet Waste Bin', 'Rinse and recycle any packaging'],
    whyExplanation: 'Baked food waste is compostable. Separate any foil or plastic packaging first.',
  },
  donut: {
    category: 'Wet / Organic',
    material: 'Organic Food Waste',
    condition: 'Mixed-material',
    disposalRecommendation: ['Discard in Wet/Organic Waste Bin'],
    whyExplanation: 'Baked goods decompose readily in organic waste processing.',
  },

  // Paper / Cardboard
  book: {
    category: 'Dry / Recyclable',
    material: 'Cellulose Paper / Cardboard',
    condition: 'Clean',
    disposalRecommendation: ['Donate if in good condition', 'Place in Paper Recycling Bin', 'Remove hardcover if present'],
    whyExplanation: 'Paper books are recyclable as paper fiber. Hardcovers may contain non-paper materials and should be separated.',
  },
  'cell phone': {
    category: 'E-Waste',
    material: 'PCB / Li-Ion Battery / Glass',
    condition: 'Clean',
    disposalRecommendation: ['Do NOT place in regular trash', 'Take to E-Waste collection center', 'Consider manufacturer take-back program'],
    whyExplanation: 'Smartphones contain lithium, cobalt, and rare-earth metals that require specialized e-waste recovery to prevent toxic soil contamination.',
  },
  laptop: {
    category: 'E-Waste',
    material: 'PCB / Li-Ion Battery / Aluminum',
    condition: 'Clean',
    disposalRecommendation: ['Wipe personal data first', 'Take to authorized E-Waste facility', 'Check for manufacturer recycling program'],
    whyExplanation: 'Laptops contain hazardous heavy metals and rechargeable batteries that must be processed at certified e-waste facilities.',
  },
  keyboard: {
    category: 'E-Waste',
    material: 'ABS Plastic / PCB',
    condition: 'Slightly Contaminated',
    disposalRecommendation: ['Take to E-Waste collection point', 'Do not place in regular bin'],
    whyExplanation: 'Electronic peripherals contain circuit boards with trace heavy metals.',
  },
  mouse: {
    category: 'E-Waste',
    material: 'ABS Plastic / PCB / Wiring',
    condition: 'Slightly Contaminated',
    disposalRecommendation: ['Take to E-Waste collection point'],
    whyExplanation: 'Computer mice contain electronic components requiring proper e-waste disposal.',
  },
  'remote control': {
    category: 'E-Waste',
    material: 'ABS Plastic / PCB / Batteries',
    condition: 'Slightly Contaminated',
    disposalRecommendation: ['Remove batteries separately (battery recycling)', 'Take device to E-Waste bin'],
    whyExplanation: 'Remote controls contain circuit boards and batteries — both requiring specialized disposal.',
  },
  'tv monitor': {
    category: 'E-Waste',
    material: 'LCD Glass / PCB / Plastic Housing',
    condition: 'Clean',
    disposalRecommendation: ['Contact municipal bulk e-waste pickup', 'Take to E-Waste facility'],
    whyExplanation: 'Monitors contain hazardous LCD panels and circuit boards that cannot go in regular waste.',
  },

  // Batteries
  battery: {
    category: 'Hazardous',
    material: 'Lithium / Alkaline / Lead-Acid',
    condition: 'Clean',
    disposalRecommendation: ['Never throw in regular bin', 'Take to battery drop-off point', 'Check retailer take-back programs'],
    whyExplanation: 'Batteries contain corrosive acids, heavy metals, and reactive lithium that are toxic to soil and water.',
  },

  // Clothing / Textile
  tie: {
    category: 'Dry / Recyclable',
    material: 'Polyester / Cotton Textile',
    condition: 'Clean',
    disposalRecommendation: ['Donate if usable', 'Take to textile recycling bin', 'Do NOT place in paper recycling'],
    whyExplanation: 'Textiles should go to dedicated clothing banks or recyclers, not general recycling.',
  },
  'teddy bear': {
    category: 'Non-Recyclable',
    material: 'Mixed Textile / Polyfill',
    condition: 'Clean',
    disposalRecommendation: ['Donate if in good condition', 'Place in General Waste if damaged'],
    whyExplanation: 'Stuffed toys contain mixed materials and synthetic filling that cannot be recycled conventionally.',
  },

  // Glass
  wine_glass: {
    category: 'Dry / Recyclable',
    material: 'Borosilicate / Soda-Lime Glass',
    condition: 'Slightly Contaminated',
    disposalRecommendation: ['Rinse out residue', 'Place in Glass Recycling Bin', 'Do not mix with broken glass'],
    whyExplanation: 'Glass is 100% infinitely recyclable. Keep intact to avoid safety hazards at sorting plants.',
  },
  vase: {
    category: 'Dry / Recyclable',
    material: 'Soda-Lime Glass / Ceramic',
    condition: 'Clean',
    disposalRecommendation: ['Donate if intact', 'Glass: place in Glass Bin', 'Ceramic: General Waste'],
    whyExplanation: 'Standard glass vases are recyclable. Ceramic glazed items are not recyclable.',
  },

  // Furniture / Large items
  chair: {
    category: 'Non-Recyclable',
    material: 'Mixed Wood / Fabric / Metal',
    condition: 'Clean',
    disposalRecommendation: ['Donate or sell if usable', 'Schedule bulk waste municipal pickup', 'Separate metal parts for scrap recycling'],
    whyExplanation: 'Composite furniture cannot be recycled through regular streams — municipal bulk waste or donation is best.',
  },
  couch: {
    category: 'Non-Recyclable',
    material: 'Mixed Fabric / Foam / Wood Frame',
    condition: 'Clean',
    disposalRecommendation: ['Donate if usable', 'Schedule bulk waste collection', 'Contact specialized furniture recycler'],
    whyExplanation: 'Upholstered furniture contains mixed materials requiring specialized handling.',
  },
  'potted plant': {
    category: 'Wet / Organic',
    material: 'Organic Plant Matter / Soil',
    condition: 'Clean',
    disposalRecommendation: ['Compost plant matter in Green Bin', 'Recycle or reuse pot separately', 'Donate if live plant'],
    whyExplanation: 'Plant and soil matter is compostable. Plastic or ceramic pots should be handled separately.',
  },

  // Bags
  'handbag': {
    category: 'Non-Recyclable',
    material: 'Leather / Synthetic Polymer',
    condition: 'Clean',
    disposalRecommendation: ['Donate if usable', 'Place in General Waste if damaged'],
    whyExplanation: 'Leather and synthetic handbags are not recyclable through standard streams.',
  },
  backpack: {
    category: 'Non-Recyclable',
    material: 'Nylon / Polyester Textile',
    condition: 'Clean',
    disposalRecommendation: ['Donate if usable', 'Place in General Waste if worn out'],
    whyExplanation: 'Mixed textile bags are best donated or placed in general waste if beyond use.',
  },
  suitcase: {
    category: 'Non-Recyclable',
    material: 'ABS Plastic / Polycarbonate',
    condition: 'Clean',
    disposalRecommendation: ['Donate if usable', 'Contact hard-sided luggage recyclers', 'General Waste as last resort'],
    whyExplanation: 'Hard-shell luggage is made of tough thermoplastics that are difficult to recycle conventionally.',
  },

  // Sports / Misc
  'sports ball': {
    category: 'Non-Recyclable',
    material: 'Rubber / Synthetic Latex',
    condition: 'Clean',
    disposalRecommendation: ['Donate if usable', 'Check rubber recycling programs', 'General Waste'],
    whyExplanation: 'Sports balls are made of rubber compounds not accepted by standard recycling streams.',
  },
  frisbee: {
    category: 'Dry / Recyclable',
    material: 'LDPE / HDPE Plastic',
    condition: 'Clean',
    disposalRecommendation: ['Place in Plastic Recycling Bin', 'Check for resin code on item'],
    whyExplanation: 'Hard disc-like plastic frisbees are typically recyclable hard plastics.',
  },
  scissors: {
    category: 'Non-Recyclable',
    material: 'Stainless Steel / Plastic Handle',
    condition: 'Clean',
    disposalRecommendation: ['Donate if usable', 'Take metal parts to metal scrap', 'Do not place in regular recycling'],
    whyExplanation: 'Sharp objects cannot go in regular recycling due to safety risks. Donate or take to metal scrap.',
  },
  knife: {
    category: 'Hazardous',
    material: 'Stainless Steel',
    condition: 'Clean',
    disposalRecommendation: ['Wrap in thick paper/tape for safety', 'Take to metal scrap yard', 'Donate if usable'],
    whyExplanation: 'Sharp blades pose an injury risk in recycling bins. Wrap carefully and take to metal recycling.',
  },
  fork: {
    category: 'Dry / Recyclable',
    material: 'Stainless Steel / Plastic',
    condition: 'Slightly Contaminated',
    disposalRecommendation: ['Rinse food residue', 'Metal fork → Metal scrap/recycling', 'Plastic fork → Non-Recyclable Bin'],
    whyExplanation: 'Metal cutlery can be recycled as scrap metal. Plastic cutlery is typically non-recyclable.',
  },
  spoon: {
    category: 'Dry / Recyclable',
    material: 'Stainless Steel / Plastic',
    condition: 'Slightly Contaminated',
    disposalRecommendation: ['Rinse food residue', 'Metal spoon → Metal scrap/recycling', 'Plastic spoon → Non-Recyclable Bin'],
    whyExplanation: 'Metal cutlery can be recycled as scrap metal.',
  },
  toothbrush: {
    category: 'Non-Recyclable',
    material: 'Nylon / Polypropylene',
    condition: 'Heavily Contaminated',
    disposalRecommendation: ['Check for manufacturer mail-back programs', 'General Waste Bin as last resort'],
    whyExplanation: 'Toothbrushes are made of mixed plastics and nylon bristles that cannot be separated for standard recycling.',
  },
  umbrella: {
    category: 'Non-Recyclable',
    material: 'Metal Frame / Polyester Fabric',
    condition: 'Clean',
    disposalRecommendation: ['Donate if usable', 'Separate metal frame for scrap', 'Fabric → General Waste'],
    whyExplanation: 'Umbrellas are composite items. Metal frames can be recycled as scrap if separated.',
  },
};

const DEFAULT_PROFILE: WasteProfile = {
  category: 'Non-Recyclable',
  material: 'Unknown Composite Material',
  condition: 'Unknown',
  disposalRecommendation: ['Identify the material', 'Check local recycling guidelines', 'If unsure, place in General Waste'],
  whyExplanation: 'Unable to determine precise waste category. When in doubt, dispose in general waste to avoid contaminating recycling streams.',
};

// ─── Model Singleton ──────────────────────────────────────────────────────────

let modelInstance: cocoSsd.ObjectDetection | null = null;

export async function loadModel(): Promise<cocoSsd.ObjectDetection> {
  if (!modelInstance) {
    modelInstance = await cocoSsd.load({ base: 'mobilenet_v2' });
  }
  return modelInstance;
}

// ─── Main Scan Function ───────────────────────────────────────────────────────

export async function scanImageElement(
  imageEl: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  telemetryOptIn: boolean,
  zone: string
): Promise<ScanResult> {
  const model = await loadModel();
  const predictions = await model.detect(imageEl);

  const objects: DetectedObject[] = predictions.map((pred, idx) => {
    const labelKey = pred.class.toLowerCase();
    const profile = WASTE_PROFILES[labelKey] ?? DEFAULT_PROFILE;

    // Convert pixel bounding box → percentages
    let imgW = 1, imgH = 1;
    if (imageEl instanceof HTMLImageElement) {
      imgW = imageEl.naturalWidth || imageEl.width || 800;
      imgH = imageEl.naturalHeight || imageEl.height || 600;
    } else if (imageEl instanceof HTMLVideoElement) {
      imgW = imageEl.videoWidth || imageEl.clientWidth || 640;
      imgH = imageEl.videoHeight || imageEl.clientHeight || 480;
    } else if (imageEl instanceof HTMLCanvasElement) {
      imgW = imageEl.width;
      imgH = imageEl.height;
    }

    const [bx, by, bw, bh] = pred.bbox;
    const boxPct = {
      x: Math.round((bx / imgW) * 100),
      y: Math.round((by / imgH) * 100),
      w: Math.round((bw / imgW) * 100),
      h: Math.round((bh / imgH) * 100),
    };

    return {
      id: `obj-${idx + 1}-${Date.now()}`,
      label: pred.class.charAt(0).toUpperCase() + pred.class.slice(1),
      category: profile.category,
      material: profile.material,
      confidence: Math.round(pred.score * 100),
      box: boxPct,
      condition: profile.condition,
      disposalRecommendation: profile.disposalRecommendation,
      whyExplanation: profile.whyExplanation,
    };
  });

  // If nothing detected, return a friendly "nothing found" result
  if (objects.length === 0) {
    return {
      id: `scan-${Date.now()}`,
      timestamp: new Date().toISOString(),
      imageUrl: '',
      primaryCategory: 'Non-Recyclable',
      primaryCondition: 'Unknown',
      overallRecommendation: ['No waste objects detected', 'Try a clearer image or different angle', 'Ensure item is well-lit and centered'],
      explainableAI: 'The AI scanner could not detect any recognizable waste objects in this image. Try a clearer photo with better lighting.',
      anonymizedTelemetryOptIn: telemetryOptIn,
      zone,
      objects: [{
        id: 'obj-none',
        label: 'No Object Detected',
        category: 'Non-Recyclable',
        material: 'Unknown',
        confidence: 0,
        box: { x: 10, y: 10, w: 80, h: 80 },
        condition: 'Unknown',
        disposalRecommendation: ['Try again with a clearer image'],
        whyExplanation: 'No recognizable waste item was detected. Make sure the item fills the frame and lighting is good.',
      }],
    };
  }

  // Use the highest-confidence detection as primary
  const primary = [...objects].sort((a, b) => b.confidence - a.confidence)[0];
  const primaryProfile = WASTE_PROFILES[primary.label.toLowerCase()] ?? DEFAULT_PROFILE;

  return {
    id: `scan-${Date.now()}`,
    timestamp: new Date().toISOString(),
    imageUrl: '',
    primaryCategory: primary.category,
    primaryCondition: primary.condition,
    overallRecommendation: primaryProfile.disposalRecommendation,
    explainableAI: `Detected ${objects.length} object(s): ${objects.map(o => `${o.label} (${o.confidence}%)`).join(', ')}. ${primary.whyExplanation}`,
    anonymizedTelemetryOptIn: telemetryOptIn,
    zone,
    objects,
  };
}
