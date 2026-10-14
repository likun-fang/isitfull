import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { theme } from '../theme';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return <Text style={styles.paragraph}>{children}</Text>;
}

function BulletPoint({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.bulletContainer}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

export default function TermsPageWeb() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <Text style={styles.logo}>Is It Full?</Text>
        </a>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.lastUpdated}>Last updated: February 5, 2026</Text>

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

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 Is It Full? All rights reserved.</Text>
          <View style={styles.footerLinks}>
            <a href="/privacy/" style={{ textDecoration: 'none', fontSize: 14, color: theme.colors.primary[600] }}>Privacy</a>
            <a href="/terms/" style={{ textDecoration: 'none', fontSize: 14, color: theme.colors.primary[600] }}>Terms</a>
            <a href="/support/" style={{ textDecoration: 'none', fontSize: 14, color: theme.colors.primary[600] }}>Support</a>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[0],
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary[600],
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 64,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.neutral[900],
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    color: theme.colors.neutral[500],
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.neutral[900],
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    color: theme.colors.neutral[700],
    lineHeight: 26,
    marginBottom: 12,
  },
  bulletContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 16,
    color: theme.colors.neutral[700],
    marginRight: 8,
    lineHeight: 26,
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.neutral[700],
    lineHeight: 26,
  },
  footer: {
    marginTop: 48,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.neutral[500],
    marginBottom: 12,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 24,
  },
});
