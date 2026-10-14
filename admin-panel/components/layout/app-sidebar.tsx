'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Map,
  Users,
  MapPin,
  AlertTriangle,
  FileText,
  ScrollText,
  MessageSquare,
  LogOut,
  KeyRound,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { clearAuth, getDisplayName } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { ChangePasswordDialog } from './change-password-dialog'

const navItems = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard },
  { title: 'Map Monitor', href: '/map', icon: Map },
  { title: 'Users', href: '/users', icon: Users },
  { title: 'RVMs', href: '/rvms', icon: MapPin },
  { title: 'Reports', href: '/reports', icon: FileText },
  { title: 'Issues', href: '/issues', icon: AlertTriangle },
  { title: 'Feedback', href: '/feedback', icon: MessageSquare },
  { title: 'Audit Logs', href: '/audit', icon: ScrollText },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [pwDialogOpen, setPwDialogOpen] = useState(false)

  const handleSignOut = () => {
    clearAuth()
    router.push('/login')
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-gray-200 px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500" />
          <span className="text-sm font-semibold text-gray-900">
            Is It Full?
          </span>
          <span className="text-xs text-gray-400">Admin</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={
                        isActive
                          ? 'bg-green-50 text-green-700 font-medium hover:bg-green-50'
                          : 'text-gray-600 hover:bg-gray-100'
                      }
                    >
                      <Link href={item.href}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors duration-200">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                A
              </div>
              <span className="truncate">{getDisplayName()}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setPwDialogOpen(true)}
            >
              <KeyRound className="mr-2 h-4 w-4" />
              Change Password
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>

      <ChangePasswordDialog
        open={pwDialogOpen}
        onOpenChange={setPwDialogOpen}
      />
    </Sidebar>
  )
}
