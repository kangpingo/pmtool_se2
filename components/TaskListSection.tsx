'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import TaskCard from './TaskCard'
import { sortByProgress, sortByStartDate, sortByEndDate } from './TaskSortSelect'
import { isTaskOverdue } from '@/lib/date-utils'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import CreateTaskDialog from './CreateTaskDialog'
import ImportExportButtons from './ImportExportButtons'
import { useApp } from './AppProvider'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Trash2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface Task {
  id: string
  name: string
  startDate: string
  endDate: string
  status: string
  progress: number
  favorite: boolean
  keyPoints: string | null
  duration: number
  includeWeekend: boolean
  project?: { id: string; name: string }
}

const labels = {
  zh: {
    taskList: '任务列表',
    total: '共 {total} 条任务',
    completed: '已完成',
    inProgress: '进行中',
    overdue: '逾期',
    addTask: '添加任务',
    batchDelete: '批量删除',
    confirmDelete: '确认删除',
    confirmMessage: '确定删除选中的任务？',
    deleteWarning: '删除后不可撤销。',
    cancel: '取消',
    deleteBtn: '确认删除',
    deleteSuccess: '已删除 {count} 个任务',
    deleteFailed: '删除失败',
    selectAll: '全选',
    deselectAll: '取消全选',
  },
  en: {
    taskList: 'Tasks',
    total: '{total} Tasks',
    completed: 'Completed',
    inProgress: 'In Progress',
    overdue: 'Overdue',
    addTask: 'Add Task',
    batchDelete: 'Batch Delete',
    confirmDelete: 'Confirm Delete',
    confirmMessage: 'Are you sure you want to delete selected tasks?',
    deleteWarning: 'This action cannot be undone.',
    cancel: 'Cancel',
    deleteBtn: 'Delete',
    deleteSuccess: 'Deleted {count} tasks',
    deleteFailed: 'Delete failed',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
  },
}

const sortOptions = {
  zh: [
    { value: 'status' as const, label: '按完成状态', icon: ArrowUpDown },
    { value: 'startDate' as const, label: '按开始时间', icon: ArrowUp },
    { value: 'endDate' as const, label: '按完成时间', icon: ArrowDown },
  ],
  en: [
    { value: 'status' as const, label: 'By Status', icon: ArrowUpDown },
    { value: 'startDate' as const, label: 'By Start Date', icon: ArrowUp },
    { value: 'endDate' as const, label: 'By End Date', icon: ArrowDown },
  ],
}

