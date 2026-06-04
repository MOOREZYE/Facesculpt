'use client'

import { ReactNode } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
  userName?: string
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-emerald-50/30">
      {/* Glass-morphism Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/40 border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-stone-900">FaceSculpt™</h1>
                <p className="text-xs text-stone-500">Professional Training</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <button className="text-stone-600 hover:text-stone-900 transition-colors text-sm font-medium">
                Settings
              </button>
              <button className="text-stone-600 hover:text-stone-900 transition-colors text-sm font-medium">
                Help
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">{children}</main>

      {/* Footer */}
      <footer className="border-t border-stone-200/50 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-stone-500">
          <p>FaceSculpt™ © 2024. Professional training platform for beauty specialists.</p>
        </div>
      </footer>
    </div>
  )
}
