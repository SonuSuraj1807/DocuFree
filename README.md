<div align="center">

<img src="apps/frontend/public/favicon.svg" width="64" height="64" alt="DocuFree logo" />

# DocuFree

**AI-powered document editor — free forever. No subscriptions, no watermarks.**

[![Deploy to GitHub Pages](https://github.com/YOUR_USERNAME/docufree/actions/workflows/deploy.yml/badge.svg)](https://github.com/YOUR_USERNAME/docufree/actions/workflows/deploy.yml)
[![CI Checks](https://github.com/YOUR_USERNAME/docufree/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/docufree/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-00e5ff.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)

**[Live Demo](https://YOUR_USERNAME.github.io/docufree) · [Issues](https://github.com/YOUR_USERNAME/docufree/issues)**

</div>

---

## Features

| Feature | Description |
|---------|-------------|
| PDF Editing | View, annotate, and edit PDFs with a Fabric.js overlay canvas |
| DOCX Support | Edit Word documents via Mammoth.js — full HTML round-trip |
| AI Assistant | Natural language commands via OpenRouter (Gemini, Llama, Mistral — free tier) |
| Smart Fields | Auto-detect names, dates, amounts, and addresses in documents |
| AI Rewrite | Rewrite, translate, or summarize selected text with one command |
| PDF Tools | Merge, split, compress, rotate, watermark, and redact PDFs |
| Export | Export to PDF, PNG, JPG, DOCX, and TXT |
| Auth | Google + GitHub sign-in via Firebase |
| Storage | Firebase Storage with auto-delete for guest files |
| Shortcuts | Ctrl+Z, Ctrl+Shift+Z, Ctrl+S, and more |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                       │
│  React 18 · Vite · TypeScript · Tailwind · Zustand          │
│  react-pdf · Fabric.js · Mammoth.js · react-dropzone        │
└─────────────┬───────────────────────────────────────────────┘
              │ HTTPS / REST
┌─────────────▼───────────────────────────────────────────────┐
│                    Express API  (Railway)                    │
│  Node.js · TypeScript · Firebase Admin · Multer             │
│  Rate limiting · Auth middleware · Cron cleanup             │
└───────┬──────────────────┬──────────────────────────────────┘
        │                  │
┌───────▼──────┐  ┌────────▼────────┐
│   Firebase   │  │   OpenRouter    │
│  Auth + GCS  │  │  Gemini · Llama │
│   Storage    │  │  Mistral (free) │
└──────────────┘  └─────────────────┘
```

Deploy targets:
- **Frontend** → GitHub Pages (this repo) + Vercel
- **Backend**  → Railway

---

## Project Structure

```
docufree/
├── .github/
│   └── workflows/
│       ├── deploy.yml        # Auto-deploy to GitHub Pages on push to main
│       └── ci.yml            # TypeScript check + build on every PR
├── apps/
│   ├── frontend/             # React + Vite
│   │   └── src/
│   │       ├── components/
│   │       │   ├── ui/       # AppShell, sidebar, layout
│   │       │   ├── editor/   # Toolbar, AICommandBar
│   │       │   └── pdf/      # PdfViewer (react-pdf)
│   │       ├── hooks/        # useFileUpload
│   │       ├── lib/          # Firebase, Axios, auth context
│   │       ├── pages/        # Landing, Auth, Dashboard, Editor
│   │       ├── store/        # Zustand stores
│   │       └── types/        # Shared TypeScript types
│   └── backend/              # Express API
│       └── src/
│           ├── routes/       # /files /ai /export /pdf
│           ├── middleware/   # authGuard
│           ├── services/     # Firebase Storage
│           └── lib/          # firebase-admin, file-store
├── vercel.json
├── railway.toml
└── package.json              # npm workspaces monorepo
```

---

## Setup

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/docufree.git
cd docufree
npm install
```

### 2. Firebase project

1. [Firebase Console](https://console.firebase.google.com) → New project
2. Authentication → Enable **Google** and **GitHub** providers
3. Storage → Get started
4. Project Settings → Your Apps → Add Web App → copy config
5. Project Settings → Service Accounts → Generate private key → save JSON

### 3. Environment files

```bash
cp apps/frontend/.env.example apps/frontend/.env.local
cp apps/backend/.env.example  apps/backend/.env
# Fill in Firebase keys and OPENROUTER_API_KEY
```

### 4. Run locally

```bash
npm run dev
# Frontend → http://localhost:5173
# Backend  → http://localhost:3001
```

---

## Deployment

### GitHub Pages (frontend)

1. Push repo to GitHub
2. **Settings → Pages → Source** → set to **GitHub Actions**
3. Add secrets under **Settings → Secrets → Actions**:

| Secret | Where to get it |
|--------|-----------------|
| `VITE_FIREBASE_API_KEY` | Firebase console → Project Settings |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase console |
| `VITE_FIREBASE_PROJECT_ID` | Firebase console |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase console |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase console |
| `VITE_FIREBASE_APP_ID` | Firebase console |
| `VITE_API_URL` | Your Railway backend URL |

4. Push to `main` → GitHub Actions deploys automatically
5. Live at `https://YOUR_USERNAME.github.io/docufree/`

> **Important:** In `.github/workflows/deploy.yml`, change `VITE_BASE_PATH: /docufree/` to match your exact repo name.

### Vercel (alternative frontend)

```bash
npx vercel --prod
```

### Railway (backend)

1. Push repo to GitHub
2. [Railway](https://railway.app) → New Project → Deploy from GitHub
3. Set env vars from `apps/backend/.env.example`
4. Railway auto-reads `railway.toml`

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | — | Health check |
| POST | `/api/files/upload` | ✓ | Upload file (max 100MB) |
| GET | `/api/files` | ✓ | List user files |
| GET | `/api/files/usage` | ✓ | Storage usage |
| GET | `/api/files/:id` | ✓ | Get file + fresh URL |
| DELETE | `/api/files/:id` | ✓ | Delete file |
| POST | `/api/ai/command` | ✓ | AI natural language command |
| POST | `/api/ai/detect-fields` | ✓ | Smart field detection |
| POST | `/api/export/:fileId` | ✓ | Export (pdf/png/docx/txt) |
| POST | `/api/pdf/merge` | ✓ | Merge PDFs |
| POST | `/api/pdf/split` | ✓ | Split PDF |
| POST | `/api/pdf/compress` | ✓ | Compress PDF |
| POST | `/api/pdf/rotate` | ✓ | Rotate pages |
| POST | `/api/pdf/watermark` | ✓ | Add watermark |
| POST | `/api/pdf/redact` | ✓ | Redact regions |

---

## Roadmap

- [x] Phase 1 — Auth, dashboard, file upload, PDF renderer
- [x] Phase 2 — Editor toolbar, DOCX support, undo/redo, export scaffolding
- [x] Phase 3 — AI integration via OpenRouter, field detection
- [x] Phase 4 — PDF tools suite, rate limiting, cron cleanup
- [ ] Fabric.js canvas tools (text/draw/highlight on PDF)
- [ ] pdf-lib full implementation
- [ ] Puppeteer PDF export
- [ ] Firestore persistence
- [ ] Redis rate limiting
- [ ] Mobile responsive editor

---

## Contributing

Contributions welcome! Open an issue first to discuss changes.

```bash
git checkout -b feature/your-feature
git commit -m "feat: your feature"
git push origin feature/your-feature
# open a PR
```

---

## License

[MIT](LICENSE) © 2025 YOUR_NAME

<div align="center">
  <sub>React · Express · Firebase · OpenRouter · GitHub Pages · Railway</sub>
</div>
