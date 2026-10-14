import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
} from 'react-native-reanimated';
import { UserRank, RANK_INFO } from '../../types';
import { theme } from '../../theme';
import { useAppTheme } from '../../theme/ThemeContext';

interface Props {
  visible: boolean;
  previousRank: UserRank;
  newRank: UserRank;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function LevelUpModal({ visible, newRank, onClose }: Props) {
  const newRankInfo = RANK_INFO[newRank] || RANK_INFO.ECO_NEWBIE;
  const { colors } = useAppTheme();

  // Animation values
  const backdropOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.3);
  const cardOpacity = useSharedValue(0);
  const emojiScale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const glowPulse = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Reset values
      backdropOpacity.value = 0;
      cardScale.value = 0.3;
      cardOpacity.value = 0;
      emojiScale.value = 0;
      titleOpacity.value = 0;
      glowPulse.value = 0;

      // Animate in sequence
      backdropOpacity.value = withTiming(1, { duration: 300 });

      cardScale.value = withDelay(100, withSpring(1, {
        damping: 12,
        stiffness: 200,
        mass: 0.8,
      }));
      cardOpacity.value = withDelay(100, withTiming(1, { duration: 200 }));

      emojiScale.value = withDelay(300, withSequence(
        withSpring(1.2, { damping: 8, stiffness: 300 }),
        withSpring(1, { damping: 15, stiffness: 200 })
      ));

      titleOpacity.value = withDelay(400, withTiming(1, { duration: 300 }));

      glowPulse.value = withDelay(500, withRepeat(
        withSequence(
          withTiming(1, { duration: 1000 }),
          withTiming(0, { duration: 1000 })
        ),
        -1,
        true
      ));
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      cardScale.value = withTiming(0.8, { duration: 200 });
      cardOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + glowPulse.value * 0.5,
    transform: [{ scale: 1 + glowPulse.value * 0.1 }],
  }));

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, backdropStyle]} />
      </TouchableWithoutFeedback>

      {/* Card */}
      <Animated.View style={[styles.card, cardStyle, { backgroundColor: colors.neutral[0] }]}>
        {/* Glow effect behind emoji */}
        <Animated.View style={[styles.glow, glowStyle]} />

        {/* Emoji */}
        <Animated.View style={[styles.emojiContainer, emojiStyle]}>
          <Text style={styles.emoji}>{newRankInfo.emoji}</Text>
        </Animated.View>

        {/* Text content */}
        <Animated.View style={titleStyle}>
          <Text style={styles.levelUpText}>LEVEL UP!</Text>
          <Text style={[styles.youAreNow, { color: colors.neutral[500] }]}>You are now a</Text>
          <Text style={[styles.rankName, { color: colors.neutral[900] }]}>{newRankInfo.name}</Text>
          <Text style={[styles.subtitle, { color: colors.neutral[600] }]}>
            Your reports now carry more trust in the community!
          </Text>
        </Animated.View>

        {/* Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={onClose}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Awesome!</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  card: {
    borderRadius: 28,
    padding: 32,
    paddingTop: 40,
    alignItems: 'center',
    marginHorizontal: 24,
    maxWidth: 340,
    width: '100%',
    shadowColor: theme.colors.primary[600],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 24,
    overflow: 'visible',
  },
  glow: {
    position: 'absolute',
    top: 20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primary[400],
  },
  emojiContainer: {
    marginBottom: 16,
    zIndex: 1,
  },
  emoji: {
    fontSize: 80,
    textAlign: 'center',
  },
  levelUpText: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.primary[600],
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 12,
  },
  youAreNow: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
  },
  rankName: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  button: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: 56,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: theme.colors.primary[600],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.neutral[0],
    letterSpacing: 0.5,
  },
});
