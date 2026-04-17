import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import KanbanBoard from '@/components/KanbanBoard'
import CreateTaskDialog from '@/components/CreateTaskDialog'
import { LayoutGrid } from 'lucide-react'

export const dynamic = 'force-dynamic'

const labels = {
  zh: {
    title: '暂无任务',
    desc: '点击下方按钮添加第一个任务',
  },
  en: {
    title: 'No Tasks Yet',
    desc: 'Click the button below to add your first task',
  },
}

export default async function ProjectKanbanPage({ params }: { params: Promise<{ id: string }> }) {
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
    orderBy: { plannedEndDate: 'asc' },
  })

  const serializedTasks = tasks.map(t => ({
    ...t,
    startDate: t.plannedStartDate.toISOString(),
    endDate: t.plannedEndDate.toISOString(),
    progress: t.progress,
    project: { id: project.id, name: project.name },
  }))

  return (
    <div className="p-4 md:p-6 h-full">
      {serializedTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <LayoutGrid className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">{t.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t.desc}</p>
          <CreateTaskDialog projectId={project.id} />
        </div>
      ) : (
        <KanbanBoard tasks={serializedTasks} visibleStatuses={['TODO', 'IN_PROGRESS', 'OVERDUE', 'DONE']} />
      )}
    </div>
  )
}
