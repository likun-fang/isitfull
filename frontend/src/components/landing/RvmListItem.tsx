import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Icon } from '../common/Icon';
import { theme } from '../../theme';
import { rvmService } from '../../services/rvmService';
import type { Rvm, RvmStatus, IssueReason } from '../../types';

interface Props {
  rvm: Rvm;
  onReport?: (rvmId: number, status: RvmStatus) => void;
}

// ── Brand detection: local logo assets + fallback color ──
const BRAND_LOGOS: Record<string, { logo: any; bg: string }> = {
  lidl: { logo: require('../../../assets/brands/lidl.png'), bg: '#0050AA' },
  tesco: { logo: require('../../../assets/brands/tesco.png'), bg: '#EE1C2E' },
  supervalu: { logo: require('../../../assets/brands/supervalu.png'), bg: '#00A651' },
  aldi: { logo: require('../../../assets/brands/aldi.png'), bg: '#00529B' },
  dunnes: { logo: require('../../../assets/brands/dunnes.png'), bg: '#1B3D6D' },
  centra: { logo: require('../../../assets/brands/centra.png'), bg: '#E31837' },
  spar: { logo: require('../../../assets/brands/spar.png'), bg: '#D4202C' },
  dealz: { logo: require('../../../assets/brands/dealz.png'), bg: '#E4007C' },
};

function getBrand(name: string): { logo: any | null; bg: string } {
  const lower = name.toLowerCase();
  for (const [brand, config] of Object.entries(BRAND_LOGOS)) {
    if (lower.includes(brand)) {
      return config;
    }
  }
  return { logo: null, bg: theme.colors.primary[500] };
}

// ── Status config ──
const STATUS_STYLES: Record<RvmStatus, { bg: string; text: string; label: string; icon: string }> = {
  AVAILABLE: { bg: 'rgba(34, 197, 94, 0.12)', text: '#16A34A', label: 'Available', icon: 'check-circle' },
  BUSY: { bg: 'rgba(234, 179, 8, 0.12)', text: '#CA8A04', label: 'Busy', icon: 'clock' },
  BROKEN: { bg: 'rgba(239, 68, 68, 0.12)', text: '#DC2626', label: 'Broken', icon: 'x-circle' },
  UNKNOWN: { bg: 'rgba(156, 163, 175, 0.12)', text: '#6B7280', label: 'Unknown', icon: 'help-circle' },
};

function formatDistance(meters: number | null): string {
  if (meters === null) return 'Distance unknown';
  if (meters < 1000) return `${Math.round(meters)}m away`;
  return `${(meters / 1000).toFixed(1)}km away`;
}

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return 'No recent reports';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const ISSUE_REASONS: { value: IssueReason; label: string }[] = [
  { value: 'DOES_NOT_EXIST', label: 'Machine missing' },
  { value: 'WRONG_LOCATION', label: 'Wrong location' },
  { value: 'DUPLICATE', label: 'Duplicate listing' },
  { value: 'OTHER', label: 'Other issue' },
];

// ── Report button config ──
const REPORT_OPTIONS: { status: RvmStatus; label: string; icon: string; color: string; glow: string; tint: string }[] = [
  { status: 'AVAILABLE', label: 'Working', icon: 'check-circle', color: '#22C55E', glow: 'rgba(34,197,94,0.35)', tint: '#E6F8EF' },
  { status: 'BUSY', label: 'Busy', icon: 'clock', color: '#EAB308', glow: 'rgba(234,179,8,0.35)', tint: '#FFF8E1' },
  { status: 'BROKEN', label: 'Broken', icon: 'x-circle', color: '#EF4444', glow: 'rgba(239,68,68,0.35)', tint: '#FCE8E6' },
];

