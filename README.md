# PMTool SE2 – Lightweight Project Management

<img width="1274" height="706" alt="image" src="https://github.com/user-attachments/assets/fac8fbbe-85c8-4f20-bdda-86b25043fbd9" />

A modern, responsive project management system designed for teams and individuals to track tasks, manage projects, and visualize progress through intuitive views including Kanban boards and Gantt charts.

## Key Features

### Project & Task Management
- **Dashboard** – Overview of active projects, tasks, and deadlines at a glance
- **Projects** – Create, edit, copy, and delete projects with full metadata (owner, dates, progress)
- **Tasks** – Full task lifecycle management with status tracking (TODO / IN_PROGRESS / DONE)
- **Kanban Board** – Visual task management with drag-and-drop style columns (TODO / IN_PROGRESS / OVERDUE / DONE)
- **Gantt Chart** – Timeline view for project scheduling and planning with day/week/month scale
- **Project Status** – Automatic status color coding:
  - 🟢 **Not Started** (0% progress)
  - 🔵 **In Progress** (1-99%)
  - 🔴 **Overdue** (past planned end date)
  - ⚫ **Completed** (100%)
- **Bidirectional Date-Duration Sync** – Adjusting dates auto-updates duration; changing duration auto-updates end date

### Search & Navigation
- **Global Search** – Search bar in header with project/task toggle
- **Project Search** – Find projects by name, shows status icon + progress
- **Task Search** – Find tasks by name, shows task name,所属项目, progress %; click to navigate and highlight

### Task Filtering & Sorting
- **Status Filter** – Filter by: All / In Progress / Completed / Overdue (clickable tabs)
- **Sort By** – Progress / Start Date / End Date
- **Batch Operations** – Select multiple tasks and batch delete

### UI/UX
- **Dark/Light Theme** – Seamless theme switching
- **Internationalization** – Full Chinese and English language support
- **Responsive Design** – Works on desktop and mobile
- **Message Board** – Quick team communication from header
- **Data Import/Export** – Export/import via CSV format

### User Management
- **User Registration** – Account creation with validation
- **User Authentication** – Cookie-based login with hardcoded admin account support
- **User List** – View all system users from settings menu
- **User Profile** – Editable display name and email

## Tech Stack

### Frontend
- **React 19** with **TypeScript** for type-safe development
- **Next.js 15** (App Router) for server-side rendering and routing
- **shadcn/ui** + **Radix UI** for accessible components
- **Tailwind CSS 3.4** for styling
- **Lucide React** for icons

### Backend
- **Prisma ORM** – Type-safe database access
- **PostgreSQL** – Production database

### Date & State
- **date-fns** – Date manipulation and formatting

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Installation

```bash
# Clone the repository
git clone https://github.com/kangpingo/pmtool_se2.git
cd pmtool_se2

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Initialize database
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to database
npm run db:seed       # Seed demo data (10 projects, 61 tasks)

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Default Login
- Account: `admin`
- Password: `admin@123`

## Database

```env
DATABASE_URL="postgresql://username:password@localhost:5432/pmtool_se2"
```

## Project Structure

```
├── app/
│   ├── (app)/                  # Authenticated app routes
│   │   ├── page.tsx           # Dashboard overview
│   │   ├── projects/[id]/     # Project detail
│   │   │   ├── tasks/         # Task list view
│   │   │   ├── kanban/        # Kanban board view
│   │   │   └── gantt/         # Gantt chart view
│   │   └── tasks/             # All tasks across projects
│   ├── api/                    # API routes
│   │   ├── auth/              # Login, logout, register
│   │   ├── projects/          # Project CRUD + copy
│   │   ├── tasks/             # Task CRUD + duplicate
│   │   ├── search/            # Global search
│   │   └── messages/          # Message board
│   └── login/                 # Login & register pages
├── components/
│   ├── ui/                    # shadcn/ui base components
│   ├── KanbanBoard.tsx        # Kanban board
│   ├── GanttChart.tsx         # Gantt chart
│   ├── TaskListSection.tsx    # Task list with filters
│   ├── TaskCard.tsx           # Task card component
│   ├── SearchBar.tsx          # Project/Task search
│   └── Sidebar.tsx            # Navigation sidebar
└── prisma/
    └── schema.prisma           # Database schema
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio |

## Version History

### v2.0.0 (2026-04-18)
- Navigation redesign: sidebar logo, dynamic project list with status icons
- Project header: status-based color coding (green/blue/red/black)
- SearchBar: project/task toggle search with status-colored folder icons
- Task list: status filter tabs, task statistics with color coding
- Project/Task creation: owner and completion date as required fields
- Demo data: 10 projects with realistic distribution (2 not started, 4 in progress, 2 overdue, 2 completed)

### v1.0.0 (2026-04-17)
- User management: registration, display name, user list
- Bidirectional date-duration sync in task/project dialogs
- Internationalized operation logs
- Docker + Vercel deployment support

## Screenshots

*Dashboard View*
<img width="1267" height="713" alt="image" src="https://github.com/user-attachments/assets/f01a3586-0ec4-4108-89a8-96eb1757d19c" />

*Project View*
<img width="1266" height="695" alt="image" src="https://github.com/user-attachments/assets/38749e00-3eb5-4116-b471-c7badd531386" />

*Kanban Board*
<img width="1262" height="819" alt="image" src="https://github.com/user-attachments/assets/7ed2c540-ca74-404b-aea2-3a81979d14dd" />

*Gantt Chart*
<img width="1267" height="824" alt="image" src="https://github.com/user-attachments/assets/55e2305f-322b-4c88-8454-589a622fe9cf" />

## License

MIT License
