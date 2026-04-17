'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp } from './AppProvider'

const labels = {
  zh: {
    placeholderProject: '搜索项目...',
    placeholderTask: '搜索任务...',
    noResults: '无结果',
    project: '项目',
    task: '任务',
  },
  en: {
    placeholderProject: 'Search projects...',
    placeholderTask: 'Search tasks...',
    noResults: 'No results',
    project: 'Project',
    task: 'Task',
  },
}

interface Project {
  id: string
  name: string
  progress: number
  tasks: { status: string; plannedEndDate: string }[]
}

interface Task {
  id: string
  name: string
  status: string
  progress: number
  plannedEndDate: string
  project: { id: string; name: string }
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
    </svg>
  )
}

function TaskIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2"/>
      <path d="M7 9h2M7 13h6M7 17h4"/>
    </svg>
  )
}

function StatusIcon({ project }: { project: Project }) {
  const now = new Date()
  const hasOverdue = project.tasks.some(
    t => t.status !== 'DONE' && new Date(t.plannedEndDate) < now
  )
  const total = project.tasks.length
  const pct = project.progress

  const colorClass = hasOverdue
    ? 'text-red-500'
    : pct === 100 && total > 0
    ? 'text-gray-500'
    : pct === 0
    ? 'text-green-500'
    : 'text-blue-500'

  return <FolderIcon className={cn('h-4 w-4 shrink-0', colorClass)} />
}

function TaskStatusIcon({ status, plannedEndDate }: { status: string; plannedEndDate: string }) {
  const now = new Date()
  const isOverdue = status !== 'DONE' && new Date(plannedEndDate) < now

  const colorClass = isOverdue
    ? 'text-red-500'
    : status === 'DONE'
    ? 'text-gray-500'
    : 'text-blue-500'

  return <TaskIcon className={cn('h-4 w-4 shrink-0', colorClass)} />
}

export default function SearchBar() {
  const router = useRouter()
  const { lang } = useApp()
  const t = labels[lang]
  const [searchType, setSearchType] = useState<'project' | 'task'>('project')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Project[] | Task[]>([])
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.length < 1) {
      setResults([])
      setShowResults(false)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${searchType}`)
        const data = await res.json()
        setResults(data.results || [])
        setShowResults(true)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [query, searchType])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(projectId: string, taskId?: string) {
    setQuery('')
    setShowResults(false)
    if (taskId) {
      router.push(`/projects/${projectId}/tasks?highlight=${taskId}`)
    } else {
      router.push(`/projects/${projectId}/kanban`)
    }
  }

  function handleClear() {
    setQuery('')
    setResults([])
    setShowResults(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2">
        {/* Search input */}
        <div className="flex items-center gap-2 px-3 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700">
          <Search className="h-4 w-4 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => query.length > 0 && setShowResults(true)}
            placeholder={searchType === 'project' ? t.placeholderProject : t.placeholderTask}
            className="w-40 text-sm bg-transparent outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400"
          />
          {query && (
            <button onClick={handleClear} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Toggle switch */}
        <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-0.5">
          <button
            onClick={() => { setSearchType('project'); setQuery('') }}
            className={cn(
              'px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-200',
              searchType === 'project'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            )}
          >
            {t.project}
          </button>
          <button
            onClick={() => { setSearchType('task'); setQuery('') }}
            className={cn(
              'px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-200',
              searchType === 'task'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            )}
          >
            {t.task}
          </button>
        </div>
      </div>

      {showResults && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 max-h-64 overflow-y-auto">
          {results.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-400">{t.noResults}</div>
          ) : searchType === 'project' ? (
            (results as Project[]).map(project => (
              <button
                key={project.id}
                onClick={() => handleSelect(project.id)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <StatusIcon project={project} />
                  <span className="truncate">{project.name}</span>
                </div>
                <span className="text-xs text-gray-400 ml-2 shrink-0">{project.progress}%</span>
              </button>
            ))
          ) : (
            (results as Task[]).map(task => (
              <button
                key={task.id}
                onClick={() => handleSelect(task.project.id, task.id)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <TaskStatusIcon status={task.status} plannedEndDate={task.plannedEndDate} />
                    <span className="truncate">{task.name}</span>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{task.progress}%</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                  <FolderIcon className="h-3 w-3" />
                  <span className="truncate">{task.project.name}</span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
