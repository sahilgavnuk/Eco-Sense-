/**
 * wasteAI.ts — Client-side waste analysis using TensorFlow.js COCO-SSD
 * All 80 COCO classes mapped. Low threshold so almost nothing is missed.
 */

import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs';
import type { ScanResult, DetectedObject, WasteCategory, ContaminationLevel } from '../../types';

// ─── Singleton model cache ────────────────────────────────────────────────────
let modelPromise: Promise<cocoSsd.ObjectDetection> | null = null;

export function preloadModel(): Promise<cocoSsd.ObjectDetection> {
  if (!modelPromise) {
    modelPromise = (async () => {
      try {
        await tf.setBackend('webgl');
        await tf.ready();
      } catch {
        await tf.setBackend('cpu');
        await tf.ready();
      }
      return cocoSsd.load({ base: 'mobilenet_v2' });
    })();
  }
  return modelPromise;
}

// ─── Waste profile type ───────────────────────────────────────────────────────
interface WasteProfile {
  category: WasteCategory;
  material: string;
  condition: ContaminationLevel;
  disposal: string[];
  why: string;
}

// ─── ALL 80 COCO-SSD classes mapped to waste categories ──────────────────────
const LABEL_MAP: Record<string, WasteProfile> = {
  // ── E-Waste ──────────────────────────────────────────────────────────────
  tv: {
    category: 'E-Waste', material: 'Mixed Electronics (LCD, PCB, Metals)', condition: 'Mixed-material',
    disposal: ['Do NOT place at kerbside', 'Contact e-waste collection centre', 'Check retailer take-back scheme'],
    why: 'TVs contain hazardous materials including lead and mercury.',
  },
  laptop: {
    category: 'E-Waste', material: 'Mixed Electronics (Li-Ion, PCB, Aluminium)', condition: 'Mixed-material',
    disposal: ['Wipe personal data', 'Remove battery if possible', 'Drop at certified e-waste recycler'],
    why: 'Laptops contain hazardous materials and valuable recoverable metals.',
  },
  mouse: {
    category: 'E-Waste', material: 'ABS Plastic + PCB', condition: 'Mixed-material',
    disposal: ['Drop at an e-waste collection point', 'Check manufacturer take-back'],
    why: 'Contains circuit boards with hazardous materials.',
  },
  remote: {
    category: 'E-Waste', material: 'ABS Plastic + Batteries', condition: 'Mixed-material',
    disposal: ['Remove batteries and recycle separately', 'Take casing to e-waste point'],
    why: 'Batteries require separate hazardous waste disposal.',
  },
  keyboard: {
    category: 'E-Waste', material: 'ABS Plastic + PCB', condition: 'Mixed-material',
    disposal: ['Drop at an e-waste collection point', 'Check manufacturer take-back'],
    why: 'Electronics contain heavy metals not suitable for landfill.',
  },
  'cell phone': {
    category: 'E-Waste', material: 'Mixed Electronics (Li-Ion, Glass, Aluminium)', condition: 'Mixed-material',
    disposal: ['Remove SIM card and wipe personal data', 'Drop at authorized e-waste centre'],
    why: 'Phones contain toxic lithium and heavy metals.',
  },
  microwave: {
    category: 'E-Waste', material: 'Mixed Metal + Electronics', condition: 'Mixed-material',
    disposal: ['Contact municipal large-item collection', 'Many retailers offer appliance take-back'],
    why: 'Contains electronic components requiring specialist disposal.',
  },
  toaster: {
    category: 'E-Waste', material: 'Steel + Heating Element', condition: 'Mixed-material',
    disposal: ['Remove crumb tray', 'Drop at e-waste or small appliance collection point'],
    why: 'Toasters contain electrical components unsuitable for regular bins.',
  },
  'hair drier': {
    category: 'E-Waste', material: 'ABS Plastic + Motor', condition: 'Mixed-material',
    disposal: ['Drop at small appliance e-waste collection', 'Check local council recycling options'],
    why: 'Hair dryers contain motors and electrical wiring requiring e-waste handling.',
  },
  clock: {
    category: 'E-Waste', material: 'Mixed Plastic + Electronics', condition: 'Mixed-material',
    disposal: ['Remove battery first', 'Drop at e-waste collection point'],
    why: 'Clocks contain batteries and circuit boards requiring e-waste disposal.',
  },

  // ── Special Handling ─────────────────────────────────────────────────────
  oven: {
    category: 'Special Handling', material: 'Steel + Electronics', condition: 'Mixed-material',
    disposal: ['Contact municipal bulk waste collection', 'Scrap metal dealers may accept it'],
    why: 'Large appliances need special disposal routes.',
  },
  refrigerator: {
    category: 'Special Handling', material: 'Steel + Refrigerant Gases', condition: 'Mixed-material',
    disposal: ['Do NOT puncture — refrigerant gases are harmful', 'Contact licensed appliance disposal service'],
    why: 'Refrigerants are potent greenhouse gases requiring certified removal.',
  },
  sink: {
    category: 'Special Handling', material: 'Stainless Steel / Ceramic', condition: 'Clean',
    disposal: ['Contact municipal bulk waste for pick-up', 'Metal sinks can go to scrap dealers'],
    why: 'Sinks are large items needing bulk collection.',
  },
  chair: {
    category: 'Special Handling', material: 'Wood / Fabric / Metal', condition: 'Clean',
    disposal: ['Donate if in good condition', 'Contact bulk waste collection', 'Disassemble and sort materials'],
    why: 'Furniture is too large for regular bins.',
  },
  couch: {
    category: 'Special Handling', material: 'Fabric + Foam + Wood Frame', condition: 'Clean',
    disposal: ['Donate if usable', 'Book a bulk-waste collection with your municipality'],
    why: 'Sofas are bulky items needing separate large-item collection.',
  },
  bed: {
    category: 'Special Handling', material: 'Fabric + Metal Springs + Wood', condition: 'Clean',
    disposal: ['Mattress recyclers may accept', 'Book a bulk-waste collection service'],
    why: 'Beds contain mixed materials requiring specialized recycling.',
  },
  'dining table': {
    category: 'Special Handling', material: 'Wood / Glass / Metal', condition: 'Clean',
    disposal: ['Donate if usable', 'Contact bulk waste collection'],
    why: 'Large furniture items need special bulk collection.',
  },
  toilet: {
    category: 'Special Handling', material: 'Ceramic / Porcelain', condition: 'Clean',
    disposal: ['Contact municipal bulk waste service', 'Some builders may reuse ceramic'],
    why: 'Ceramic sanitary ware needs large-item collection.',
  },
  bicycle: {
    category: 'Special Handling', material: 'Steel / Aluminium', condition: 'Clean',
    disposal: ['Donate to charity if working', 'Take to scrap metal dealer', 'Contact cycle recycling schemes'],
    why: 'Bikes are valuable metal that can be donated or recycled.',
  },
  car: {
    category: 'Special Handling', material: 'Steel / Aluminium / Plastics / Fluids', condition: 'Mixed-material',
    disposal: ['Take to licensed vehicle dismantler', 'End-of-life vehicles must be properly deregistered'],
    why: 'Vehicles contain hazardous fluids and must be professionally dismantled.',
  },
  motorcycle: {
    category: 'Special Handling', material: 'Steel + Engine Components', condition: 'Mixed-material',
    disposal: ['Take to licensed vehicle dismantler', 'Contact council for collection'],
    why: 'Motorcycles contain oils and metals requiring licensed disposal.',
  },
  airplane: {
    category: 'Special Handling', material: 'Aluminium / Composites', condition: 'Mixed-material',
    disposal: ['Contact specialist aviation dismantler'],
    why: 'Aircraft require specialist decommissioning.',
  },
  bus: {
    category: 'Special Handling', material: 'Steel + Engine', condition: 'Mixed-material',
    disposal: ['Contact licensed vehicle dismantler'],
    why: 'Large vehicles require professional disposal.',
  },
  train: {
    category: 'Special Handling', material: 'Steel + Electronics', condition: 'Mixed-material',
    disposal: ['Contact rail authority for decommissioning'],
    why: 'Rail vehicles require specialist decommissioning.',
  },
  truck: {
    category: 'Special Handling', material: 'Steel + Engine', condition: 'Mixed-material',
    disposal: ['Contact licensed vehicle dismantler'],
    why: 'Large vehicles require professional disposal.',
  },
  boat: {
    category: 'Special Handling', material: 'Fibreglass / Steel', condition: 'Mixed-material',
    disposal: ['Contact harbour authority or specialist dismantler'],
    why: 'Boats contain fibreglass which requires specialist recycling.',
  },
  'traffic light': {
    category: 'Special Handling', material: 'Metal + Electronics + LEDs', condition: 'Mixed-material',
    disposal: ['Contact local council — do not remove yourself', 'Council handles road furniture disposal'],
    why: 'Traffic signals are public infrastructure requiring council management.',
  },
  'fire hydrant': {
    category: 'Special Handling', material: 'Cast Iron / Steel', condition: 'Clean',
    disposal: ['Contact local water authority', 'Do not remove — public infrastructure'],
    why: 'Fire hydrants are public infrastructure.',
  },
  'stop sign': {
    category: 'Special Handling', material: 'Aluminium + Reflective Film', condition: 'Clean',
    disposal: ['Contact local council for road sign disposal'],
    why: 'Road signs are public infrastructure managed by local councils.',
  },
  'parking meter': {
    category: 'Special Handling', material: 'Metal + Electronics', condition: 'Mixed-material',
    disposal: ['Contact local council', 'Do not remove — public property'],
    why: 'Parking meters are council property and e-waste.',
  },
  bench: {
    category: 'Special Handling', material: 'Wood / Metal / Concrete', condition: 'Clean',
    disposal: ['Contact council if damaged public bench', 'Donate or repurpose if private'],
    why: 'Benches are large mixed-material items.',
  },
  suitcase: {
    category: 'Special Handling', material: 'ABS Plastic / Polycarbonate', condition: 'Clean',
    disposal: ['Donate if usable', 'Contact municipal bulk waste for pick-up'],
    why: 'Suitcases are large mixed-material items.',
  },
  skis: {
    category: 'Special Handling', material: 'Fibreglass + Metal Edges', condition: 'Mixed-material',
    disposal: ['Donate to ski charities if usable', 'Check specialist sports equipment recyclers'],
    why: 'Ski composites are difficult to recycle in standard streams.',
  },
  snowboard: {
    category: 'Special Handling', material: 'Fibreglass + Wood Core', condition: 'Mixed-material',
    disposal: ['Donate if usable', 'Check specialist sports recyclers'],
    why: 'Composite sports equipment requires specialist recycling.',
  },
  surfboard: {
    category: 'Special Handling', material: 'Foam + Fibreglass + Epoxy', condition: 'Mixed-material',
    disposal: ['Contact surf board recycling programmes', 'Some shapers accept old boards'],
    why: 'Surfboards use foam and epoxy resin that cannot go in standard recycling.',
  },

  // ── Dry / Recyclable ─────────────────────────────────────────────────────
  bottle: {
    category: 'Dry / Recyclable', material: 'PET Plastic / Glass', condition: 'Clean',
    disposal: ['Rinse the bottle to remove residue', 'Remove cap and label if possible', 'Place in the blue recycling bin'],
    why: 'Bottles are typically made of recyclable PET plastic or glass.',
  },
  'wine glass': {
    category: 'Dry / Recyclable', material: 'Glass', condition: 'Clean',
    disposal: ['Wrap in newspaper to prevent breakage', 'Place in glass recycling bin'],
    why: 'Glass is 100% recyclable without quality loss.',
  },
  bowl: {
    category: 'Dry / Recyclable', material: 'Glass / Ceramic / Plastic', condition: 'Clean',
    disposal: ['Rinse thoroughly', 'Ceramic goes to general waste; glass/plastic to recycling'],
    why: 'Material type determines recycling route.',
  },
  vase: {
    category: 'Dry / Recyclable', material: 'Glass / Ceramic', condition: 'Clean',
    disposal: ['Glass vases go to glass recycling bin', 'Ceramic goes to general waste or donation'],
    why: 'Glass is recyclable; ceramics generally are not in standard streams.',
  },
  book: {
    category: 'Dry / Recyclable', material: 'Paper / Cardboard', condition: 'Clean',
    disposal: ['Donate if in good condition', 'Place in paper recycling bin otherwise'],
    why: 'Paper and cardboard are among the most recycled materials.',
  },
  frisbee: {
    category: 'Dry / Recyclable', material: 'HDPE Plastic', condition: 'Clean',
    disposal: ['Check plastic type (usually #2 HDPE)', 'Place in plastic recycling if accepted locally'],
    why: 'HDPE plastic is widely recyclable.',
  },
  'sports ball': {
    category: 'Non-Recyclable', material: 'Rubber + Synthetic Leather', condition: 'Clean',
    disposal: ['Donate to charity if still usable', 'General waste bin if worn out'],
    why: 'Sports balls are mixed materials (rubber + synthetic) not accepted in standard recycling.',
  },
  kite: {
    category: 'Non-Recyclable', material: 'Nylon + Plastic + String', condition: 'Mixed-material',
    disposal: ['General waste bin', 'Remove metal parts for metal recycling'],
    why: 'Kites are mixed synthetic materials not easily recyclable.',
  },
  fork: {
    category: 'Dry / Recyclable', material: 'Stainless Steel / Plastic', condition: 'Clean',
    disposal: ['Metal fork: place in metal recycling', 'Plastic fork: general waste'],
    why: 'Metal cutlery is recyclable; single-use plastic cutlery is not.',
  },
  knife: {
    category: 'Hazardous', material: 'Stainless Steel', condition: 'Clean',
    disposal: ['Wrap blade in thick cardboard and tape', 'Take to metal recycler or knife amnesty bin'],
    why: 'Bladed items pose serious injury risk to waste handlers.',
  },
  spoon: {
    category: 'Dry / Recyclable', material: 'Stainless Steel / Plastic', condition: 'Clean',
    disposal: ['Metal spoon: metal recycling', 'Plastic spoon: general waste'],
    why: 'Metal cutlery is recyclable.',
  },

  // ── Non-Recyclable ───────────────────────────────────────────────────────
  cup: {
    category: 'Non-Recyclable', material: 'Paper + Plastic Lining', condition: 'Slightly Contaminated',
    disposal: ['Disposable cups have plastic lining — do not recycle', 'Place in general waste bin'],
    why: 'Most disposable cups have a plastic lining making them non-recyclable.',
  },
  backpack: {
    category: 'Non-Recyclable', material: 'Nylon / Polyester', condition: 'Clean',
    disposal: ['Donate if still usable', 'Textile recycling bin if worn out'],
    why: 'Synthetic fabric backpacks cannot go in standard recycling.',
  },
  umbrella: {
    category: 'Non-Recyclable', material: 'Nylon + Metal Frame', condition: 'Mixed-material',
    disposal: ['Remove metal frame for metal recycling', 'Fabric goes to textile recycling or general waste'],
    why: 'Umbrellas are mixed materials needing disassembly before disposal.',
  },
  handbag: {
    category: 'Non-Recyclable', material: 'Leather / Synthetic Fabric', condition: 'Clean',
    disposal: ['Donate if usable', 'Drop at textile recycling point'],
    why: 'Leather and synthetic bags require textile recycling pathways.',
  },
  tie: {
    category: 'Non-Recyclable', material: 'Silk / Polyester', condition: 'Clean',
    disposal: ['Donate if usable', 'Textile recycling or general waste'],
    why: 'Fabric ties need textile recycling rather than standard recycling.',
  },
  'baseball bat': {
    category: 'Non-Recyclable', material: 'Wood / Aluminium / Composite', condition: 'Clean',
    disposal: ['Donate if usable', 'Wood bat: general waste or compost', 'Metal bat: metal recycling'],
    why: 'Material type varies — check before disposing.',
  },
  'baseball glove': {
    category: 'Non-Recyclable', material: 'Leather', condition: 'Clean',
    disposal: ['Donate if usable', 'Leather goods to textile/leather recycling'],
    why: 'Leather goods require textile recycling pathways.',
  },
  skateboard: {
    category: 'Non-Recyclable', material: 'Maple Wood + Aluminium Trucks', condition: 'Mixed-material',
    disposal: ['Donate if usable', 'Separate wood deck and metal trucks', 'Metal to scrap, wood to general waste'],
    why: 'Composite sports equipment needs disassembly before disposal.',
  },
  'tennis racket': {
    category: 'Non-Recyclable', material: 'Carbon Fibre / Graphite + String', condition: 'Clean',
    disposal: ['Donate if usable', 'General waste — composites are difficult to recycle'],
    why: 'Carbon fibre composites are not recyclable in standard streams.',
  },
  'teddy bear': {
    category: 'Non-Recyclable', material: 'Synthetic Fabric + Stuffing', condition: 'Clean',
    disposal: ['Donate to charity if in good condition', 'Textile recycling or general waste'],
    why: 'Stuffed toys are mixed synthetic materials.',
  },
  toothbrush: {
    category: 'Non-Recyclable', material: 'Nylon + Plastic Handle', condition: 'Slightly Contaminated',
    disposal: ['Not accepted in standard recycling', 'Send to specialist toothbrush recycling programmes (e.g. TerraCycle)', 'Otherwise general waste'],
    why: 'Toothbrushes are made of mixed plastics not accepted in kerb-side recycling.',
  },

  // ── Wet / Organic ────────────────────────────────────────────────────────
  banana: {
    category: 'Wet / Organic', material: 'Fruit / Organic Matter', condition: 'Clean',
    disposal: ['Place in green composting bin', 'Can be home-composted'],
    why: 'Fruit peels are biodegradable organic waste.',
  },
  apple: {
    category: 'Wet / Organic', material: 'Fruit / Organic Matter', condition: 'Clean',
    disposal: ['Place in green composting bin', 'Can be home-composted'],
    why: 'Fruit is biodegradable and ideal for composting.',
  },
  sandwich: {
    category: 'Wet / Organic', material: 'Food Waste', condition: 'Slightly Contaminated',
    disposal: ['Place in food-waste / green bin', 'Avoid contaminating dry recyclables with food'],
    why: 'Food waste is organic and should be composted or sent to biogas plants.',
  },
  orange: {
    category: 'Wet / Organic', material: 'Fruit / Organic Matter', condition: 'Clean',
    disposal: ['Place in green composting bin'],
    why: 'Citrus peels are organic matter suitable for composting.',
  },
  broccoli: {
    category: 'Wet / Organic', material: 'Vegetable / Organic Matter', condition: 'Clean',
    disposal: ['Place in green composting bin'],
    why: 'Vegetables are biodegradable organic waste.',
  },
  carrot: {
    category: 'Wet / Organic', material: 'Vegetable / Organic Matter', condition: 'Clean',
    disposal: ['Place in green composting bin'],
    why: 'Root vegetables compost efficiently.',
  },
  'hot dog': {
    category: 'Wet / Organic', material: 'Food Waste', condition: 'Slightly Contaminated',
    disposal: ['Place in food-waste bin', 'Do not put cooked meat in home compost'],
    why: 'Cooked meat scraps go to food waste bins, not home compost.',
  },
  pizza: {
    category: 'Wet / Organic', material: 'Food Waste', condition: 'Slightly Contaminated',
    disposal: ['Food waste bin for leftovers', 'Greasy pizza boxes in general waste, not recycling'],
    why: 'Grease contaminates paper recycling streams.',
  },
  donut: {
    category: 'Wet / Organic', material: 'Food Waste', condition: 'Clean',
    disposal: ['Place in food-waste / green composting bin'],
    why: 'Baked goods are organic waste best composted.',
  },
  cake: {
    category: 'Wet / Organic', material: 'Food Waste', condition: 'Clean',
    disposal: ['Place in food-waste / green composting bin'],
    why: 'Food scraps are organic waste best composted.',
  },
  'potted plant': {
    category: 'Wet / Organic', material: 'Soil + Organic Matter + Plastic Pot', condition: 'Mixed-material',
    disposal: ['Compost or garden-waste bin for soil and plant matter', 'Recycle plastic pot if clean'],
    why: 'Plant matter is organic; plastic pots may be recyclable.',
  },

  // ── Hazardous ────────────────────────────────────────────────────────────
  scissors: {
    category: 'Hazardous', material: 'Stainless Steel', condition: 'Clean',
    disposal: ['Wrap in thick tape or cardboard to cover blades', 'Take to a metal recycling facility'],
    why: 'Sharp objects pose injury risk to waste handlers.',
  },

  // ── Animals / People — not waste ──────────────────────────────────────────
  person: {
    category: 'Non-Recyclable', material: 'N/A', condition: 'Unknown',
    disposal: ['This is a person, not waste!', 'Please point the camera at a waste item'],
    why: 'No waste object detected — a person was identified instead.',
  },
  bird: {
    category: 'Wet / Organic', material: 'Organic Matter', condition: 'Clean',
    disposal: ['This appears to be a living animal', 'Not a waste item — please scan an actual waste object'],
    why: 'Living animals are not waste.',
  },
  cat: {
    category: 'Wet / Organic', material: 'Organic Matter', condition: 'Clean',
    disposal: ['This is a living animal, not waste!', 'Please scan an actual waste item'],
    why: 'Living animals are not waste.',
  },
  dog: {
    category: 'Wet / Organic', material: 'Organic Matter', condition: 'Clean',
    disposal: ['This is a living animal, not waste!', 'Please scan an actual waste item'],
    why: 'Living animals are not waste.',
  },
  horse: {
    category: 'Wet / Organic', material: 'Organic Matter', condition: 'Clean',
    disposal: ['This is a living animal, not waste!', 'Please scan an actual waste item'],
    why: 'Living animals are not waste.',
  },
  sheep: {
    category: 'Wet / Organic', material: 'Organic Matter', condition: 'Clean',
    disposal: ['This is a living animal, not waste!', 'Please scan an actual waste item'],
    why: 'Living animals are not waste.',
  },
  cow: {
    category: 'Wet / Organic', material: 'Organic Matter', condition: 'Clean',
    disposal: ['This is a living animal, not waste!', 'Please scan an actual waste item'],
    why: 'Living animals are not waste.',
  },
  elephant: {
    category: 'Wet / Organic', material: 'Organic Matter', condition: 'Clean',
    disposal: ['This is a living animal, not waste!', 'Please scan an actual waste item'],
    why: 'Living animals are not waste.',
  },
  bear: {
    category: 'Wet / Organic', material: 'Organic Matter', condition: 'Clean',
    disposal: ['This is a living animal, not waste!', 'Please scan an actual waste item'],
    why: 'Living animals are not waste.',
  },
  zebra: {
    category: 'Wet / Organic', material: 'Organic Matter', condition: 'Clean',
    disposal: ['This is a living animal, not waste!', 'Please scan an actual waste item'],
    why: 'Living animals are not waste.',
  },
  giraffe: {
    category: 'Wet / Organic', material: 'Organic Matter', condition: 'Clean',
    disposal: ['This is a living animal, not waste!', 'Please scan an actual waste item'],
    why: 'Living animals are not waste.',
  },

  // ── Default fallback ──────────────────────────────────────────────────────
  default: {
    category: 'Non-Recyclable', material: 'Mixed / Unknown Material', condition: 'Unknown',
    disposal: ['Identify the material type before disposal', 'When in doubt, place in general waste bin'],
    why: 'Object type is known but not in our specific waste map — defaults to general waste guidance.',
  },
};

