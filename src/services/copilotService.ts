/**
 * copilotService.ts — Industrial-Grade AI Waste Copilot Engine
 * 1. Backend/Serverless API (/api/chat) with multi-model failover
 * 2. Direct Gemini fallback with official systemInstruction format
 * 3. Deep Domain Expert Rule Engine for offline resilience
 * 4. Full multilingual support (English + Marathi)
 */

export interface CopilotResponse {
  reply: string;
  sources: string[];
  suggestedFollowups?: string[];
  isAI?: boolean;
}

const SYSTEM_INSTRUCTION = `You are EcoSense Copilot, a certified Senior Environmental Engineer, Waste Management Specialist, and official AI assistant for the EcoSense AI platform.

Core Expertise:
1. 4-Bin Municipal Color Codes:
   - 🔵 Blue Bin: Clean Dry Recyclables (PET/HDPE plastic, paper, cardboard, cans, glass).
   - 🟢 Green Bin: Wet Organic Waste (food scraps, vegetable peels, compostable plant matter).
   - 🔴 Red Bin: Hazardous & E-Waste (batteries, electronics, chemicals, tube lights, expired medicines).
   - ⚫ Black Bin: Non-Recyclable Reject (soiled plastic, sanitary items, multilayer snack packets).
2. Regional Context (Maharashtra & Western India):
   - Zone 1 (Kokan Coastal Region): Organic composting, marine plastic debris prevention.
   - Zone 2 (NSP East/West & Virar): Urban segregation, door-to-door dry waste collection.
3. EcoSense AI Features:
   - AI Waste Scanner, Analytics Heatmaps, Route Optimization, Community Challenges, Citizen Dump Reporting.

Format:
- Use bold highlights, numbered actionable steps, and clear bullet points.
- If asked in Marathi, answer completely in natural, accurate Marathi (मराठी).
- If asked in English, answer in friendly, professional English.`;

// ─── Direct Gemini API Fallback ────────────────────────────────────────────────
export async function callGeminiDirect(
  query: string,
  history: { sender: string; text: string }[] = [],
  language: 'en' | 'mr' = 'en',
  apiKey: string
): Promise<CopilotResponse | null> {
  const models = [
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-3.7-flash',
    'gemini-3.8-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite'
  ];

  const langInstruction = language === 'mr'
    ? 'User preferred language: Marathi (मराठी). Reply fully in Marathi.'
    : 'User preferred language: English. Reply in English.';

  const contents: any[] = [];
  for (const m of history.slice(-6)) {
    if (!m.text) continue;
    const role = m.sender === 'user' ? 'user' : 'model';
    if (contents.length > 0 && contents[contents.length - 1].role === role) {
      contents[contents.length - 1].parts[0].text += `\n${m.text}`;
    } else {
      contents.push({ role, parts: [{ text: m.text }] });
    }
  }

  if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
    contents[contents.length - 1].parts[0].text += `\n${query}`;
  } else {
    contents.push({ role: 'user', parts: [{ text: query }] });
  }

  for (const model of models) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
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
              maxOutputTokens: 1024
            }
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) {
          const followups = language === 'mr'
            ? ['कचरा वर्गीकरण कसे करावे?', 'बॅटरी कुठे जमा करावी?', 'खतनिर्मितीचे नियम']
            : ['Which bin does this go in?', 'How to safely dispose batteries?', 'Composting tips'];

          return {
            reply: text.trim(),
            sources: [
              'EcoSense AI Intelligence 2026',
              'CPCB Waste Rules 2016',
              'Maharashtra Municipal Guidelines'
            ],
            suggestedFollowups: followups,
            isAI: true
          };
        }
      }
    } catch {
      // Try next candidate model
    }
  }

  return null;
}

// ─── Domain Knowledge Engine for Offline Resilience ───────────────────────────
interface DomainItem {
  id: string;
  matchWords: string[];
  en: { reply: string; sources: string[]; followups?: string[] };
  mr: { reply: string; sources: string[]; followups?: string[] };
}

