// api/scan.js — Vercel Serverless Function
// Proxies Gemini Vision API calls server-side so the API key is never exposed to the browser.

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent';

const SYSTEM_PROMPT = `You are EcoSense AI, an expert waste classification system. Analyze the image and identify ALL visible waste items or objects — even if there are many.

For each detected object, classify it using these exact waste categories:
- "Dry / Recyclable" — plastic bottles, cardboard, paper, glass bottles, metal cans, tins
- "Wet / Organic" — food scraps, fruit, vegetables, plant matter, food packaging with food residue
- "Non-Recyclable" — composite packaging, styrofoam, dirty wrappers, mixed materials, fabric
- "E-Waste" — phones, laptops, batteries, cables, electronics, chargers, remotes
- "Hazardous" — chemicals, paint, sharp objects, medical waste, aerosols
- "Special Handling" — large appliances, furniture, tyres, mattresses

Respond ONLY with a valid JSON object in this exact structure (no markdown, no explanation):
{
  "objects": [
    {
      "label": "Human-readable object name (be specific e.g. 'Plastic Water Bottle' not just 'Bottle')",
      "category": "one of the 6 categories above",
      "material": "specific material e.g. PET Plastic / Kraft Cardboard / Li-Ion Battery",
      "confidence": 85,
      "condition": "Clean | Slightly Contaminated | Heavily Contaminated | Mixed-material",
      "box": { "x": 10, "y": 10, "w": 80, "h": 80 },
      "disposalRecommendation": ["Step 1", "Step 2", "Step 3"],
      "whyExplanation": "One sentence explaining the classification reasoning."
    }
  ],
  "overallSummary": "Brief summary of what was scanned and the key action to take.",
  "zone": "Zone 2 — Central District"
}

Rules:
- box values are percentages (0-100) showing where in the image the object is
- confidence is 0-100 based on certainty
- disposalRecommendation must have 2-4 specific, actionable steps
- Detect EVERY object in the image, even partial ones
- If image is unclear, still return JSON with your best guess and low confidence
- ALWAYS return at least 1 object — never return an empty objects array`;

export default async function handler(req, res) {
  // CORS headers
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
      error: 'Gemini API key not configured on server. Please add GEMINI_API_KEY (or VITE_GEMINI_API_KEY) in your Vercel project Environment Variables.',
    });
  }

  const { base64, mimeType } = req.body;
  if (!base64 || !mimeType) {
    return res.status(400).json({ error: 'Missing base64 or mimeType in request body.' });
  }

  try {
    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
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
          temperature: 0.2,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!geminiRes.ok) {
      const err = await geminiRes.json().catch(() => ({}));
      return res.status(geminiRes.status).json({
        error: `Gemini API error ${geminiRes.status}: ${err?.error?.message ?? geminiRes.statusText}`,
      });
    }

    const data = await geminiRes.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    // Parse JSON from Gemini response
    const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        return res.status(500).json({ error: 'Could not parse Gemini response as JSON', raw: rawText });
      }
    }

    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
}
