// Compatibility shim: exposes the same `base44` interface the app already uses,
// but backed by Supabase. This lets every component keep calling
// `base44.entities.X.filter(...)`, `base44.auth.me()`,
// `base44.integrations.Core.UploadFile(...)`, etc. unchanged.
import { supabase } from '@/lib/supabase';

// --- Entity name -> Postgres table ------------------------------------------
const TABLES = {
  WardrobeItem: 'wardrobe_item',
  SavedLook: 'saved_look',
  MarketListing: 'market_listing',
  MarketFavorite: 'market_favorite',
  MarketMessage: 'market_message',
  MarketOffer: 'market_offer',
  OutfitLog: 'outfit_log',
  Trip: 'trip',
  UserSettings: 'user_settings',
};

// Base44 exposed `created_date` / `updated_date`; Postgres uses *_at.
const SORT_FIELD_ALIASES = {
  created_date: 'created_at',
  updated_date: 'updated_at',
};

// Fields that are managed by the DB and must never be written by the client.
const READONLY_FIELDS = ['id', 'created_by', 'created_at', 'updated_at', 'created_date', 'updated_date'];

function normalizeRow(row) {
  if (!row) return row;
  return { ...row, created_date: row.created_at, updated_date: row.updated_at };
}

function sanitizeWrite(obj) {
  const clean = { ...obj };
  for (const f of READONLY_FIELDS) delete clean[f];
  return clean;
}

// Parse a Base44 sort string ("-created_date", "date") into { column, ascending }.
function parseSort(sort) {
  if (!sort || typeof sort !== 'string') return null;
  const ascending = !sort.startsWith('-');
  const raw = ascending ? sort : sort.slice(1);
  const column = SORT_FIELD_ALIASES[raw] || raw;
  return { column, ascending };
}

function applyOrderAndLimit(query, sort, limit) {
  const parsed = parseSort(sort);
  if (parsed) query = query.order(parsed.column, { ascending: parsed.ascending });
  if (typeof limit === 'number') query = query.limit(limit);
  return query;
}

function makeEntity(table) {
  return {
    async list(sort, limit) {
      let query = supabase.from(table).select('*');
      query = applyOrderAndLimit(query, sort, limit);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(normalizeRow);
    },

    async filter(criteria = {}, sort, limit) {
      let query = supabase.from(table).select('*');
      for (const [key, value] of Object.entries(criteria)) {
        if (value === undefined) continue; // Base44 ignores undefined filters
        if (value === null) query = query.is(key, null);
        else if (Array.isArray(value)) query = query.in(key, value);
        else query = query.eq(key, value);
      }
      query = applyOrderAndLimit(query, sort, limit);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(normalizeRow);
    },

    async get(id) {
      const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
      if (error) throw error;
      return normalizeRow(data);
    },

    async create(payload) {
      const { data, error } = await supabase
        .from(table)
        .insert(sanitizeWrite(payload))
        .select()
        .single();
      if (error) throw error;
      return normalizeRow(data);
    },

    async bulkCreate(payloads = []) {
      const { data, error } = await supabase
        .from(table)
        .insert(payloads.map(sanitizeWrite))
        .select();
      if (error) throw error;
      return (data || []).map(normalizeRow);
    },

    async update(id, patch) {
      const { data, error } = await supabase
        .from(table)
        .update(sanitizeWrite(patch))
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return normalizeRow(data);
    },

    async delete(id) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    },
  };
}

const entities = Object.fromEntries(
  Object.entries(TABLES).map(([name, table]) => [name, makeEntity(table)])
);

// --- Auth -------------------------------------------------------------------
function authError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const auth = {
  // Returns a Base44 User-shaped object (throws with .status on failure).
  async me() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw authError('Not authenticated', 401);

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email,
      full_name: profile?.full_name || user.user_metadata?.full_name || '',
      avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || '',
      location: profile?.location || '',
      role: profile?.role || 'user',
      created_date: user.created_at,
      ...profile,
    };
  },

  async updateMe(patch) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw authError('Not authenticated', 401);
    const { data, error } = await supabase
      .from('profiles')
      .update(sanitizeWrite(patch))
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async logout(redirectUrl) {
    await supabase.auth.signOut();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return { success: true };
  },

  redirectToLogin() {
    if (typeof window !== 'undefined') window.location.href = '/login';
  },
};

// --- Integrations (Core) ----------------------------------------------------
const Core = {
  // Upload a File/Blob to Supabase Storage, return { file_url } (public URL).
  async UploadFile({ file }) {
    const { data: { user } } = await supabase.auth.getUser();
    const uid = user?.id || 'anon';
    const ext = (file?.name?.split('.').pop() || 'jpg').toLowerCase();
    const safe = (file?.name || 'file').replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${uid}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`;

    const { error } = await supabase.storage
      .from('uploads')
      .upload(path, file, { contentType: file?.type || `image/${ext}`, upsert: false });
    if (error) throw error;

    const { data } = supabase.storage.from('uploads').getPublicUrl(path);
    return { file_url: data.publicUrl };
  },

  // Proxy to the `invoke-llm` edge function (keeps API keys server-side).
  // Returns a string when no schema is given, else the parsed object —
  // matching the Base44 InvokeLLM contract.
  async InvokeLLM({ prompt, file_urls, model, response_json_schema } = {}) {
    const { data, error } = await supabase.functions.invoke('invoke-llm', {
      body: { prompt, file_urls, model, response_json_schema },
    });
    if (error) throw error;
    if (response_json_schema) return data?.object ?? data;
    return typeof data?.text === 'string' ? data.text : data;
  },
};

export const base44 = {
  entities,
  auth,
  integrations: { Core },
  functions: {}, // reserved; direct function stubs live in src/functions/*
};

export default base44;