const DOMAIN_DATA: DomainItem[] = [
  {
    id: 'greeting',
    matchWords: ['hi', 'hello', 'hey', 'namaste', 'greeting', 'who are you', 'what can you do', 'help', 'नमस्कार', 'हाय', 'हॅलो', 'काय करू शकतोस', 'मदत'],
    en: {
      reply: `👋 **Hello! I am EcoSense AI Copilot.**

I am your 24/7 environmental assistant for **waste classification, recycling rules, hazardous disposal, composting, and EcoSense AI platform features**.

**What you can ask me:**
1. ♻️ "How do I dispose of milk packets, pizza boxes, or medicines?"
2. 🔋 "Where do used batteries or broken electronics go?"
3. 🌿 "How to start composting kitchen waste at home?"
4. 🏙️ "What are the dry waste collection rules in Nalasopara & Virar?"
5. 🔍 "How does the EcoSense AI Waste Scanner work?"`,
      sources: ['EcoSense AI Knowledge Engine', 'CPCB Waste Guidelines 2016'],
      followups: ['Milk packet disposal', 'Battery safety', 'Home composting tips']
    },
    mr: {
      reply: `👋 **नमस्कार! मी EcoSense AI Copilot आहे.**

मी **कचरा वर्गीकरण, प्लास्टिक पुनर्वापर, ई-कचरा सुरक्षितता आणि खतनिर्मिती** यावर अचूक मार्गदर्शन करतो.

**तुम्ही विचारू शकता:**
1. ♻️ "दुधाची पिशवी किंवा पिझ्झा बॉक्स कसा रिसायकल करावा?"
2. 🔋 "जुन्या बॅटरी कुठे जमा कराव्यात?"
3. 🌿 "ओल्या कचऱ्यापासून घरच्या घरी खत कसे बनवावे?"
4. 🏙️ "नालासोपारा-विरारमधील कचरा संकलन नियम काय आहेत?"`,
      sources: ['इकोसेन्स प्रमाणित ज्ञानकोश', 'महाराष्ट्र प्रदूषण नियंत्रण मंडळ'],
      followups: ['दुधाची पिशवी विल्हेवाट', 'बॅटरी कुठे टाकावी?', 'खतनिर्मिती कशी करावी?']
    }
  },
  {
    id: 'battery',
    matchWords: ['battery', 'batteries', 'lithium', 'aa battery', 'cell', 'बॅटरी', 'सेल'],
    en: {
      reply: `🔴 **Hazardous & E-Waste Alert: Batteries**

1. **Never throw in normal trash**: Batteries contain toxic heavy metals (lithium, lead, cadmium, acid) that cause landfill fires.
2. **Terminal Taping**: Cover the positive (+) and negative (-) terminals with transparent tape to prevent accidental short-circuits.
3. **Storage**: Keep in a dry, non-conductive plastic container away from flammable materials.
4. **Disposal Route**: Drop off at authorized municipal e-waste centers or retailer battery return bins.`,
      sources: ['CPCB Battery Waste Management Rules 2022', 'EcoSense Safety Protocol'],
      followups: ['Where are e-waste drop-offs?', 'Can I recycle phone batteries?']
    },
    mr: {
      reply: `🔴 **घातक कचरा: बॅटरी विल्हेवाट**

1. **सामान्य कचऱ्यात टाकू नका**: बॅटरीमध्ये घातक रसायने व लिथियम असते, ज्यामुळे आग लागू शकते.
2. **टर्मिनल्सवर चिकटपट्टी लावा**: बॅटरीच्या टोकांवर चिकटपट्टी लावा जेणेकरून स्पार्क होणार नाही.
3. **विल्हेवाट**: अधिकृत ई-कचरा संकलन केंद्रात जमा करा.`,
      sources: ['बॅटरी कचरा व्यवस्थापन नियम २०२२', 'इकोसेन्स सुरक्षा मानक'],
      followups: ['ई-कचरा संकलन केंद्र कुठे आहे?']
    }
  },
  {
    id: 'plastic_milk',
    matchWords: ['milk', 'milk packet', 'milk pouch', 'दूध', 'दुधाची पिशवी'],
    en: {
      reply: `🔵 **Dry Recyclable: Milk Pouches (LDPE Plastic #4)**

1. **Cut small corner only**: Avoid cutting off tiny detached plastic bits that litter water drains.
2. **Wash & Rinse**: Empty milk completely and rinse the pouch with clean water.
3. **Dry Thoroughly**: Dry the pouch to prevent mold and bacterial odor.
4. **Bin Placement**: Put in the **🔵 Blue Bin** for high-grade LDPE recycling into pellets.`,
      sources: ['CPCB Plastic Waste Management Rules 2016', 'EcoSense Polymer Standard'],
      followups: ['What about curd packets?', 'How to recycle plastic bottles?']
    },
    mr: {
      reply: `🔵 **सुका पुनर्वापरयोग्य कचरा: दुधाची पिशवी (LDPE Plastic #4)**

1. **छोटा कोपरा कापा**: पिशवीचा बारीक तुकडा वेगळा न कापता अखंड ठेवा जेणेकरून तो नाल्यात अडकणार नाही.
2. **धुऊन स्वच्छ करा**: पिशवी आतून पाण्याने धुवून घ्या.
3. **सुकवून ठेवा**: पिशवी पूर्ण वाळवा.
4. **डब्यात टाका**: स्वच्छ सुकलेली पिशवी **🔵 निळ्या डब्यात** टाका.`,
      sources: ['महाराष्ट्र प्लास्टिक नियम', 'इकोसेन्स मार्गदर्शक'],
      followups: ['प्लास्टिक बाटल्या कशा रिसायकल कराव्यात?']
    }
  }
];

