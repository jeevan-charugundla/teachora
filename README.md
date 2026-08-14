# Teachora - AI-Powered Educational Content & Studio Platform

**Teachora** is an end-to-end, AI-driven educational platform designed to empower educators, instructional designers, and content creators. It provides intelligent tools to generate, customize, preview, and export high-quality teaching materials, interactive lessons, assessment assets, and multimedia resources seamlessly.

---

## 🌟 Key Features

### 🎨 Creation Studio
- **Multi-Format Content Generation**: Generate 13+ distinct educational asset types:
  - **Lesson Plans & Notes**: Comprehensive structured summaries, key concepts, and detailed teaching guides.
  - **Assessments & Evaluations**: Question papers, mock tests, quizzes, and rubrics.
  - **Interactive Learning**: Flashcard decks, interactive student activities, and assignments.
  - **Visual & Multimedia Assets**: Presentation slide outlines, infographics, mind maps, analytical charts, and educational video script outlines.
- **Live Interactive Previews**: Rich, real-time visual previews for every content type with full editing and customizing capability before saving.
- **Export Capabilities**: Export generated materials directly to PDF, DOCX (Microsoft Word), PPTX (PowerPoint), or raw JSON formats.

### 🤖 AI Teacher Assistant & Chat
- **Interactive Chat Interface**: Conversational AI tutor and assistant customized for pedagogical guidance, curriculum alignment, and lesson drafting.
- **Document RAG / Context Awareness**: Extract and analyze uploaded PDF textbooks, syllabus documents, or notes to ground AI answers and creations directly in relevant study material.
- **Multi-Provider AI Edge Pipeline**: Integrates Supabase Edge Functions with direct Pollinations AI / LLM models for generation and image synthesis.

### 🗂️ Workspace & Project Management
- **Folder & Asset Organization**: Organize educational content into custom workspaces, sub-folders, and projects.
- **IndexedDB Offline Caching**: Browser-side storage using Dexie.js for persistent drafts and fast local state retrieval.
- **Supabase Cloud Synchronization**: Sync profiles, project assets, conversations, and usage limits effortlessly with Supabase Postgres DB & Storage.

### 🔍 Discover & Templates Catalog
- **Curated Template Library**: Browse pre-built templates categorized by grade level, subject matter, and learning objective.
- **Quick-Start Wizard**: Launch customized wizards for fast asset generation tailored to specific educational standards.

---

## 🛠️ Architecture & Tech Stack

### Frontend Architecture
- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vitejs.dev/) with PWA support
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) + Radix UI Primitives + Framer Motion animations
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) for global app state & Dexie.js for local IndexedDB caching
- **Data Fetching & Caching**: [TanStack Query v5](https://tanstack.com/query)
- **Charts & Data Visuals**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend & AI Infrastructure
- **Backend as a Service (BaaS)**: [Supabase](https://supabase.com/) (Authentication, PostgreSQL Database, Storage, RLS policies)
- **Serverless Functions**: Supabase Edge Functions (Deno / TypeScript runtime)
  - `generate-content`: Formats structured JSON educational assets based on strict prompt system guidelines.
  - `generate-image`: Image synthesis pipeline for visual materials.
  - `teacher-chat` & `chat`: Conversational AI endpoints with streaming & prompt context injection.
  - `search-media`: Unsplash/Pexels media search edge function integration.

---

## 📁 Repository Directory Structure

```text
teachora/
├── public/                    # Static assets, icons, and web manifest
├── scripts/                   # Test scripts for API verification & model tests
├── src/
│   ├── app/                   # Root providers, layouts (Sidebar, BottomNav), and routing setup
│   ├── components/            # Reusable UI components (Common headers, feedback overlays, modals)
│   ├── features/
│   │   ├── assistant/         # AI Assistant Chat page, Markdown renderers, Save/Export modals
│   │   ├── auth/              # Login, Signup, and Password reset flows
│   │   ├── create/            # Creation Studio, wizard forms, asset-specific previews & catalog
│   │   ├── discover/          # Content discovery & template catalog page
│   │   ├── home/              # Main dashboard overview
│   │   ├── lessons/           # Lesson planning, create & edit flows
│   │   ├── profile/           # User profile & subscription management
│   │   └── workspace/         # Folder organization, asset management & project view
│   ├── hooks/                 # Custom React hooks (media queries, online status)
│   ├── lib/                   # Utilities & constants
│   ├── services/              # AI providers, document extraction (PDF), exporters (PDF/DOCX/PPTX), Supabase client APIs
│   ├── stores/                # Zustand state stores (Auth, UI, Creation)
│   └── types/                 # Shared TypeScript interfaces & Database schemas
└── supabase/
    ├── functions/             # Deno Edge Functions (chat, generate-content, generate-image, search-media)
    └── migrations/            # PostgreSQL database schema & vector document chunk migrations
```

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or later recommended)
- `npm` or `pnpm` / `yarn`
- [Supabase CLI](https://supabase.com/docs/guides/cli) (optional, if running backend Edge Functions locally)

### 1. Clone the Repository
```bash
git clone https://github.com/jeevan-charugundla/teachora.git
cd teachora
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory (or copy `.env.example`):
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

If deploying or developing Supabase Edge Functions locally, configure `supabase/.env`:
```env
POLLINATIONS_API_KEY=your_optional_key
```

### 4. Start Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## 📜 Build & Maintenance Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite local development server with HMR. |
| `npm run build` | Runs TypeScript typechecks (`tsc -b`) and builds production bundle. |
| `npm run preview` | Previews production build build output locally. |
| `npm run lint` | Runs [Oxlint](https://oxc.rs/) for high-performance linting. |

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
