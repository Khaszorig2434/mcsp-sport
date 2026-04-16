# MCSP Sport — Multi-Sport Tournament Tracker

An HLTV-inspired tournament tracking platform for esports and traditional sports.

**Supported sports:** Basketball · Chess · CS2 · Dota 2 · Darts · Table Tennis

## Quick Start

### 1. Database
```bash
createdb mcsp_sport
psql -U postgres -d mcsp_sport -f database/schema.sql
psql -U postgres -d mcsp_sport -f database/seed.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env          # edit DB credentials if needed
npm install
npm run dev                   # API on http://localhost:4000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev                   # UI on http://localhost:3000
```

## Stack

| Layer    | Tech |
|----------|------|
| Frontend | Next.js 14 (App Router), Tailwind CSS, shadcn-style components |
| Backend  | Node.js, Express |
| Database | PostgreSQL |

## Features

- Dashboard with live & upcoming matches across all tournaments
- Tournament page with **Overview / Matches / Standings / Bracket** tabs
- Group-stage standings: W · L · Pts · +/- with promotion markers
- HLTV-style playoff bracket with SVG connectors, win/loss highlighting
- `POST /api/matches/:id` to update scores in real time

## API

```
GET  /api/tournaments
GET  /api/tournaments/:id
GET  /api/matches?tournamentId=&stage=&status=
GET  /api/matches/live
POST /api/matches/:id           { score1, score2, status }
GET  /api/standings?tournamentId=
GET  /api/bracket?tournamentId=
```

## Tournament Format

```
Group A (3 teams)   Group B (3 teams)
  Round Robin         Round Robin
       │                   │
  A1 ──┐               B2 ──┐
       ├── SF1 ──┐           │
  B2 ──┘         ├── FINAL   │
                 │           │
  B1 ──┐         │       ┌── A2
       ├── SF2 ──┘       │
  A2 ──┘               B1 ──┘

       Losers ── Bronze Match
```
