import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { theme } from '../theme';

const APP_STORE_URL = 'https://apps.apple.com/app/is-it-full/id6759020531';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=ie.isitfull.mobile';

export default function DownloadsPageWeb() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <Text style={styles.logo}>Is It Full?</Text>
        </a>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Get the App</Text>
        <Text style={styles.subtitle}>
          Available now on the App Store and Google Play. Find Re-Turn machines
          and check real-time availability before you go.
        </Text>

        {/* iOS Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <img
              src="https://developer.apple.com/assets/elements/icons/app-store/app-store-64x64_2x.png"
              alt="App Store"
              style={{ width: 40, height: 40, marginRight: 12, borderRadius: 8 }}
            />
            <View style={styles.cardHeaderText}>
              <Text style={styles.platformTitle}>iPhone & iPad</Text>
              <Text style={styles.platformTag}>App Store</Text>
            </View>
          </View>
          <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" style={linkStyles.button}>
            Download on the App Store
          </a>
        </View>

        {/* Android Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <img
              src="https://www.gstatic.com/android/market_images/web/favicon_v3.ico"
              alt="Google Play"
              style={{ width: 40, height: 40, marginRight: 12 }}
            />
            <View style={styles.cardHeaderText}>
              <Text style={styles.platformTitle}>Android</Text>
              <Text style={styles.platformTag}>Google Play</Text>
            </View>
          </View>
          <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" style={linkStyles.button}>
            Get it on Google Play
          </a>
        </View>

        {/* Help note */}
        <View style={styles.helpBox}>
          <Text style={styles.helpTitle}>Having trouble?</Text>
          <Text style={styles.helpContact}>
            Need help? Email us at{' '}
            <a href="mailto:support@isitfull.ie" style={{ color: theme.colors.primary[600], textDecoration: 'none' }}>
              support@isitfull.ie
            </a>
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 Is It Full? All rights reserved.</Text>
          <View style={styles.footerLinks}>
            <a href="/privacy/" style={linkStyles.footerLink}>Privacy</a>
            <a href="/terms/" style={linkStyles.footerLink}>Terms</a>
            <a href="/support/" style={linkStyles.footerLink}>Support</a>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const linkStyles = {
  button: {
    display: 'inline-block' as const,
    backgroundColor: theme.colors.primary[600],
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600' as const,
    padding: '12px 24px',
    borderRadius: 10,
    textDecoration: 'none' as const,
    textAlign: 'center' as const,
    marginTop: 12,
  },
  footerLink: {
    textDecoration: 'none' as const,
    fontSize: 14,
    color: theme.colors.primary[600],
  },
};

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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    maxWidth: 640,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 64,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: theme.colors.neutral[900],
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: theme.colors.neutral[600],
    lineHeight: 26,
    marginBottom: 32,
  },
  card: {
    backgroundColor: theme.colors.neutral[50],
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  platformTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.neutral[900],
  },
  platformTag: {
    fontSize: 13,
    color: theme.colors.neutral[500],
    marginTop: 2,
  },
  helpBox: {
    backgroundColor: theme.colors.primary[50],
    borderRadius: 12,
    padding: 20,
    marginTop: 12,
    marginBottom: 32,
  },
  helpTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.neutral[800],
    marginBottom: 6,
  },
  helpContact: {
    fontSize: 14,
    color: theme.colors.neutral[600],
  },
  footer: {
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
