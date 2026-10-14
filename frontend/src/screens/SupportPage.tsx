import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import { useAppTheme } from '../theme/ThemeContext';
import { FeedbackModal } from '../components/feedback/FeedbackModal';

interface SupportItemProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
}

function SupportItem({ icon, title, description, onPress }: SupportItemProps) {
  const { colors } = useAppTheme();
  return (
    <TouchableOpacity style={[styles.supportItem, { borderBottomColor: colors.neutral[100] }]} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.supportIcon, { backgroundColor: colors.primary[50] }]}>
        <Feather name={icon} size={24} color={colors.primary[600]} />
      </View>
      <View style={styles.supportContent}>
        <Text style={[styles.supportTitle, { color: colors.neutral[900] }]}>{title}</Text>
        <Text style={[styles.supportDescription, { color: colors.neutral[500] }]}>{description}</Text>
      </View>
      <Feather name="chevron-right" size={20} color={colors.neutral[400]} />
    </TouchableOpacity>
  );
}

export default function SupportPage() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const { showActionSheetWithOptions } = useActionSheet();
  const [feedbackType, setFeedbackType] = useState<'BUG' | 'FEATURE'>('BUG');
  const [feedbackVisible, setFeedbackVisible] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleEmail = () => {
    const email = 'support@isitfull.ie';
    const subject = encodeURIComponent('App Support Request');

    if (Platform.OS === 'web') {
      window.open(`mailto:${email}?subject=${subject}`, '_blank');
      return;
    }

    const options = ['Gmail', 'Outlook', 'Default Mail', 'Copy Email Address', 'Cancel'];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        title: 'Send email via',
      },
      async (selectedIndex) => {
        if (selectedIndex === undefined || selectedIndex === cancelButtonIndex) return;

        const selectedOption = options[selectedIndex];

        try {
          if (selectedOption === 'Gmail') {
            const gmailUrl = `googlegmail:///co?to=${email}&subject=${subject}`;
            const canOpen = await Linking.canOpenURL(gmailUrl).catch(() => false);
            if (canOpen) {
              await Linking.openURL(gmailUrl);
            } else {
              await Linking.openURL(`https://mail.google.com/mail/?view=cm&to=${email}&su=${subject}`);
            }
          } else if (selectedOption === 'Outlook') {
            const outlookUrl = `ms-outlook://compose?to=${email}&subject=${subject}`;
            const canOpen = await Linking.canOpenURL(outlookUrl).catch(() => false);
            if (canOpen) {
              await Linking.openURL(outlookUrl);
            } else {
              await Linking.openURL(`https://outlook.live.com/mail/0/deeplink/compose?to=${email}&subject=${subject}`);
            }
          } else if (selectedOption === 'Default Mail') {
            await Linking.openURL(`mailto:${email}?subject=${subject}`);
          } else if (selectedOption === 'Copy Email Address') {
            await Clipboard.setStringAsync(email);
            Alert.alert('Copied', `${email} copied to clipboard.`);
          }
        } catch {
          Alert.alert('Unable to open', 'Could not open the email app. The address has been copied to your clipboard.');
          await Clipboard.setStringAsync(email).catch(() => {});
        }
      }
    );
  };

  const handleBugReport = () => {
    setFeedbackType('BUG');
    setFeedbackVisible(true);
  };

  const handleFeatureRequest = () => {
    setFeedbackType('FEATURE');
    setFeedbackVisible(true);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.neutral[50] }]}>
      <View style={[styles.header, { backgroundColor: colors.neutral[0], borderBottomColor: colors.neutral[200] }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={24} color={colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.neutral[900] }]}>Support</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroSection, { backgroundColor: colors.neutral[0] }]}>
          <View style={[styles.heroIcon, { backgroundColor: colors.primary[50] }]}>
            <Feather name="help-circle" size={48} color={colors.primary[500]} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.neutral[900] }]}>How can we help?</Text>
          <Text style={[styles.heroDescription, { color: colors.neutral[600] }]}>
            We're here to help you get the most out of Is It Full? Choose an option below
            or email us directly.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.neutral[500] }]}>Contact Us</Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.neutral[0] }]}>
            <SupportItem
              icon="mail"
              title="Email Support"
              description="Get help with any issue"
              onPress={handleEmail}
            />
            <SupportItem
              icon="alert-circle"
              title="Report a Bug"
              description="Let us know if something isn't working"
              onPress={handleBugReport}
            />
            <SupportItem
              icon="star"
              title="Request a Feature"
              description="Tell us what you'd like to see"
              onPress={handleFeatureRequest}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.neutral[500] }]}>Frequently Asked Questions</Text>
          <View style={[styles.faqContainer, { backgroundColor: colors.neutral[0] }]}>
            <View style={styles.faqItem}>
              <Text style={[styles.faqQuestion, { color: colors.neutral[900] }]}>How do I report an RVM status?</Text>
              <Text style={[styles.faqAnswer, { color: colors.neutral[600] }]}>
                Tap on any RVM marker on the map, then tap "Update Status". You must be
                within 50 meters of the RVM to submit a report.
              </Text>
            </View>
            <View style={styles.faqItem}>
              <Text style={[styles.faqQuestion, { color: colors.neutral[900] }]}>What are karma points?</Text>
              <Text style={[styles.faqAnswer, { color: colors.neutral[600] }]}>
                Karma points are earned by submitting accurate status reports. They reflect
                your contribution to the community and unlock higher user ranks.
              </Text>
            </View>
            <View style={styles.faqItem}>
              <Text style={[styles.faqQuestion, { color: colors.neutral[900] }]}>Why can't I submit a report?</Text>
              <Text style={[styles.faqAnswer, { color: colors.neutral[600] }]}>
                You must be within 50 meters of the RVM and wait 15 minutes between reports
                for the same machine. Make sure location services are enabled.
              </Text>
            </View>
            <View style={styles.faqItem}>
              <Text style={[styles.faqQuestion, { color: colors.neutral[900] }]}>How do I delete my account?</Text>
              <Text style={[styles.faqAnswer, { color: colors.neutral[600] }]}>
                Go to Settings → Account → Delete Account. This will permanently remove all
                your data including karma points and report history.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.neutral[500] }]}>
            Response time: We typically respond within 24-48 hours.
          </Text>
          <Text style={[styles.footerEmail, { color: colors.primary[600] }]}>support@isitfull.ie</Text>
        </View>
      </ScrollView>

      <FeedbackModal
        visible={feedbackVisible}
        type={feedbackType}
        onClose={() => setFeedbackVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: theme.spacing['4xl'],
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing['3xl'],
    paddingHorizontal: theme.spacing.xl,
  },
  heroIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  heroTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
  },
  heroDescription: {
    fontSize: theme.typography.fontSize.base,
    textAlign: 'center',
    lineHeight: 24,
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
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
  },
  supportIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: '600',
    marginBottom: 2,
  },
  supportDescription: {
    fontSize: theme.typography.fontSize.sm,
  },
  faqContainer: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  faqItem: {
    marginBottom: theme.spacing.lg,
  },
  faqQuestion: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  faqAnswer: {
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: theme.spacing['3xl'],
    paddingHorizontal: theme.spacing.xl,
  },
  footerText: {
    fontSize: theme.typography.fontSize.sm,
    marginBottom: theme.spacing.xs,
  },
  footerEmail: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: '600',
  },
});
