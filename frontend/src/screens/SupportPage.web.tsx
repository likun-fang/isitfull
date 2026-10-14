import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { theme } from '../theme';
import { FeedbackModal } from '../components/feedback/FeedbackModal';

interface SupportItemProps {
  icon: string;
  title: string;
  description: string;
  href?: string;
  onPress?: () => void;
}

function SupportItem({ icon, title, description, href, onPress }: SupportItemProps) {
  const content = (
    <View style={styles.supportItem}>
      <View style={styles.supportIcon}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <View style={styles.supportContent}>
        <Text style={styles.supportTitle}>{title}</Text>
        <Text style={styles.supportDescription}>{description}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </View>
  );

  if (href) {
    return <a href={href} style={{ textDecoration: 'none' }}>{content}</a>;
  }

  return (
    <div onClick={onPress} style={{ cursor: 'pointer' }}>
      {content}
    </div>
  );
}

export default function SupportPageWeb() {
  const [feedbackType, setFeedbackType] = useState<'BUG' | 'FEATURE'>('BUG');
  const [feedbackVisible, setFeedbackVisible] = useState(false);

  const handleBugReport = () => {
    setFeedbackType('BUG');
    setFeedbackVisible(true);
  };

  const handleFeatureRequest = () => {
    setFeedbackType('FEATURE');
    setFeedbackVisible(true);
  };

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
        <Text style={styles.title}>Support</Text>
        <Text style={styles.subtitle}>
          We're here to help you get the most out of Is It Full?
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.sectionContent}>
            <SupportItem
              icon="✉️"
              title="Email Support"
              description="Get help with any issue"
              href="mailto:support@isitfull.ie?subject=App Support Request"
            />
            <SupportItem
              icon="🐛"
              title="Report a Bug"
              description="Let us know if something isn't working"
              onPress={handleBugReport}
            />
            <SupportItem
              icon="⭐"
              title="Request a Feature"
              description="Tell us what you'd like to see"
              onPress={handleFeatureRequest}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqContainer}>
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>How do I report an RVM status?</Text>
              <Text style={styles.faqAnswer}>
                Tap on any RVM marker on the map, then tap "Update Status". You must be
                within 50 meters of the RVM to submit a report.
              </Text>
            </View>
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>What are karma points?</Text>
              <Text style={styles.faqAnswer}>
                Karma points are earned by submitting accurate status reports. They reflect
                your contribution to the community and unlock higher user ranks.
              </Text>
            </View>
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Why can't I submit a report?</Text>
              <Text style={styles.faqAnswer}>
                You must be within 50 meters of the RVM and wait 15 minutes between reports
                for the same machine. Make sure location services are enabled.
              </Text>
            </View>
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>How do I delete my account?</Text>
              <Text style={styles.faqAnswer}>
                Go to Settings → Account → Delete Account. This will permanently remove all
                your data including karma points and report history.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.responseInfo}>
          <Text style={styles.responseText}>
            Response time: We typically respond within 24-48 hours.
          </Text>
          <Text style={styles.responseEmail}>support@isitfull.ie</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 Is It Full? All rights reserved.</Text>
          <View style={styles.footerLinks}>
            <a href="/privacy/" style={{ textDecoration: 'none', fontSize: 14, color: theme.colors.primary[600] }}>Privacy</a>
            <a href="/terms/" style={{ textDecoration: 'none', fontSize: 14, color: theme.colors.primary[600] }}>Terms</a>
            <a href="/support/" style={{ textDecoration: 'none', fontSize: 14, color: theme.colors.primary[600] }}>Support</a>
          </View>
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
  subtitle: {
    fontSize: 18,
    color: theme.colors.neutral[600],
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: theme.colors.neutral[50],
    borderRadius: 12,
    overflow: 'hidden',
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  supportIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 24,
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.neutral[900],
    marginBottom: 2,
  },
  supportDescription: {
    fontSize: 14,
    color: theme.colors.neutral[500],
  },
  chevron: {
    fontSize: 24,
    color: theme.colors.neutral[400],
  },
  faqContainer: {
    backgroundColor: theme.colors.neutral[50],
    borderRadius: 12,
    padding: 24,
  },
  faqItem: {
    marginBottom: 24,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.neutral[900],
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: theme.colors.neutral[600],
    lineHeight: 22,
  },
  responseInfo: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  responseText: {
    fontSize: 14,
    color: theme.colors.neutral[500],
    marginBottom: 4,
  },
  responseEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary[600],
  },
  footer: {
    marginTop: 24,
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
