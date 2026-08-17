import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Shoes', 'Bags', 'Accessories', 'Jewellery'];
const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'];
const COLORS = ['White', 'Black', 'Blue', 'Red', 'Pink', 'Green', 'Brown', 'Beige', 'Grey', 'Multi', 'Yellow', 'Orange', 'Purple'];

function normalize(value, list) {
  if (!value) return '';
  return list.find((i) => i.toLowerCase() === value.toLowerCase()) || value;
}

function rgbToColorName(r, g, b) {
  const palette = [
    { name: 'White', r: 245, g: 245, b: 245 }, { name: 'Black', r: 26, g: 26, b: 26 },
    { name: 'Grey', r: 128, g: 128, b: 128 }, { name: 'Red', r: 220, g: 50, b: 50 },
    { name: 'Pink', r: 236, g: 72, b: 153 }, { name: 'Orange', r: 249, g: 115, b: 22 },
    { name: 'Yellow', r: 234, g: 179, b: 8 }, { name: 'Green', r: 34, g: 197, b: 94 },
    { name: 'Blue', r: 59, g: 130, b: 246 }, { name: 'Purple', r: 168, g: 85, b: 247 },
    { name: 'Brown', r: 146, g: 64, b: 14 }, { name: 'Beige', r: 212, g: 184, b: 150 },
  ];
  let closest = 'Multi', minDist = Infinity;
  for (const c of palette) {
    const d = Math.sqrt((c.r - r) ** 2 + (c.g - g) ** 2 + (c.b - b) ** 2);
    if (d < minDist) { minDist = d; closest = c.name; }
  }
  return closest;
}

async function callGoogleVision(base64Data) {
  const apiKey = Deno.env.get('GOOGLE_VISION_API_KEY');
  if (!apiKey) return null;
  const content = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const res = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [{ image: { content }, features: [
        { type: 'LABEL_DETECTION', maxResults: 15 },
        { type: 'IMAGE_PROPERTIES', maxResults: 5 },
        { type: 'OBJECT_LOCALIZATION', maxResults: 5 },
        { type: 'LOGO_DETECTION', maxResults: 3 },
      ]}],
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.responses?.[0] || null;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { base64Image, photoUrl, lang } = await req.json();
  console.log('analyzeClothingPhoto called. base64:', !!base64Image, 'url:', !!photoUrl);

  // 1. Google Vision (if base64 provided)
  let hasVision = false;
  let visionPrompt = '';
  let detectedBrand = '';

  if (base64Image) {
    const v = await callGoogleVision(base64Image);
    if (v) {
      hasVision = true;
      const labels = (v.labelAnnotations || []).map((l) => l.description + '(' + Math.round(l.score * 100) + '%)').join(', ');
      const objects = (v.localizedObjectAnnotations || []).map((o) => o.name).join(', ');
      const logos = (v.logoAnnotations || []).map((l) => l.description).join(', ');
      detectedBrand = v.logoAnnotations?.[0]?.description || '';
      const topColor = v.imagePropertiesAnnotation?.dominantColors?.colors?.[0];
      const colorName = topColor ? rgbToColorName(Math.round(topColor.color.red || 0), Math.round(topColor.color.green || 0), Math.round(topColor.color.blue || 0)) : '';
      visionPrompt = 'Google Vision data - Labels: ' + labels + '. Objects: ' + objects + '. Logos: ' + logos + '. Dominant color: ' + colorName + '.';
      console.log('Vision OK:', visionPrompt.slice(0, 150));
    }
  }

  // 2. Claude
  const LANG_NAMES = { en: 'English', fr: 'French', es: 'Spanish' };
  const langName = LANG_NAMES[lang] || 'English';

  // Always include vision prompt context if available, but Claude will also look at the image directly
  const visionContext = hasVision ? `Additional context from image analysis: ${visionPrompt} ` : '';
  const prompt = `You are a fashion expert analysing a clothing photo. ${visionContext}Look carefully at the attached image. Identify the clothing item precisely — its type, colour, fabric, and style.

IMPORTANT: Write the "name", "description", and "style_tags" fields in ${langName}. The "category", "color", "seasons" fields must stay exactly as the enum values provided (in English).

Return JSON with:
- name: specific item name in ${langName} (e.g. ${lang === 'fr' ? '"Chemise en lin blanc"' : lang === 'es' ? '"Camisa de lino blanca"' : '"White Linen Shirt"'})
- category: one of: ${CATEGORIES.join(', ')}
- color: one of: ${COLORS.join(', ')}
- brand: visible brand or empty string
- seasons: array from: ${SEASONS.join(', ')}
- description: one sentence in ${langName} about the item and how to style it
- style_tags: array of 3 style words in ${langName}
- low_confidence: true ONLY if the image is very unclear or item completely unidentifiable`;

  console.log('Calling Claude. hasVision:', hasVision);

  let result;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) await new Promise(r => setTimeout(r, 3000 * attempt));
      result = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: photoUrl ? [photoUrl] : undefined,
        model: 'claude_sonnet_4_6',
        response_json_schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            category: { type: 'string', enum: CATEGORIES },
            color: { type: 'string' },
            brand: { type: 'string' },
            seasons: { type: 'array', items: { type: 'string', enum: SEASONS } },
            description: { type: 'string' },
            style_tags: { type: 'array', items: { type: 'string' } },
            low_confidence: { type: 'boolean' },
          },
          required: ['name', 'category', 'color', 'style_tags', 'seasons'],
        },
      });
      break; // success
    } catch (err) {
      if (attempt === 2) throw err;
    }
  }

  console.log('Claude result: ' + JSON.stringify(result));

  const r = result?.response || result;

  return Response.json({
    name: r.name || '',
    category: normalize(r.category, CATEGORIES),
    color: normalize(r.color, COLORS),
    brand: (r.brand && r.brand !== 'Unknown') ? r.brand : (detectedBrand || ''),
    season: r.seasons?.length > 0 ? r.seasons : ['Spring', 'Summer', 'Autumn', 'Winter'],
    notes: r.description || '',
    style_tags: r.style_tags || [],
    low_confidence: !!r.low_confidence,
    used_vision: hasVision,
  });
});