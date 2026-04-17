'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { List, Kanban, BarChart3, User, Calendar, Clock } from 'lucide-react'
import { isTaskOverdue } from '@/lib/date-utils'
import EditProjectDialog from '@/components/EditProjectDialog'
import DeleteProjectButton from '@/components/DeleteProjectButton'
import CopyProjectButton from '@/components/CopyProjectButton'
import SearchBar from '@/components/SearchBar'
import CreateProjectDialog from '@/components/CreateProjectDialog'
import { ListTodo } from 'lucide-react'

const labels = {
  zh: {
    tasks: '任务',
    kanban: '看板',
    gantt: '甘特图',
    start: '开始',
    completion: '完成',
    overdue: '个逾期',
    progress: '进度',
    allComplete: '全部完成',
  },
  en: {
    tasks: 'Tasks',
    kanban: 'Kanban',
    gantt: 'Gantt',
    start: 'Start',
    completion: 'Finish',
    overdue: ' overdue',
    progress: 'Progress',
    allComplete: 'All Complete',
  },
}

interface ProjectInfo {
  id: string
  name: string
  owner: string | null
  plannedStartDate: string
  completionTime: string | null
  progress: number
  tasks: { status: string; plannedEndDate: string }[]
  link: string | null
  shortName: string | null
  fullName: string | null
  duration: number
  description: string | null
  image: string | null
}

