import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';

interface PrivacyConsentModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function PrivacyConsentModal({ visible, onAccept, onDecline }: PrivacyConsentModalProps) {
  const { colors } = useAppTheme();

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={[styles.container, { backgroundColor: colors.neutral[0] }]}>
        <ScrollView style={styles.scrollView}>
          <Text style={[styles.title, { color: colors.neutral[900] }]}>Privacy Notice</Text>

          <Text style={[styles.sectionTitle, { color: colors.neutral[700] }]}>Data We Collect</Text>
          <Text style={[styles.text, { color: colors.neutral[500] }]}>
            {'\u2022'} Location data: Used to show nearby RVMs and verify you are at a machine when reporting its status.
          </Text>
          <Text style={[styles.text, { color: colors.neutral[500] }]}>
            {'\u2022'} Device identifier: A random ID stored on your device to prevent spam reports. We do not track you across apps.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.neutral[700] }]}>How We Use Your Data</Text>
          <Text style={[styles.text, { color: colors.neutral[500] }]}>
            {'\u2022'} Location is only accessed when you open the app or submit a report.
          </Text>
          <Text style={[styles.text, { color: colors.neutral[500] }]}>
            {'\u2022'} We do not sell or share your data with third parties.
          </Text>
          <Text style={[styles.text, { color: colors.neutral[500] }]}>
            {'\u2022'} Data is processed in accordance with GDPR regulations.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.neutral[700] }]}>Your Rights</Text>
          <Text style={[styles.text, { color: colors.neutral[500] }]}>
            Under GDPR, you have the right to access, correct, or delete your data. Contact us at privacy@isitfull.ie.
          </Text>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.declineButton, { borderColor: colors.neutral[200] }]} onPress={onDecline}>
            <Text style={[styles.declineButtonText, { color: colors.neutral[500] }]}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.acceptButton, { backgroundColor: colors.primary[500] }]} onPress={onAccept}>
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
