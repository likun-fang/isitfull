import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Linking,
} from 'react-native';
import { Icon } from '../common/Icon';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SuccessModal({ visible, onClose }: SuccessModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.emoji}>🎉</Text>

          <Text style={styles.title}>Thank you!</Text>

          <Text style={styles.description}>
            You just saved someone a wasted trip.
          </Text>

          <Text style={styles.upsellText}>
            Want to earn Karma Points for this? Track your impact and compete with neighbors in the App.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => Linking.openURL('/downloads')}
            activeOpacity={0.85}
          >
            <Icon name="download" size={18} color={colors.neutral[0]} />
            <Text style={styles.primaryButtonText}>Get the App</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>Not now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  content: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius['2xl'],
    padding: spacing['2xl'],
    maxWidth: 400,
    width: '100%',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
    color: colors.neutral[800],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
  },
  upsellText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[500],
    textAlign: 'center',
    marginBottom: spacing['2xl'],
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[600],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'],
    borderRadius: borderRadius.lg,
    width: '100%',
    gap: spacing.sm,
  },
  primaryButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.neutral[0],
  },
  secondaryButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
  },
});
