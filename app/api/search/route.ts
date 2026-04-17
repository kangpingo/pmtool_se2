import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const type = searchParams.get('type') || 'project'

  if (q.length < 1) {
    return NextResponse.json({ results: [] })
  }

  const { prisma } = await import('@/lib/prisma')

  if (type === 'task') {
    const tasks = await prisma.task.findMany({
      where: {
        name: { contains: q },
      },
      select: {
        id: true,
        name: true,
        status: true,
        progress: true,
        plannedEndDate: true,
        project: {
          select: { id: true, name: true },
        },
      },
      take: 10,
    })
    return NextResponse.json({ results: tasks })
  }

  // Default: project search
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { name: { contains: q } },
        { fullName: { contains: q } },
      ],
    },
    select: {
      id: true,
      name: true,
      fullName: true,
      progress: true,
      tasks: {
        select: { status: true, plannedEndDate: true },
      },
    },
    take: 10,
  })

  return NextResponse.json({ results: projects })
}
