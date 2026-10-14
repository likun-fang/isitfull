import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../../theme/ThemeContext';

const UPDATE_URLS: Record<string, string> = {
  ios: 'https://apps.apple.com/app/is-it-full/id6759020531',
  android: 'https://play.google.com/store/apps/details?id=ie.isitfull.mobile',
  web: 'https://apps.apple.com/app/is-it-full/id6759020531',
};

export function ForceUpdateModal() {
  const { colors } = useAppTheme();

  const handleUpdate = () => {
    Linking.openURL(UPDATE_URLS[Platform.OS] || UPDATE_URLS.web);
  };

  if (Platform.OS === 'web') {
    return (
      <div style={webStyles.container}>
        <div style={webStyles.content}>
          <div style={webStyles.iconCircle}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
              stroke="#059669" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>
          <div style={webStyles.title}>Update Required</div>
          <div style={webStyles.message}>
            A new version is available. Please update to continue using the app.
          </div>
          <button onClick={handleUpdate} style={webStyles.updateButton}>
            <span style={webStyles.updateText}>Update Now</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.neutral[0] }]}>
      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primary[50] }]}>
          <Feather name="download" size={40} color={colors.primary[600]} />
        </View>
        <Text style={[styles.title, { color: colors.neutral[900] }]}>Update Required</Text>
        <Text style={[styles.message, { color: colors.neutral[500] }]}>
          A new version is available. Please update to continue using the app.
        </Text>
        <TouchableOpacity style={[styles.updateButton, { backgroundColor: colors.primary[600] }]} onPress={handleUpdate} activeOpacity={0.8}>
          <Text style={styles.updateText}>Update Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  updateButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  updateText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

const webStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: '100vh',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: 320,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#ECFDF5',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: '22px',
    marginBottom: 32,
  },
  updateButton: {
    backgroundColor: '#059669',
    paddingLeft: 32,
    paddingRight: 32,
    paddingTop: 14,
    paddingBottom: 14,
    borderRadius: 12,
    border: 'none',
    cursor: 'pointer',
  },
  updateText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
};