function getProfile(label: string): WasteProfile {
  return LABEL_MAP[label.toLowerCase()] ?? LABEL_MAP['default'];
}

// ─── Convert dataURL → HTMLImageElement ───────────────────────────────────────
function dataUrlToImageElement(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}

// ─── Build ScanResult from predictions ───────────────────────────────────────
function buildResult(
  predictions: cocoSsd.DetectedObject[],
  imgW: number,
  imgH: number,
  dataUrl: string,
  telemetryOptIn: boolean,
  zone: string
): ScanResult {
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
        x: Math.max(0, Math.round((bx / imgW) * 100)),
        y: Math.max(0, Math.round((by / imgH) * 100)),
        w: Math.min(100, Math.round((bw / imgW) * 100)),
        h: Math.min(100, Math.round((bh / imgH) * 100)),
      },
      condition: profile.condition,
      disposalRecommendation: profile.disposal,
      whyExplanation: profile.why,
    };
  });

  // Hard fallback when truly nothing detected at any threshold
  if (objects.length === 0) {
    objects.push({
      id: `obj-1-${Date.now()}`,
      label: 'Unidentified Object',
      category: 'Non-Recyclable',
      material: 'Unknown',
      confidence: 0,
      box: { x: 5, y: 5, w: 90, h: 90 },
      condition: 'Unknown',
      disposalRecommendation: [
        'Could not identify the specific item',
        'Check material label or packaging',
        'When in doubt, place in general waste bin',
        'Contact your local recycling centre for advice',
      ],
      whyExplanation:
        'The AI could not confidently identify this object. Try a clearer, closer photo with good lighting.',
    });
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
    explainableAI:
      objects[0]?.label === 'Unidentified Object'
        ? 'No specific waste object was detected. Try a clearer or closer photo.'
        : `Detected ${objects.length} item(s): ${objects.map((o) => `${o.label} (${o.confidence}%)`).join(', ')}.`,
    anonymizedTelemetryOptIn: telemetryOptIn,
    zone,
  };
}

