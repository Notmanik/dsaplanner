# Frontend Quick Context (Agent Handoff)

This frontend is a **React + TypeScript + Vite** app for the DSA planner product.
It uses a custom **Terminal-Premium Editorial** design language and talks to the backend through `/api`.

## Stack
- React 19 + TypeScript
- Vite
- Tailwind CSS + custom theme tokens
- React Query (`@tanstack/react-query`) for server state
- Axios for API calls
- React Router for page routing

## Run Commands
```bash
cd frontend
npm install
npm run dev      # local dev server
npm run build    # type-check + production build
npm run lint
npm run preview
```

## App Routing
Defined in [src/App.tsx](/home/manik/projects/dsaplanner/frontend/src/App.tsx):
- `/login` (public)
- `/dashboard` (protected)
- `/onboarding` (protected, plan generator)
- `/plan/:id` (protected, plan calendar view)
- `/plan/:id/day/:date` (protected, day detail / question flow)
- fallback -> `/dashboard`

Auth guard lives in [src/components/ProtectedRoute.tsx](/home/manik/projects/dsaplanner/frontend/src/components/ProtectedRoute.tsx).

## Auth + API Wiring
API client is in [src/lib/api.ts](/home/manik/projects/dsaplanner/frontend/src/lib/api.ts).

Behavior:
- Base URL is `/api` (proxied by Vite to `http://localhost:5000` in dev).
- Request interceptor adds `x-auth-token` from `localStorage.token`.
- On `401`, client clears `token` and `planId` and redirects to `/login`.

Vite proxy config: [vite.config.ts](/home/manik/projects/dsaplanner/frontend/vite.config.ts).

## Current Product Flow (Important)
- Login/Register via [src/pages/Login.tsx](/home/manik/projects/dsaplanner/frontend/src/pages/Login.tsx).
- User lands on **Dashboard** even if no plan exists.
- Dashboard supports **multiple plans** and active-plan selection.
- Onboarding creates a new plan (`name`, `duration`, `startDate`, `userLevels`).
- PlanView shows day-wise plan progress.
- DayDetail is where individual question status/score is updated.

## Key Pages
- [src/pages/Login.tsx](/home/manik/projects/dsaplanner/frontend/src/pages/Login.tsx)
  - Terminal-styled auth UI
  - Register + Login toggle in one page
- [src/pages/Dashboard.tsx](/home/manik/projects/dsaplanner/frontend/src/pages/Dashboard.tsx)
  - Active plan summary, plan switcher, streak/analytics, today focus
- [src/pages/Onboarding.tsx](/home/manik/projects/dsaplanner/frontend/src/pages/Onboarding.tsx)
  - Plan generator page (topic selection + skill calibration + operational params)
- [src/pages/PlanView.tsx](/home/manik/projects/dsaplanner/frontend/src/pages/PlanView.tsx)
  - Calendar-like day grid and progress tinting
- [src/pages/DayDetail.tsx](/home/manik/projects/dsaplanner/frontend/src/pages/DayDetail.tsx)
  - Question cards, confidence/rating flow, difficulty color coding

## API Endpoints Used by Frontend
Auth:
- `POST /auth/register`
- `POST /auth/login`

Plans:
- `POST /plans/generate`
- `GET /plans/me`
- `GET /plans/me/active`
- `POST /plans/:id/select`
- `GET /plans/:id`
- `PATCH /plans/:id/complete`

User stats:
- `GET /users/me/streak`
- `GET /users/me/analytics`

## Design System / Theme Notes
Main tokens and global styling are in:
- [src/index.css](/home/manik/projects/dsaplanner/frontend/src/index.css)
- [tailwind.config.js](/home/manik/projects/dsaplanner/frontend/tailwind.config.js)
- [src/theme/TERMINAL_PREMIUM_GUIDE.md](/home/manik/projects/dsaplanner/frontend/src/theme/TERMINAL_PREMIUM_GUIDE.md)

Conventions currently used:
- No hard section dividers where possible; use tonal surfaces (`surface`, `surface-low`, `surface-container`).
- Amber as primary accent, zinc-first dark base.
- Monospace (`JetBrains Mono`) for numeric/data-heavy UI.
- Difficulty color coding:
  - Easy -> green
  - Medium -> amber/yellow
  - Hard -> red

## Shared UI Building Blocks
Reusable controls:
- [src/components/ui/button.tsx](/home/manik/projects/dsaplanner/frontend/src/components/ui/button.tsx)
- [src/components/ui/input.tsx](/home/manik/projects/dsaplanner/frontend/src/components/ui/input.tsx)
- [src/components/ui/badge.tsx](/home/manik/projects/dsaplanner/frontend/src/components/ui/badge.tsx)
- [src/components/ui/slider.tsx](/home/manik/projects/dsaplanner/frontend/src/components/ui/slider.tsx)

Auth-specific components:
- `src/components/auth/*`

## Local Storage Keys
- `token`: auth token
- `planId`: currently active plan id (client convenience)

## Quick Safe-Change Checklist
1. `npm run build` after edits.
2. Verify protected routes still redirect correctly when token is missing.
3. Validate plan flow end-to-end:
   - create plan -> dashboard -> plan view -> day detail -> progress reflected back.
4. Keep new UI aligned with existing terminal tokens/classes instead of ad-hoc colors.
