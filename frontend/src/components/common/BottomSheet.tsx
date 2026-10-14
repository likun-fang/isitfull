import React, { useEffect, useCallback, useId, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  BackHandler,
  Platform,
  Modal,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useModalPortal } from '../../contexts/ModalPortalContext';
import { useAppTheme } from '../../theme/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 300,
  mass: 0.5,
};

interface Props {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: number[];
}

// Inner component that renders the actual modal content
function BottomSheetContent({
  visible,
  onClose,
  children,
  snapPoints = [0.5],
}: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const context = useSharedValue({ y: 0 });

  const maxHeight = SCREEN_HEIGHT * snapPoints[snapPoints.length - 1];
  const dismissThreshold = maxHeight * 0.3;

  const handleClose = useCallback(() => {
    translateY.value = withSpring(SCREEN_HEIGHT, SPRING_CONFIG);
    backdropOpacity.value = withTiming(0, { duration: 200 });
    setTimeout(onClose, 200);
  }, [onClose, translateY, backdropOpacity]);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, SPRING_CONFIG);
      backdropOpacity.value = withTiming(1, { duration: 250 });
    } else {
      translateY.value = withSpring(SCREEN_HEIGHT, SPRING_CONFIG);
      backdropOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, translateY, backdropOpacity]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (visible) {
          handleClose();
          return true;
        }
        return false;
      });
      return () => backHandler.remove();
    }
  }, [visible, handleClose]);

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      translateY.value = Math.max(0, context.value.y + event.translationY);
    })
    .onEnd((event) => {
      if (translateY.value > dismissThreshold || event.velocityY > 500) {
        translateY.value = withSpring(SCREEN_HEIGHT, SPRING_CONFIG);
        backdropOpacity.value = withTiming(0, { duration: 200 });
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0, SPRING_CONFIG);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  return (
    <View style={styles.modalContainer} pointerEvents={visible ? 'auto' : 'none'}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.backdrop, backdropStyle]} />
      </TouchableWithoutFeedback>

      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            styles.sheet,
            sheetStyle,
            {
              backgroundColor: colors.neutral[0],
              paddingBottom: Platform.OS === 'web' ? 80 : insets.bottom + 16,
            },
          ]}
        >
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.neutral[300] }]} />
          </View>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

export function BottomSheet({ visible, onClose, children, snapPoints = [0.5] }: Props) {
  const modalId = useId();
  const { registerModal, unregisterModal } = useModalPortal();
  const isRegisteredRef = useRef(false);

  // On web, register/unregister the modal content with the portal
  useEffect(() => {
    if (Platform.OS === 'web') {
      if (visible && !isRegisteredRef.current) {
        isRegisteredRef.current = true;
        registerModal(
          modalId,
          <BottomSheetContent
            visible={visible}
            onClose={onClose}
            children={children}
            snapPoints={snapPoints}
          />
        );
      } else if (visible && isRegisteredRef.current) {
        // Update the modal content when props change
        registerModal(
          modalId,
          <BottomSheetContent
            visible={visible}
            onClose={onClose}
            children={children}
            snapPoints={snapPoints}
          />
        );
      } else if (!visible && isRegisteredRef.current) {
        isRegisteredRef.current = false;
        unregisterModal(modalId);
      }
    }
  }, [visible, modalId, registerModal, unregisterModal, onClose, children, snapPoints]);

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
    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={onClose}
      >
        <BottomSheetContent
          visible={visible}
          onClose={onClose}
          children={children}
          snapPoints={snapPoints}
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 24,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
});
