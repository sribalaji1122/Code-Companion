# InnooRyze ARC+ (Architecture & Capability Explorer)

## Overview

InnooRyze ARC+ is an internal AI-powered web tool that generates enterprise architecture visualizations and maturity models. Users provide company context (industry, tools, data sources, channels) through a form, and the system uses OpenAI to generate a structured JSON response containing architecture diagrams across four maturity stages: Current, Crawl, Walk, and Run. The tool renders interactive node-based architecture diagrams and use case journeys.

**Key constraint:** The AI must return strict JSON only — no free-text responses. The frontend only renders JSON data. Do not add authentication, pricing/ROI modeling, or execution workflows.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework:** React with TypeScript (no RSC/server components)
- **Routing:** Wouter (lightweight client-side router)
- **State Management:** Zustand with `persist` middleware for client-side architecture data storage
- **Data Fetching:** TanStack React Query for server state
- **Forms:** React Hook Form with Zod resolvers for validation
- **Diagram Rendering:** React + Tailwind + SVG for enterprise architecture blueprints with dark theme (EnterpriseArchitecture component); CSS Grid 3-column layout (Collect, Process, Activate) + full-width Data & Service strip; @xyflow/react retained for use-case journey diagrams
- **Graph Layout:** Deterministic CSS Grid layout with SVG edge overlays (no Mermaid, no auto-layout)
- **Animations:** Framer Motion for transitions and layout animations
- **UI Components:** shadcn/ui (new-york style) with Radix UI primitives
- **Styling:** Tailwind CSS with custom CSS variables for theming; custom fonts (Outfit for display, Plus Jakarta Sans for body)
- **Icons:** Lucide React

### Path Aliases
- `@/*` → `./client/src/*`
- `@shared/*` → `./shared/*`
- `@assets` → `./attached_assets/`

### Pages
- `/` → Redirects to `/input`
- `/input` → Company context input form
- `/architecture` → Maturity model visualization with tabbed stages (Current/Crawl/Walk/Run)
- `/use-cases` → Consulting-grade slide-style use case journeys: Section 1 (Summary/Objective/Audience), Section 2 (Horizontal Touchpoint Flow with timing/messaging/CTAs), Section 3 (Messaging Table), Section 4 (Control Rules: entry/exit/re-entry/frequency cap/KPIs)

### Backend Architecture
- **Runtime:** Node.js with Express
- **Language:** TypeScript (ESM modules, built with tsx for dev, esbuild for production)
- **API Pattern:** REST endpoints defined in `shared/routes.ts` with Zod schemas for input/output validation
- **Build:** Vite for client bundling, esbuild for server bundling; production output goes to `dist/`

### API Endpoints
- `POST /api/generate` — Accepts company context, calls OpenAI to generate architecture JSON, returns structured maturity model
- `GET /api/architectures` — Lists saved architectures
- `GET /api/architectures/:id` — Gets a specific saved architecture

### AI Integration
- Uses OpenAI API via user's own `OPENAI_API_KEY` secret
- Model: gpt-4o-mini
- System prompt enforces strict JSON output matching the architecture schema
- Node types: sourceNode, systemNode, channelNode, dataNode, decisionNode, entryNode, actionNode, exitNode
- Lanes: collect (x=100), process (x=500), engage (x=900), data (bottom full-width)
- Edge types: solid (data flow), dashed (segment sync), dotted (real-time events)
- Server-side post-processing enforces: all 4 stages present, data lane always has nodes, Crawl has no dotted edges, Run has dotted edges, keyChanges arrays always exist
- Use case post-processing: validates channels against input activationChannels + stage engage nodes, validates architectureComponentsUsed against stage node IDs, enforces max 6 use cases, normalizes to journey.touchpoints[] + journey.controlRules{} structure, enforces 4-6 touchpoint range, migrates legacy fields (kpis/measuresOfSuccess → measures, flat journey fields → controlRules)

### Data Storage
- **Database:** PostgreSQL via `DATABASE_URL` environment variable
- **ORM:** Drizzle ORM with `drizzle-zod` for schema-to-validation integration
- **Schema location:** `shared/schema.ts`
- **Migrations:** Managed via `drizzle-kit push` (output to `./migrations/`)
- **Main table:** `architectures` — stores company name, input context (JSONB), AI output (JSONB), created timestamp
- **Chat tables:** `conversations` and `messages` in `shared/models/chat.ts` (for Replit integrations, not core business logic)

### Shared Layer (`shared/`)
- `schema.ts` — Drizzle table definitions, Zod schemas for company context input and AI output
- `routes.ts` — API route definitions with type-safe schemas
- `models/chat.ts` — Chat/conversation models (Replit integration scaffolding)

### Replit Integrations (scaffolding, not core)
- `server/replit_integrations/` contains pre-built modules for audio, chat, image, and batch processing
- These are integration templates and not central to ARC+ business logic

## External Dependencies

### Required Services
- **PostgreSQL** — Primary database (must be provisioned, connection via `DATABASE_URL`)
- **OpenAI API** — Architecture generation via Replit AI Integrations (`AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`)

### Key NPM Packages
- `@xyflow/react` — Node-based diagram rendering
- `dagre` — Graph layout algorithm
- `framer-motion` — Animations
- `drizzle-orm` / `drizzle-kit` — Database ORM and migrations
- `openai` — OpenAI SDK
- `zod` — Schema validation (shared between client and server)
- `zustand` — Client-side state management
- `wouter` — Client-side routing
- `react-hook-form` — Form handling
- `express` — HTTP server
- `connect-pg-simple` — PostgreSQL session store (available but auth not implemented per project rules)