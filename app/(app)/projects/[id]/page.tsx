import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ImportExportButtons from '@/components/ImportExportButtons'
import { CheckCircle2, AlertTriangle, Clock, ListTodo } from 'lucide-react'
import { isTaskOverdue, isTaskDueToday, isTaskDueTomorrow } from '@/lib/date-utils'

export const dynamic = 'force-dynamic'

const labels = {
  zh: {
    overview: '项目概览',
    tasks: '任务',
    completed: '已完成',
    inProgress: '进行中',
    notStarted: '未开始',
    dueToday: '今日到期',
    dueTomorrow: '明日到期',
    quickAddTask: '快速添加任务',
  },
  en: {
    overview: 'Overview',
    tasks: 'Tasks',
    completed: 'Completed',
    inProgress: 'In Progress',
    notStarted: 'Not Started',
    dueToday: 'Due Today',
    dueTomorrow: 'Due Tomorrow',
    quickAddTask: 'Quick Add Task',
  },
}

export default async function ProjectOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const lang = (cookieStore.get('lang')?.value as 'zh' | 'en') || 'zh'
  const t = labels[lang]

  const project = await prisma.project.findUnique({
    where: { id },
    include: { tasks: { orderBy: { plannedEndDate: 'asc' } } },
  })
  if (!project) notFound()

  const done = project.tasks.filter(task => task.status === 'DONE').length
  const total = project.tasks.length
  const overdueCnt = project.tasks.filter(task => task.status !== 'DONE' && isTaskOverdue(new Date(task.plannedEndDate))).length
  const inProgressCnt = project.tasks.filter(task => task.status === 'IN_PROGRESS').length
  const notStartedCnt = project.tasks.filter(task => task.status === 'TODO').length
  const dueTodayCnt = project.tasks.filter(task => task.status !== 'DONE' && isTaskDueToday(new Date(task.plannedEndDate))).length
  const dueTomorrowCnt = project.tasks.filter(task => task.status !== 'DONE' && isTaskDueTomorrow(new Date(task.plannedEndDate))).length

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* 项目描述 */}
      {project.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300">{project.description}</p>
      )}

      {/* 任务统计卡片 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                <ListTodo className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{total}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t.tasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{done}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{inProgressCnt}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                <ListTodo className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{notStartedCnt}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t.notStarted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 预警信息 */}
      {(overdueCnt > 0 || dueTodayCnt > 0 || dueTomorrowCnt > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {overdueCnt > 0 && (
            <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <div>
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">{overdueCnt}</p>
                  <p className="text-xs text-red-500 dark:text-red-400">{t.tasks} {lang === 'zh' ? '逾期' : 'overdue'}</p>
                </div>
              </CardContent>
            </Card>
          )}
          {dueTodayCnt > 0 && (
            <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20">
              <CardContent className="p-4 flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <div>
                  <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{dueTodayCnt}</p>
                  <p className="text-xs text-orange-500 dark:text-orange-400">{t.dueToday}</p>
                </div>
              </CardContent>
            </Card>
          )}
          {dueTomorrowCnt > 0 && (
            <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20">
              <CardContent className="p-4 flex items-center gap-3">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{dueTomorrowCnt}</p>
                  <p className="text-xs text-yellow-500 dark:text-yellow-400">{t.dueTomorrow}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 快速操作 */}
      <div className="flex items-center gap-3">
        <Link href={`/projects/${id}/tasks`}>
          <Button variant="outline">
            <ListTodo className="h-4 w-4 mr-2" />
            {lang === 'zh' ? '查看所有任务' : 'View All Tasks'}
          </Button>
        </Link>
        <ImportExportButtons projectId={project.id} projectName={project.name} />
      </div>
    </div>
  )
}
