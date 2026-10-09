// api/chat.js — Vercel Serverless Function & Local Dev Handler
// Industrial-grade EcoSense AI Copilot powered by Google Gemini 3.x Flash with multi-model failover

const CANDIDATE_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.7-flash',
  'gemini-3.8-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite'
];

const SYSTEM_INSTRUCTION = `You are EcoSense Copilot, a certified Senior Environmental Engineer, Waste Management Specialist, and the official AI assistant for the EcoSense AI Platform.

Your expertise covers:
1. Waste Segregation & 4-Bin Municipal Color Codes:
   - 🔵 Blue Bin: Clean Dry Recyclables (rigid plastic bottles #1-#7, clean paper/cardboard, aluminum/tin cans, glass jars).
   - 🟢 Green Bin: Wet Organic Waste (food scraps, vegetable peels, fruit waste, coffee grounds, garden leaves, compostable matter).
   - 🔴 Red Bin / Special Collection: Domestic Hazardous & E-Waste (batteries, old phones/cables, electronics, CFL/tube lights, paint cans, expired medicines, sanitary/diaper waste).
   - ⚫ Black Bin: Non-Recyclable Reject (soiled plastic films, multilayer composite chip/snack wrappers, thermocol/styrofoam).
2. Local Regional Protocols (Maharashtra & Western India):
   - Zone 1 (Kokan Coastal Region): High-humidity organic composting, coastal litter prevention, coconut coir recycling.
   - Zone 2 (Nalasopara East/West & Virar): High-density urban collection, door-to-door dry waste segregation, plastic packaging recovery.
3. EcoSense AI Platform Features:
   - AI Waste Scanner: Computer-vision powered instant classification of materials with bounding boxes & contamination checks.
   - Analytics & Route Optimization: Smart bin fill-level heatmaps, fuel-efficient municipal truck routing.
   - Community Challenges & Eco-Points: Gamified citizen participation, leaderboard rewards, green badges.
   - Citizen Report Portal: Report illegal dumping spots with photo verification and municipal tracking.

Guidelines:
- Give clear, practical, numbered steps and actionable advice.
- Use bold text for bin colors (🔵 **Blue Bin**, 🟢 **Green Bin**, 🔴 **Red Bin**, ⚫ **Black Bin**) and key actions.
- If asked in Marathi (मराठी), reply completely in clean, natural, helpful Marathi.
- If asked in English, reply in professional, concise, and friendly English.
- Always provide safety warnings when batteries, hazardous chemicals, or medical sharps are mentioned.`;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'Gemini API key is not configured. Please set GEMINI_API_KEY in your environment variables.',
    });
  }

  const { query, history = [], language = 'en' } = req.body || {};
  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'Missing or invalid "query" string in request body.' });
  }

  const cleanQuery = query.trim();
  const langInstruction = language === 'mr'
    ? 'User preferred language: Marathi (मराठी). Reply fully in Marathi.'
    : 'User preferred language: English. Reply in English.';

  // Build clean alternating history
  const contents = [];
  if (Array.isArray(history)) {
    for (const msg of history.slice(-8)) {
      if (!msg.text || typeof msg.text !== 'string') continue;
      const role = msg.sender === 'user' ? 'user' : 'model';
      // Prevent consecutive duplicate roles
      if (contents.length > 0 && contents[contents.length - 1].role === role) {
        contents[contents.length - 1].parts[0].text += `\n${msg.text}`;
      } else {
        contents.push({
          role,
          parts: [{ text: msg.text }]
        });
      }
    }
  }

  // Ensure last message is from user
  if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
    contents[contents.length - 1].parts[0].text += `\n${cleanQuery}`;
  } else {
    contents.push({
      role: 'user',
      parts: [{ text: cleanQuery }]
    });
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

        if (geminiRes.status === 503 || geminiRes.status === 429) {
          const errBody = await geminiRes.json().catch(() => ({}));
          lastError = errBody?.error?.message || `Status ${geminiRes.status}`;
          await wait(350 * attempt);
          continue;
        }

        if (!geminiRes.ok) {
          const errBody = await geminiRes.json().catch(() => ({}));
          lastError = errBody?.error?.message || geminiRes.statusText;
          break; // Try next candidate model
        }

        const data = await geminiRes.json();
        const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (replyText && replyText.trim()) {
          // Dynamic follow-up chips
          const followups = language === 'mr'
            ? ['कचरा वर्गीकरण कसे करावे?', 'बॅटरी कुठे जमा करावी?', 'खतनिर्मितीचे नियम']
            : ['Which bin does this go in?', 'How to safely dispose batteries?', 'Composting tips'];

          return res.status(200).json({
            reply: replyText.trim(),
            sources: [
              'EcoSense AI Intelligence 2026',
              'CPCB Waste Rules 2016',
              'Maharashtra Municipal Guidelines'
            ],
            suggestedFollowups: followups
          });
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }
  }

  // If all models failed upstream, return clear error for client to retry
  return res.status(502).json({
    error: `AI service temporarily unavailable (${lastError || 'High Demand'}). Please tap retry.`,
  });
}
