// Minimal Anthropic Messages API helper for Supabase Edge Functions (Deno).
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

type ContentBlock =
  | { type: 'text'; text: string }
  | { type: 'image'; source: { type: 'url'; url: string } }
  | { type: 'image'; source: { type: 'base64'; media_type: string; data: string } };

export interface InvokeArgs {
  prompt: string;
  file_urls?: string[];          // remote image URLs (Anthropic fetches them)
  images_base64?: string[];      // inline images (data URI or raw base64) — more robust
  model?: string;
  response_json_schema?: Record<string, unknown>;
  max_tokens?: number;
}

// Turn a data URI or raw base64 string into an inline Anthropic image block.
function base64ImageBlock(input: string): ContentBlock {
  let mediaType = 'image/jpeg';
  let data = input;
  const m = input.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/s);
  if (m) {
    mediaType = m[1];
    data = m[2];
  }
  return { type: 'image', source: { type: 'base64', media_type: mediaType, data } };
}

export function defaultModel() {
  return Deno.env.get('ANTHROPIC_MODEL') || 'claude-sonnet-5';
}

// Base44 used underscored aliases (claude_sonnet_4_6, gemini_3_flash) that are
// NOT valid Anthropic model ids. Only pass through real Anthropic ids
// (hyphenated `claude-*`); otherwise fall back to the configured default.
export function resolveModel(model?: string) {
  return model && /^claude-[a-z0-9.-]+$/i.test(model) ? model : defaultModel();
}

// Calls Claude and returns { text, object }.
// `object` is populated (parsed) only when a response_json_schema is requested.
export async function invokeClaude(args: InvokeArgs): Promise<{ text: string; object: unknown | null }> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');

  const content: ContentBlock[] = [];
  for (const b64 of args.images_base64 || []) {
    if (b64) content.push(base64ImageBlock(b64));
  }
  for (const url of args.file_urls || []) {
    if (url) content.push({ type: 'image', source: { type: 'url', url } });
  }

  let prompt = args.prompt || '';
  if (args.response_json_schema) {
    prompt +=
      `\n\nReturn ONLY a valid JSON object (no markdown, no backticks) matching this JSON schema:\n` +
      JSON.stringify(args.response_json_schema);
  }
  content.push({ type: 'text', text: prompt });

  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: resolveModel(args.model),
      max_tokens: args.max_tokens || 1500,
      messages: [{ role: 'user', content }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text: string = (data.content || [])
    .filter((b: { type: string }) => b.type === 'text')
    .map((b: { text: string }) => b.text)
    .join('\n')
    .trim();

  let object: unknown | null = null;
  if (args.response_json_schema) {
    const cleaned = text.replace(/```json|```/g, '').trim();
    try {
      object = JSON.parse(cleaned);
    } catch {
      // Best-effort: pull the first {...} block.
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) object = JSON.parse(match[0]);
    }
  }

  return { text, object };
}