export default function ProjectPageHeader({ lang }: { lang: 'zh' | 'en' }) {
  const pathname = usePathname()
  const t = labels[lang]

  // Check if this is a project page: /projects/[id] or /projects/[id]/[tab]
  const match = pathname.match(/^\/projects\/([^/]+)/)
  const projectId = match ? match[1] : null

  const [project, setProject] = useState<ProjectInfo | null>(null)

  useEffect(() => {
    if (!projectId) {
      setProject(null)
      return
    }

    // Fetch project data
    fetch(`/api/projects/${projectId}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setProject(data)
        }
      })
      .catch(() => setProject(null))
  }, [projectId])

  if (!project) {
    // Render header for overview page
    return (
      <header className="relative z-50 border-b border-blue-200 dark:border-blue-800 bg-[#eff6ff] dark:bg-[#0c1929] transition-colors duration-300">
        <div className="flex items-center justify-between gap-4 px-4 md:px-6 h-14">
          <div className="flex items-center gap-4">
            <SearchBar />
          </div>
          <div className="flex items-center gap-2">
            <Link href="/tasks">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-sm h-8">
                <ListTodo className="h-4 w-4" />
                {lang === 'zh' ? '任务总览' : 'Tasks'}
              </button>
            </Link>
            <CreateProjectDialog />
          </div>
        </div>
      </header>
    )
  }

  // Calculate stats
  const total = project.tasks.length
  const overdueCnt = project.tasks.filter(
    task => task.status !== 'DONE' && isTaskOverdue(new Date(task.plannedEndDate))
  ).length
  const pct = project.progress

  // Background style based on project status
  const bgStyle = overdueCnt > 0
    ? 'bg-gradient-to-r from-red-200 via-red-100 to-orange-100 dark:from-red-900/80 dark:via-red-800/60 dark:to-orange-900/40 border-red-300 dark:border-red-600'
    : pct === 100 && total > 0
    ? 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-100 dark:from-gray-700/80 dark:via-gray-800/60 dark:to-gray-900/40 border-black dark:border-white'
    : pct === 0
    ? 'bg-gradient-to-r from-green-200 via-green-100 to-emerald-100 dark:from-green-900/80 dark:via-green-800/60 dark:to-emerald-900/40 border-green-300 dark:border-green-600'
    : 'bg-gradient-to-r from-blue-200 via-blue-100 to-indigo-100 dark:from-blue-900/80 dark:via-blue-800/60 dark:to-indigo-900/40 border-blue-300 dark:border-blue-600'

  // Progress bar style
  const progressGradient = overdueCnt > 0
    ? 'linear-gradient(90deg, #dc2626, #ef4444)'
    : pct === 100
    ? 'linear-gradient(90deg, #111111, #333333)'
    : pct === 0
    ? 'linear-gradient(90deg, #16a34a, #22c55e)'
    : 'linear-gradient(90deg, #2563eb, #3b82f6)'

  // Determine status for button styling
  const status: 'overdue' | 'completed' | 'ready' | 'in_progress' =
    overdueCnt > 0 ? 'overdue' :
    pct === 100 && total > 0 ? 'completed' :
    pct === 0 ? 'ready' : 'in_progress'

  // Status-based tab colors
  const statusColors = {
    overdue: {
      activeBg: 'bg-white dark:bg-gray-700',
      activeBorder: 'border-red-500',
      activeText: 'text-red-600 dark:text-red-400',
      inactiveText: 'text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400',
    },
    completed: {
      activeBg: 'bg-white dark:bg-gray-700',
      activeBorder: 'border-black dark:border-white',
      activeText: 'text-black dark:text-white',
      inactiveText: 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white',
    },
    ready: {
      activeBg: 'bg-white dark:bg-gray-700',
      activeBorder: 'border-green-500',
      activeText: 'text-green-600 dark:text-green-400',
      inactiveText: 'text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400',
    },
    in_progress: {
      activeBg: 'bg-white dark:bg-gray-700',
      activeBorder: 'border-blue-500',
      activeText: 'text-blue-600 dark:text-blue-400',
      inactiveText: 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400',
    },
  }

  const tabColors = statusColors[status]

  const tabs = [
    { href: `/projects/${projectId}/tasks`, label: t.tasks, icon: List },
    { href: `/projects/${projectId}/kanban`, label: t.kanban, icon: Kanban },
    { href: `/projects/${projectId}/gantt`, label: t.gantt, icon: BarChart3 },
  ]

  return (
    <div className="shrink-0">
      {/* 项目基本信息 - 固定置顶 */}
      <div className={`px-4 md:px-6 py-3 border-b ${bgStyle}`}>
        <div className="flex items-center gap-4 flex-wrap">
          {/* 项目名称 */}
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {project.name}
            {project.fullName && project.fullName !== project.name && (
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">({project.fullName})</span>
            )}
          </h1>

          {/* 逾期徽章 */}
          {overdueCnt > 0 && (
            <Badge variant="destructive" className="text-sm">{overdueCnt} {t.overdue}</Badge>
          )}
          {pct === 100 && total > 0 && (
            <Badge className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-sm">
              {t.allComplete}
            </Badge>
          )}

          {/* 负责人 */}
          {project.owner && (
            <span className="flex items-center gap-1 text-sm font-bold text-black dark:text-white">
              <User className="h-4 w-4" />
              {project.owner}
            </span>
          )}

          {/* 完成时间 */}
          {project.completionTime && (
            <span className="flex items-center gap-1 text-sm font-bold text-black dark:text-white">
              <Clock className="h-4 w-4" />
              {t.completion}: {format(new Date(project.completionTime), 'yyyy/MM/dd')}
            </span>
          )}

          {/* 操作按钮 */}
          <div className="flex items-center gap-1.5 ml-auto">
            <CopyProjectButton project={{
              id: project.id,
              name: project.name,
              shortName: project.shortName,
              fullName: project.fullName,
              plannedStartDate: project.plannedStartDate,
              duration: project.duration,
              description: project.description,
              owner: project.owner,
              link: project.link,
              image: project.image,
              completionTime: project.completionTime,
            }} status={status} />
            <EditProjectDialog project={{
              id: project.id,
              name: project.name,
              shortName: project.shortName,
              fullName: project.fullName,
              plannedStartDate: project.plannedStartDate,
              duration: project.duration,
              description: project.description,
              owner: project.owner,
              link: project.link,
              image: project.image,
              completionTime: project.completionTime,
            }} status={status} />
            <DeleteProjectButton id={project.id} name={project.name} status={status} />
          </div>
        </div>

        {/* 进度条 - 左侧文字，右侧进度条 */}
        {total > 0 && (
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{t.progress}</span>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{pct.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex-1">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: progressGradient }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tab 导航 */}
      <div className="px-4 md:px-6 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md">
        <nav className="flex gap-2">
          {tabs.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-t-lg transition-all duration-200 border-b-2 ${
                  isActive
                    ? `${tabColors.activeBg} ${tabColors.activeBorder} ${tabColors.activeText} shadow-sm`
                    : `bg-transparent border-transparent ${tabColors.inactiveText} hover:bg-white/50 dark:hover:bg-gray-700/50`
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
