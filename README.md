# Focus Station

Focus Station is a minimalist, aesthetic workspace built for deep work. It combines a center-stage focus timer, draggable sticky notes, and a dual-audio ambiance system into one calm interface.

The UI includes four Telegram-inspired visual themes:

- Night Blue
- Graphite
- Solar
- Arctic

## Project Overview

Focus Station is designed around low-friction productivity:

- A clean, theme-aware workspace with smooth visual transitions
- Persistent task context through draggable notes
- Independent ambient rain and lofi music controls
- Live sync feedback so you always know whether your data is synced or stored locally

## Key Features

- Interactive Timer
- Custom minute durations
- Play/Pause/Reset controls
- Theme-linked progress ring accent

- Draggable Notes
- Drag-and-drop notes with persistent X/Y coordinates
- Position sync to backend on drag end
- Local fallback when offline

- Dual Audio Engine
- Independent Lofi music and Rain ambiance channels
- Separate volume controls for music and rain
- Player visualizer bars that animate only while music is playing

- Global Sync Status
- Cloud badge in the navbar with three states:
- Synced (checkmark)
- Syncing (pulsing)
- Offline (amber warning)

## Tech Stack

- Frontend
- React
- Tailwind CSS
- Framer Motion (draggables)
- Lucide React (icons)

- Backend
- Node.js
- Express (MVC architecture)

- Persistence
- JSON-based server-side local storage (notes and settings)

## How To Run Locally

Prerequisites:

- Node.js 18+

### Strict Two-Process Dev Setup

Focus Station now runs in a strict split architecture:

- API server: port 3001
- Frontend (Vite): port 5173
- Vite proxies `/api/*` requests to `http://localhost:3001`

Install dependencies:

```bash
npm install
```

Start API server only:

```bash
npm run api
```

Start frontend only:

```bash
npm run dev
```

Start both together:

```bash
npm run start
```

Requested command reference:

```bash
cd server && npm install
```

This repository currently keeps backend dependencies in the root package.json, so the command above is optional unless you later split backend dependencies into a dedicated server package.

## Folder Structure

```text
server/
   controllers/   # Request handlers and business logic (notes, settings)
   models/        # Data interfaces/types
   routes/        # Express route definitions mapped to controllers
   data/          # JSON persistence files and store helpers

src/
   components/    # UI building blocks (Navbar, Timer, DraggableNote, Player)
   context/       # Global state providers (theme, audio)
   api/           # Frontend API helpers and fallback logic
   state/         # Shared client-side sync status store
```

## MVC Notes (Backend)

- Routes define endpoint URLs and delegate to controllers.
- Controllers implement request validation and response handling.
- Models define data shape contracts.
- Data stores provide persistence operations against local JSON files.
