# youtube saver — Private Media Workspace (MEDIAFLOW)

A frontend implementation for **youtube saver / MEDIAFLOW**, a private media workspace designed for processing and managing company-owned or authorized digital assets.

This phase is **frontend-only** with a realistic simulated state engine, design tokens, and a clean service abstraction ready for future backend integration.

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Design System**: Dark SaaS tokens (CSS Variables)
- **Icons**: Lucide React
- **State Management**: React Context (`WorkspaceContext`) with simulated job transitions
- **Notifications**: Lightweight Accessible Toast System

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### 3. Production Build
```bash
npm run build
npm start
```

---

## 🎨 Design Tokens & Theme

The design system is defined in `src/app/globals.css` and mapped to Tailwind utilities in `tailwind.config.ts`:

- `--background`: Deep Charcoal Black (`#0b0c10`)
- `--surface`: Refined Container Surface (`#12141a`)
- `--surface-elevated`: Elevated Cards & Dropdowns (`#191c24`)
- `--surface-hover`: Interactive hover surface (`#20242e`)
- `--border`: Crisp subtle borders (`#262b36`)
- `--border-subtle`: Secondary divider lines (`#1a1e27`)
- `--border-focus`: Focus rings (`#5073fa`)
- `--text-primary`: Crisp White (`#f5f6f8`)
- `--text-secondary`: Slate Secondary (`#9ca3af`)
- `--text-muted`: Metadata tertiary (`#646c7b`)
- `--accent`: Technical Indigo (`#5073fa`) — easily swappable
- `--success`: Emerald Green (`#22c55e`)
- `--warning`: Amber Warning (`#eab308`)
- `--error`: Crimson Error (`#f43f5e`)

---

## 🧭 Routes & Application Structure

| Route | View | Description |
|---|---|---|
| `/` | **Downloader (Home)** | Primary media ingestion workspace, URL input, analysis skeleton, format selector, live progress, completion card, and error handling. |
| `/downloads` | **Downloads Queue** | Active job manager with tabs (`All`, `Active`, `Completed`, `Failed`), live progress bars, retry, and delete controls. |
| `/history` | **History Archive** | Searchable archive with status filters, date sorting, and asset manifest downloads. |
| `/settings` | **Settings** | General defaults (format/quality), storage usage bar (2.4 GB / 10 GB), cache clearing action, and interface toggles. |
| `/about` | **About** | System architecture, version info, compliance policy, and legal governance notices. |

---

## 🔌 Backend-Ready Service Layer

All backend operations are abstracted in `src/lib/services/media-service.ts`. When ready to connect to real endpoints, replace the simulated methods with HTTP `fetch` requests:

- `POST /api/media/analyze` ➔ `mediaService.analyzeMedia(url)`
- `POST /api/downloads` ➔ `mediaService.startDownload(media, format)`
- `GET /api/downloads/:id` ➔ `mediaService.getDownloadStatus(id)`
- `POST /api/downloads/:id/cancel` ➔ `mediaService.cancelDownload(id)`
- `GET /api/history` ➔ `mediaService.getHistory()`

---

## 📱 Responsive Verification

The UI is optimized for:
- **iPhone** (390 × 844, 430 × 932): Full-width URL input, stacked format cards, thumb-friendly bottom dock navigation + slide-over drawer, and comfortable touch targets (≥ 40px).
- **iPad** (768 × 1024, 1024 × 1366): Two-column grid layouts and spacious preview cards.
- **Desktop** (1280 × 800, 1440 × 900, 1920 × 1080): Left sidebar with active route badges, top metrics header, and centered workspace.
