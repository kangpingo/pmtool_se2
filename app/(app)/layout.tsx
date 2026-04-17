import type { Metadata, Viewport } from 'next'
import { cookies } from 'next/headers'
import '../globals.css'
import { Toaster } from 'sonner'
import Sidebar from '@/components/Sidebar'
import ProjectPageHeader from './ProjectPageHeader'
import ContentArea from './ContentArea'

export const metadata: Metadata = {
  title: 'PMTool SE1',
  description: 'PMTool SE1 - Project Management Tool',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const lang = (cookieStore.get('lang')?.value as 'zh' | 'en') || 'zh'

  return (
    <div className="flex h-screen overflow-hidden bg-[#e8edf4] dark:bg-gray-900 transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ProjectPageHeader lang={lang} />
        <ContentArea>
          {children}
        </ContentArea>
      </div>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(99, 102, 241, 0.95))',
            border: 'none',
            color: '#fff',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
          },
          className: 'toast-immersion',
        }}
        className="toaster-immersion"
        theme="light"
      />
    </div>
  )
}
