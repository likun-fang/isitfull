'use client'

import { useDashboardStats } from '@/lib/queries/dashboard'
import { useAllRvms } from '@/lib/queries/rvms'
import { StatCard } from '@/components/dashboard/stat-card'
import { IssueDonutChart } from '@/components/dashboard/issue-donut-chart'
import { RvmStatusChart } from '@/components/dashboard/rvm-status-chart'
import { TopCitiesChart } from '@/components/dashboard/top-cities-chart'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users,
  UserCheck,
  UserPlus,
  MapPin,
  AlertTriangle,
  FileText,
  FileCheck,
  Clock,
  CheckCircle,
} from 'lucide-react'

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats()
  const { data: rvms = [] } = useAllRvms()

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-[320px] rounded-xl" />
          <Skeleton className="h-[320px] rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} />
        <StatCard title="Active (30d)" value={stats.activeUsers30d} icon={UserCheck} />
        <StatCard title="New Today" value={stats.newUsersToday} icon={UserPlus} />
        <StatCard title="Total RVMs" value={stats.totalRvms} icon={MapPin} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard title="Broken RVMs" value={stats.brokenRvms} icon={AlertTriangle} iconBg="bg-red-50" iconColor="text-red-600" />
        <StatCard title="Pending Issues" value={stats.pendingIssues} icon={Clock} iconBg="bg-amber-50" iconColor="text-amber-600" />
      </div>

      {/* Charts Row 1: RVM Status + Top Cities */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">RVM Status Distribution</h2>
          <RvmStatusChart rvms={rvms} />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Top 10 Cities by RVM Count</h2>
          <TopCitiesChart rvms={rvms} />
        </div>
      </div>

      {/* Charts Row 2: Reports Overview + Issue Status */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Reports Overview</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-gray-500 mb-1">
                <FileText className="h-4 w-4" />
                <span className="text-xs">Total Reports</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalReports.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-gray-500 mb-1">
                <FileCheck className="h-4 w-4" />
                <span className="text-xs">Today</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.reportsToday.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-gray-500 mb-1">
                <CheckCircle className="h-4 w-4" />
                <span className="text-xs">Resolved Today</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{stats.resolvedIssuesToday.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Issue Status</h2>
          <IssueDonutChart
            pending={stats.pendingIssues}
            resolved={stats.resolvedIssuesToday}
            ignored={0}
          />
        </div>
      </div>
    </div>
  )
}
