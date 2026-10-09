/**
 * copilotService.ts — EcoSense AI Copilot Engine
 * Connects directly to Google Gemini API.
 * Falls back to an expanded, intelligent local knowledge engine.
 */

export interface CopilotResponse {
  reply: string;
  sources: string[];
  isAI?: boolean;
}

const GEMINI_SYSTEM_PROMPT = `You are EcoSense Copilot — a professional, friendly AI Environmental Engineer specializing in waste management for Maharashtra, India (specifically Kokan Region and NSP East/West & Virar).

Your role is to:
1. Guide users on correct waste segregation using the 4-bin color system:
   - 🔵 Blue Bin: Dry Recyclables (clean plastic, paper, cardboard, metal, glass)
   - 🟢 Green Bin: Wet/Organic Waste (food scraps, peels, tea leaves, garden waste)
   - 🔴 Red Bin: Hazardous & E-Waste (batteries, electronics, medicines, chemicals)
   - ⚫ Black Bin: Non-Recyclable Reject (soiled wrappers, sanitary waste, diapers)

2. Give zone-specific advice:
   - Zone 1 (Kokan Region): Coastal area, high organic/agricultural waste, composting focus
   - Zone 2 (NSP East/West & Virar): Dense urban, high plastic/packaging waste

3. Response style:
   - Be concise, warm, and professional
   - Use bold headings, bullet points, numbered steps
   - Use relevant emojis for visual clarity
   - If user writes in Marathi (मराठी), respond fully in Marathi
   - Keep answers mobile-friendly and scannable
   - End with a helpful tip or follow-up suggestion`;

// ─── Gemini Direct API Call ────────────────────────────────────────────────────
export async function callGeminiAPI(
  query: string,
  history: { sender: string; text: string }[],
  language: 'en' | 'mr',
  apiKey: string
): Promise<CopilotResponse | null> {
  const MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-flash'];

  const contents: any[] = [
    {
      role: 'user',
      parts: [{ text: `${GEMINI_SYSTEM_PROMPT}\n\nUser language preference: ${language === 'mr' ? 'Marathi (मराठी) — please respond in Marathi' : 'English'}.` }]
    },
    {
      role: 'model',
      parts: [{ text: 'Understood. I am EcoSense Copilot, ready to assist with professional waste management guidance for Kokan and NSP/Virar zones.' }]
    }
  ];

  for (const msg of history.slice(-6)) {
    contents.push({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    });
  }
  contents.push({ role: 'user', parts: [{ text: query }] });

  for (const model of MODELS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: { temperature: 0.3, maxOutputTokens: 1024 }
          }),
          signal: controller.signal
        }
      );
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) {
          return {
            reply: text,
            sources: ['Google Gemini AI', 'CPCB Waste Management Rules', 'EcoSense 2-Zone Protocol'],
            isAI: true
          };
        }
      }
    } catch {
      // Try next model
    }
  }
  return null;
}

// ─── Expanded Intelligent Local Knowledge Engine ──────────────────────────────
type KnowledgeEntry = {
  keywords: string[];
  en: CopilotResponse;
  mr: CopilotResponse;
};