export default function TaskListSection({ tasks, projectId: projectIdProp, projectName: projectNameProp }: { tasks: Task[]; projectId?: string; projectName?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [sortOrder, setSortOrder] = useState<'status' | 'startDate' | 'endDate'>('status')
  const [open, setOpen] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { lang } = useApp()
  const t = labels[lang]
  const options = sortOptions[lang]

  // Get highlighted task ID and status filter from URL
  const highlightedId = searchParams.get('highlight')
  const statusFilter = searchParams.get('status')

  // Apply status filter
  const statusFiltered = statusFilter
    ? statusFilter === 'in_progress'
      ? tasks.filter(task => task.status !== 'DONE' && !isTaskOverdue(new Date(task.endDate)))
      : statusFilter === 'completed'
      ? tasks.filter(task => task.status === 'DONE')
      : statusFilter === 'overdue'
      ? tasks.filter(task => task.status !== 'DONE' && isTaskOverdue(new Date(task.endDate)))
      : tasks
    : tasks

  const sortedTasks = sortOrder === 'status'
    ? sortByProgress(statusFiltered)
    : sortOrder === 'startDate'
    ? sortByStartDate(statusFiltered)
    : sortByEndDate(statusFiltered)

  const done = tasks.filter(task => task.status === 'DONE').length
  const total = tasks.length
  const overdueCnt = tasks.filter(task => task.status !== 'DONE' && isTaskOverdue(new Date(task.endDate))).length
  const inProgressCnt = tasks.filter(task => task.status !== 'DONE' && !isTaskOverdue(new Date(task.endDate))).length

  function setStatusFilter(filter: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (filter) {
      params.set('status', filter)
    } else {
      params.delete('status')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  // Get projectId from first task or from props
  const task0 = tasks.length > 0 ? (tasks[0] as Task) : null
  const projectId = task0 ? ((task0 as any).project?.id || projectIdProp || '') : (projectIdProp || '')
  const projectName = task0 ? ((task0 as any).project?.name || projectNameProp || '') : (projectNameProp || '')

  function toggleSelect(taskId: string) {
    const newSet = new Set(selectedTasks)
    if (newSet.has(taskId)) {
      newSet.delete(taskId)
    } else {
      newSet.add(taskId)
    }
    setSelectedTasks(newSet)
  }

  function toggleSelectAll() {
    if (selectedTasks.size === tasks.length) {
      setSelectedTasks(new Set())
    } else {
      setSelectedTasks(new Set(tasks.map(t => t.id)))
    }
  }

  async function handleBatchDelete() {
    if (selectedTasks.size === 0) return
    try {
      await Promise.all(
        Array.from(selectedTasks).map(id =>
          fetch(`/api/tasks/${id}`, { method: 'DELETE' })
        )
      )
      toast.success(t.deleteSuccess.replace('{count}', String(selectedTasks.size)))
      setSelectedTasks(new Set())
      setDeleteOpen(false)
      router.refresh()
    } catch {
      toast.error(t.deleteFailed)
    }
  }

  return (
    <div className="space-y-2">
      {total === 0 ? (
        <div className="flex flex-col items-center justify-center pt-8 pb-16">
          <div className="relative mb-6">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center">
              <svg className="w-14 h-14 text-blue-400 dark:text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="1"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
              <Plus className="h-4 w-4 text-white" />
            </div>
          </div>
          <p className="text-base font-bold text-gray-600 dark:text-gray-200 mb-1">{lang === 'zh' ? '还没有任务' : 'No tasks yet'}</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">{lang === 'zh' ? '点击按钮添加你的第一个任务' : 'Add your first task to get started'}</p>
          <CreateTaskDialog
            projectId={projectId}
            projectName={projectName}
            trigger={
              <Button className="bg-blue-500 hover:bg-blue-600 text-white px-5 h-9 rounded-lg text-sm font-medium shadow-md shadow-blue-200 dark:shadow-blue-900/30">
                <Plus className="h-4 w-4 mr-1.5" />
                {t.addTask}
              </Button>
            }
          />
        </div>
      ) : (
        <>
          {/* 任务统计 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 text-sm font-bold">
              <button
                onClick={() => setStatusFilter(null)}
                className={`px-2 py-0.5 rounded-md transition-colors ${!statusFilter ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
              >
                {lang === 'zh' ? `${total} 条任务` : t.total.replace('{total}', String(total))}
              </button>
              <button
                onClick={() => setStatusFilter('in_progress')}
                className={`text-xs px-2 py-0.5 rounded-md transition-colors ${statusFilter === 'in_progress' ? 'bg-blue-500 text-white' : 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'}`}
              >
                {inProgressCnt} {t.inProgress}
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`text-xs px-2 py-0.5 rounded-md transition-colors ${statusFilter === 'completed' ? 'bg-black dark:bg-gray-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white'}`}
              >
                {done} {t.completed}
              </button>
              <button
                onClick={() => setStatusFilter('overdue')}
                className={`text-xs px-2 py-0.5 rounded-md transition-colors ${statusFilter === 'overdue' ? 'bg-red-500 text-white' : 'text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300'}`}
              >
                {overdueCnt} {t.overdue}
              </button>
              {selectedTasks.size > 0 && (
                <span className="text-xs text-blue-600 dark:text-blue-400">{selectedTasks.size} 已选</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* 排序选择 */}
              <div className="relative">
                <button
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-1 px-2 py-1 h-7 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg transition-colors border border-blue-200 dark:border-blue-800"
                >
                  <ArrowUpDown className="h-3 w-3" />
                  <span>{options.find(o => o.value === sortOrder)?.label}</span>
                </button>

                {open && (
                  <>
                    <div className="fixed inset-0 z-[70]" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 z-[80] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[120px]">
                      {options.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setSortOrder(opt.value)
                            setOpen(false)
                          }}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 text-[10px] hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                            sortOrder === opt.value ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          <opt.icon className="h-3 w-3" />
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* 导入导出 */}
              <div className="flex items-center gap-1">
                <ImportExportButtons projectId={projectId} projectName={projectName} />
                <CreateTaskDialog
                  projectId={projectId}
                  projectName={projectName}
                  trigger={
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-7 px-2 py-1">
                      <Plus className="h-3 w-3" />
                    </Button>
                  }
                />
                {/* 批量删除按钮 */}
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-red-500 hover:bg-red-600 h-7 px-2 py-1">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                    <DialogContent className="max-w-sm dark:bg-gray-800">
                      <DialogHeader>
                        <div className="flex items-center gap-3 px-1 pb-3 border-b border-gray-100 dark:border-gray-700">
                          <div className="p-2.5 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-md shadow-red-200 dark:shadow-red-900/50">
                            <AlertTriangle className="h-5 w-5 text-white" />
                          </div>
                          <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {t.confirmDelete}
                          </DialogTitle>
                        </div>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                          <p className="text-sm text-red-800 dark:text-red-200">
                            {t.confirmMessage}
                          </p>
                          <p className="text-xs text-red-600 dark:text-red-400 mt-2">{t.deleteWarning}</p>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setDeleteOpen(false)} className="border-gray-200 dark:border-gray-700">{t.cancel}</Button>
                          <Button variant="destructive" onClick={handleBatchDelete} className="bg-red-500 hover:bg-red-600">{t.deleteBtn}</Button>
                        </div>
                      </div>
                    </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
          {sortedTasks.map((task, idx) => {
            const isOverdue = task.status !== 'DONE' && isTaskOverdue(new Date(task.endDate))
            const isComplete = task.progress === 100
            const circleStyle = isOverdue
              ? 'bg-red-500 text-white'
              : isComplete
              ? 'bg-gray-900 dark:bg-gray-600 text-white'
              : 'bg-blue-500 text-white'
            const isSelected = selectedTasks.has(task.id)
            return (
              <div key={task.id} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full ${circleStyle} flex items-center justify-center shrink-0 text-xs font-medium`}>{idx + 1}</div>
                <div className="flex-1 min-w-0">
                  <TaskCard
                    task={task}
                    showKeyPoints={false}
                    showExpand={false}
                    showProject={false}
                    showDelete={false}
                    selected={isSelected}
                    onToggleSelect={toggleSelect}
                    highlighted={task.id === highlightedId}
                  />
                </div>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}
