// api/chat.js — Secure Serverless Function for EcoSense AI Chatbot
// Runs securely on Vercel and local Vite dev server. Keeps API keys hidden from frontend.

const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.7-flash',
  'gemini-3.6-flash'
];

const SYSTEM_INSTRUCTION = `You are EcoSense AI Copilot, a certified Senior Environmental Engineer and the helpful official assistant for the EcoSense AI platform.

Your primary topics of expertise:
1. Waste Segregation & 4-Bin Municipal Guidelines:
   - 🔵 Blue Bin (Dry Recyclables): Clean plastic bottles & containers (#1-#7), paper, cardboard boxes, aluminum/tin cans, glass jars.
   - 🟢 Green Bin (Wet Organics): Kitchen food waste, fruit & vegetable peels, tea leaves, compostable organic scraps.
   - 🔴 Red Bin (Domestic Hazardous & E-Waste): Old batteries, electronic gadgets, charging cables, tube lights, paints, chemicals, expired medicines, sanitary items.
   - ⚫ Black Bin (Non-Recyclable Reject): Greasy food packaging, multi-layer metallized snack wrappers, thermocol/styrofoam.
2. Composting & Organic Waste Processing:
   - Home composting techniques: layering greens (nitrogen) and browns (carbon: dry leaves, coco peat, cardboard shreds), turning every 4-5 days, managing moisture.
   - Odor control, bio-enzymes, vermicomposting, and municipal wet waste processing.
3. Regional Context (Maharashtra & India):
   - Zone 1 (Kokan Region): Coastal composting, wet waste biomethanation, marine litter prevention.
   - Zone 2 (Nalasopara & Virar): High-density urban collection, door-to-door dry waste segregation.
4. EcoSense AI Platform Capabilities:
   - AI Waste Scanner (image-based classification of materials & contamination check).
   - Analytics & Route Optimization (smart bin fill-level mapping & optimized collection).
   - Community Challenges & Eco-Points (rewards for waste segregation & civic actions).
   - Citizen Report Portal (reporting illegal dumping with geolocation).

Guidelines:
- Give direct, helpful, and concise answers with bullet points or numbered steps.
- Use bold highlights for bin colors (e.g. 🔵 **Blue Bin**, 🟢 **Green Bin**, 🔴 **Red Bin**, ⚫ **Black Bin**).
- If the user writes in Marathi (मराठी), answer completely in clean, natural Marathi.
- If the user writes in English, answer in polite, clear, professional English.`;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Please use POST.' });
  }

  // Get API key from environment
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not configured on the server. Please add your Gemini API key to your environment variables.',
    });
  }

  const { message, query, history = [], language = 'en' } = req.body || {};
  const userText = (message || query || '').trim();

  if (!userText) {
    return res.status(400).json({ error: 'Please enter a valid message.' });
  }

  const langInstruction = language === 'mr'
    ? 'User preferred language: Marathi (मराठी). Reply fully in Marathi.'
    : 'User preferred language: English. Reply in English.';

  // Build strictly alternating contents array
  const contents = [];
  if (Array.isArray(history)) {
    for (const msg of history.slice(-8)) {
      if (!msg || !msg.text) continue;
      const role = msg.sender === 'user' ? 'user' : 'model';
      if (contents.length > 0 && contents[contents.length - 1].role === role) {
        contents[contents.length - 1].parts[0].text += `\n${msg.text}`;
      } else {
        contents.push({ role, parts: [{ text: msg.text }] });
      }
    }
  }

  if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
    contents[contents.length - 1].parts[0].text += `\n${userText}`;
  } else {
    contents.push({ role: 'user', parts: [{ text: userText }] });
  }

  // Ensure first turn in contents is always from user
  while (contents.length > 0 && contents[0].role !== 'user') {
    contents.shift();
  }
  if (contents.length === 0) {
    contents.push({ role: 'user', parts: [{ text: userText }] });
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
            systemInstruction: {
              parts: [{ text: `${SYSTEM_INSTRUCTION}\n\n${langInstruction}` }]
            },
            contents,
            generationConfig: {
              temperature: 0.25,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
          }),
        });

        if (geminiRes.status === 429) {
          const errBody = await geminiRes.json().catch(() => ({}));
          lastError = errBody?.error?.message || `Quota limit on ${model}`;
          break; // Immediately fail over to next model
        }

        if (geminiRes.status === 503) {
          const errBody = await geminiRes.json().catch(() => ({}));
          lastError = errBody?.error?.message || `Service unavailable on ${model}`;
          await wait(200 * attempt);
          continue;
        }

        if (!geminiRes.ok) {
          const errBody = await geminiRes.json().catch(() => ({}));
          lastError = errBody?.error?.message || geminiRes.statusText;
          break; // Switch to next model
        }

        const data = await geminiRes.json();
        const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (replyText && replyText.trim()) {
          return res.status(200).json({
            reply: replyText.trim()
          });
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }
  }

  return res.status(502).json({
    error: `AI service unavailable (${lastError || 'High Demand'}). Please tap Retry to try again.`,
  });
}
