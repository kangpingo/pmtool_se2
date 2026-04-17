import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import TaskListSection from '@/components/TaskListSection'
import CreateTaskDialog from '@/components/CreateTaskDialog'
import { cookies } from 'next/headers'
import { FileText } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ProjectTasksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const lang = (cookieStore.get('lang')?.value as 'zh' | 'en') || 'zh'

  const project = await prisma.project.findUnique({
    where: { id },
    select: { id: true, name: true },
  })

  if (!project) notFound()

  const tasks = await prisma.task.findMany({
    where: { projectId: id },
    orderBy: { plannedEndDate: 'asc' },
  })

  const serializedTasks = tasks.map(t => ({
    id: t.id,
    name: t.name,
    startDate: t.plannedStartDate.toISOString(),
    endDate: t.plannedEndDate.toISOString(),
    actualFinishDate: t.actualFinishDate?.toISOString() ?? null,
    duration: t.duration,
    includeWeekend: t.includeWeekend,
    keyPoints: t.keyPoints,
    status: t.status,
    progress: t.progress,
    favorite: t.favorite,
    project: { id: project.id, name: project.name },
  }))

  const emptyLabels = {
    zh: {
      title: '暂无任务',
      desc: '点击下方按钮添加第一个任务',
    },
    en: {
      title: 'No Tasks Yet',
      desc: 'Click the button below to add your first task',
    },
  }
  const t = emptyLabels[lang]

  return (
    <div className="p-4 md:p-6 h-full">
      {serializedTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">{t.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t.desc}</p>
          <CreateTaskDialog projectId={project.id} projectName={project.name} />
        </div>
      ) : (
        <TaskListSection tasks={serializedTasks} projectId={project.id} projectName={project.name} />
      )}
    </div>
  )
}