export function RvmListItem({ rvm, onReport }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<RvmStatus | null>(null);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [selectedReason, setSelectedReason] = useState<IssueReason | null>(null);
  const [issueSubmitting, setIssueSubmitting] = useState(false);
  const [issueResult, setIssueResult] = useState<string | null>(null);

  const brand = getBrand(rvm.name);
  const status = STATUS_STYLES[rvm.status] || STATUS_STYLES.UNKNOWN;

  const handleToggleExpand = () => setExpanded((prev) => !prev);

  const openDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${rvm.lat},${rvm.lng}`;
    window.open(url, '_blank');
  };

  const handleReport = (s: RvmStatus) => {
    setSelectedStatus(s);
    onReport?.(rvm.id, s);
    // Reset after brief flash
    setTimeout(() => setSelectedStatus(null), 600);
  };

  const handleIssueSubmit = async () => {
    if (!selectedReason) return;
    setIssueSubmitting(true);
    try {
      const message = await rvmService.reportIssue(rvm.id, selectedReason);
      setIssueResult(message);
      setTimeout(() => {
        setShowIssueForm(false);
        setSelectedReason(null);
        setIssueResult(null);
      }, 2000);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to submit';
      setIssueResult(msg);
    } finally {
      setIssueSubmitting(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handleToggleExpand}
      activeOpacity={0.8}
    >
      {/* ── Header row ── */}
      <View style={styles.header}>
        {/* Brand logo */}
        <View style={[styles.brandCircle, { backgroundColor: brand.logo ? '#fff' : brand.bg }]}>
          {brand.logo ? (
            <Image
              source={brand.logo}
              style={styles.brandLogo}
              resizeMode="contain"
            />
          ) : (
            <Icon name="map-pin" size={18} color="#fff" />
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{rvm.name}</Text>
          <View style={styles.metaRow}>
            <Icon name="navigation" size={12} color={theme.colors.neutral[400]} />
            <Text style={styles.distance}>{formatDistance(rvm.distanceMeters)}</Text>
          </View>
        </View>

        {/* Status pill + chevron */}
        <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
        </View>
        <Icon
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={theme.colors.neutral[400]}
          style={styles.chevron}
        />
      </View>

      {/* ── Expanded section ── */}
      {expanded && (
        <View style={styles.expandedSection}>
          {/* Trust signal */}
          <View style={styles.trustBar}>
            <Icon name="info" size={13} color={theme.colors.neutral[500]} />
            <Text style={styles.trustText}>
              {rvm.statusUpdatedAt
                ? `Last updated ${formatTimeAgo(rvm.statusUpdatedAt)}`
                : 'No recent reports — be the first!'}
            </Text>
          </View>

          {/* Get Directions */}
          <TouchableOpacity
            style={styles.directionsButton}
            onPress={openDirections}
            activeOpacity={0.8}
          >
            <Icon name="navigation" size={16} color={theme.colors.neutral[0]} />
            <Text style={styles.directionsText}>Get Directions</Text>
          </TouchableOpacity>

          {/* Report capsules */}
          <Text style={styles.reportPrompt}>What's the status now?</Text>
          <View style={styles.reportButtons}>
            {REPORT_OPTIONS.map((opt) => {
              const isActive = selectedStatus === opt.status;
              return (
                <TouchableOpacity
                  key={opt.status}
                  style={[
                    styles.reportCapsule,
                    isActive
                      ? { backgroundColor: opt.color, borderColor: opt.color, shadowColor: opt.glow, shadowOpacity: 1, shadowRadius: 16, shadowOffset: { width: 0, height: 4 } }
                      : { backgroundColor: opt.tint, borderColor: opt.color + '30' },
                  ]}
                  onPress={() => handleReport(opt.status)}
                  activeOpacity={0.8}
                >
                  <Icon
                    name={opt.icon}
                    size={16}
                    color={isActive ? '#fff' : opt.color}
                  />
                  <Text style={[
                    styles.reportCapsuleText,
                    isActive ? { color: '#fff' } : { color: opt.color },
                  ]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Issue report */}
          {!showIssueForm ? (
            <TouchableOpacity
              style={styles.issueLink}
              onPress={() => setShowIssueForm(true)}
              activeOpacity={0.7}
            >
              <Icon name="alert-triangle" size={13} color={theme.colors.neutral[400]} />
              <Text style={styles.issueLinkText}>Something wrong with this listing?</Text>
            </TouchableOpacity>
          ) : issueResult ? (
            <View style={styles.issueResult}>
              <Icon name="check" size={14} color={theme.colors.success} />
              <Text style={styles.issueResultText}>{issueResult}</Text>
            </View>
          ) : (
            <View style={styles.issueForm}>
              <Text style={styles.issueFormTitle}>What's the problem?</Text>
              {ISSUE_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason.value}
                  style={[
                    styles.issueOption,
                    selectedReason === reason.value && styles.issueOptionSelected,
                  ]}
                  onPress={() => setSelectedReason(reason.value)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.radio,
                    selectedReason === reason.value && styles.radioSelected,
                  ]}>
                    {selectedReason === reason.value && <View style={styles.radioDot} />}
                  </View>
                  <Text style={[
                    styles.issueOptionText,
                    selectedReason === reason.value && styles.issueOptionTextSelected,
                  ]}>
                    {reason.label}
                  </Text>
                </TouchableOpacity>
              ))}
              <View style={styles.issueActions}>
                <TouchableOpacity
                  style={styles.issueCancelButton}
                  onPress={() => { setShowIssueForm(false); setSelectedReason(null); }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.issueCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.issueSubmitButton,
                    !selectedReason && styles.issueSubmitDisabled,
                  ]}
                  onPress={handleIssueSubmit}
                  disabled={!selectedReason || issueSubmitting}
                  activeOpacity={0.8}
                >
                  {issueSubmitting ? (
                    <ActivityIndicator size="small" color={theme.colors.neutral[0]} />
                  ) : (
                    <Text style={styles.issueSubmitText}>Submit</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // ── Card bubble ──
  card: {
    backgroundColor: theme.colors.neutral[0],
    borderRadius: 20,
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: theme.colors.neutral[100],
  },

  // ── Header row ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    overflow: 'hidden',
  },
  brandLogo: {
    width: 28,
    height: 28,
  },
  info: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  name: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: '600',
    color: theme.colors.neutral[900],
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distance: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[500],
  },
  statusPill: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '700',
  },
  chevron: {
    marginLeft: theme.spacing.sm,
  },

  // ── Expanded section ──
  expandedSection: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[100],
  },

  // Trust signal bar
  trustBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.neutral[50] ?? theme.colors.neutral[100],
    borderRadius: 10,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    gap: 6,
  },
  trustText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral[600],
    fontWeight: '500',
  },

  // Get Directions
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[500],
    borderRadius: 9999,
    paddingVertical: 10,
    marginBottom: theme.spacing.lg,
    gap: 8,
  },
  directionsText: {
    color: theme.colors.neutral[0],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
  },

  // Report capsules
  reportPrompt: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  reportButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  reportCapsule: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: theme.colors.neutral[200],
    backgroundColor: theme.colors.neutral[0],
    gap: 5,
  },
  reportCapsuleText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
  },

  // Issue report
  issueLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    gap: 5,
  },
  issueLinkText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral[400],
  },
  issueResult: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    gap: 6,
  },
  issueResultText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    fontWeight: '500',
  },
  issueForm: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[100],
  },
  issueFormTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.neutral[700],
    marginBottom: theme.spacing.sm,
  },
  issueOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 12,
    marginBottom: 4,
    gap: theme.spacing.sm,
  },
  issueOptionSelected: {
    backgroundColor: theme.colors.neutral[50] ?? theme.colors.neutral[100],
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: theme.colors.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: theme.colors.primary[500],
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary[500],
  },
  issueOptionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
  },
  issueOptionTextSelected: {
    color: theme.colors.neutral[900],
    fontWeight: '500',
  },
  issueActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  issueCancelButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  issueCancelText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    fontWeight: '500',
  },
  issueSubmitButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 9999,
    backgroundColor: theme.colors.primary[500],
  },
  issueSubmitDisabled: {
    opacity: 0.5,
  },
  issueSubmitText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[0],
    fontWeight: '600',
  },
});
