// Client stub for the `analyze-clothing-photo` Supabase Edge Function.
// Mirrors the Base44-generated function import the app used before.
import { supabase } from '@/lib/supabase';

export async function analyzeClothingPhoto({ base64Image, photoUrl, lang }) {
  const { data, error } = await supabase.functions.invoke('analyze-clothing-photo', {
    body: { base64Image, photoUrl, lang },
  });
  if (error) {
    // Surface a soft error the UI can fall back on (same shape as the function output).
    return { error: error.message, low_confidence: true };
  }
  return data;
}

export default analyzeClothingPhoto;
