// api/scan.js — Vercel Serverless Function
// High accuracy waste detection using Gemini Vision with multi-model failover

const CANDIDATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-2.5-pro',
  'gemini-1.5-pro'
];

const SYSTEM_PROMPT = `You are EcoSense AI, an expert computer vision waste classification system.
Your job is to accurately detect, identify, and categorize the ACTUAL waste items present in the uploaded image.

Look carefully at the image:
1. Identify the specific real item (e.g. "Coca Cola Plastic Bottle", "Crushed Cardboard Delivery Box", "Used AA Battery", "Half-eaten Apple Core", "Styrofoam Food Container", "Broken Smartphone Screen"). DO NOT guess or return generic placeholders.
2. Accurately assign it to one of these 6 standard waste categories:
   - "Dry / Recyclable" (clean PET bottles, HDPE jugs, clean cardboard/paper, aluminum cans, glass bottles/jars)
   - "Wet / Organic" (food leftovers, vegetable peels, fruit scraps, coffee grounds, garden clippings)
   - "Non-Recyclable" (soiled plastic films, composite wrappers, chip bags, multi-layer pouches, styrofoam/thermocol)
   - "E-Waste" (phones, chargers, cables, circuit boards, batteries, electronic appliances)
   - "Hazardous" (household chemicals, paints, motor oil, batteries, aerosol cans, syringes/medical waste)
   - "Special Handling" (bulky furniture, tires, mattresses, construction debris)

3. Detect the approximate bounding box percentages (x, y, w, h from 0 to 100).
4. Provide 3 concrete, step-by-step disposal instructions.
5. Provide a 1-2 sentence explanation of why this classification and disposal route was selected based on material properties and local municipal recycling codes.

Respond ONLY with valid JSON in this exact structure without markdown backticks:
{
  "objects": [
    {
      "label": "Exact Item Name",
      "category": "one of the 6 categories above",
      "material": "Specific material (e.g. PET Plastic #1, Corrugated Cardboard, Aluminum, Li-ion)",
      "confidence": 92,
      "condition": "Clean | Slightly Contaminated | Heavily Contaminated | Mixed-material",
      "box": { "x": 10, "y": 10, "w": 80, "h": 80 },
      "disposalRecommendation": ["1. Step one", "2. Step two", "3. Step three"],
      "whyExplanation": "Clear factual explanation of why this belongs here."
    }
  ],
  "overallSummary": "Brief overview of what was identified and the main action.",
  "zone": "Zone 2 — Central District"
}`;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'Gemini API key not configured on server. Add GEMINI_API_KEY in Vercel Environment Variables.',
    });
  }

  const { base64, mimeType } = req.body;
  if (!base64 || !mimeType) {
    return res.status(400).json({ error: 'Missing base64 or mimeType in request body.' });
  }

  let lastError = null;

  for (const model of CANDIDATE_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const geminiRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: SYSTEM_PROMPT },
                  { inlineData: { mimeType, data: base64 } },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              topK: 32,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }),
        });

        if (geminiRes.status === 503 || geminiRes.status === 429) {
          const errData = await geminiRes.json().catch(() => ({}));
          lastError = errData?.error?.message || `Status ${geminiRes.status}`;
          await wait(400 * attempt);
          continue;
        }

        if (!geminiRes.ok) {
          const errData = await geminiRes.json().catch(() => ({}));
          lastError = errData?.error?.message || geminiRes.statusText;
          break; // Switch to next model
        }

        const data = await geminiRes.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

        const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
        let parsed;
        try {
          parsed = JSON.parse(cleaned);
        } catch {
          const match = cleaned.match(/\{[\s\S]*\}/);
          if (match) {
            parsed = JSON.parse(match[0]);
          } else {
            throw new Error('Failed to parse model output as JSON');
          }
        }

        if (parsed && Array.isArray(parsed.objects) && parsed.objects.length > 0) {
          return res.status(200).json(parsed);
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }
  }

  return res.status(500).json({
    error: `AI analysis service error: ${lastError || 'Could not classify image'}. Please try again.`
  });
}
