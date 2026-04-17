'use client'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { isTaskOverdue } from '@/lib/date-utils'

interface ProjectInfo {
  id: string
  progress: number
  tasks: { status: string; plannedEndDate: string }[]
}

export default function ContentArea({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const match = pathname.match(/^\/projects\/([^/]+)/)
  const projectId = match ? match[1] : null

  const [bgStyle, setBgStyle] = useState('')

  useEffect(() => {
    if (!projectId) {
      setBgStyle('')
      return
    }

    fetch(`/api/projects/${projectId}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          const project: ProjectInfo = data
          const total = project.tasks.length
          const overdueCnt = project.tasks.filter(
            task => task.status !== 'DONE' && isTaskOverdue(new Date(task.plannedEndDate))
          ).length
          const pct = project.progress

          let bg = ''
          if (overdueCnt > 0) {
            bg = 'bg-[#fef2f2] dark:bg-[#1c0a0a]'
          } else if (pct === 100 && total > 0) {
            bg = 'bg-[#f9f9f9] dark:bg-[#1a1a1a]'
          } else if (pct === 0) {
            bg = 'bg-[#f0fdf4] dark:bg-[#052e16]'
          } else {
            bg = 'bg-[#eff6ff] dark:bg-[#0c1929]'
          }
          setBgStyle(bg)
        }
      })
      .catch(() => setBgStyle(''))
  }, [projectId])

  return (
    <main className={`flex-1 overflow-y-auto transition-colors duration-300 ${bgStyle}`}>
      {children}
    </main>
  )
}
