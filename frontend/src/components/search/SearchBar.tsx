import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Keyboard,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useAppTheme } from '../../theme/ThemeContext';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmit?: () => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  onClear,
  onFocus,
  onBlur,
  onSubmit,
  placeholder = 'Search address or EIR code...',
}: Props) {
  const { colors } = useAppTheme();

  const handleSubmit = () => {
    Keyboard.dismiss();
    onSubmit?.();
  };

  return (
    <View style={[styles.searchBox, { backgroundColor: colors.neutral[0], borderColor: colors.neutral[200] }]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.neutral[100] }]}>
        <Feather name="search" size={18} color={colors.neutral[400]} />
      </View>
      <TextInput
        style={[styles.input, { color: colors.neutral[900] }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.neutral[400]}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        onFocus={onFocus}
        onBlur={onBlur}
        onSubmitEditing={handleSubmit}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={onClear}
          style={[styles.clearButton, { backgroundColor: colors.neutral[100] }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="x" size={16} color={colors.neutral[400]} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    borderWidth: 1,
    ...theme.shadows.lg,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    padding: 0,
    fontWeight: '400',
  },
  clearButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
  },
});