const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // ── Plastic Bottles / PET ──────────────────────────────────────────────────
  {
    keywords: ['plastic', 'bottle', 'pet', 'cold drink', 'soda', 'water bottle', 'mineral water', 'बाटली', 'प्लॅस्टिक', 'कोल्ड ड्रिंक', 'सोडा'],
    en: {
      reply: `♻️ **Plastic Bottles & PET Containers**

**Step-by-step disposal:**
1. **Empty completely** — pour out all residual liquid
2. **Rinse with water** — prevents contamination of other recyclables
3. **Crush & cap** — saves space in the bin, keeps shape compact
4. **Bin:** 🔵 **Blue Bin (Dry Recyclables)**

**Accepted:** PET (#1), HDPE (#2), PP (#5) bottles
**Not accepted:** Oily/chemical containers — these go to 🔴 **Red Bin**

💡 *Zone 2 Tip (NSP & Virar):* Clean PET bottles are sorted for textile fiber & bottle-to-bottle recycling. Even small 200ml bottles matter!
💡 *Zone 1 Tip (Kokan):* Keep bottles dry — humidity can degrade recyclability.`,
      sources: ['CPCB Plastic Waste Management Rules 2016', 'BIS Plastic Recycling Standard']
    },
    mr: {
      reply: `♻️ **प्लॅस्टिक बाटल्यांची योग्य विल्हेवाट**

**क्रमवार पद्धत:**
1. **रिकामे करा** — बाटलीतील सर्व द्रव पदार्थ बाहेर काढा
2. **धुवून टाका** — साध्या पाण्याने स्वच्छ करा
3. **दाबून झाकण लावा** — जागा कमी होते
4. **डबा:** 🔵 **निळा डबा (सुका कचरा)**

**टाकता येते:** PET (#1), HDPE (#2), PP (#5) बाटल्या
**टाकता येत नाही:** तेल/रसायनाच्या बाटल्या — 🔴 **लाल डब्यात** टाका

💡 *झोन २ (नालासोपारा-विरार):* स्वच्छ PET बाटल्यांपासून धागे व नव्या बाटल्या बनवल्या जातात.`,
      sources: ['CPCB प्लॅस्टिक कचरा नियम २०१६', 'महाराष्ट्र कचरा व्यवस्थापन']
    }
  },

  // ── Milk Pouches / Dairy ───────────────────────────────────────────────────
  {
    keywords: ['milk', 'pouch', 'packet', 'dairy', 'curd', 'yogurt', 'cream', 'दूध', 'पिशवी', 'दही', 'दूधाची पिशवी', 'ताक'],
    en: {
      reply: `🥛 **Milk Pouches & Dairy Packaging**

**Step-by-step:**
1. **Cut smartly** — snip a small corner, don't remove the cut-off piece entirely (prevents micro-litter)
2. **Rinse inside** — remove milk film to prevent smell & contamination
3. **Air dry** — shake out moisture before binning
4. **Bin:** 🔵 **Blue Bin (Dry Recyclables)**

**Why it works:** LDPE milk pouches (#4 plastic) are 100% recyclable when clean and dry.

**Curd/yogurt containers (PP #5):** Rinse and place in 🔵 Blue Bin.
**Foil-lined Tetra Pak (Amul, Nandini cartons):** These are multi-layer — ⚫ **Black Bin** unless your area has Tetra Pak collection.

💡 *Pro tip:* Collect 10+ pouches in a small bag before adding to bin — easier for waste workers to handle.`,
      sources: ['CPCB Plastic Waste Rules', 'Maharashtra PCB Dairy Packaging Standard']
    },
    mr: {
      reply: `🥛 **दुधाच्या पिशव्यांची विल्हेवाट**

**क्रमवार पद्धत:**
1. **कापा** — पिशवीचा कोपरा थोडाच कापा, तुकडा पूर्ण वेगळा करू नका
2. **आतून धुवा** — दुधाचा थर निघेल; वास येणार नाही
3. **सुकवा** — ओली पिशवी ठेवू नका
4. **डबा:** 🔵 **निळा डबा (सुका कचरा)**

**दही/ताकाचे प्लास्टिक कप (PP #5):** धुऊन 🔵 निळ्या डब्यात.
**Tetra Pak (Amul, Nandini कार्टन):** बहुस्तरीय असल्यामुळे ⚫ **काळ्या डब्यात**.

💡 *टीप:* १०+ पिशव्या एका बॅगेत जमा करून टाका — कचरा वेचणाऱ्यांना सोपे जाते.`,
      sources: ['CPCB प्लॅस्टिक कचरा नियम', 'महाराष्ट्र प्रदूषण नियंत्रण मंडळ']
    }
  },

  // ── Batteries ─────────────────────────────────────────────────────────────
  {
    keywords: ['battery', 'batteries', 'cell', 'lithium', 'alkaline', 'बॅटरी', 'सेल', 'लिथियम'],
    en: {
      reply: `⚠️ **Battery Disposal — Handle With Care**

**NEVER put batteries in curbside bins** — they cause fires in garbage trucks and leach lead, cadmium & lithium into soil.

**Step-by-step safe disposal:**
1. **Tape the terminals** — put clear tape over both ends (+/-) to prevent short circuits
2. **Store in a cool, dry place** — keep in a cardboard box until you have 5–10 batteries
3. **Drop off at:** 🔴 **E-Waste / Hazardous Waste Collection Point**

**Battery types & handling:**
- 🔋 **AA/AAA Alkaline** — E-waste drop-off
- 🔋 **Lithium (phone, laptop)** — Never puncture or crush; direct to authorized recycler
- 🔋 **Car battery (Lead-Acid)** — Return to dealer/mechanic for buyback
- 🔋 **Button cells (watches)** — Pharmacy or jewelry shop often accepts these

**Zone 2 (NSP/Virar):** E-waste kiosks are available at major NMMC collection centers.
**Zone 1 (Kokan):** Contact local Municipal Corporation for nearest hazardous waste point.`,
      sources: ['CPCB E-Waste Management Rules 2022', 'BIS Safety Standard for Batteries', 'MOEF Hazardous Waste Rules']
    },
    mr: {
      reply: `⚠️ **बॅटरी विल्हेवाट — सावधान!**

**बॅटऱ्या कधीही साध्या कचऱ्यात टाकू नका** — यातून शिसे, कॅडमियम, लिथियम जमिनीत मिसळतात व आग लागण्याचा धोका असतो.

**सुरक्षित पद्धत:**
1. **टेप लावा** — बॅटरीच्या दोन्ही टोकांवर (+ आणि -) चिकटपट्टी लावा
2. **थंड, कोरड्या जागी साठवा** — ५-१० बॅटऱ्या जमा झाल्यावर न्या
3. **जमा करा:** 🔴 **ई-कचरा/घातक कचरा संकलन केंद्रावर**

**बॅटरीचे प्रकार:**
- 🔋 **AA/AAA (Alkaline)** — ई-कचरा केंद्र
- 🔋 **लिथियम (मोबाईल, लॅपटॉप)** — टोचू किंवा दाबू नका; अधिकृत रिसायकलरकडे
- 🔋 **Car बॅटरी (Lead-Acid)** — Dealer/मेकॅनिककडे परत करा
- 🔋 **बटण सेल (घड्याळ)** — Pharmacy स्वीकारतात

💡 **Zone 2:** NMMC संकलन केंद्रे उपलब्ध आहेत.`,
      sources: ['CPCB ई-कचरा व्यवस्थापन नियम २०२२', 'घातक कचरा सुरक्षा मानके']
    }
  },

  // ── E-Waste / Electronics ─────────────────────────────────────────────────
  {
    keywords: ['phone', 'mobile', 'laptop', 'computer', 'tv', 'television', 'charger', 'cable', 'electronic', 'ewaste', 'e-waste', 'monitor', 'printer', 'keyboard', 'mouse', 'headphone', 'मोबाईल', 'इलेक्ट्रॉनिक', 'टीव्ही', 'चार्जर', 'ई-कचरा'],
    en: {
      reply: `📱 **E-Waste (Electronics) — Proper Disposal**

E-waste contains toxic heavy metals (lead, mercury, cadmium, arsenic) that are harmful to human health and ecosystems.

**Never bin electronics in regular waste!**

**How to dispose properly:**
1. **Data wipe:** Factory reset phones & laptops before disposal (protect your privacy)
2. **Remove battery:** Where possible, remove battery for separate disposal
3. **Drop-off options:**
   - 🔴 **Authorized E-Waste Collection Centers** (check on CPCB portal)
   - **Manufacturer take-back** — Samsung, Apple, HP, LG all have programs
   - **Local kabadiwala** with e-waste handling certification
4. **Working devices:** Consider donating to NGOs or schools before disposal

**Items classified as E-Waste:**
Phones, tablets, laptops, TVs, monitors, chargers, cables, printers, scanners, keyboards, headphones, ACs, refrigerators (large appliances via Extended Producer Responsibility)

💡 *Zone 2 (NSP/Virar):* MPCB has registered e-waste recyclers in the Vasai-Virar region.`,
      sources: ['CPCB E-Waste Management Rules 2022', 'Extended Producer Responsibility Framework', 'MPCB Maharashtra E-Waste Guidelines']
    },
    mr: {
      reply: `📱 **ई-कचरा (Electronics) योग्य विल्हेवाट**

इलेक्ट्रॉनिक वस्तूंमध्ये शिसे, पारा, कॅडमियम, आर्सेनिक असे विषारी धातू असतात — यांना साध्या कचऱ्यात टाकू नका!

**सुयोग्य पद्धत:**
1. **डेटा डिलीट करा:** मोबाईल/लॅपटॉप Factory Reset करा
2. **बॅटरी वेगळी काढा:** शक्य असल्यास वेगळ्या E-Waste मध्ये टाका
3. **जमा करण्याचे ठिकाण:**
   - 🔴 **अधिकृत ई-कचरा संकलन केंद्र** (CPCB पोर्टलवर शोधा)
   - **Manufacturer Take-Back** — Samsung, Apple, HP यांचे कार्यक्रम आहेत
   - **प्रमाणित कबाडीवाला** — ई-कचरा हाताळणी करणारे
4. **सुस्थितीतील वस्तू:** NGO किंवा शाळांना दान करा

**ई-कचऱ्यामध्ये येतात:** मोबाईल, टॅबलेट, लॅपटॉप, TV, चार्जर, केबल, प्रिंटर, हेडफोन

💡 *Zone 2:* MPCB-नोंदणीकृत रिसायकलर्स वसई-विरार भागात उपलब्ध आहेत.`,
      sources: ['CPCB ई-कचरा व्यवस्थापन नियम २०२२', 'महाराष्ट्र प्रदूषण नियंत्रण मंडळ']
    }
  },

  // ── Food Waste / Organic / Composting ────────────────────────────────────
  {
    keywords: ['food', 'wet waste', 'organic', 'compost', 'kitchen', 'vegetable', 'fruit', 'peel', 'leftovers', 'rice', 'roti', 'tea', 'coffee', 'eggshell', 'ओला', 'अन्न', 'कचरा', 'खत', 'भाजीपाला', 'फळ', 'साल', 'उरलेलं जेवण', 'चहा'],
    en: {
      reply: `🌱 **Wet Organic Waste & Composting**

**🟢 Green Bin — What goes in:**
✅ Fruit & vegetable peels, cores, seeds
✅ Leftover cooked food (without packaging)
✅ Tea leaves, coffee grounds, eggshells
✅ Garden clippings, dried leaves (small amounts)
✅ Bread, rice, roti (without plastic wrap)

**❌ What does NOT go in Green Bin:**
❌ Plastic wrappers, rubber bands, twist ties
❌ Tetra Pak or foil-lined packaging
❌ Meat & fish bones (can go in limited quantities if your area has biogas plant)

**🪴 DIY Composting (especially great for Zone 1 — Kokan):**
1. Layer greens (wet waste) with browns (dry leaves, cardboard bits) in 2:1 ratio
2. Keep moist but not soggy — like a wrung-out sponge
3. Turn every 3–5 days for aeration
4. Ready in 30–45 days in Kokan's warm, humid climate 🌿

💡 *Urban tip (Zone 2 — NSP/Virar):* Use a 10-litre covered bucket composter on your balcony. Add 1 tsp dry soil after each layer to control odor.`,
      sources: ['National Compost Mission India', 'CPCB Solid Waste Management Rules 2016', 'Maharashtra Organic Waste Protocol']
    },
    mr: {
      reply: `🌱 **ओला कचरा व घरगुती खतनिर्मिती**

**🟢 हिरवा डबा — काय टाकावे:**
✅ फळे व भाज्यांची साले, बिया, देठ
✅ उरलेले शिजवलेले जेवण (पॅकेजिंगशिवाय)
✅ चहाची पत्ती, कॉफी, अंड्याची टरफले
✅ बागेतील पाने, गवत
✅ भाकरी, भात, पोळी

**❌ हिरव्या डब्यात टाकू नये:**
❌ प्लास्टिक रॅपर, रबर बँड
❌ Tetra Pak किंवा फॉइलच्या वेष्टने
❌ मांस, माशांचे कांटे (मर्यादित)

**🌿 घरगुती कंपोस्टिंग (Zone 1 — कोकणासाठी उत्तम):**
1. ओला कचरा + कोरडी पाने/पुठ्ठे — २:१ थर लावा
2. ओलसर ठेवा (पिळलेल्या स्पंजसारखे)
3. दर ३-५ दिवसांनी ढवळा
4. ३०-४५ दिवसांत उत्तम सेंद्रिय खत तयार 🌿

💡 *Zone 2 शहरी टीप:* बाल्कनीत १० लिटर बंद बादली कंपोस्टर वापरा. प्रत्येक थरावर १ चमचा कोरडी माती टाका — वास येणार नाही.`,
      sources: ['राष्ट्रीय कंपोस्ट अभियान', 'CPCB घनकचरा व्यवस्थापन नियम २०१६']
    }
  },

  // ── Cardboard & Paper ──────────────────────────────────────────────────────
  {
    keywords: ['cardboard', 'box', 'carton', 'paper', 'newspaper', 'magazine', 'notebook', 'envelope', 'tissue', 'पुठ्ठा', 'खोका', 'वर्तमानपत्र', 'कागद', 'नोटबुक', 'लिफाफा'],
    en: {
      reply: `📦 **Paper & Cardboard Disposal**

**🔵 Blue Bin — Accepted (Dry & Clean):**
✅ Newspapers, magazines, books (no glossy covers with heavy ink)
✅ Office paper, envelopes, notebooks
✅ Flattened shipping boxes (remove tape first!)
✅ Toilet roll tubes, egg cartons (if clean & dry)
✅ Cereal boxes (remove inner plastic liner)

**❌ NOT recyclable (go to ⚫ Black Bin):**
❌ **Greasy pizza boxes** — if heavily soiled with oil/cheese (tear off the clean lid; recycle only that part)
❌ Waxed or coated paper (coffee cups, ice cream cartons — special material)
❌ Wet, moldy paper
❌ Tissue paper & paper towels (too short-fibered)
❌ Carbon paper, thermal receipts (contain BPA)

**Preparation tips:**
- Flatten all boxes to save space
- Remove plastic windows from envelopes
- Bundle newspapers with twine for kabadiwala pickup`,
      sources: ['CPCB Paper Waste Management Guidelines', 'Bureau of Indian Standards Recycled Paper Norms']
    },
    mr: {
      reply: `📦 **कागद आणि पुठ्ठ्याची विल्हेवाट**

**🔵 निळा डबा — स्वीकार्य (कोरडे व स्वच्छ):**
✅ वर्तमानपत्रे, मासिके, पुस्तके
✅ ऑफिसचा कागद, लिफाफे, नोटबुक
✅ सपाट केलेले खोके (आधी टेप काढा!)
✅ अंड्याच्या कार्टन (स्वच्छ व कोरड्या)
✅ धान्य/बिस्किटाचे खोके (आतील प्लास्टिक काढून)

**❌ रिसायकल होत नाही (⚫ काळा डबा):**
❌ **तेलाने भिजलेला पिझ्झा बॉक्स** — फक्त स्वच्छ झाकण रिसायकल करता येते
❌ मेण/कोटिंग असलेला कागद (कॉफी कप, आईस्क्रीम कार्टन)
❌ ओला किंवा बुरशीचा कागद
❌ टिश्यू पेपर, पेपर टॉवेल
❌ कार्बन पेपर, ATM स्लिप

**तयारी टिप्स:**
- सर्व खोके सपाट करा
- वर्तमानपत्रे दोरीने बांधा — कबाडीवाला लवकर नेतो`,
      sources: ['CPCB कागद कचरा मार्गदर्शक', 'भारतीय मानक ब्युरो पुनर्वापर नियम']
    }
  },

  // ── Pizza Box ─────────────────────────────────────────────────────────────
  {
    keywords: ['pizza', 'pizza box', 'greasy box', 'पिझ्झा'],
    en: {
      reply: `🍕 **Pizza Box — The Smart Disposal Trick**

This is one of the most commonly mis-recycled items!

**The Rule:** Oil contamination ruins paper recycling — a greasy box can ruin an entire batch of recycled pulp.

**How to handle it:**
1. **Inspect the box:** Is the lid clean? Is only the bottom greasy?
2. **Tear it in two:**
   - 🔵 **Recycle the clean LID** → Blue Bin
   - ⚫ or 🟢 **Compost/Black Bin the greasy BASE** → Green Bin (if your area composts food-soiled paper) or Black Bin
3. **If the whole box is grease-free** (e.g., packaging was perfect) → 🔵 Blue Bin (flatten first)

**Zone 1 (Kokan):** Greasy pizza bases can go into compost pits as browns.
**Zone 2 (NSP/Virar):** Use Black Bin for greasy base — municipal composting handles it.`,
      sources: ['EPA US Pizza Box Recycling Guide (adapted for India)', 'CPCB Paper Recycling Contamination Standards']
    },
    mr: {
      reply: `🍕 **पिझ्झा बॉक्स — योग्य विल्हेवाट**

हा सर्वात जास्त चुकीच्या पद्धतीने टाकला जाणारा कचरा आहे!

**नियम:** तेल कागद रिसायकलिंग खराब करते — एक तेलाचा बॉक्स संपूर्ण बॅच बिघडवू शकतो.

**कसे करावे:**
1. **बॉक्स तपासा:** झाकण स्वच्छ आहे का? फक्त तळाला तेल आहे का?
2. **दोन भाग करा:**
   - 🔵 **स्वच्छ झाकण** → निळा डबा
   - ⚫ किंवा 🟢 **तेलाचा तळ** → हिरवा डबा (कंपोस्ट) किंवा काळा डबा
3. **संपूर्ण बॉक्स स्वच्छ असेल तर** → 🔵 निळा डबा (सपाट करून)

💡 *Zone 1 (कोकण):* तेलाचा तळ कंपोस्ट खड्ड्यात टाका — ब्राऊन लेयर म्हणून उपयुक्त.`,
      sources: ['CPCB कागद रिसायकलिंग मानके', 'घनकचरा व्यवस्थापन नियम']
    }
  },

  // ── Glass ─────────────────────────────────────────────────────────────────
  {
    keywords: ['glass', 'bottle', 'jar', 'broken glass', 'mirror', 'काच', 'बरणी', 'तुटलेली काच'],
    en: {
      reply: `🍶 **Glass Disposal Guide**

**Intact Glass Bottles & Jars:**
1. **Empty & rinse** — remove all food residue
2. **Remove metal lids** — lids go to 🔵 Blue Bin separately
3. **Bin:** 🔵 **Blue Bin (Dry Recyclables)**
   - Accepted: Clear, green, brown glass bottles & jars

**⚠️ Broken Glass — SAFETY FIRST:**
1. **Do NOT put loose broken glass in the bin** — it injures waste workers
2. **Wrap carefully** in thick newspaper (3–4 layers), then tape it shut
3. **Label the package:** Write "BROKEN GLASS — CAREFUL" on the outside
4. **Bin:** ⚫ **Black Bin** (labeled package)

**❌ NOT recyclable glass:**
- Mirrors (coated backing)
- Window/tempered glass
- Pyrex/ovenware (different glass composition)
- Light bulbs → 🔴 Red/Hazardous bin`,
      sources: ['Glass Recycling Federation India', 'CPCB Solid Waste Management Rules']
    },
    mr: {
      reply: `🍶 **काचेच्या वस्तूंची विल्हेवाट**

**सुरक्षित काचेच्या बाटल्या/बरण्या:**
1. **रिकाम्या करा आणि धुवा**
2. **धातूचे झाकण वेगळे काढा** → 🔵 निळा डबा
3. **डबा:** 🔵 **निळा डबा (सुका कचरा)**

**⚠️ तुटलेली काच — सावधान!**
1. **सैल तुटलेली काच डब्यात टाकू नका** — कचरा वेचणाऱ्यांना इजा होते
2. **जाड वर्तमानपत्रात (३-४ थर) गुंडाळा** आणि टेप लावा
3. **बाहेर लिहा:** "तुटलेली काच — काळजी घ्या"
4. **डबा:** ⚫ **काळा डबा** (बंद पॅकेटमध्ये)

**❌ रिसायकल होत नाही:**
- आरसे, खिडकीची काच
- Pyrex/ओव्हनवेअर
- बल्ब → 🔴 घातक कचरा`,
      sources: ['काच रिसायकलिंग मानके भारत', 'CPCB घनकचरा नियम']
    }
  },

  // ── Medicines / Pharmaceuticals ───────────────────────────────────────────
  {
    keywords: ['medicine', 'pill', 'tablet', 'syrup', 'injection', 'syringe', 'expired', 'drug', 'pharmaceutical', 'औषध', 'गोळ्या', 'सिरप', 'सिरिंज', 'एक्सपायर्ड'],
    en: {
      reply: `💊 **Expired Medicine & Pharmaceutical Disposal**

**⚠️ NEVER:**
- Flush medicines down the toilet (contaminates water supply)
- Throw in regular bins (children or animals may consume)
- Burn them

**Safe Disposal:**
1. **Remove personal info** from prescription labels
2. **Mix with something unappealing** — used coffee grounds, dirt (makes it undesirable to scavenge)
3. **Seal in a bag** — double-bag if possible
4. **Drop off at:** 🔴 **Pharmacy Take-Back Programs** (most chemists in India accept expired medicines)
5. **Or:** Municipal Hazardous Waste Collection → 🔴 **Red Bin**

**Syringes & sharps:**
- Place in a hard plastic bottle with lid (e.g., empty PET bottle)
- Label "SHARPS — BIOHAZARD"
- Take to nearest PHC (Primary Health Center) or hospital

💡 Hospitals and chemists are your best first point of contact for pharmaceutical waste in both Zone 1 & Zone 2.`,
      sources: ['Bio-Medical Waste Management Rules 2016 India', 'WHO Safe Medication Disposal Guidelines']
    },
    mr: {
      reply: `💊 **मुदत संपलेल्या औषधांची विल्हेवाट**

**⚠️ कधीही करू नका:**
- टॉयलेटमध्ये फ्लश करू नका (पाणी दूषित होते)
- साध्या कचऱ्यात टाकू नका (मुले/प्राणी खाऊ शकतात)
- जाळू नका

**सुरक्षित पद्धत:**
1. **प्रिस्क्रिप्शन लेबलवरील नाव काढा**
2. **कॉफी, माती मिसळा** — कोणी उचलणार नाही
3. **पिशवीत बंद करा** — शक्य असल्यास दुहेरी पिशवी
4. **घ्या:** 🔴 **फार्मसी Take-Back** — बहुतांश Chemist स्वीकारतात
5. **किंवा:** महापालिका घातक कचरा संकलन → 🔴 **लाल डबा**

**सुया/Sharps:**
- बंद झाकणाच्या PET बाटलीत ठेवा
- "SHARPS — BIOHAZARD" असे लिहा
- जवळच्या PHC किंवा रुग्णालयात द्या`,
      sources: ['जैव-वैद्यकीय कचरा व्यवस्थापन नियम २०१६', 'WHO औषध विल्हेवाट मार्गदर्शन']
    }
  },

  // ── Sanitary / Hygienic Waste ──────────────────────────────────────────────
  {
    keywords: ['sanitary', 'pad', 'diaper', 'napkin', 'tampon', 'tissue', 'cotton', 'bandage', 'सॅनिटरी', 'डायपर', 'रुमाल', 'बॅंडेज', 'पॅड'],
    en: {
      reply: `🩺 **Sanitary & Hygienic Waste Disposal**

This is classified as **infectious/special waste** and must be handled carefully.

**Step-by-step:**
1. **Wrap tightly** — roll used items and wrap in their own packaging or old newspaper
2. **Use a separate bag** — double-bag with a sealed knot
3. **Bin:** ⚫ **Black Bin (Non-Recyclable / Reject Waste)**
   - Sanitary pads, tampons, diapers go here — NEVER in Green or Blue Bin

**⚠️ Why this matters:**
These items can contaminate entire batches of wet or dry recyclables.
Municipal waste treatment facilities handle Black Bin contents with special protocols.

**For healthcare/institutional settings:**
Classify as Bio-Medical Waste (BMW) and use yellow bio-hazard bags as per BMW Rules 2016.

💡 *Eco-tip:* Consider switching to reusable menstrual cups, washable cloth pads, or biodegradable sanitary products to dramatically reduce your footprint.`,
      sources: ['Bio-Medical Waste Management Rules 2016', 'CPCB Special Waste Handling Guidelines', 'WHO Domestic Hazardous Waste Protocols']
    },
    mr: {
      reply: `🩺 **सॅनिटरी व स्वच्छता कचरा विल्हेवाट**

हा **संसर्गजन्य/विशेष कचरा** आहे — काळजीने हाताळा.

**क्रमवार पद्धत:**
1. **घट्ट गुंडाळा** — वापरलेल्या वस्तू त्यांच्या पॅकेजमध्ये किंवा वर्तमानपत्रात गुंडाळा
2. **वेगळ्या पिशवीत ठेवा** — दुहेरी पिशवी वापरा, घट्ट बांधा
3. **डबा:** ⚫ **काळा डबा (नकारात्मक/नको असलेला कचरा)**
   - सॅनिटरी पॅड, डायपर, टॅम्पॉन → इथेच जातात; हिरव्या/निळ्या डब्यात कधीही नाही

**⚠️ का महत्त्वाचे आहे:**
या वस्तू ओल्या/सुक्या कचऱ्याचा संपूर्ण बॅच दूषित करतात.

💡 **पर्याय:** पुनर्वापरयोग्य मासिक पाळी कप, कापडी पॅड किंवा जैव-विघटनशील उत्पादने वापरा.`,
      sources: ['जैव-वैद्यकीय कचरा व्यवस्थापन नियम २०१६', 'CPCB विशेष कचरा मार्गदर्शन']
    }
  },

  // ── Kokan Zone ────────────────────────────────────────────────────────────
  {
    keywords: ['kokan', 'coastal', 'beach', 'fishing', 'konkan', 'konkan region', 'कोकण', 'समुद्र', 'किनारा', 'मासेमारी'],
    en: {
      reply: `🌴 **Zone 1 — Kokan Region Waste Management**

**Zone Profile:**
- Coastal geography — beaches, estuaries, fishing villages
- High organic/agricultural waste (~38% of total)
- Seasonal surge during festivals & tourism

**Key priorities for Kokan:**

🟢 **Wet Organic (Priority Focus):**
- High agricultural & kitchen waste — ideal for composting
- Kokan's humid climate (26–33°C) perfect for aerobic composting
- Community bio-gas plants being set up in coastal villages

🔵 **Dry Recyclables:**
- Fishing gear (nets, rope, floats) — special marine plastic recycling
- Festival plastic (Ganpati visarjan) — coordinate with MPCB

🌊 **Beach Waste Protocol:**
- Never burn waste on beach — releases dioxins into coastal air
- Segregate waste at beach before collection
- Contact: Maharashtra Maritime Board for marine debris programs

🌿 **Composting Opportunity:**
Kokan has one of India's best composting climates. Start a community compost with neighbors — fishermen's organic waste makes exceptional fertilizer!`,
      sources: ['MPCB Kokan Coastal Zone Management Plan', 'Maharashtra Maritime Board', 'CPCB Coastal Area Waste Guidelines']
    },
    mr: {
      reply: `🌴 **झोन १ — कोकण विभाग कचरा व्यवस्थापन**

**झोन प्रोफाइल:**
- किनारी भूगोल — समुद्रकिनारे, खाड्या, मच्छिमार गावे
- ओला/शेती कचरा जास्त (~३८%)
- सण व पर्यटन काळात कचरा वाढतो

**कोकणसाठी प्राधान्यक्रम:**

🟢 **ओला सेंद्रिय कचरा (मुख्य लक्ष):**
- शेती व स्वयंपाकघर कचरा — कंपोस्टिंगसाठी आदर्श
- कोकणचे उबदार व दमट हवामान (२६-३३°C) कंपोस्टसाठी उत्तम
- किनारी गावांमध्ये बायोगॅस प्रकल्प सुरू होत आहेत

🔵 **सुका पुनर्वापरयोग्य कचरा:**
- मासेमारीचे जाळे, दोर, फ्लोट — विशेष सागरी प्लास्टिक रिसायकलिंग
- गणपती विसर्जनाचा प्लास्टिक — MPCB समन्वय

🌊 **समुद्रकिनारा कचरा नियम:**
- किनाऱ्यावर कचरा जाळू नका — डायऑक्सिन वायू सुटतो
- संकलनापूर्वी किनाऱ्यावरच कचरा वर्गीकरण करा

🌿 **कंपोस्टिंगची संधी:** कोकण हे भारतातील सर्वोत्तम कंपोस्टिंग हवामानांपैकी एक आहे!`,
      sources: ['MPCB कोकण किनारी व्यवस्थापन', 'महाराष्ट्र सागरी मंडळ', 'CPCB किनारी क्षेत्र मार्गदर्शन']
    }
  },

  // ── NSP / Virar Zone ──────────────────────────────────────────────────────
  {
    keywords: ['nsp', 'nalasopara', 'virar', 'vasai', 'east', 'west', 'nsp east', 'nsp west', 'नालासोपारा', 'विरार', 'वसई'],
    en: {
      reply: `🏙️ **Zone 2 — NSP East/West & Virar Waste Management**

**Zone Profile:**
- Dense urban population (~1.2M+)
- High plastic & e-commerce packaging (~44% of waste)
- Multi-residential complexes (apartments, chawls, societies)

**Key priorities:**

🔵 **Dry Recyclables (Primary focus):**
- Rinse all containers before binning — contamination is Zone 2's #1 problem
- Flatten all cardboard — saves 60% bin space
- Collect & bundle plastic bags separately (LDPE recycling collection)

🟢 **Wet Waste:**
- Each floor/building should have a dedicated wet waste bucket
- NMMC has wet waste pickup 6 days/week — check your society's schedule

♻️ **Available Infrastructure:**
- NMMC Recycling Centers: Vasai-Virar Municipal Corporation
- E-Waste Collection: Check MPCB registered centers in Nalasopara/Virar
- Plastic Banks: Available at select NMMC locations

📦 **E-Commerce Packaging:**
- Remove air pillows (plastic) — try to flatten & recycle
- Cardboard boxes — flatten and give to kabadiwala
- Bubble wrap — check if kabadiwala accepts LDPE films`,
      sources: ['NMMC Solid Waste Management Report', 'Vasai-Virar Municipal Corporation Guidelines', 'MPCB Zone 2 Waste Audit']
    },
    mr: {
      reply: `🏙️ **झोन २ — नालासोपारा (NSP) पूर्व/पश्चिम व विरार**

**झोन प्रोफाइल:**
- दाट शहरी लोकसंख्या (~१२ लाख+)
- प्लास्टिक व ई-कॉमर्स पॅकेजिंग जास्त (~४४%)
- सोसायट्या, चाळी, अपार्टमेंट कॉम्प्लेक्स

**प्राधान्यक्रम:**

🔵 **सुका कचरा (मुख्य लक्ष):**
- सर्व डबे धुऊन टाका — संदूषण हे Zone 2 चे मुख्य आव्हान
- सर्व खोके सपाट करा — ६०% जागा वाचते
- प्लास्टिक पिशव्या वेगळ्या बंडलमध्ये गोळा करा (LDPE संकलन)

🟢 **ओला कचरा:**
- प्रत्येक मजला/बिल्डिंगला वेगळी ओल्या कचऱ्याची बादली ठेवा
- NMMC आठवड्यातून ६ दिवस ओला कचरा नेते — सोसायटीचे वेळापत्रक तपासा

♻️ **उपलब्ध पायाभूत सुविधा:**
- NMMC रिसायकलिंग केंद्रे: वसई-विरार महापालिका
- ई-कचरा संकलन: MPCB नोंदणीकृत केंद्रे
- Plastic Banks: निवडक NMMC ठिकाणी`,
      sources: ['NMMC घनकचरा व्यवस्थापन अहवाल', 'वसई-विरार महापालिका मार्गदर्शन', 'MPCB Zone 2 कचरा लेखापरीक्षण']
    }
  },

  // ── Segregation Overview ─────────────────────────────────────────────────
  {
    keywords: ['segregation', 'separate', 'bins', 'how to', 'guide', 'start', 'begin', 'what', 'help', 'वर्गीकरण', 'वेगळे', 'कसे', 'मार्गदर्शन', 'सुरुवात', 'काय'],
    en: {
      reply: `♻️ **Complete Waste Segregation Guide — 4 Color System**

**At Home — The 4 Bin Setup:**

🔵 **Blue Bin — Dry Recyclables** (Clean & Dry)
→ Plastic bottles, paper, cardboard, glass, metals, milk pouches

🟢 **Green Bin — Wet/Organic** (Biodegradable)
→ Food scraps, vegetable peels, fruit waste, tea leaves, garden waste

🔴 **Red Bin — Hazardous & E-Waste**
→ Batteries, expired medicines, bulbs, electronics, chemicals, paints

⚫ **Black Bin — Non-Recyclable Reject**
→ Soiled wrappers, sanitary waste, diapers, multi-layer chips packets

**Golden Rules:**
1. 🚿 **Rinse before Blue Bin** — dirty recyclables get rejected
2. 🏷️ **When in doubt** — Black Bin (better safe than contaminate)
3. 📦 **Flatten everything** — saves up to 60% bin space
4. ☠️ **Hazardous goes Red** — never mix batteries/e-waste with regular bins

💬 *Ask me about any specific item — milk packet, pizza box, batteries, broken glass, medicines — and I'll give you a precise answer!*`,
      sources: ['CPCB Solid Waste Management Rules 2016', 'SWM Manual India', 'EcoSense 2-Zone Protocol']
    },
    mr: {
      reply: `♻️ **संपूर्ण कचरा वर्गीकरण मार्गदर्शिका — ४ रंग पद्धत**

**घरी — ४ डब्यांची व्यवस्था:**

🔵 **निळा डबा — सुका पुनर्वापरयोग्य कचरा** (स्वच्छ व कोरडा)
→ प्लास्टिक बाटल्या, कागद, पुठ्ठा, काच, धातू, दुधाच्या पिशव्या

🟢 **हिरवा डबा — ओला/सेंद्रिय** (जैव-विघटनशील)
→ अन्न अवशेष, भाज्यांची साले, फळे, चहाची पत्ती, बागेचा कचरा

🔴 **लाल डबा — घातक व ई-कचरा**
→ बॅटऱ्या, मुदत संपलेली औषधे, बल्ब, इलेक्ट्रॉनिक्स, रसायने

⚫ **काळा डबा — नकारात्मक कचरा**
→ गलिच्छ रॅपर्स, सॅनिटरी कचरा, डायपर, बहुस्तरीय चिप्स पॅकेट

**सुवर्ण नियम:**
1. 🚿 **निळ्या डब्यापूर्वी धुवा** — घाण कचरा नाकारला जातो
2. 🏷️ **शंका असल्यास** — काळा डबा (सुरक्षित पर्याय)
3. 📦 **सर्व सपाट करा** — ६०% जागा वाचते
4. ☠️ **घातक वस्तू लाल डब्यात** — बॅटऱ्या/इलेक्ट्रॉनिक्स साध्या डब्यात नाही

💬 *कोणत्याही वस्तूबद्दल विचारा — दूध पिशवी, पिझ्झा बॉक्स, बॅटरी, तुटलेली काच, औषधे — मी अचूक उत्तर देतो!*`,
      sources: ['CPCB घनकचरा व्यवस्थापन नियम २०१६', 'SWM मॅन्युअल भारत', 'EcoSense 2-झोन प्रोटोकॉल']
    }
  }
];

