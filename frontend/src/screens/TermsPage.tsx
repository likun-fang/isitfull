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

export default function TermsPage() {
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
        <Text style={[styles.title, { color: colors.neutral[900] }]}>Terms of Service</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.lastUpdated, { color: colors.neutral[500] }]}>Last updated: February 5, 2026</Text>

        <Section title="Agreement to Terms">
          <Paragraph>
            By downloading, installing, or using Is It Full? ("the App"), you agree to be
            bound by these Terms of Service ("Terms"). If you do not agree to these Terms,
            do not use the App.
          </Paragraph>
        </Section>

        <Section title="Description of Service">
          <Paragraph>
            Is It Full? is a community-driven application that helps users locate Reverse
            Vending Machines (RVMs) in Ireland and view their current availability status.
            Users can contribute by reporting the status of RVMs they visit.
          </Paragraph>
        </Section>

        <Section title="User Accounts">
          <Paragraph>
            You may use the App as a guest or create an account using Google or Apple
            sign-in. You are responsible for maintaining the confidentiality of your
            account and for all activities that occur under your account.
          </Paragraph>
          <Paragraph>
            You agree to provide accurate information and to update your information as
            necessary. We reserve the right to suspend or terminate accounts that violate
            these Terms.
          </Paragraph>
        </Section>

        <Section title="User-Generated Content">
          <Paragraph>
            When you submit status reports ("User Content"), you grant us a non-exclusive,
            worldwide, royalty-free license to use, display, and distribute this content
            within the App.
          </Paragraph>
          <Paragraph>
            You agree that your User Content will be accurate and submitted in good faith.
            You must not submit false, misleading, or malicious reports.
          </Paragraph>
        </Section>

        <Section title="Prohibited Conduct">
          <Paragraph>
            You agree not to:
          </Paragraph>
          <BulletPoint>
            Submit false or intentionally misleading status reports
          </BulletPoint>
          <BulletPoint>
            Attempt to manipulate the karma system or game the reporting mechanism
          </BulletPoint>
          <BulletPoint>
            Use automated systems or bots to submit reports
          </BulletPoint>
          <BulletPoint>
            Interfere with or disrupt the App's functionality
          </BulletPoint>
          <BulletPoint>
            Attempt to access other users' accounts or data
          </BulletPoint>
          <BulletPoint>
            Use the App for any illegal purpose
          </BulletPoint>
          <Paragraph>
            We have zero tolerance for malicious reporting. Accounts found to be
            submitting false reports may be permanently banned without warning.
          </Paragraph>
        </Section>

        <Section title="Karma Points">
          <Paragraph>
            Karma points are earned by contributing accurate status reports. Karma points
            have no monetary value and cannot be exchanged, transferred, or redeemed for
            cash or goods. We reserve the right to adjust karma balances if we detect
            abuse or manipulation.
          </Paragraph>
        </Section>

        <Section title="Disclaimer of Warranties">
          <Paragraph>
            The App is provided "as is" without warranties of any kind. We do not guarantee
            the accuracy of RVM status information, as it is based on user reports. Always
            verify RVM availability in person before making a trip.
          </Paragraph>
          <Paragraph>
            We are not affiliated with any RVM operators or retailers. RVM locations and
            availability may change without notice.
          </Paragraph>
        </Section>

        <Section title="Limitation of Liability">
          <Paragraph>
            To the maximum extent permitted by law, we shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages arising from your use
            of the App, including but not limited to wasted trips to unavailable RVMs.
          </Paragraph>
        </Section>

        <Section title="Changes to Terms">
          <Paragraph>
            We may update these Terms from time to time. We will notify you of any material
            changes by posting the new Terms in the App. Your continued use of the App
            after such changes constitutes acceptance of the new Terms.
          </Paragraph>
        </Section>

        <Section title="Governing Law">
          <Paragraph>
            These Terms shall be governed by and construed in accordance with the laws of
            Ireland, without regard to its conflict of law provisions.
          </Paragraph>
        </Section>

        <Section title="Contact Us">
          <Paragraph>
            If you have any questions about these Terms, please contact us at:
          </Paragraph>
          <Paragraph>
            Email: support@isitfull.ie
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
