import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useAppTheme } from '../../theme/ThemeContext';

interface Props {
  visible: boolean;
  currentName: string;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
}

export function EditNameModal({ visible, currentName, onClose, onSave }: Props) {
  const { colors } = useAppTheme();
  const [name, setName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setName(currentName);
      setError(null);
    }
  }, [visible, currentName]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    if (trimmed.length > 30) {
      setError('Name must be less than 30 characters');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSave(trimmed);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update name');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={[styles.container, { backgroundColor: colors.neutral[0] }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.neutral[900] }]}>Edit Display Name</Text>
            <TouchableOpacity onPress={onClose} disabled={isLoading}>
              <Feather name="x" size={24} color={colors.neutral[500]} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.description, { color: colors.neutral[500] }]}>
            This name will be shown when you report RVM status.
          </Text>

          <TextInput
            style={[styles.input, { borderColor: colors.neutral[300], color: colors.neutral[900], backgroundColor: colors.neutral[50] }, error && { borderColor: colors.error }]}
            value={name}
            onChangeText={setName}
            placeholder="Enter your display name"
            placeholderTextColor={colors.neutral[400]}
            maxLength={30}
            autoFocus
            editable={!isLoading}
          />

          <Text style={[styles.charCount, { color: colors.neutral[400] }]}>{name.length}/30</Text>

          {error && (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={14} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          )}

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: colors.neutral[100] }]}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={[styles.cancelText, { color: colors.neutral[600] }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary[600] }, isLoading && { backgroundColor: colors.neutral[300] }]}
              onPress={handleSave}
              disabled={isLoading || name.trim().length < 2}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.neutral[0]} size="small" />
              ) : (
                <Text style={[styles.saveText, { color: colors.neutral[0] }]}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  errorText: {
    fontSize: 13,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