function getLocalResponse(query: string, language: 'en' | 'mr'): CopilotResponse {
  const q = query.toLowerCase().trim();
  const isMarathi = language === 'mr' || /[\u0900-\u097F]/.test(query);

  // Find best matching entry
  let bestEntry: KnowledgeEntry | null = null;
  let bestScore = 0;

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (q.includes(kw.toLowerCase())) {
        score += kw.length > 4 ? 3 : 1; // longer keyword = better match
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  if (bestEntry && bestScore > 0) {
    return isMarathi ? bestEntry.mr : bestEntry.en;
  }

  // Default comprehensive response
  return isMarathi
    ? KNOWLEDGE_BASE[KNOWLEDGE_BASE.length - 1].mr
    : KNOWLEDGE_BASE[KNOWLEDGE_BASE.length - 1].en;
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export async function sendCopilotQuery(
  query: string,
  history: { sender: string; text: string }[] = [],
  language: 'en' | 'mr' = 'en',
  userApiKey?: string
): Promise<CopilotResponse> {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    return { reply: 'Please type a question to get started.', sources: [] };
  }

  // 1. Try Gemini API if user provided a key
  const apiKey = userApiKey || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  if (apiKey && apiKey.startsWith('AIza')) {
    const result = await callGeminiAPI(cleanQuery, history, language, apiKey);
    if (result) return result;
  }

  // 2. Try serverless /api/chat (only works when deployed on Vercel)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: cleanQuery, history: history.slice(-6) }),
      signal: controller.signal
    });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (data?.reply) return { reply: data.reply, sources: data.sources || [], isAI: true };
    }
  } catch {
    // Fallback to local
  }

  // 3. Intelligent local knowledge engine (always works)
  return getLocalResponse(cleanQuery, language);
}
