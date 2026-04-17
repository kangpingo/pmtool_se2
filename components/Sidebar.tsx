'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useApp } from './AppProvider'
import { ChevronLeft, ChevronRight, Menu, X, Globe, LogOut, Settings, FileText, MessageSquare, Database, Heart, Sun, Moon, Users, Layers, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import UserProfileDialog from './UserProfileDialog'
import SettingsDialog from './SettingsDialog'
import LogViewer from './LogViewer'
import UserListDialog from './UserListDialog'
import MessageBoardDialog from './MessageBoardDialog'
import DeclarationDialog from './DeclarationDialog'
import DataManagementDialog from './DataManagementDialog'

interface Project {
  id: string
  name: string
  progress: number
  visible: boolean
  tasks: { status: string; plannedEndDate: string }[]
}

const labels = {
  zh: {
    logout: '退出登录',
    settings: '设置',
    viewLogs: '查看日志',
    userList: '用户列表',
    setProgress: '进度百分比',
    dataManagement: '数据管理',
    logs: '日志',
    messageBoard: '留言板',
    about: '关于',
    projectList: '项目列表',
    showProject: '显示',
    hideProject: '隐藏',
  },
  en: {
    logout: 'Logout',
    settings: 'Settings',
    viewLogs: 'View Logs',
    userList: 'User List',
    setProgress: 'Progress %',
    dataManagement: 'Data Management',
    logs: 'Logs',
    messageBoard: 'Message Board',
    about: 'About',
    projectList: 'Project List',
    showProject: 'Show',
    hideProject: 'Hide',
  },
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>
    </svg>
  )
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
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

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { lang, setLang, theme, toggleTheme } = useApp()
  const t = labels[lang]
  const [collapsed, setCollapsed] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [transitioning, setTransitioning] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)

  // Dialog states
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showLogs, setShowLogs] = useState(false)
  const [showMessageBoard, setShowMessageBoard] = useState(false)
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false)
  const [showDataManagement, setShowDataManagement] = useState(false)
  const [showDeclaration, setShowDeclaration] = useState(false)
  const [showUserList, setShowUserList] = useState(false)
  const [showProjectList, setShowProjectList] = useState(false)
  const [displayName, setDisplayName] = useState('User')
  const [hiddenProjects, setHiddenProjects] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        setProjects(data)
        // Initialize hidden projects: those with 100% progress are hidden by default
        const hidden = new Set<string>()
        data.forEach((p: Project) => {
          if (p.progress === 100) {
            hidden.add(p.id)
          }
        })
        // Merge with localStorage preferences
        try {
          const stored = localStorage.getItem('hiddenProjects')
          if (stored) {
            const parsed = JSON.parse(stored)
            if (Array.isArray(parsed)) {
              parsed.forEach((id: string) => hidden.add(id))
            }
          }
        } catch {}
        setHiddenProjects(hidden)
        setLoadingProjects(false)
      })
      .catch(() => setLoadingProjects(false))
  }, [])

  // Load username from cookies
  useEffect(() => {
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=')
      if (name === 'displayName') {
        setDisplayName(decodeURIComponent(value))
        return
      }
      if (name === 'username') {
        setDisplayName(decodeURIComponent(value))
      }
    }
  }, [])

  const handleToggle = () => {
    setTransitioning(true)
    setCollapsed(!collapsed)
    setTimeout(() => setTransitioning(false), 300)
  }

  const handleNavClick = () => {
    setMobileOpen(false)
  }

  const isProjectActive = (projectId: string) => pathname === `/projects/${projectId}` || pathname.startsWith(`/projects/${projectId}/`)

  const toggleProjectVisibility = (projectId: string) => {
    setHiddenProjects(prev => {
      const next = new Set(prev)
      if (next.has(projectId)) {
        // Already hidden → unhide it
        next.delete(projectId)
      } else {
        // Hide the project
        next.add(projectId)
      }
      localStorage.setItem('hiddenProjects', JSON.stringify([...next]))
      return next
    })
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch {
      toast.error('Logout failed')
    }
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn('px-3 py-3 border-b border-white/10', collapsed ? 'text-center' : '')}>
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Logo" className="w-8 h-8 rounded-lg shrink-0" />
          <span className={cn('text-white font-bold text-sm whitespace-nowrap', collapsed ? 'hidden' : 'block')}>PMTool SE2</span>
        </div>
      </div>

      {/* 导航 */}
      <nav className="py-4 px-2 space-y-1 overflow-y-auto flex-1">
        {/* 总览 */}
        <Link
          href="/"
          onClick={handleNavClick}
          onMouseEnter={() => setHoveredItem('/')}
          onMouseLeave={() => setHoveredItem(null)}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 relative overflow-hidden group'
          )}
          style={{
            backgroundColor: pathname === '/' ? '#3b82f6' : hoveredItem === '/' ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
            color: pathname === '/' ? '#ffffff' : '#e2e8f0',
          }}
        >
          <HomeIcon className="h-5 w-5 flex-shrink-0 relative z-10" />
          <span className={cn('transition-all duration-200 whitespace-nowrap relative z-10', collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100')}>
            {lang === 'zh' ? '总览' : 'Overview'}
          </span>
          {pathname === '/' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />}
        </Link>

        {/* 项目列表 */}
        {!loadingProjects && projects.map((project) => {
          if (hiddenProjects.has(project.id)) return null
          const active = isProjectActive(project.id)
          const isHovered = hoveredItem === project.id
          return (
            <Link
              key={project.id}
              href={`/projects/${project.id}/tasks`}
              onClick={handleNavClick}
              onMouseEnter={() => setHoveredItem(project.id)}
              onMouseLeave={() => setHoveredItem(null)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 relative',
                collapsed ? 'justify-center' : ''
              )}
              style={{
                backgroundColor: active ? 'rgba(59, 130, 246, 0.3)' : isHovered ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                color: active ? '#ffffff' : '#e2e8f0',
              }}
            >
              <StatusIcon project={project} />
              <span className={cn('transition-all duration-200 whitespace-nowrap truncate', collapsed ? 'hidden' : 'block')}>
                {project.name}
              </span>
              {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full" />}
            </Link>
          )
        })}

        {loadingProjects && (
          <div className={cn('px-3 py-2 text-xs text-gray-500', collapsed ? 'text-center' : '')}>
            {collapsed ? '...' : (lang === 'zh' ? '加载中...' : 'Loading...')}
          </div>
        )}
      </nav>

      {/* 底部功能区 - 紧凑布局 */}
      <div className={cn('border-t border-white/10 py-2 px-2', collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100')}>
        {/* 第一行：主要功能按钮 */}
        <div className="flex items-center gap-1">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title={theme === 'dark' ? (lang === 'zh' ? '浅色模式' : 'Light Mode') : (lang === 'zh' ? '深色模式' : 'Dark Mode')}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Settings dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              title={t.settings}
            >
              <Settings className="h-4 w-4" />
            </button>
            {showSettingsDropdown && (
              <>
                <div className="fixed inset-0 z-[60]" onClick={() => setShowSettingsDropdown(false)} />
                <div className="absolute left-0 bottom-full mb-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-[100] min-w-[160px]">
                  <button
                    onClick={() => { setShowSettings(true); setShowSettingsDropdown(false) }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                  >
                    <Settings className="h-4 w-4" />
                    {t.setProgress}
                  </button>
                  <button
                    onClick={() => { setShowUserList(true); setShowSettingsDropdown(false) }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                  >
                    <Users className="h-4 w-4" />
                    {t.userList}
                  </button>
                  <button
                    onClick={() => { setShowLogs(true); setShowSettingsDropdown(false) }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                  >
                    <FileText className="h-4 w-4" />
                    {t.viewLogs}
                  </button>
                  <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
                  <button
                    onClick={() => { setShowMessageBoard(true); setShowSettingsDropdown(false) }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                  >
                    <MessageSquare className="h-4 w-4" />
                    {t.messageBoard}
                  </button>
                  <button
                    onClick={() => { setShowDeclaration(true); setShowSettingsDropdown(false) }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                  >
                    <Heart className="h-4 w-4" />
                    {t.about}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Data Management button */}
          <button
            onClick={() => setShowDataManagement(true)}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title={t.dataManagement}
          >
            <Database className="h-4 w-4" />
          </button>

          {/* Project list toggle */}
          <div className="relative">
            <button
              onClick={() => setShowProjectList(!showProjectList)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              title={t.projectList}
            >
              <Layers className="h-4 w-4" />
            </button>
            {showProjectList && (
              <>
                <div className="fixed inset-0 z-[60]" onClick={() => setShowProjectList(false)} />
                <div className="absolute left-0 bottom-full mb-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-[100] min-w-[260px] max-h-[400px] overflow-y-auto">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    {t.projectList}
                  </div>
                  {projects.map(project => (
                    <div key={project.id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <StatusIcon project={project} />
                        <span className="text-sm text-gray-700 dark:text-gray-200 truncate">{project.name}</span>
                      </div>
                      <button
                        onClick={() => toggleProjectVisibility(project.id)}
                        className={cn(
                          'flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-colors',
                          hiddenProjects.has(project.id)
                            ? 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            : 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                        )}
                      >
                        {hiddenProjects.has(project.id) ? (
                          <><EyeOff className="h-3 w-3" /> {t.hideProject}</>
                        ) : (
                          <><Eye className="h-3 w-3" /> {t.showProject}</>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Language toggle */}
          <div className="relative ml-auto">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              title={lang === 'zh' ? '中文' : 'English'}
            >
              <Globe className="h-4 w-4" />
            </button>
            {showLangMenu && (
              <>
                <div className="fixed inset-0 z-[60]" onClick={() => setShowLangMenu(false)} />
                <div className="absolute left-full top-0 ml-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-[100] min-w-[100px]">
                  <button
                    onClick={() => { setLang('zh'); setShowLangMenu(false); router.refresh() }}
                    className={cn('w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2', lang === 'zh' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200')}
                  >
                    <span>🇨🇳</span> 中文
                  </button>
                  <button
                    onClick={() => { setLang('en'); setShowLangMenu(false); router.refresh() }}
                    className={cn('w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2', lang === 'en' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200')}
                  >
                    <span>🇺🇸</span> English
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 第二行：用户信息 */}
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10">
          <button
            onClick={() => { setShowUserProfile(true); setMobileOpen(false) }}
            className="flex items-center gap-2 hover:bg-white/10 rounded-lg px-2 py-1 transition-colors flex-1 min-w-0"
          >
            <img src="/avatar.svg" alt="Avatar" className="w-5 h-5 rounded-full shrink-0" />
            <span className="text-xs font-bold text-gray-200 truncate">
              {displayName}
            </span>
          </button>
          <button
            onClick={handleLogout}
            className="p-1.5 text-gray-400 hover:text-red-400 transition-colors shrink-0"
            title={t.logout}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 折叠/展开按钮 */}
      <button
        onClick={handleToggle}
        className={cn(
          'absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-700 border-2 border-gray-600 rounded-full flex items-center justify-center',
          'hover:bg-blue-500 hover:border-blue-400 transition-all duration-200 hover:scale-110 z-20',
          'shadow-lg shadow-gray-900/50 hidden md: flex'
        )}
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-gray-300" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-gray-300" />
        )}
      </button>
    </div>
  )

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 w-10 h-10 bg-gray-800 text-white rounded-lg flex items-center justify-center shadow-lg"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-shrink-0 flex-col h-full border-r shadow-lg transition-all duration-300 ease-in-out relative',
          'bg-gray-800 border-gray-700',
          collapsed ? 'w-16' : 'w-56'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'md:hidden fixed inset-y-0 left-0 z-50 flex-shrink-0 flex-col h-full border-r shadow-xl transition-all duration-300 ease-in-out',
          'bg-gray-800 border-gray-700',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-14 border-b border-white/10 px-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="Logo" className="w-8 h-8 rounded-lg" />
            <span className="text-white font-bold text-base">PM System</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sidebarContent}
        </div>
      </aside>

      {/* Dialogs */}
      {showUserProfile && <UserProfileDialog onClose={() => setShowUserProfile(false)} />}
      {showSettings && <SettingsDialog open={showSettings} onClose={() => setShowSettings(false)} />}
      {showLogs && <LogViewer open={showLogs} onClose={() => setShowLogs(false)} />}
      {showMessageBoard && <MessageBoardDialog open={showMessageBoard} onClose={() => setShowMessageBoard(false)} />}
      {showDeclaration && <DeclarationDialog open={showDeclaration} onClose={() => setShowDeclaration(false)} />}
      {showDataManagement && <DataManagementDialog open={showDataManagement} onClose={() => setShowDataManagement(false)} />}
      {showUserList && <UserListDialog open={showUserList} onClose={() => setShowUserList(false)} />}
    </>
  )
}
