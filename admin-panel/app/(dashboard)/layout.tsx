'use client'

import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { AppHeader } from '@/components/layout/app-header'
import { AuthGuard } from '@/components/layout/auth-guard'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex flex-1 flex-col min-h-screen">
          <AppHeader />
          <div className="flex-1 p-6">{children}</div>
        </main>
      </SidebarProvider>
    </AuthGuard>
  )
}
