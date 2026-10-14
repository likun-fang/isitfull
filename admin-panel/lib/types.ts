// API wrapper
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  meta?: {
    total: number
    page: number
    size: number
    totalPages: number
  }
}

// Enums
export type RvmStatus = 'AVAILABLE' | 'BUSY' | 'BROKEN' | 'UNKNOWN' | 'REMOVED'
export type IssueStatus = 'PENDING' | 'RESOLVED' | 'IGNORED'
export type IssueResolution = 'FIXED' | 'IGNORED' | 'DUPLICATE' | 'INVALID'
export type IssueReason = 'DOES_NOT_EXIST' | 'WRONG_LOCATION' | 'DUPLICATE' | 'OTHER'
export type AuthProvider = 'GUEST' | 'GOOGLE' | 'APPLE'
export type QueueLength = 'NONE' | 'SHORT' | 'LONG'
export type FeedbackType = 'BUG' | 'FEATURE'

// Entities
export interface Rvm {
  id: number
  externalId: string | null
  name: string
  city: string
  postalCode: string | null
  latitude: number
  longitude: number
  openHours: string | null
  status: RvmStatus
  queueLength: string | null
  confidenceScore: number | null
  statusUpdatedAt: string | null
  lastCalculatedAt: string | null
  adminLocked: boolean
  createdAt: string
}

export interface User {
  id: number
  provider: AuthProvider
  providerId: string
  email: string | null
  displayName: string | null
  avatarUrl: string | null
  karmaPoints: number
  reportCount: number
  firstReportCount: number
  correctionCount: number
  createdAt: string
  updatedAt: string
  lastActiveAt: string | null
  deletedAt: string | null
}

export interface IssueReport {
  id: number
  rvm_id: number
  user_id: number
  reason: IssueReason
  status: IssueStatus
  resolution: IssueResolution | null
  resolved_by: number | null
  resolved_at: string | null
  admin_note: string | null
  created_at: string
  // Joined fields from listIssues endpoint (snake_case from SQL)
  rvm_name?: string
  rvm_city?: string
  reporter_name?: string
  reporter_email?: string
}

export interface DashboardStats {
  totalUsers: number
  activeUsers30d: number
  newUsersToday: number
  totalRvms: number
  brokenRvms: number
  totalReports: number
  reportsToday: number
  pendingIssues: number
  resolvedIssuesToday: number
}

export interface AuditLog {
  id: number
  adminId: number
  action: string
  targetType: string | null
  targetId: number | null
  details: string | null
  createdAt: string
}

export interface StatusReport {
  id: number
  rvm_id: number
  user_id: number | null
  status: RvmStatus
  latitude: number | null
  longitude: number | null
  distance_meters: number | null
  verified: boolean
  queue_length: QueueLength | null
  created_at: string
  // Joined fields (snake_case from SQL)
  rvm_name?: string
  rvm_city?: string
  reporter_name?: string
  reporter_email?: string
}

// Request DTOs
export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  displayName: string | null
}

export interface ResolveIssueRequest {
  resolution: IssueResolution
  note?: string
}

export interface AdjustKarmaRequest {
  points: number
  reason: string
}

export interface FeedbackItem {
  id: number
  user_id: number
  type: FeedbackType
  message: string
  screenshot_url?: string
  created_at: string
  reporter_name?: string
  reporter_email?: string
}

export interface RvmRequest {
  name: string
  city: string
  postalCode?: string
  latitude: number
  longitude: number
  openHours?: string
  externalId?: string
}

export interface RvmStatusRequest {
  status: RvmStatus
  locked?: boolean
}

export interface RvmSyncResult {
  fetched: number
  upserted: number
  newCount: number
  removedCount: number
  newRvmNames: string[]
  removedExternalIds: string[]
}
