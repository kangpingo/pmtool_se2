'use client'
import { Menu } from 'lucide-react'

export default function Header() {
  return (
    <header className="relative z-50 h-14 border-b border-gray-200/50 dark:border-gray-700 bg-white/80 dark:bg-gray-800 backdrop-blur-md flex items-center px-4 transition-colors duration-300">
      {/* Mobile menu button placeholder */}
      <div className="w-10 shrink-0" />
    </header>
  )
}
