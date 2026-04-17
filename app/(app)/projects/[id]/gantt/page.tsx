import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import GanttChart from '@/components/GanttChart'
import CreateTaskDialog from '@/components/CreateTaskDialog'
import { BarChart3 } from 'lucide-react'

export const dynamic = 'force-dynamic'

const labels = {
  zh: {
    title: '甘特图',
    noTasks: '暂无任务',
    taskCount: '共 {count} 个任务',
    emptyTitle: '暂无任务',
    emptyDesc: '点击下方按钮添加第一个任务',
  },
  en: {
    title: 'Gantt Chart',
    noTasks: 'No tasks',
    taskCount: '{count} tasks',
    emptyTitle: 'No Tasks Yet',
    emptyDesc: 'Click the button below to add your first task',
  },
}

export default async function ProjectGanttPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const lang = (cookieStore.get('lang')?.value as 'zh' | 'en') || 'zh'
  const t = labels[lang]

  const project = await prisma.project.findUnique({
    where: { id },
    select: { id: true, name: true },
  })

  if (!project) notFound()

  const tasks = await prisma.task.findMany({
    where: { projectId: id },
    include: { project: { select: { id: true, name: true } } },
    orderBy: { plannedStartDate: 'asc' },
  })

  const serializedTasks = tasks.map(task => ({
    ...task,
    startDate: task.plannedStartDate.toISOString(),
    endDate: task.plannedEndDate.toISOString(),
  }))

  // Pass empty projects array and hide the selector
  return (
    <div className="p-4 md:p-6 h-full">
      {serializedTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <BarChart3 className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">{t.emptyTitle}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t.emptyDesc}</p>
          <CreateTaskDialog projectId={project.id} />
        </div>
      ) : (
        <GanttChart
          tasks={serializedTasks}
          projects={[{ id: project.id, name: project.name }]}
          selectedProjectId={project.id}
          title={t.title}
          selectLabel=""
          allLabel=""
          noTasksLabel={t.noTasks}
          countLabel={t.taskCount}
        />
      )}
    </div>
  )
}
