import { RvmStatus, QueueLength } from '../types';

export const STATUS_CONFIG: Record<RvmStatus, { color: string; label: string; icon: string }> = {
  AVAILABLE: { color: '#22C55E', label: 'Available', icon: 'check-circle' },
  BUSY: { color: '#EAB308', label: 'Busy', icon: 'clock' },
  BROKEN: { color: '#EF4444', label: 'Broken', icon: 'x-circle' },
  UNKNOWN: { color: '#9CA3AF', label: 'Unknown', icon: 'help-circle' },
};

/**
 * Get marker color based on status and queue length
 * - Green: AVAILABLE with no/short queue
 * - Yellow: AVAILABLE with long queue, or BUSY
 * - Red: BROKEN
 * - Gray: UNKNOWN
 */
export const getStatusColor = (status: RvmStatus, queueLength?: QueueLength | null): string => {
  if (status === 'BROKEN') return '#EF4444'; // Red
  if (status === 'UNKNOWN') return '#9CA3AF'; // Gray

  if (status === 'AVAILABLE') {
    if (queueLength === 'LONG') return '#EAB308'; // Yellow
    return '#22C55E'; // Green
  }

  // BUSY
  return '#EAB308'; // Yellow
};

export const getStatusLabel = (status: RvmStatus): string => {
  return STATUS_CONFIG[status]?.label || STATUS_CONFIG.UNKNOWN.label;
};