// ─── Exported scan functions ──────────────────────────────────────────────────

export async function scanDataUrl(
  dataUrl: string,
  telemetryOptIn: boolean,
  zone: string
): Promise<ScanResult> {
  const [model, imgEl] = await Promise.all([preloadModel(), dataUrlToImageElement(dataUrl)]);
  const w = imgEl.naturalWidth || imgEl.width || 640;
  const h = imgEl.naturalHeight || imgEl.height || 480;

  // Try with permissive threshold first (catches most objects)
  let predictions = await model.detect(imgEl, 20, 0.15);

  // If nothing found, try with very low threshold (catches even uncertain detections)
  if (predictions.length === 0) {
    predictions = await model.detect(imgEl, 10, 0.05);
  }

  return buildResult(predictions, w, h, dataUrl, telemetryOptIn, zone);
}

export async function scanImageElement(
  imageEl: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  telemetryOptIn: boolean,
  zone: string
): Promise<ScanResult> {
  const model = await preloadModel();
  const w =
    imageEl instanceof HTMLVideoElement ? imageEl.videoWidth || 640
    : imageEl instanceof HTMLImageElement ? imageEl.naturalWidth || imageEl.width || 640
    : imageEl.width || 640;
  const h =
    imageEl instanceof HTMLVideoElement ? imageEl.videoHeight || 480
    : imageEl instanceof HTMLImageElement ? imageEl.naturalHeight || imageEl.height || 480
    : imageEl.height || 480;

  let predictions = await model.detect(imageEl, 20, 0.15);
  if (predictions.length === 0) {
    predictions = await model.detect(imageEl, 10, 0.05);
  }

  return buildResult(predictions, w, h, '', telemetryOptIn, zone);
}
