# FitMe — Digital Closet & Style Assistant

> A smart, intuitive digital closet that helps you track your outfits, generate stylish looks effortlessly, and declutter your wardrobe.

---

## 📖 Table of Contents

1. [Mission](#-mission)
2. [Tech Stack](#-tech-stack)
3. [App Structure](#-app-structure)
4. [Entities (Data Model)](#-entities-data-model)
5. [Pages](#-pages)
6. [Components](#-components)
7. [Backend Functions](#-backend-functions)
8. [Integrations](#-integrations)
9. [Design System](#-design-system)
10. [Authentication & Security](#-authentication--security)
11. [Internationalization](#-internationalization)

---

## 🎯 Mission

FitMe is a personal wardrobe management app designed to help users:

- **Track** every clothing item they own in a digital closet.
- **Generate** stylish outfits effortlessly using AI.
- **Log** daily outfits on a calendar to build a style history.
- **Declutter** by selling, swapping, or listing unused items on the FitMe Market.
- **Plan** trips with AI-generated packing lists.
- **Understand** their style DNA and sustainability impact.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Animation | Framer Motion |
| State | TanStack React Query |
| Routing | React Router DOM v6 |
| Maps | React Leaflet |
| Charts | Recharts |
| Icons | lucide-react |
| Fonts | Playfair Display (display) + DM Sans (body) |
| Backend | Base44 BaaS (auth, database, integrations, hosting) |
| AI | Claude (via InvokeLLM), Google Vision (clothing photo analysis) |

---

## 🏗 App Structure

```
src/
├── App.jsx                  # Router + auth/providers wrapper
├── main.jsx                 # Vite entry
├── index.css                # Design tokens (colors, fonts, radius)
├── api/
│   └── base44Client.js      # Pre-initialized Base44 SDK
├── pages/
│   ├── Home.jsx             # Dashboard, weather, outfit suggestions
│   ├── Wardrobe.jsx         # Digital closet management
│   ├── LookGenerator.jsx    # AI outfit generator
│   ├── Sell.jsx             # Declutter / marketplace
│   ├── CalendarPage.jsx     # Outfit logging calendar
│   └── Profile.jsx          # User profile, stats, settings
├── components/
│   ├── layout/              # AppShell, BottomNav
│   ├── wardrobe/            # AddItemModal, ItemDetailScreen, etc.
│   ├── outfits/             # OutfitBuilder, OutfitDetailSheet
│   ├── looks/               # SavedLooksSection, OutfitResultCard
│   ├── calendar/            # LogOutfitModal, MonthGrid, WeekStrip
│   ├── sell/                # SellModal, SwapModal, SellItemCard
│   ├── market/              # FitMeMarket, MarketCard, MarketChat
│   ├── trips/               # TripPlanner, TripResult, MyTrips
│   ├── profile/             # ProfileHeader, StyleDNACard, etc.
│   ├── shared/              # SeasonChips
│   └── ui/                  # shadcn/ui primitives + FitMeToaster
├── lib/
│   ├── AuthContext.jsx      # Auth provider
│   ├── SeasonContext.jsx    # Current season state
│   ├── i18n.jsx             # Language provider + translations
│   ├── query-client.js      # React Query client
│   ├── seedWardrobe.js      # Sample data seeding
│   └── utils.js             # cn() helper
└── utils/
    └── index.ts             # createPageUrl helper

base44/
├── entities/                # JSON schema definitions
├── functions/               # Backend function handlers
└── config.jsonc             # App configuration
```

---

## 🗄 Entities (Data Model)

All entities use **Row-Level Security (RLS)** scoped to `created_by_id: {{user.id}}` — each user only sees their own records.

### WardrobeItem
The core entity representing a piece of clothing.

| Field | Type | Description |
|---|---|---|
| `name` | string (required) | Item name |
| `category` | enum (required) | Tops, Bottoms, Dresses, Shoes, Bags, Accessories, Jewellery |
| `color` | string | Primary color |
| `brand` | string | Brand name |
| `size` | string | e.g. S, M, 38, XL |
| `tags` | string[] | User-defined tags |
| `style_tags` | string[] | AI-generated style tags |
| `photo_url` | string | Main photo URL |
| `extra_photos` | string[] | Additional photos for marketplace |
| `emoji` | string | Placeholder if no photo |
| `times_worn` | number | Wear count (default 0) |
| `last_worn_date` | date | Last worn |
| `date_added` | date | When added |
| `is_for_sale` | boolean | Listed on market (default false) |
| `season` | enum[] | Spring, Summer, Autumn, Winter |
| `notes` | string | User notes |

### OutfitLog
A daily outfit entry on the calendar.

| Field | Type | Description |
|---|---|---|
| `date` | date (required) | Date worn |
| `occasion` | enum | Uni, Dinner, Club, Date, Sport, Travel, Work |
| `item_ids` | string[] | IDs of wardrobe items worn |
| `item_snapshots` | object[] | Snapshot of items at log time |
| `outfit_name` | string | Outfit name (from Look Generator) |
| `saved_look_id` | string | Reference to SavedLook if used |
| `notes` | string | User notes |

### SavedLook
An AI-generated or user-created outfit combination.

| Field | Type | Description |
|---|---|---|
| `outfit_name` | string (required) | AI or user name |
| `style_description` | string | Short style description from Claude |
| `styling_tip` | string | Styling tip from Claude |
| `item_ids` | string[] (required) | Selected wardrobe item IDs |
| `item_snapshots` | object[] | Snapshot of item data |
| `match_score` | number | Match percentage (0–100) |
| `occasion_prompt` | string | Original user prompt |
| `date_saved` | date | When saved |
| `season` | string | Season this look belongs to |
| `is_favourite` | boolean | Favourited by user |
| `is_manual` | boolean | true = user-created, false = AI-generated |
| `tags` | string[] | e.g. gym, daily, work |
| `times_worn` | number | How many times worn |
| `last_worn_date` | date | Last worn |

### MarketListing
A marketplace listing linked to a wardrobe item.

| Field | Type | Description |
|---|---|---|
| `wardrobe_item_id` | string (required) | Linked WardrobeItem ID |
| `title` | string (required) | Listing title |
| `description` | string | Listing description |
| `price` | number | Asking price (euros) |
| `condition` | enum | New with tags, Like new, Good, Fair |
| `size` | string | Size |
| `category` | string | Item category |
| `brand` | string | Brand |
| `color` | string | Color |
| `season` | string[] | Seasons |
| `cover_photo` | string | Cover photo URL |
| `photos` | string[] | All photo URLs |
| `status` | enum | active, sold, removed (default active) |

### Trip
An AI-planned trip with packing list.

| Field | Type | Description |
|---|---|---|
| `destination` | string (required) | City/country |
| `date_from` | date (required) | Start date |
| `date_to` | date (required) | End date |
| `trip_types` | string[] | Activity types |
| `special_event` | string | Special event during trip |
| `trip_name` | string | AI-generated trip name |
| `packing_list` | object[] | AI packing list with wardrobe items |
| `missing_items` | object[] | Items Claude suggests buying |
| `packing_tips` | string[] | Packing tips from Claude |

### UserSettings
Per-user preferences.

| Field | Type | Description |
|---|---|---|
| `language` | string | Language code (default "en") |
| `weatherSuggestions` | boolean | Weather-based outfit suggestions (default true) |
| `dailyReminder` | boolean | Daily outfit reminder (default false) |
| `reminderTime` | string | Reminder time HH:MM (default "08:00") |
| `rotationReminders` | boolean | Remind about unworn items (default true) |
| `shareStyleData` | boolean | Share style data to improve AI (default false) |

### User (built-in)
Platform-managed user entity. Read-only: `id`, `created_date`, `full_name`, `email`. Editable: `role` (admin/user).

---

## 📄 Pages

### Home (`/`)
The main dashboard. Shows:
- **Weather widget** — geolocation + IP-based weather with WMO code icons.
- **Seasonal selector** — Spring/Summer/Autumn/Winter chips.
- **Outfit suggestion cards** — occasion-based styling (Uni, Dinner, Club, Date, Sport, Travel, Work).
- **Quick stats** — wardrobe overview.
- **Manual outfit builder** entry point.
- Integrates weather + season + wardrobe data to suggest looks.

### Wardrobe (`/wardrobe`)
Central hub for the digital closet:
- **Header** with item count and add menu.
- **Category filter** (Tops, Bottoms, Dresses, Shoes, Bags, Accessories, Jewellery).
- **Color filter** with swatches.
- **Sort** by wear frequency, last-worn, or date added.
- **Responsive grid** of wardrobe item cards.
- **Add menu** — batch scan, gallery import, manual entry.
- **Item detail** screen with edit/delete.
- **Outfit builder** for manual outfit creation.

### LookGenerator (`/look`, `/lookgenerator`)
AI-powered outfit generation:
- **Occasion chips** to set the styling context.
- **Voice modal** for spoken prompts.
- **Generating loader** with animation.
- **Outfit result card** with match score, style description, styling tip.
- **Market suggestions** for missing pieces.
- **Saved looks** section.
- **Saved look detail modal**.

### Sell (`/sell`)
Decluttering and marketplace:
- **Two main tabs**: My Items | FitMe Market.
- **Summary banner** — unworn count, estimated value, listed count.
- **Sub-tabs**: Suggestions | Listed | All Items.
- **SellItemCard** with sell/swap/third-party actions.
- **SellModal** — listing form with photo upload, AI description generation, condition selector, pricing.
- **SwapModal** — post swap offers.
- **ThirdPartyModal** — open external platforms (Vinted, Depop, etc.).
- **FitMeMarket** — browse/search/filter marketplace, favorites, item detail, swap offers, market chat.

### CalendarPage (`/calendar`, `/calendarpage`)
Outfit history and logging:
- **WeekStrip** — quick week navigation.
- **MonthGrid** — full calendar grid with outfit indicators.
- **CalendarStats** — wear frequency, most-worn items, rotation metrics.
- **FavouriteLooksGallery** — saved favourite outfits.
- **DayDetailPanel** — slide-over showing logged outfit, item gallery, notes, QR share.
- **LogOutfitModal** — bottom sheet to log outfits with:
  - Occasion selector.
  - Mode toggle: Wardrobe picker | Saved Look picker.
  - Item grid selection.
  - Saved looks list.
  - Notes field.
  - Dynamic title reflecting selected date.

### Profile (`/profile`)
User account and insights:
- **ProfileHeader** — avatar, name, email.
- **WardrobeStatsGrid** — total items, categories, brands.
- **ActivityStatsRow** — outfits logged, items worn.
- **StyleDNACard** — AI-analyzed style profile.
- **SustainabilityScore** — environmental impact metrics.
- **PreferencesSection** — settings toggles.
- **LanguageSelector** — en/es/fr.
- **AccountSection** — account management.

---

## 🧩 Components

### Layout
- **AppShell** — wraps all authenticated pages with top structure + bottom nav.
- **BottomNav** — mobile-first navigation bar (Home, Wardrobe, Look, Sell, Calendar, Profile).

### Wardrobe
- **AddItemModal** — photo upload with AI auto-fill (Vision + Claude). Fields: brand chips, name, category, season, color, style tags, notes. Sticky save footer. Gold dot indicator for AI-filled fields.
- **AddMenu** — bottom-sheet menu for batch scan, gallery import, manual entry.
- **BatchScanSession** — multi-item scanning flow.
- **GalleryImport** — import from device gallery.
- **ItemDetailScreen** — full item view with edit/delete.
- **EditItemModal** — edit existing item.
- **WardrobeItemCard** — grid card with photo, category badge, wear status.
- **WardrobeHeader** — title and actions.
- **CategoryFilter** — category chips.
- **ColorFilter** — color swatch filter.
- **SortButton** — sort dropdown.
- **EmptyWardrobe** — empty state illustration.
- **DeleteConfirmDialog** — delete confirmation.
- **wearStatus.jsx** — wear status logic (green/orange/red), category emojis, category badge colors, color options.

### Outfits & Looks
- **OutfitBuilder** — categorized item selection grid for manual outfit creation. Supports swapping items, naming, and persistence.
- **OutfitDetailSheet** — outfit detail slide-over.
- **MyOutfitsSection** — saved outfits list.
- **SavedLooksSection** — AI + manual saved looks.
- **OutfitResultCard** — AI result with match score.
- **GeneratingLoader** — animated generation state.
- **MarketSuggestions** — suggested purchases to complete a look.
- **SavedLookDetailModal** — saved look detail.
- **VoiceModal** — voice input for look prompts.
- **OccasionChips** — occasion selector.

### Calendar
- **LogOutfitModal** — bottom sheet for logging outfits. Wardrobe picker / Saved Look picker modes. Dynamic date title. Occasion selector. Notes.
- **DayDetailPanel** — slide-over day detail with item gallery, look details, notes, QR share modal.
- **MonthGrid** — monthly calendar grid.
- **WeekStrip** — weekly navigation strip.
- **CalendarStats** — wear statistics.
- **FavouriteLooksGallery** — favourite looks grid.

### Sell & Market
- **SellItemCard** — item card with sell/swap/third-party/remove actions.
- **SellModal** — listing form with photo compression, AI description, condition/price/size.
- **SwapModal** — swap offer posting.
- **ThirdPartyModal** — external platform opener.
- **sellUtils.jsx** — brand tier pricing (luxury/mid/fast-fashion), suggested price, sell-readiness, days-ago.
- **FitMeMarket** — marketplace browse with search, sort, filters, favorites.
- **MarketCard** — marketplace listing card.
- **MarketChat** — in-marketplace messaging.
- **MarketFilterPanel** — filter slide-over.
- **MarketItemDetail** — listing detail view.
- **SwapOfferModal** — swap offer creation.
- **marketplaceData.js** — marketplace data helpers.

### Trips
- **TripPlanner** — trip input and AI planning.
- **TripInputCard** — destination, dates, activities, special event.
- **TripResult** — AI packing list, missing items, tips.
- **MyTrips** — saved trips list.
- **TripDetailModal** — trip detail view.

### Profile
- **ProfileHeader** — user identity.
- **WardrobeStatsGrid** — wardrobe metrics.
- **ActivityStatsRow** — activity metrics.
- **StyleDNACard** — style DNA analysis.
- **SustainabilityScore** — sustainability metrics.
- **PreferencesSection** — settings toggles.
- **LanguageSelector** — language picker.
- **AccountSection** — account management.

### Shared & UI
- **SeasonChips** — `SeasonMultiChips` (multi-select) and `SeasonSelectorBar` (single-select).
- **FitMeToaster** — custom toast provider (max 2 toasts, auto-dismiss 2.5s, bottom-positioned above nav).
- Full **shadcn/ui** primitive set (button, input, select, dialog, drawer, tabs, etc.).

---

## ⚙️ Backend Functions

### `analyzeClothingPhoto`
Located at `base44/functions/analyzeClothingPhoto/entry.ts`.

**Purpose**: Analyzes a clothing photo and auto-fills item metadata.

**Flow**:
1. **Google Vision API** — label detection, color extraction, category inference.
2. **Claude (InvokeLLM)** — structures the Vision output into a clean item record (name, category, color, brand, season, style tags, notes).

**Input**: `{ base64Image, photoUrl, lang }`
**Output**: `{ name, category, color, brand, season[], style_tags[], notes, low_confidence, error }`

**Secrets used**: `GOOGLE_VISION_API_KEY`

---

## 🔌 Integrations

### Core (built-in)
| Integration | Usage |
|---|---|
| `InvokeLLM` | AI outfit generation, style descriptions, trip planning, clothing analysis structuring |
| `UploadFile` | Item photo uploads |
| `UploadPrivateFile` | Private file storage |
| `CreateFileSignedUrl` | Signed URLs for private files |
| `ExtractDataFromUploadedFile` | Data extraction from CSV/Excel/JSON/PDF |
| `GenerateImage` | AI image generation |
| `GenerateSpeech` | TTS for voice features |
| `GenerateVideo` | AI video generation |
| `SendEmail` | Notifications to registered users |
| `SendPushNotification` | Mobile push (native app only) |
| `TranscribeAudio` | Voice-to-text |

### External APIs
- **Google Vision API** — clothing photo label/color/category detection (via `analyzeClothingPhoto` backend function).
- **Weather API** — geolocation + IP-based weather for outfit suggestions (called from Home.jsx).

### Connectors (available, not yet authorized)
The app supports a wide range of OAuth connectors (Google Calendar, Gmail, Slack, Notion, etc.) but none are currently authorized. A workspace connector for **Google Calendar** is registered (`Google Calendar (usuarios)`, id: `6a7750a888193d87943e77be`).

---

## 🎨 Design System

### Color Tokens (HSL)
| Token | Value | Hex | Usage |
|---|---|---|---|
| `--background` | `0 0% 100%` | #FFFFFF | Page background |
| `--foreground` | `0 0% 6%` | #0F0F0F | Primary text |
| `--primary` | `0 0% 6%` | #0F0F0F | Buttons, active states |
| `--secondary` | `40 14% 96%` | #F5F4F1 | Off-white surfaces |
| `--muted` | `36 12% 93%` | #EDEBE7 | Muted backgrounds |
| `--muted-foreground` | `0 0% 42%` | #6B6B6B | Secondary text |
| `--accent` | `36 48% 61%` | #C9A96E | Warm gold accent |
| `--destructive` | `0 44% 39%` | #8B3A3A | Muted burgundy |
| `--border` | `36 16% 90%` | #E8E6E1 | Borders |
| `--success` | `142 25% 39%` | #4A7C59 | Forest green |

### Typography
- **Display**: `Playfair Display` (headings, serif) — elegant, editorial feel.
- **Body**: `DM Sans` (body, UI) — clean, modern sans-serif.

### Radius
- `--radius`: `0.25rem` (sharp, minimal corners — fashion-editorial aesthetic).

### Design Language
- **Editorial / fashion-magazine** aesthetic with serif display + sans body.
- **Minimal, sharp corners** (2–4px radius).
- **Gold accent** (`#C9A96E`) for AI features and highlights.
- **Soft shadows** via custom border-based `soft-shadow` utilities.
- **Mobile-first** with bottom sheets, sticky footers, and bottom navigation.

---

## 🔐 Authentication & Security

### Auth
- Platform-managed authentication (login, sessions, email verification).
- Login page provided by the platform — no custom login page.
- `AuthProvider` wraps the app; `useAuth()` exposes loading/error states.
- `UserNotRegisteredError` component handles unregistered users.
- Users join via invites (`base44.users.inviteUser(email, role)`).

### Row-Level Security (RLS)
All custom entities enforce ownership-based RLS:
```jsonc
"rls": {
  "create": { "created_by_id": "{{user.id}}" },
  "read":   { "created_by_id": "{{user.id}}" },
  "update": { "created_by_id": "{{user.id}}" },
  "delete": { "created_by_id": "{{user.id}}" }
}
```
Each user can only create, read, update, and delete their own records. The built-in `User` entity has platform-default security (admins can manage other users).

---

## 🌍 Internationalization

- **LanguageProvider** (`src/lib/i18n.jsx`) wraps the app.
- `useLanguage()` hook provides `t(key, ...args)` and `lang`.
- Supported languages: **English (en)**, **Spanish (es)**, **French (fr)**.
- Language preference stored in `UserSettings.language`.
- `LanguageSelector` component in Profile page.
- All UI strings localized across pages and components.

---

## 📱 Navigation

### Routes
| Path | Page |
|---|---|
| `/` | Home (dashboard) |
| `/wardrobe` | Wardrobe (digital closet) |
| `/look` `/lookgenerator` | LookGenerator (AI outfits) |
| `/sell` | Sell (declutter + market) |
| `/calendar` `/calendarpage` | CalendarPage (outfit history) |
| `/profile` | Profile (account + insights) |
| `*` | PageNotFound |

### Bottom Nav
Mobile-first bottom navigation bar with icons for: Home, Wardrobe, Look, Sell, Calendar, Profile.

---

## 📊 Key Features Summary

| Feature | Description |
|---|---|
| 📸 AI Photo Analysis | Snap a photo → Vision + Claude auto-fills name, category, color, brand, season, tags |
| ✨ AI Look Generator | Describe an occasion → Claude builds an outfit from your wardrobe with a match score |
| 📅 Outfit Calendar | Log daily outfits, view history, QR-share looks, see wear statistics |
| 🏷️ FitMe Market | List items for sale, browse marketplace, swap offers, in-app chat |
| 🧳 Trip Planner | Enter destination + dates → AI packing list using your wardrobe + missing item suggestions |
| 🌤️ Weather Suggestions | Local weather influences outfit recommendations |
| 📊 Style DNA | AI-analyzed style profile from your wardrobe and wear history |
| ♻️ Sustainability Score | Tracks wardrobe rotation and environmental impact |
| 🗣️ Voice Prompts | Speak your outfit request |
| 🌍 Multi-language | English, Spanish, French |
| 📱 Mobile-First | Bottom sheets, sticky footers, responsive grids — ships to iOS/Android |

---

*Generated for FitMe — your digital closet, style assistant, and decluttering companion.*