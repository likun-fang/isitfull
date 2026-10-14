import React, { useState } from 'react';
import { Rvm, IssueReason } from '../../types';
import { STATUS_CONFIG } from '../../utils/statusColor';
import { useFavorites } from '../../hooks/useFavorites';
import { rvmService } from '../../services/rvmService';

interface Props {
  rvm: Rvm;
  onReport: () => void;
  onClose: () => void;
}

export function RvmDetailSheet({ rvm, onReport, onClose }: Props) {
  const statusConfig = STATUS_CONFIG[rvm.status] || STATUS_CONFIG.UNKNOWN;
  const { isFavorite, toggleFavorite } = useFavorites();
  const isRvmFavorite = isFavorite(rvm.id);
  const [isReportingIssue, setIsReportingIssue] = useState(false);
  const [showIssueMenu, setShowIssueMenu] = useState(false);

  const handleToggleFavorite = async () => {
    try {
      await toggleFavorite(rvm.id);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const issueReasons: { label: string; value: IssueReason }[] = [
    { label: 'Machine does not exist', value: 'DOES_NOT_EXIST' },
    { label: 'Location is wrong', value: 'WRONG_LOCATION' },
    { label: 'Duplicate listing', value: 'DUPLICATE' },
    { label: 'Other', value: 'OTHER' },
  ];

  const handleSubmitIssue = async (reason: IssueReason) => {
    setShowIssueMenu(false);
    setIsReportingIssue(true);
    try {
      await rvmService.reportIssue(rvm.id, reason);
      alert('Thanks! We\'ll verify this shortly.');
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to submit report.';
      alert(msg);
    } finally {
      setIsReportingIssue(false);
    }
  };

  const formatDistance = (meters: number | null) => {
    if (!meters) return 'Distance unknown';
    if (meters < 1000) return `${meters}m away`;
    return `${(meters / 1000).toFixed(1)}km away`;
  };

  const openDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${rvm.lat},${rvm.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div style={styles.container}>
      {/* Header with status indicator */}
      <div style={styles.header}>
        <div style={{ ...styles.statusIndicator, backgroundColor: statusConfig.color }} />
        <div style={styles.headerContent}>
          <div style={styles.name}>{rvm.name}</div>
          <div style={styles.locationRow}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span style={styles.location}>{rvm.city} · {formatDistance(rvm.distanceMeters)}</span>
          </div>
        </div>
        <button onClick={handleToggleFavorite} style={styles.favoriteButton}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill={isRvmFavorite ? '#EF4444' : 'none'} stroke={isRvmFavorite ? '#EF4444' : '#D1D5DB'} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Status Card */}
      <div style={{ ...styles.statusCard, backgroundColor: `${statusConfig.color}08` }}>
        <div style={styles.statusContent}>
          <div style={{ ...styles.statusDot, backgroundColor: statusConfig.color }} />
          <div style={styles.statusTextContainer}>
            <div style={{ ...styles.statusLabel, color: statusConfig.color }}>
              {rvm.status === 'AVAILABLE' && rvm.confidenceScore <= 20
                ? 'Likely Available'
                : statusConfig.label}
            </div>
            <div style={styles.statusSubtext}>
              {rvm.status === 'AVAILABLE' && rvm.confidenceScore <= 20
                ? 'No recent reports'
                : rvm.confidenceScore > 70 ? 'High confidence'
                : rvm.confidenceScore > 40 ? 'Moderate confidence'
                : 'Low confidence'}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={styles.actions}>
        <button
          style={styles.primaryButton}
          onClick={openDirections}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
          <span style={styles.primaryButtonText}>Get Directions</span>
        </button>

        <button
          style={styles.secondaryButton}
          onClick={onReport}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          <span style={styles.secondaryButtonText}>Update Status</span>
        </button>
      </div>

      {/* Report Issue Link */}
      <div style={styles.reportIssueContainer}>
        <button
          onClick={() => setShowIssueMenu(!showIssueMenu)}
          disabled={isReportingIssue}
          style={styles.reportIssueLink}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="4" y1="22" x2="4" y2="15" />
          </svg>
          <span style={styles.reportIssueLinkText}>
            {isReportingIssue ? 'Submitting...' : 'Report an issue with this machine'}
          </span>
        </button>
        {showIssueMenu && (
          <div style={styles.issueMenu}>
            {issueReasons.map((r) => (
              <button
                key={r.value}
                onClick={() => handleSubmitIssue(r.value)}
                style={styles.issueMenuItem}
              >
                {r.label}
              </button>
            ))}
            <button
              onClick={() => setShowIssueMenu(false)}
              style={{ ...styles.issueMenuItem, color: '#9CA3AF' }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '4px 20px 80px',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  statusIndicator: {
    width: 4,
    minHeight: 48,
    borderRadius: 2,
    marginRight: 14,
  },
  headerContent: {
    flex: 1,
  },
  favoriteButton: {
    padding: 8,
    marginLeft: 8,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: '-0.3px',
    lineHeight: '26px',
    marginBottom: 6,
  },
  locationRow: {
    display: 'flex',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 5,
  },
  statusCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  statusContent: {
    display: 'flex',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  statusSubtext: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  actions: {
    display: 'flex',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    padding: 14,
    borderRadius: 12,
    border: 'none',
    gap: 8,
    cursor: 'pointer',
    boxShadow: '0 4px 8px rgba(5, 150, 105, 0.2)',
    transition: 'all 0.15s ease',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    padding: 14,
    borderRadius: 12,
    border: 'none',
    gap: 8,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#059669',
  },
  reportIssueContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    marginTop: 16,
    position: 'relative' as const,
  },
  reportIssueLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
  },
  reportIssueLinkText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  issueMenu: {
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    marginTop: 8,
    overflow: 'hidden' as const,
    minWidth: 220,
  },
  issueMenuItem: {
    padding: '12px 16px',
    background: 'none',
    border: 'none',
    borderBottom: '1px solid #F3F4F6',
    cursor: 'pointer',
    fontSize: 14,
    color: '#374151',
    textAlign: 'left' as const,
  },
};