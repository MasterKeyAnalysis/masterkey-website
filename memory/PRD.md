# PRD — Master Key Analysis

## Original Problem Statement
A hybrid product for Master Key Analysis (Founder: Vasanth, "Unlocking Business Intelligence — Data Insights. Smart Solutions."):
1. Multi-page marketing website (Home, About, Founder, Services, Why Us, Process, Contact) in navy + orange corporate tones, fresh modern design.
2. A real, functional data-analysis web application: Excel/CSV upload, validation/cleaning/processing, interactive analysis (filter/search/sort/drill-down), KPI cards, charts, tables, export/download of results and reports, secure DB storage of datasets and analysis records, admin dashboard with left sidebar (Overview, Data Upload, Data Analysis, Charts, Detailed Results, Reports/Export, Admin).
3. Contact form saves enquiries to DB with an admin view to read them.

## User Personas
- Prospective business client browsing the marketing site and sending an enquiry
- Admin (Vasanth) logging into the dashboard to upload datasets, analyze, visualize, export, and review enquiries

## Architecture
- Frontend: React 19 + Tailwind + framer-motion + lenis + recharts + sonner. Marketing pages under /src/pages/marketing, dashboard under /src/pages/dashboard. JWT in localStorage (mka_token), axios interceptor adds Bearer token.
- Backend: FastAPI (/api prefix) + pandas/openpyxl for file parsing + bcrypt + PyJWT. MongoDB (motor) via MONGO_URL/DB_NAME.
- Collections: users (seeded admin), enquiries, datasets (metadata + column profiles), dataset_rows (rows as {dataset_id, data}), login_attempts (brute-force lockout).
- Design tokens per /app/design_guidelines.json: navy #050B14/#0A1428/#122340, orange #F97316, Cabinet Grotesk (display) + Manrope (body/dashboard).

## Implemented (2026-08-25)
- Marketing site: kinetic hero with masked line reveal + parallax + grain, editorial marquee, numbered approach chapters, services preview with tracing-beam cards, process teaser, founder teaser, CTA band; pages for About, Founder, Services (12 services), Why Us (+ expertise + industries), Process (6 steps), Contact.
- Contact form → POST /api/enquiries (public), stored in MongoDB, success state + toasts.
- Auth: admin login (JWT, bcrypt, brute-force lockout), idempotent admin seeding from env. Credentials in /app/memory/test_credentials.md.
- Dashboard: left sidebar layout (responsive, mobile drawer), Overview (KPIs + recent activity), Data Upload (drag-drop, pandas cleaning/profiling, 20k row cap), Data Analysis (KPI cards + per-column profiles: numeric stats / top values), Charts (bar/line/area/pie via MongoDB aggregation, X/Y/agg controls), Detailed Results (search, column filter, sortable headers, pagination), Reports & Export (CSV, XLSX, JSON analysis summary), Admin (enquiry read/unread/delete, dataset delete).
- Verified: all API endpoints with curl (login, me, 401 guard, enquiry, upload, rows+search, aggregate, CSV export, stats); screenshots of home hero, scroll sections, login→overview, charts with live data.

## Update (2026-08-25, iteration 2)
- Founder's real photo (/assets/vasanth.png) now used in the hero (spotlight clipped frame), Founder page, Home founder teaser, and as the dashboard header avatar.
- About stat box "6 Core Tools" replaced with "Financial Analytics & Excel Stock Mgmt".
- New GET /api/finance/sample endpoint serving deterministic sample stock/financial data (opening stock, purchases, sales, closing stock, turnover for 12 months).
- New marketing section "Sample Insights" on Home: dark Power BI-style KPI cards + stock movement bar chart + turnover line chart.
- New dashboard page "Financial Insights" (/dashboard/finance): dark Power BI-themed panel with 4 KPI cards, turnover line chart, stock movement bar chart, closing stock area chart. Sidebar nav updated.
- Verified: finance endpoint curl OK; screenshots of hero photo, showcase section, and finance dashboard page.

## Update (2026-08-26, iteration 3)
- Hero background replaced with a subtle data-analytics watermark layer (HeroWatermark.js): grid, line/bar/donut charts, KPI card outlines, faint figures, and a giant faded "DATA ANALYSIS" text — all low opacity, parallax preserved.
- Original uncropped founder photo (vasanth.png) shown with full framing in the hero card, founder teaser, and Founder page (no aspect-crop). Mobile stacks the photo below the hero content; a tightly cropped vasanth-avatar.png is used only for the tiny dashboard header avatar.
- Official Master Key Analysis logo cropped from the flyer (/assets/logo.png) now used in the marketing navbar, footer, dashboard sidebar, and login page (white pill, original proportions/colors).
- Service renamed exactly: "PostgreSQL Solutions" → "SQL Solutions" (contact form dropdown updates automatically via shared content data).
- Verified desktop + mobile hero layouts (photo, logo, text, watermark aligned and readable).

## Update (2026-08-26, iteration 4)
- Favicon (icon mark cropped from the official logo) + tab title "Master Key Analysis | Data Insights. Smart Solutions." + navy theme-color and meta description.
- Enquiry email alerts: every contact-form submission now triggers an instant branded notification email to info@masterkeyanalysis.in via the Emergent managed Resend integration (EMERGENT_EMAIL_KEY in backend/.env, background task so the form never blocks or fails, guardrail gate on every send). Reply-To: info@masterkeyanalysis.in. Verified with two live sends (202 Accepted).

- Client auto-reply: every enquiry also triggers an instant branded thank-you email to the client (greets them by first name, references their chosen service, includes phone/email contact block). Verified live (202 Accepted for both sends).

## Backlog / Next Tasks
- P0: none outstanding — core flows all working
- P1: Email notification to info@masterkeyanalysis.in on new enquiry (Resend); multiple non-admin user accounts with roles
- P1: Saved chart/report configurations per dataset; scheduled re-analysis
- P2: Column-type override on upload, data cleaning actions (fill nulls, dedupe) from UI
- P2: Dashboard dark mode toggle; public client-facing report sharing links