// ─── Main Exported Function ───────────────────────────────────────────────────
export async function sendCopilotQuery(
  query: string,
  history: { sender: string; text: string }[] = [],
  language: 'en' | 'mr' = 'en',
  userApiKey?: string
): Promise<CopilotResponse> {
  const clean = query.trim();
  if (!clean) {
    return {
      reply: language === 'mr' ? 'कृपया आपला प्रश्न विचारा.' : 'Please enter your question.',
      sources: []
    };
  }

  // 1. Primary: Serverless Backend / Local Dev Middleware (/api/chat)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 14000);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: clean, history: history.slice(-8), language }),
      signal: controller.signal
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (data && data.reply) {
        return {
          reply: data.reply,
          sources: data.sources || ['EcoSense AI Copilot Engine'],
          suggestedFollowups: data.suggestedFollowups || (language === 'mr'
            ? ['कचरा वर्गीकरण नियम', 'बॅटरी सुरक्षा विल्हेवाट', 'खतनिर्मिती मार्गदर्शन']
            : ['Which bin does this go in?', 'How to safely dispose batteries?', 'Composting tips']),
          isAI: true
        };
      }
    }
  } catch {
    // Continue to direct client fallback
  }

  // 2. Secondary: Direct Client Gemini API call (if client key available)
  const apiKey = userApiKey || (import.meta as any).env?.VITE_GEMINI_API_KEY || (typeof localStorage !== 'undefined' ? localStorage.getItem('ecosense_gemini_key') : '') || '';
  if (apiKey && apiKey.length > 5) {
    const directResult = await callGeminiDirect(clean, history, language, apiKey);
    if (directResult) return directResult;
  }

  // 3. Tertiary: Offline Domain Knowledge Matcher
  const lower = clean.toLowerCase();
  let bestItem: DomainItem | null = null;
  let maxScore = 0;

  for (const item of DOMAIN_DATA) {
    let score = 0;
    for (const word of item.matchWords) {
      if (lower.includes(word.toLowerCase())) {
        score += word.length > 4 ? 3 : 1.5;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestItem = item;
    }
  }

  if (bestItem && maxScore > 0) {
    const langData = language === 'mr' ? bestItem.mr : bestItem.en;
    return {
      reply: langData.reply,
      sources: langData.sources,
      suggestedFollowups: langData.followups
    };
  }

  // 4. Default Guidance with Bin Structure
  if (language === 'mr') {
    return {
      reply: `**"${clean}"** बाबत कचरा विल्हेवाट मार्गदर्शन:\n\n🔵 **सुका कचरा (Blue Bin)**: प्लास्टिक, कागद, काच, धातू (स्वच्छ व सुकवलेले).\n🟢 **ओला कचरा (Green Bin)**: ओला अन्न कचरा, भाजीपाल्याचे अवशेष, खतनिर्मितीसाठी.\n🔴 **घातक/ई-कचरा (Red Bin)**: जुन्या बॅटऱ्या, औषधे, इलेक्ट्रॉनिक्स.\n⚫ **काळा डबा (Black Bin)**: तेलकट/मळलेले प्लास्टिक, सॅनिटरी वेस्ट.\n\nअधिक माहितीसाठी विशिष्ट वस्तूचे नाव विचारा.`,
      sources: ['इकोसेन्स नगरपालिका मानक', 'महाराष्ट्र प्रदूषण नियंत्रण मंडळ'],
      suggestedFollowups: ['दुधाची पिशवी विल्हेवाट', 'बॅटरी कुठे टाकावी?', 'खतनिर्मिती कशी करावी?']
    };
  }

  return {
    reply: `Here is the certified waste guidance for **"${clean}"**:\n\n🔵 **Dry Recyclables (Blue Bin)**: Clean plastic bottles, paper, cardboard, metal, glass.\n🟢 **Wet Organics (Green Bin)**: Food leftovers, fruit/vegetable peels, organic matter for composting.\n🔴 **Hazardous & E-Waste (Red Bin)**: Batteries, electronics, chemicals, expired medicines.\n⚫ **Non-Recyclable Reject (Black Bin)**: Greasy food packaging, multi-layer pouches, thermocol.\n\nAsk about any specific item for exact step-by-step instructions!`,
    sources: ['EcoSense Municipal Waste Standard 2026', 'CPCB Waste Rules 2016'],
    suggestedFollowups: ['How to recycle plastic bottles?', 'Safe battery disposal steps', 'How to start composting?']
  };
}
