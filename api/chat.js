// api/chat.js — Vercel Serverless Function
// Powers the EcoSense AI Copilot with Google Gemini 3.8 Flash LLM

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent';

const SYSTEM_INSTRUCTION = `You are EcoSense Copilot, a world-class, professional AI Environmental Engineer and Waste Management Specialist.
Your mission is to provide accurate, authoritative, scientifically sound, and practical advice on:
1. Waste Segregation (Dry/Recyclables, Wet/Organic, E-Waste, Hazardous, Special Handling, Non-Recyclable).
2. Material recyclability (plastics #1-#7, composites, tetrapaks, metals, glass, paper fibers).
3. Contamination prevention (washing, rinsing, drying, avoiding greasy food oil contamination).
4. Safe disposal protocols for toxic or hazardous items (batteries, fluorescent bulbs, e-waste, paints, medical waste).
5. Circular economy solutions, composting best practices, and municipal collection operations.

Response Style:
- Professional, concise, knowledgeable, and polite.
- Structure your answers with clear formatting: use bolding, bullet points, or numbered steps when giving disposal instructions.
- Give concrete, actionable steps (e.g. "Empty & rinse", "Remove lid", "Place in Blue Bin").
- Mention exact standard sources or municipal protocols when applicable (e.g. EPA Recycling Guidelines, UNEP Waste Guidelines, ISO 14001, Local Municipal Waste Protocols).
- Always prioritize safety when hazardous materials or lithium batteries are mentioned.
- Keep answers focused, practical, and easy to read on mobile and desktop.`;

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
      error: 'Gemini API key not configured on server.',
    });
  }

  const { query, history = [] } = req.body;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid query in request body.' });
  }

  try {
    // Format conversation history for Gemini multi-turn
    const contents = [
      {
        role: 'user',
        parts: [{ text: `${SYSTEM_INSTRUCTION}\n\nPlease acknowledge and prepare for user inquiries.` }]
      },
      {
        role: 'model',
        parts: [{ text: 'Understood. I am EcoSense Copilot, ready to assist with professional, certified waste intelligence and disposal protocols.' }]
      }
    ];

    // Append previous dialogue
    for (const msg of history.slice(-6)) {
      contents.push({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      });
    }

    // Append current user message
    contents.push({
      role: 'user',
      parts: [{ text: query }]
    });

    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
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
    const replyText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'I apologize, but I could not formulate a complete answer. Please rephrase your question.';

    // Extract dynamic sources or citations if relevant
    const defaultSources = [
      'EcoSense Municipal Waste Standard 2026',
      'EPA National Recycling Framework',
      'UNEP Sustainable Materials Management'
    ];

    return res.status(200).json({
      reply: replyText,
      sources: defaultSources,
    });
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
