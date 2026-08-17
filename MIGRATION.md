# FitMe — Migration Base44 → Supabase

FitMe a été porté depuis Base44 (BaaS propriétaire) vers un **stack que tu possèdes** :
React 18 + Vite (frontend, inchangé) + **Supabase** (auth, Postgres+RLS, Storage, Edge Functions).

## 📍 État au 14/08/2026
- ✅ Projet Supabase cloud créé (`bbbhckooprejnsgobuod`), schéma appliqué, `.env.local` branché.
- ✅ Vérifié en conditions réelles : inscription → login → session persistante, garde-robe
  lecture **et** écriture (22 items chargés/relus), RLS OK, météo OK.
- ⏳ **Reste à faire (features IA)** : déployer les 2 Edge Functions + fournir les clés
  `ANTHROPIC_API_KEY` et `GOOGLE_VISION_API_KEY` (voir « Déployer en CLOUD » ci-dessous).
  Sans ça : générateur de looks IA, analyse photo et trip planner restent inactifs ;
  tout le reste fonctionne.

## Ce qui a changé

| Avant (Base44) | Maintenant (Supabase) |
|---|---|
| `@base44/sdk` | `@supabase/supabase-js` |
| `base44.entities.*` | Shim `src/api/base44Client.js` → tables Postgres (RLS) |
| Auth plateforme (pas de page login) | Supabase Auth + `src/pages/Login.jsx` |
| `Core.UploadFile` | Supabase Storage (bucket `uploads`) |
| `Core.InvokeLLM` | Edge Function `invoke-llm` → API Anthropic |
| Fonction `analyzeClothingPhoto` | Edge Function `analyze-clothing-photo` (Vision + Claude) |

> **Astuce d'archi :** les 22 fichiers qui appelaient `base44.*` n'ont pas changé.
> Un shim de compatibilité (`src/api/base44Client.js`) réexpose la même interface,
> adossée à Supabase. Pour t'affranchir totalement du nom « base44 » plus tard,
> il suffira de renommer ce module et ses imports.

---

## ✅ Actions que TU dois faire (je ne peux pas les faire à ta place)

### 1. Clés API (services IA)
- **Anthropic** : crée une clé sur console.anthropic.com → `ANTHROPIC_API_KEY`
- **Google Vision** : active l'API Vision sur Google Cloud → `GOOGLE_VISION_API_KEY`

Ces clés restent **côté serveur** (secrets Edge Functions), jamais dans le frontend.

### 2. Choisir un mode Supabase
- **Local** (dev) : nécessite **Docker Desktop lancé**. Rien à créer en ligne.
- **Cloud** (prod / partage) : crée un projet sur supabase.com, récupère
  `Project URL` + `anon key` (Settings → API).

---

## 🚀 Lancer en LOCAL

```bash
# 1. Installer la CLI Supabase (une fois)
npm install -g supabase   # ou: brew install supabase/tap/supabase

# 2. Démarrer Docker Desktop, puis le stack local
cd fitme_app
supabase init        # crée supabase/config.toml (garde migrations & functions)
supabase start       # 1er lancement = téléchargement des images Docker

# 3. Appliquer le schéma
supabase db reset    # applique supabase/migrations/0001_init.sql

# 4. Renseigner le frontend : copie les valeurs affichées par `supabase start`
cp .env.example .env.local
#   VITE_SUPABASE_URL       = API URL   (http://127.0.0.1:54321)
#   VITE_SUPABASE_ANON_KEY  = anon key

# 5. Secrets des Edge Functions + servir les fonctions
supabase secrets set ANTHROPIC_API_KEY=sk-ant-... GOOGLE_VISION_API_KEY=...
supabase functions serve

# 6. Lancer le front (autre terminal)
npm run dev
```

Emails d'auth en local : capturés par **Inbucket** → http://127.0.0.1:54324

## ☁️ Déployer en CLOUD

```bash
supabase login
supabase link --project-ref <ton-ref>
supabase db push                              # applique les migrations
supabase functions deploy invoke-llm analyze-clothing-photo
supabase secrets set ANTHROPIC_API_KEY=... GOOGLE_VISION_API_KEY=...
# .env.local : URL + anon key du projet cloud
npm run build                                 # -> dist/ (déployable sur Vercel/Netlify/…)
```

---

## Modèle de données

7 tables owner-scoped (RLS `created_by = auth.uid()`) :
`profiles`, `wardrobe_item`, `saved_look`, `market_listing`, `outfit_log`, `trip`, `user_settings`.
Schéma complet : `supabase/migrations/0001_init.sql`.

## Notes
- Modèle Claude par défaut : `claude-sonnet-5` (surchargeable via secret `ANTHROPIC_MODEL`).
- Le dossier `base44/` (anciennes entités/fonction) est conservé comme référence — supprimable.
- OAuth Google (bouton login) : optionnel, à configurer dans Supabase → Authentication → Providers.
