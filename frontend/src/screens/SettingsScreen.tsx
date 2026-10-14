import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Application from 'expo-application';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import { useAppTheme } from '../theme/ThemeContext';
import { useAppStore } from '../stores/useAppStore';
import { useAuthStore, useIsGuest } from '../stores';
import { RANK_INFO } from '../types';
import appConfig from '../../app.config';

const CONFIG_VERSION = appConfig({ config: {} } as any).version || '1.0.0';

function getAppVersion(): string {
  if (Platform.OS === 'web') return CONFIG_VERSION;
  return Application.nativeApplicationVersion || CONFIG_VERSION;
}

interface SettingItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  description?: string;
  onPress: () => void;
  showChevron?: boolean;
  danger?: boolean;
}

function SettingItem({ icon, label, description, onPress, showChevron = true, danger }: SettingItemProps) {
  const { colors } = useAppTheme();
  return (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: colors.neutral[100] }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.settingIcon, { backgroundColor: colors.primary[50] }, danger && { backgroundColor: '#FEE2E2' }]}>
        <Feather
          name={icon}
          size={20}
          color={danger ? colors.error : colors.primary[600]}
        />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingLabel, { color: colors.neutral[900] }, danger && { color: colors.error }]}>{label}</Text>
        {description && <Text style={[styles.settingDescription, { color: colors.neutral[500] }]}>{description}</Text>}
      </View>
      {showChevron && (
        <Feather name="chevron-right" size={20} color={colors.neutral[300]} />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const setHasConsented = useAppStore((state) => state.setHasConsented);
  const user = useAuthStore((state) => state.user);
  const isGuest = useIsGuest();

  const handleAbout = () => {
    Alert.alert(
      'Is It Full?',
      `Version ${getAppVersion()}\n\nWhy this app exists\n\nOfficial real-time data for Reverse Vending Machines isn't publicly available. So, we built our own solution.\n\nThis map is powered by you.\n\nEvery time you update a machine's status, you save someone else a wasted trip. We are building the reliable recycling network that Ireland deserves\u2014together.`,
      [{ text: 'OK' }]
    );
  };

  const handlePrivacy = () => {
    navigation.navigate('Privacy' as never);
  };

  const handleTerms = () => {
    navigation.navigate('Terms' as never);
  };

  const handleSupport = () => {
    navigation.navigate('Support' as never);
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear App Data',
      'This will reset all your preferences and favorites. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setHasConsented(false);
          },
        },
      ]
    );
  };

  const rankInfo = user ? RANK_INFO[user.rank] : RANK_INFO.ECO_NEWBIE;

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.neutral[50] }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.neutral[0], borderBottomColor: colors.neutral[200] }]}>
        <Text style={[styles.title, { color: colors.neutral[900] }]}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.section}>
          {isGuest ? (
            <TouchableOpacity
              style={[styles.signInBanner, { backgroundColor: colors.primary[50], borderColor: colors.primary[100] }]}
              onPress={() => navigation.navigate('Login' as never)}
            >
              <View style={[styles.signInBannerIcon, { backgroundColor: colors.neutral[0] }]}>
                <Feather name="log-in" size={22} color={colors.primary[600]} />
              </View>
              <View style={styles.signInBannerContent}>
                <Text style={[styles.signInBannerTitle, { color: colors.primary[700] }]}>Sign in</Text>
                <Text style={[styles.signInBannerSubtitle, { color: colors.primary[500] }]}>Save your progress and earn karma</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.primary[400]} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.profileButton, { backgroundColor: colors.neutral[0] }]}
              onPress={() => navigation.navigate('Profile' as never)}
            >
              <View style={styles.profileInfo}>
                {user?.avatarUrl ? (
                  <Image source={{ uri: user.avatarUrl }} style={styles.profileAvatar} />
                ) : (
                  <View style={[styles.profileAvatar, styles.profileAvatarPlaceholder, { backgroundColor: colors.neutral[100] }]}>
                    <Feather name="user" size={24} color={colors.neutral[400]} />
                  </View>
                )}
                <View>
                  <Text style={[styles.profileName, { color: colors.neutral[900] }]}>
                    {user?.displayName || 'User'}
                  </Text>
                  <Text style={[styles.profileKarma, { color: colors.neutral[500] }]}>
                    {user?.karmaPoints || 0} karma • {rankInfo.name}
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color={colors.neutral[400]} />
            </TouchableOpacity>
          )}
        </View>

        {/* App Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.neutral[500] }]}>App</Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.neutral[0] }]}>
            <SettingItem
              icon="info"
              label="About"
              description={`Version ${getAppVersion()}`}
              onPress={handleAbout}
            />
            <SettingItem
              icon="help-circle"
              label="Help & Support"
              description="FAQs and contact us"
              onPress={handleSupport}
            />
          </View>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.neutral[500] }]}>Legal</Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.neutral[0] }]}>
            <SettingItem
              icon="shield"
              label="Privacy Policy"
              onPress={handlePrivacy}
            />
            <SettingItem
              icon="file-text"
              label="Terms of Service"
              onPress={handleTerms}
            />
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.neutral[500] }]}>Data</Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.neutral[0] }]}>
            <SettingItem
              icon="trash-2"
              label="Clear App Data"
              description="Reset preferences and favorites"
              onPress={handleClearData}
              danger
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary[50] }]}>
            <Image source={require('../../assets/icon.png')} style={styles.logoImage} />
          </View>
          <Text style={[styles.footerTitle, { color: colors.neutral[800] }]}>Is It Full?</Text>
          <Text style={[styles.footerSubtitle, { color: colors.neutral[400] }]}>Recycle without the wait</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing['2xl'],
    borderBottomWidth: 1,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  signInBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
  },
  signInBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  signInBannerContent: {
    flex: 1,
  },
  signInBannerTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: '600',
  },
  signInBannerSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    marginTop: 2,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  profileAvatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: '600',
  },
  profileKarma: {
    fontSize: theme.typography.fontSize.sm,
    marginTop: 2,
  },
  section: {
    marginTop: theme.spacing['2xl'],
    paddingHorizontal: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
  },
  sectionContent: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: theme.typography.fontSize.sm,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: theme.spacing['4xl'],
    paddingHorizontal: theme.spacing.xl,
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  logoImage: {
    width: 56,
    height: 56,
  },
  footerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
  },
  footerSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
});
