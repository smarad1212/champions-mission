# Champions Mission

A personalized gamified learning app for Israeli kids aged 7-14.

## Tech Stack

- **Backend:** Node.js + TypeScript + Express
- **Database:** Supabase (Postgres)
- **AI:** Anthropic SDK (`claude-sonnet-4-6`)
- **Package Manager:** npm

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your keys:

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Your Supabase anon/public key |

### 3. Run in development mode

```bash
npm run dev
```

Server starts on **http://localhost:3000**

### 4. Build for production

```bash
npm run build
npm start
```

## API Endpoints

### Health Check

```
GET /health
```

### Generate Sprint

```
POST /api/sprint/generate
Content-Type: application/json

{ "child_id": "test-yonatan" }
```

Returns a full `SprintContent` object with lesson, 4 questions, real-world task, and curriculum slot metadata.

## Project Structure

```
src/
├── types/
│   └── index.ts          # All TypeScript interfaces
├── services/
│   ├── xpEngine.ts       # XP calculation and streak logic
│   ├── curriculumAgent.ts # Subject/concept picker
│   └── contentAgent.ts   # Anthropic API integration
├── prompts/
│   └── content.ts        # System prompt + user prompt builder
├── routes/
│   └── sprint.ts         # POST /api/sprint/generate
└── index.ts              # Express app entry point
```

## Game Logic

- **Streak multipliers:** 3d→1.1×, 7d→1.25×, 14d→1.5×, 30d→2×, 100d→2.5×
- **Sprint multipliers:** sprints 1-3→1.0×, sprint 4→0.75×, sprint 5+→0.5×
- **Difficulty by age:** 7-8yo max difficulty 2, 9-10yo max 3, 11+yo max 4
- **Weak areas** get 3× probability weight in subject selection
- **Field task** is generated only on the first sprint of each day
