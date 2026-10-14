import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import { useAppTheme } from '../theme/ThemeContext';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.neutral[900] }]}>{title}</Text>
      {children}
    </View>
  );
}

interface ParagraphProps {
  children: React.ReactNode;
}

function Paragraph({ children }: ParagraphProps) {
  const { colors } = useAppTheme();
  return <Text style={[styles.paragraph, { color: colors.neutral[700] }]}>{children}</Text>;
}

interface BulletPointProps {
  children: React.ReactNode;
}

function BulletPoint({ children }: BulletPointProps) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.bulletContainer}>
      <Text style={[styles.bullet, { color: colors.neutral[700] }]}>•</Text>
      <Text style={[styles.bulletText, { color: colors.neutral[700] }]}>{children}</Text>
    </View>
  );
}

export default function PrivacyPage() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useAppTheme();

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.neutral[0] }]}>
      <View style={[styles.header, { backgroundColor: colors.neutral[0], borderBottomColor: colors.neutral[200] }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={24} color={colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.neutral[900] }]}>Privacy Policy</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.lastUpdated, { color: colors.neutral[500] }]}>Last updated: February 11, 2026</Text>

        <Section title="Introduction">
          <Paragraph>
            Welcome to Is It Full? ("we," "our," or "us"). We are committed to protecting
            your privacy and ensuring you have a positive experience when using our app.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your
            information when you use our mobile application.
          </Paragraph>
          <Paragraph>
            By using Is It Full?, you agree to the collection and use of information in
            accordance with this policy. If you do not agree with the terms of this privacy
            policy, please do not access the application.
          </Paragraph>
        </Section>

        <Section title="Information We Collect">
          <Paragraph>
            We collect information that you provide directly to us and information that is
            automatically collected when you use our app:
          </Paragraph>
          <BulletPoint>
            Location Data: We collect your device's location to show nearby Reverse Vending
            Machines (RVMs) and to verify your proximity when submitting status reports.
            Location is only collected when you grant permission and is not stored beyond
            what is necessary to provide the service.
          </BulletPoint>
          <BulletPoint>
            Account Information: If you sign in with Google or Apple, we receive your email
            address, display name, and profile picture from these services. This information
            is used to identify your account and sync your data across devices.
          </BulletPoint>
          <BulletPoint>
            Device Information: We collect anonymous device identifiers to enable guest mode
            functionality and to improve app performance.
          </BulletPoint>
          <BulletPoint>
            User Reports: When you report an RVM status, we collect the report data along
            with your approximate location to verify the report's authenticity.
          </BulletPoint>
          <BulletPoint>
            Karma Points: We track your contribution history (reports submitted, corrections
            made) to calculate your karma score and user rank.
          </BulletPoint>
          <BulletPoint>
            Feedback and Screenshots: When you submit feedback, we collect the text you
            provide and any screenshots you attach. Screenshots are stored securely in our
            cloud storage and are only used to investigate and resolve the issues you report.
          </BulletPoint>
          <BulletPoint>
            Issue Reports: When you report a problem with an RVM (e.g., machine broken,
            location incorrect), we collect the report details along with your user ID to
            help maintain accurate machine information.
          </BulletPoint>
          <BulletPoint>
            Crash and Error Data: We automatically collect anonymous crash reports and
            performance data to identify and fix technical issues. This data does not
            include personally identifiable information.
          </BulletPoint>
        </Section>

        <Section title="How We Use Your Information">
          <Paragraph>
            We use the information we collect for the following purposes:
          </Paragraph>
          <BulletPoint>
            To provide and maintain our service, including showing you nearby RVMs and
            their current status.
          </BulletPoint>
          <BulletPoint>
            To improve and personalize your experience with the app.
          </BulletPoint>
          <BulletPoint>
            To analyze usage patterns and optimize app performance.
          </BulletPoint>
          <BulletPoint>
            To communicate with you about updates, security alerts, and support messages.
          </BulletPoint>
          <BulletPoint>
            To detect, prevent, and address technical issues or fraudulent activity.
          </BulletPoint>
        </Section>

        <Section title="Third-Party Services">
          <Paragraph>
            We use the following third-party services that may collect information about you:
          </Paragraph>
          <BulletPoint>
            Google Maps API: Used to display maps and provide location-based services.
            Google's privacy policy applies to data collected through their services.
          </BulletPoint>
          <BulletPoint>
            Firebase Authentication: Used to enable sign-in with Google and Apple. Firebase
            processes your authentication credentials securely.
          </BulletPoint>
          <BulletPoint>
            LocationIQ: Used for geocoding and address search functionality. LocationIQ
            processes location queries to provide accurate results.
          </BulletPoint>
          <BulletPoint>
            Sentry: Used for crash reporting and performance monitoring. Sentry collects
            anonymous error data to help us identify and fix technical issues. IP addresses
            are automatically removed before storage.
          </BulletPoint>
          <BulletPoint>
            Oracle Cloud Infrastructure: Used to securely store feedback screenshots. Files
            are stored in encrypted cloud storage and are only accessible to our support team.
          </BulletPoint>
          <Paragraph>
            We encourage you to review the privacy policies of these third-party services
            to understand how they handle your data.
          </Paragraph>
        </Section>

        <Section title="Data Retention and Deletion">
          <Paragraph>
            We retain your personal data only for as long as necessary to fulfill the
            purposes outlined in this privacy policy. Location data is processed in
            real-time and is not stored on our servers beyond what is necessary to
            provide the service.
          </Paragraph>
          <Paragraph>
            You can delete your account and all associated data at any time through the
            app's Settings menu. Upon account deletion, we will permanently remove your
            personal information, karma history, and report associations within 30 days.
          </Paragraph>
          <Paragraph>
            You may also request data deletion by contacting us at privacy@isitfull.ie.
            We will respond to your request within 30 days as required by GDPR.
          </Paragraph>
        </Section>

        <Section title="Your Rights (GDPR)">
          <Paragraph>
            Under the General Data Protection Regulation (GDPR), you have the following rights
            regarding your personal data:
          </Paragraph>
          <BulletPoint>
            Right to Access: You can request a copy of the personal data we hold about you.
          </BulletPoint>
          <BulletPoint>
            Right to Rectification: You can request that we correct any inaccurate or
            incomplete personal data.
          </BulletPoint>
          <BulletPoint>
            Right to Erasure: You can request that we delete your personal data, subject to
            certain legal exceptions.
          </BulletPoint>
          <BulletPoint>
            Right to Restrict Processing: You can request that we limit how we use your
            personal data.
          </BulletPoint>
          <BulletPoint>
            Right to Data Portability: You can request a copy of your data in a structured,
            machine-readable format.
          </BulletPoint>
          <BulletPoint>
            Right to Object: You can object to the processing of your personal data for
            certain purposes.
          </BulletPoint>
          <BulletPoint>
            Right to Withdraw Consent: You can withdraw your consent at any time where we
            rely on consent to process your data.
          </BulletPoint>
          <Paragraph>
            To exercise any of these rights, please contact us using the information provided
            below.
          </Paragraph>
        </Section>

        <Section title="Contact Us">
          <Paragraph>
            If you have any questions about this Privacy Policy, your personal data, or would
            like to exercise your rights under GDPR, please contact us at:
          </Paragraph>
          <Paragraph>
            Email: privacy@isitfull.ie
          </Paragraph>
          <Paragraph>
            We will respond to your request within 30 days as required by GDPR.
          </Paragraph>
        </Section>

        <View style={styles.footer} />
      </ScrollView>
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
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  lastUpdated: {
    fontSize: theme.typography.fontSize.sm,
    marginBottom: theme.spacing['2xl'],
  },
  section: {
    marginBottom: theme.spacing['2xl'],
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  paragraph: {
    fontSize: theme.typography.fontSize.base,
    lineHeight: 24,
    marginBottom: theme.spacing.md,
  },
  bulletContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
    paddingLeft: theme.spacing.sm,
  },
  bullet: {
    fontSize: theme.typography.fontSize.base,
    marginRight: theme.spacing.sm,
    lineHeight: 24,
  },
  bulletText: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    lineHeight: 24,
  },
  footer: {
    height: theme.spacing['4xl'],
  },
});