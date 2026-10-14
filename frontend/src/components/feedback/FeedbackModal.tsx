import React, { useState, useEffect, useCallback, useId, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Dimensions,
  BackHandler,
  Platform,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { useModalPortal } from '../../contexts/ModalPortalContext';
import {
  feedbackService,
  ScreenshotAsset,
} from '../../services/feedbackService';
import { useAppTheme } from '../../theme/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const SPRING_CONFIG = {
  damping: 22,
  stiffness: 280,
  mass: 0.6,
};

type FeedbackType = 'BUG' | 'FEATURE';

interface Props {
  visible: boolean;
  type: FeedbackType;
  onClose: () => void;
}

const TITLES: Record<FeedbackType, string> = {
  BUG: 'Report a Bug',
  FEATURE: 'Request a Feature',
};

const PLACEHOLDERS: Record<FeedbackType, string> = {
  BUG: 'Describe the issue you encountered...',
  FEATURE: 'Describe the feature you would like to see...',
};

const MAX_LENGTH = 2000;

function FeedbackModalContent({ visible, type, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const [message, setMessage] = useState('');
  const [screenshot, setScreenshot] = useState<ScreenshotAsset | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  const close = useCallback(() => {
    translateY.value = withSpring(SCREEN_HEIGHT, SPRING_CONFIG);
    backdropOpacity.value = withTiming(0, { duration: 200 });
    setTimeout(() => {
      setMessage('');
      setScreenshot(null);
      setError(null);
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
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (visible) {
            close();
            return true;
          }
          return false;
        }
      );
      return () => backHandler.remove();
    }
  }, [visible, close]);

  const pickScreenshot = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const actions = asset.width && asset.width > 1080
        ? [{ resize: { width: 1080 } as const }]
        : [];
      const compressed = await manipulateAsync(asset.uri, actions, {
        compress: 0.4,
        format: SaveFormat.JPEG,
      });
      setScreenshot({
        uri: compressed.uri,
        fileName: `screenshot_${Date.now()}.jpg`,
        mimeType: 'image/jpeg',
      });
    }
  };

  const handleSubmit = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await feedbackService.submit(type, trimmed, screenshot);
      close();
      setTimeout(() => {
        Alert.alert(
          'Thank You!',
          type === 'BUG'
            ? "Thanks for reporting this bug. We'll look into it."
            : 'Thanks for your suggestion! We appreciate your feedback.'
        );
      }, 300);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to submit feedback'
      );
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
  const canSubmit = message.trim().length > 0 && !isSubmitting;

  return (
    <KeyboardAvoidingView
      style={styles.modalContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={close}
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
        <View style={styles.handleContainer}>
          <View style={[styles.handle, { backgroundColor: colors.neutral[200] }]} />
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.neutral[900] }]}>{TITLES[type]}</Text>
            <TouchableOpacity
              onPress={close}
              style={styles.closeButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Feather name="x" size={22} color={colors.neutral[400]} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={[styles.textInput, { borderColor: colors.neutral[200], color: colors.neutral[900], backgroundColor: colors.neutral[50] }]}
            placeholder={PLACEHOLDERS[type]}
            placeholderTextColor={colors.neutral[400]}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={MAX_LENGTH}
            textAlignVertical="top"
            autoFocus
          />
          <Text style={[styles.charCount, { color: colors.neutral[400] }]}>
            {message.length}/{MAX_LENGTH}
          </Text>

          {screenshot ? (
            <View style={styles.screenshotPreview}>
              <Image
                source={{ uri: screenshot.uri }}
                style={styles.screenshotImage}
              />
              <TouchableOpacity
                style={styles.removeScreenshot}
                onPress={() => setScreenshot(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="x" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.attachButton, { backgroundColor: colors.neutral[100] }]}
              onPress={pickScreenshot}
              activeOpacity={0.7}
            >
              <Feather name="image" size={18} color={colors.neutral[500]} />
              <Text style={[styles.attachText, { color: colors.neutral[500] }]}>Attach Screenshot</Text>
            </TouchableOpacity>
          )}

          {error && (
            <View style={[styles.errorContainer, { backgroundColor: colors.error + '10' }]}>
              <Feather name="alert-circle" size={16} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: colors.primary[600] },
              !canSubmit && { backgroundColor: colors.neutral[300] },
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Feather name="send" size={18} color="#FFFFFF" />
                <Text style={styles.submitText}>Submit</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

export function FeedbackModal({ visible, type, onClose }: Props) {
  const modalId = useId();
  const { registerModal, unregisterModal } = useModalPortal();
  const isRegisteredRef = useRef(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      if (visible && !isRegisteredRef.current) {
        isRegisteredRef.current = true;
        registerModal(
          modalId,
          <FeedbackModalContent
            visible={visible}
            type={type}
            onClose={onClose}
          />
        );
      } else if (visible && isRegisteredRef.current) {
        registerModal(
          modalId,
          <FeedbackModalContent
            visible={visible}
            type={type}
            onClose={onClose}
          />
        );
      } else if (!visible && isRegisteredRef.current) {
        isRegisteredRef.current = false;
        unregisterModal(modalId);
      }
    }
  }, [visible, type, modalId, registerModal, unregisterModal, onClose]);

  useEffect(() => {
    return () => {
      if (Platform.OS === 'web' && isRegisteredRef.current) {
        unregisterModal(modalId);
      }
    };
  }, [modalId, unregisterModal]);

  if (Platform.OS !== 'web') {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={onClose}
      >
        <FeedbackModalContent
          visible={visible}
          type={type}
          onClose={onClose}
        />
      </Modal>
    );
  }

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
    ...Platform.select({ web: { paddingBottom: 80 } }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  closeButton: {
    padding: 4,
  },
  textInput: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    minHeight: 140,
    maxHeight: 220,
    lineHeight: 22,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 6,
    marginBottom: 12,
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  attachText: {
    fontSize: 14,
  },
  screenshotPreview: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  screenshotImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  removeScreenshot: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#6B7280',
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
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});