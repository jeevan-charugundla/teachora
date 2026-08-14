<!-- Tech stack confirmed: React 19, TypeScript, Vite 8, Tailwind CSS v4, Zustand, Dexie.js (IndexedDB), Supabase (Auth, Postgres, Storage), Supabase Edge Functions (Deno) -->
# Teachora — AI-Powered Educational Content & Studio Platform

> Transform curriculum topics into rich, multi-format teaching assets, interactive lessons, and AI-tutored learning experiences in seconds.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-38BDF8?style=flat&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)

---

## 📖 Overview

Educators spend dozens of hours every week manually preparing lesson plans, creating assessments, formatting slide decks, and tailoring materials for diverse learning needs. **Teachora** solves this burden by offering an all-in-one AI creation studio and intelligent assistant for teachers, instructional designers, and content creators. 

With Teachora, educators can transform any syllabus topic or uploaded textbook PDF into 13+ structured, classroom-ready educational formats—complete with interactive previews, customized editing, offline draft caching, and one-click exports.

---



---

## ✨ Key Features

- **Multi-Format AI Creation Studio**: Generate lesson plans, question papers, quizzes, mock tests, flashcards, slide outlines, infographics, mind maps, and video scripts.
- **Live Interactive Previews**: Instantly review, edit, and fine-tune AI-generated content before saving or exporting.
- **RAG & PDF Document Context**: Upload textbooks, syllabus PDFs, or course notes to ground AI answers and asset generations directly in course content.
- **Multi-Format Exporters**: Export created assets directly to PDF, DOCX (Microsoft Word), PPTX (PowerPoint), or raw JSON.
- **Interactive AI Teacher Assistant**: Conversational AI tutor built for lesson drafting, pedagogical advice, and curriculum alignment.
- **Workspaces & Offline Support**: Organize content into folders and projects with offline browser caching via Dexie.js (IndexedDB) and cloud sync with Supabase.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript | Core UI library & type-safe component model |
| **Build Tool & PWA** | Vite 8 + vite-plugin-pwa | Fast development server, bundling & progressive web app setup |
| **Styling & Motion** | Tailwind CSS v4 + Framer Motion | Modern responsive design system, UI primitives & smooth animations |
| **State & Offline Storage** | Zustand + Dexie.js (IndexedDB) | Global UI state management & offline-first browser draft caching |
| **Data Fetching** | TanStack Query v5 | Server state caching, asynchronous query handling & invalidation |
| **Backend as a Service** | Supabase (PostgreSQL, Auth, Storage) | User authentication, database schema, asset storage & RLS security |
| **Serverless Infrastructure** | Supabase Edge Functions (Deno) | AI content generation pipelines, chat streaming & media search proxy |
| **Visuals & Charts** | Recharts + Lucide React | Data visual analytics, chart rendering & vector icon library |

---

## 🏗️ Architecture

Teachora follows a feature-driven frontend architecture structured around clean separation of concerns. Feature modules (`src/features/*`) encapsulate their own components, pages, data, services, and state types. Shared application infrastructure—such as authentication providers, top-level layouts, edge service abstractions, and UI Zustand stores—resides in dedicated global directories.

Offline storage is powered by **Dexie.js (IndexedDB)** for local drafts, while cloud data synchronization, user identity, and storage buckets are managed via **Supabase**.

```text
src/
├── app/          # App providers, layouts (Sidebar, BottomNav), router setup
├── components/   # Shared UI components, overlays, modals, and error states
├── features/     # Feature-sliced modules (assistant, create, discover, home, workspace)
├── hooks/        # Reusable React hooks
├── lib/          # Global constants and formatting utilities
├── services/     # AI providers, document extractors, exporters (PDF/DOCX/PPTX), Supabase APIs
├── stores/       # Zustand global state stores
└── types/        # TypeScript declarations & database interfaces
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (or `pnpm` / `yarn`)
- **Supabase CLI** *(optional)*: For running backend Edge Functions locally

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jeevan-charugundla/teachora.git
   cd teachora
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:5173` in your browser.

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📁 Project Structure

```text
teachora/
├── public/           # Static web assets, manifest, and icons
├── scripts/          # Node test scripts for API & AI generation verification
├── src/              # React frontend application source code
└── supabase/         # Deno edge functions (chat, generate-content) and SQL migrations
```

---

## 📋 Roadmap

- [x] ✅ Multi-format educational asset generator (13+ asset types)
- [x] ✅ Live interactive asset previews & inline editing
- [x] ✅ Document context ingestion (PDF extraction)
- [x] ✅ PDF, DOCX, and PPTX export engines
- [x] ✅ Workspace & folder management with Dexie offline caching
- [x] ✅ Supabase Authentication & PostgreSQL Cloud Sync
- [🚧] In Progress: Enhanced AI prompt customizer for state/national board standards
- [📋] Planned: Collaborative workspace sharing & team classrooms
- [📋] Planned: LMS Integration (Google Classroom, Canvas export)

---

## ⚠️ Known Limitations

- **AI Generation**: Requires an active internet connection to communicate with AI Edge endpoints.
- **Document Processing**: Large PDF extractions (>50 pages) run client-side and may experience memory lag on low-spec hardware.
- **Offline Mode**: Offline capabilities support draft editing and local browsing; generating new AI content requires online access.

---

## 🤝 Contributing

This project is currently in active development by the core maintainer. Feedback and feature requests are welcome via GitHub Issues.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

## ✉️ Author / Contact

**Jeevan Charugundla**  
- GitHub: [@jeevan-charugundla](https://github.com/jeevan-charugundla)
