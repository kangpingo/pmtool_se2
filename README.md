# PMTools – Lightweight Project Management

A modern, responsive project management system designed for teams and individuals to track tasks, manage projects, and visualize progress through intuitive views including Kanban boards and Gantt charts.

## Key Features

- **Dashboard** – Overview of active projects, tasks, and deadlines at a glance
- **Kanban Board** – Visual task management with drag-and-drop style columns
- **Gantt Chart** – Timeline view for project scheduling and planning
- **Task Filtering** – Filter tasks by status, project, and time windows
- **Dark/Light Theme** – Seamless theme switching for comfortable viewing
- **Internationalization** – Support for Chinese and English languages

## Tech Stack

### Frontend Framework
- **React 19** with **TypeScript** for type-safe development
- **Next.js 15** (App Router) for server-side rendering and routing

### UI Library & Styling
- **shadcn/ui** – Radix UI-based accessible component library
- **Tailwind CSS 3.4** – Utility-first CSS framework
- **Lucide React** – Icon library

### State & Date Management
- **date-fns** & **date-fns-tz** – Modern date manipulation and timezone handling

### Build & Development
- **TypeScript 5** – Static type checking
- **Vercel** deployment ready

### Backend (via Prisma)
- **Prisma ORM** – Type-safe database access
- Compatible with PostgreSQL, MySQL, SQLite

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── (app)/             # Main application pages
│   │   ├── page.tsx       # Dashboard
│   │   ├── projects/      # Project management pages
│   │   ├── tasks/         # Task listing page
│   │   ├── kanban/        # Kanban board page
│   │   └── gantt/         # Gantt chart page
│   ├── api/               # API routes
│   └── login/             # Authentication page
├── components/            # React components
│   ├── ui/                # shadcn/ui base components
│   ├── Header.tsx         # Top navigation bar
│   ├── Sidebar.tsx        # Side navigation menu
│   ├── TaskCard.tsx       # Task display component
│   ├── TaskListSection.tsx # Task list container
│   └── ...
├── lib/                   # Utilities and helpers
│   ├── prisma.ts          # Prisma client
│   └── utils.ts           # Utility functions
├── prisma/                # Database schema and migrations
│   └── schema.prisma      # Prisma schema definition
└── public/                # Static assets
```

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- PostgreSQL / MySQL / SQLite database (or use SQLite for local dev)

### Installation

```bash
# Clone the repository
git clone https://github.com/kangpingo/pmtools1.git
cd pmtools1

# Install dependencies
npm install

# Set up environment variables
# Create .env file with your database URL:
# DATABASE_URL="file:./dev.db"  # for SQLite
# or
# DATABASE_URL="postgresql://user:password@localhost:5432/pmtools"

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Seed database with sample data
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Screenshots

*Dashboard View*
![Dashboard](screenshots/dashboard.png)

*Kanban Board*
![Kanban](screenshots/kanban.png)

*Gantt Chart*
![Gantt](screenshots/gantt.png)

## License

MIT License – see LICENSE file for details.
