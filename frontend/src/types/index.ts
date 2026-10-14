import { UserRank } from './auth';

export type RvmStatus = 'AVAILABLE' | 'BUSY' | 'BROKEN' | 'UNKNOWN';

export type QueueLength = 'NONE' | 'SHORT' | 'LONG';

export interface ReporterInfo {
  displayName: string;
  rank: UserRank;
}

export interface Rvm {
  id: number;
  name: string;
  city: string;
  postalCode: string;
  lat: number;
  lng: number;
  status: RvmStatus;
  confidenceScore: number;
  statusUpdatedAt: string | null;
  distanceMeters: number | null;
  queueLength: QueueLength | null;
  lastReporter?: ReporterInfo;
}

export interface Device {
  id: number;
  deviceId: string;
  reputation: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    total: number;
    radius: number;
  };
}

export interface ReportRequest {
  status: RvmStatus;
  latitude: number;
  longitude: number;
  queueLength?: QueueLength;
}

export interface ReportResponse {
  reportId: number;
  verified: boolean;
  message: string;
  karmaAwarded?: number;
  totalKarma?: number;
  leveledUp?: boolean;
  previousRank?: UserRank;
  newRank?: UserRank;
}

export interface TopContributor {
  id: string;
  displayName: string;
  avatarUrl?: string;
  karmaPoints: number;
  rank: UserRank;
}

export type IssueReason = 'DOES_NOT_EXIST' | 'WRONG_LOCATION' | 'DUPLICATE' | 'OTHER';

export interface IssueReportRequest {
  reason: IssueReason;
}

export * from './auth';
