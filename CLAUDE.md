# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PMTool_SE2 is a project management system with task tracking, Kanban boards, Gantt charts, and user management. Built with Next.js 15 (App Router), Prisma ORM, and PostgreSQL.

## Development Commands

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio
```

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 3.4, shadcn/ui + Radix UI, Lucide icons
- **Backend**: Prisma ORM, PostgreSQL (Docker), API Routes
- **Date handling**: date-fns, date-fns-tz

## Architecture

### Database Models (prisma/schema.prisma)
- `Project` - has many Tasks, stores overall progress percentage
- `Task` - belongs to Project, has status (TODO/IN_PROGRESS/DONE), plannedStartDate, plannedEndDate, progress
- `User` - username (unique), passwordHash, name, email
- `LoginLog`, `SystemLog` - audit trails
- `Message`, `Reply` - message board functionality

### Page Structure (app/(app)/)
- `/` - Dashboard overview with project cards, stats, alerts
- `/projects` - Project list with filtering
- `/projects/[id]` - Project detail with tabs: Overview, Tasks, Kanban, Gantt
- `/projects/[id]/tasks` - Task list view
- `/projects/[id]/kanban` - Kanban board view
- `/projects/[id]/gantt` - Gantt chart view
- `/tasks` - All tasks across projects
- `/kanban` - All projects kanban
- `/gantt` - All projects gantt
- `/login`, `/login/register` - Authentication

### Key Components
- `Sidebar.tsx` - Navigation with project list, features, user info at bottom
- `Header.tsx` - Minimal header (logo/menu on mobile)
- `TaskListSection.tsx` - Sortable task list with batch operations
- `KanbanBoard.tsx` - Status columns (TODO/IN_PROGRESS/OVERDUE/DONE)
- `GanttChart.tsx` - Timeline with day/week/month scale
- `AppProvider.tsx` - Theme and language context

### API Routes (app/api/)
- `/api/projects` - GET (list), POST (create)
- `/api/projects/[id]` - GET, PUT, DELETE
- `/api/projects/[id]/tasks` - Project-specific tasks
- `/api/tasks/[id]` - Task CRUD
- `/api/auth/login|logout|register` - Authentication
- `/api/search` - Project search

### State Management
- Server Components fetch data directly via Prisma
- Client Components use React useState/useEffect
- Global state: `AppProvider` (theme, language via cookies)

## Database

```env
DATABASE_URL="postgresql://pmuser:pmpassword@localhost:5432/pmdb_se2"
```

Default login: `admin` / `admin@123`

## Current Navigation Structure (as of 2026-04-17)

The sidebar shows: Overview + Project list (with status dots). Project detail pages have Tab navigation (Overview/Tasks/Kanban/Gantt). Features (theme, language, settings, message board, about) are in the sidebar footer.

## Testing & CI/CD

### Unit Tests
- **Frontend**: Vitest (for Vite projects) or Jest
- Run tests: `npm test`
- Run tests in watch mode: `npm test -- --watch`

### CI Pipeline (GitHub Actions)
Must run on every push to `main` and every PR:
- Lint: `npm run lint`
- Build: `npm run build`
- Type check: (integrated in build)
- Test: `npm test`

Example GitHub Actions workflow at `.github/workflows/ci.yml`.
