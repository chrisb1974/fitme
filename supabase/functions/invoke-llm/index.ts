// Generic LLM proxy (replaces base44.integrations.Core.InvokeLLM).
// Body: { prompt, file_urls?, model?, response_json_schema? }
// Returns: { text: string, object: object|null }
import { corsHeaders, json } from '../_shared/cors.ts';
import { invokeClaude } from '../_shared/anthropic.ts';
import { getUserId } from '../_shared/auth.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  if (!getUserId(req)) return json({ error: 'Unauthorized' }, 401);

  try {
    const { prompt, file_urls, model, response_json_schema } = await req.json();
    if (!prompt) return json({ error: 'prompt is required' }, 400);

    const { text, object } = await invokeClaude({ prompt, file_urls, model, response_json_schema });
    return json({ text, object });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
