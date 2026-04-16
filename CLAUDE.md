# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend (Express + PostgreSQL)
```bash
cd backend
npm install
npm run dev           # nodemon, hot-reload on :4000
npm start             # production
npm run db:init       # apply schema.sql to mcsp_sport DB
npm run db:seed       # load seed.sql sample data
```

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev           # Next.js dev server on :3000
npm run build         # production build
npm run lint          # ESLint
```

### Database setup (one-time)
```bash
createdb mcsp_sport
psql -U postgres -d mcsp_sport -f database/schema.sql
psql -U postgres -d mcsp_sport -f database/seed.sql
```

## Architecture

### Folder layout
```
mcsp-sport/
├── database/           PostgreSQL schema + seed data
├── backend/            Express REST API
│   └── src/
│       ├── db/         pg Pool singleton (index.js)
│       ├── controllers/ business logic per resource
│       └── routes/     thin Express routers
└── frontend/           Next.js 14 App Router
    ├── app/            pages (layout, page, tournaments/[id])
    ├── components/     MatchCard, Bracket, StandingsTable, TournamentCard, Navbar
    └── lib/            api.ts, types.ts, utils.ts
```

### Tournament data model
- 6 teams, 2 groups (A/B), 3 teams each
- Group stage: round-robin (3 matches/group). Standings ranked by points (2/win) → point difference
- Playoffs: SF1 = A1 vs B2, SF2 = B1 vs A2, Bronze = losers, Final = winners
- `matches.stage` values: `group | semi | bronze | final`
- `matches.status` values: `upcoming | live | completed`

### API routes (all under `/api`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/tournaments` | list; supports `?sport=&status=&gender=` |
| GET | `/tournaments/:id` | detail with groups+teams |
| GET | `/matches?tournamentId=` | all matches; supports `?stage=&status=` |
| GET | `/matches/live` | cross-tournament live matches |
| POST | `/matches/:id` | update score/status `{score1, score2, status}` |
| GET | `/standings?tournamentId=` | per-group standings computed in JS |
| GET | `/bracket?tournamentId=` | `{semifinals[], bronze, final}` |

### Frontend data flow
- Pages are async React Server Components that call `lib/api.ts` directly
- `TournamentTabs` (client component) owns tab state and fetches lazily per-tab
- The `api` object in `lib/api.ts` uses Next.js rewrites to proxy `/api/*` → `localhost:4000/api/*`
- Set `NEXT_PUBLIC_API_URL` in `.env.local` if running without the Next.js proxy

### Styling conventions
- Dark theme: `bg-surface` (#0f1117), cards on `bg-surface-card` (#1a1d2e)
- Semantic colors: `text-win` (green), `text-loss` (red), `text-live` / `bg-live` (orange)
- All custom colors are in `tailwind.config.ts` under `theme.extend.colors`

### Bracket component
`components/Bracket.tsx` renders an HLTV-style horizontal bracket:
- SF column → SVG connector lines (inline `<svg>`) → Final column
- Bronze match displayed separately below the main bracket
- Winner row highlighted green (`bg-win/10`), loser strikethrough + gray
