import React, { useState, useEffect, useCallback, useId, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  BackHandler,
  Platform,
  Modal,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Rvm, RvmStatus, QueueLength } from '../../types';
import { STATUS_CONFIG } from '../../utils/statusColor';
import { useModalPortal } from '../../contexts/ModalPortalContext';
import { useAppTheme } from '../../theme/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const SPRING_CONFIG = {
  damping: 22,
  stiffness: 280,
  mass: 0.6,
};

interface Props {
  visible: boolean;
  rvm: Rvm | null;
  onClose: () => void;
  onSubmit: (status: RvmStatus, queueLength: QueueLength | null) => Promise<void>;
}

const STATUS_OPTIONS: RvmStatus[] = ['AVAILABLE', 'BUSY', 'BROKEN'];

const QUEUE_OPTIONS: { value: QueueLength; label: string; description: string }[] = [
  { value: 'NONE', label: 'No queue', description: 'Empty' },
  { value: 'SHORT', label: 'Short', description: '1-3 people' },
  { value: 'LONG', label: 'Long', description: '5+ people' },
];

// Inner component that renders the actual modal content with its own state
function ReportModalContent({ visible, rvm, onClose, onSubmit }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const [selectedStatus, setSelectedStatus] = useState<RvmStatus | null>(null);
  const [queueLength, setQueueLength] = useState<QueueLength | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const successScale = useSharedValue(0);

  const close = useCallback(() => {
    translateY.value = withSpring(SCREEN_HEIGHT, SPRING_CONFIG);
    backdropOpacity.value = withTiming(0, { duration: 200 });
    setTimeout(() => {
      setSelectedStatus(null);
      setQueueLength(null);
      setError(null);
      setShowSuccess(false);
      onClose();
    }, 200);
  }, [onClose, translateY, backdropOpacity]);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, SPRING_CONFIG);
      backdropOpacity.value = withTiming(1, { duration: 250 });
    }
  }, [visible, translateY, backdropOpacity]);

  useEffect(() => {
    if (showSuccess) {
      // Simple, elegant bounce - just one gentle pop
      successScale.value = withSpring(1, {
        damping: 15,
        stiffness: 300,
        mass: 0.8,
      });
      const timer = setTimeout(close, 1800);
      return () => clearTimeout(timer);
    } else {
      successScale.value = 0;
    }
  }, [showSuccess, close, successScale]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (visible && !showSuccess) {
          close();
          return true;
        }
        return false;
      });
      return () => backHandler.remove();
    }
  }, [visible, showSuccess, close]);

  const handleSubmit = async () => {
    if (!selectedStatus) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(selectedStatus, queueLength);
      setShowSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const successIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
  }));

  if (!rvm) return null;

  return (
    <View style={styles.modalContainer} pointerEvents={visible ? 'auto' : 'none'}>
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={showSuccess ? undefined : close}
      >
        <Animated.View style={[styles.backdrop, backdropStyle]} />
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.sheet,
          sheetStyle,
          { paddingBottom: insets.bottom + 20, backgroundColor: colors.neutral[0] },
        ]}
      >
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={[styles.handle, { backgroundColor: colors.neutral[300] }]} />
        </View>

        {showSuccess ? (
          <View style={styles.successContainer}>
            <Animated.View style={[styles.successIconWrapper, successIconStyle]}>
              <View style={[styles.successIcon, { backgroundColor: colors.primary[600], shadowColor: colors.primary[600] }]}>
                <Feather name="check" size={36} color="#FFFFFF" />
              </View>
            </Animated.View>
            <Text style={[styles.successTitle, { color: colors.neutral[900] }]}>Thank you!</Text>
            <Text style={[styles.successMessage, { color: colors.neutral[500] }]}>
              You just saved someone a wasted trip.
            </Text>
          </View>
        ) : (
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text style={[styles.title, { color: colors.primary[600] }]}>Update Status</Text>
                <Text style={[styles.rvmName, { color: colors.neutral[900] }]} numberOfLines={1}>{rvm.name}</Text>
              </View>
              <TouchableOpacity
                onPress={close}
                style={styles.closeButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Feather name="x" size={22} color={colors.neutral[400]} />
              </TouchableOpacity>
            </View>

            {/* Status Options */}
            <View style={styles.optionsContainer}>
              {STATUS_OPTIONS.map((status) => {
                const config = STATUS_CONFIG[status];
                const isSelected = selectedStatus === status;

                return (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.option,
                      { borderColor: colors.neutral[200], backgroundColor: colors.neutral[50] },
                      isSelected && styles.optionSelected,
                      isSelected && { borderColor: config.color, backgroundColor: colors.neutral[0] },
                    ]}
                    onPress={() => setSelectedStatus(status)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: config.color },
                        isSelected && styles.statusDotSelected,
                      ]}
                    />
                    <Text
                      style={[
                        styles.optionText,
                        { color: colors.neutral[500] },
                        isSelected && { color: config.color, fontWeight: '600' },
                      ]}
                    >
                      {config.label}
                    </Text>
                    {isSelected && (
                      <View style={[styles.checkCircle, { backgroundColor: config.color }]}>
                        <Feather name="check" size={14} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Queue Length (Optional) */}
            <View style={styles.queueSection}>
              <Text style={[styles.queueTitle, { color: colors.neutral[500] }]}>Queue Length (optional)</Text>
              <View style={styles.queueOptions}>
                {QUEUE_OPTIONS.map((option) => {
                  const isSelected = queueLength === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.queueOption,
                        { borderColor: colors.neutral[200], backgroundColor: colors.neutral[50] },
                        isSelected && { borderColor: colors.primary[600], backgroundColor: colors.primary[50], borderWidth: 2 },
                      ]}
                      onPress={() => setQueueLength(isSelected ? null : option.value)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.queueOptionLabel,
                          { color: colors.neutral[500] },
                          isSelected && { color: colors.primary[600] },
                        ]}
                      >
                        {option.label}
                      </Text>
                      <Text
                        style={[
                          styles.queueOptionDesc,
                          { color: colors.neutral[400] },
                          isSelected && { color: colors.primary[600] },
                        ]}
                      >
                        {option.description}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Error */}
            {error && (
              <View style={[styles.errorContainer, { backgroundColor: colors.error + '10' }]}>
                <Feather name="alert-circle" size={16} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: colors.primary[600] },
                !selectedStatus && { backgroundColor: colors.neutral[300], shadowOpacity: 0, elevation: 0 },
              ]}
              onPress={handleSubmit}
              disabled={!selectedStatus || isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Feather name="send" size={18} color="#FFFFFF" />
                  <Text style={styles.submitText}>Submit Report</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Disclaimer */}
            <Text style={[styles.disclaimer, { color: colors.neutral[400] }]}>
              Reports are anonymous and help others find working machines.
            </Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

export function ReportModal({ visible, rvm, onClose, onSubmit }: Props) {
  const modalId = useId();
  const { registerModal, unregisterModal } = useModalPortal();
  const isRegisteredRef = useRef(false);

  // On web, register/unregister the modal content with the portal
  useEffect(() => {
    if (Platform.OS === 'web') {
      if (visible && rvm && !isRegisteredRef.current) {
        isRegisteredRef.current = true;
        registerModal(
          modalId,
          <ReportModalContent
            visible={visible}
            rvm={rvm}
            onClose={onClose}
            onSubmit={onSubmit}
          />
        );
      } else if (visible && rvm && isRegisteredRef.current) {
        // Update the modal content when props change
        registerModal(
          modalId,
          <ReportModalContent
            visible={visible}
            rvm={rvm}
            onClose={onClose}
            onSubmit={onSubmit}
          />
        );
      } else if (!visible && isRegisteredRef.current) {
        isRegisteredRef.current = false;
        unregisterModal(modalId);
      }
    }
  }, [visible, rvm, modalId, registerModal, unregisterModal, onClose, onSubmit]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (Platform.OS === 'web' && isRegisteredRef.current) {
        unregisterModal(modalId);
      }
    };
  }, [modalId, unregisterModal]);

  // On native, use Modal component
  if (Platform.OS !== 'web') {
    if (!rvm) return null;

    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={onClose}
      >
        <ReportModalContent
          visible={visible}
          rvm={rvm}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      </Modal>
    );
  }

  // On web, content is rendered via portal
  return null;
}

const styles = StyleSheet.create({
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 24,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    ...Platform.select({
      web: {
        paddingBottom: 80,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerText: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  rvmName: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  closeButton: {
    padding: 4,
    marginTop: -2,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  optionSelected: {
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 14,
  },
  statusDotSelected: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 16,
    gap: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disclaimer: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  successIconWrapper: {
    marginBottom: 20,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  successMessage: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  queueSection: {
    marginBottom: 20,
  },
  queueTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  queueOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  queueOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  queueOptionSelected: {
    borderWidth: 2,
  },
  queueOptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  queueOptionLabelSelected: {
  },
  queueOptionDesc: {
    fontSize: 12,
  },
  queueOptionDescSelected: {
  },
});
