import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Keyboard,
  FlatList,
  Platform,
} from 'react-native';
import { Icon } from '../common/Icon';
import { theme } from '../../theme';
import { AddressSuggestion } from '../../types/address';

interface Props {
  onFindNearest: () => void;
  onSearch: (query: string) => void;
  onSelectSuggestion: (suggestion: AddressSuggestion) => void;
  suggestions: AddressSuggestion[];
  isSearching: boolean;
  inputRef?: React.RefObject<TextInput | null>;
}

export function HeroSection({
  onFindNearest,
  onSearch,
  onSelectSuggestion,
  suggestions,
  isSearching,
  inputRef,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleTextChange = (text: string) => {
    setSearchQuery(text);
    onSearch(text);
    setShowSuggestions(text.length >= 2);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      Keyboard.dismiss();
      if (suggestions.length > 0) {
        handleSelectSuggestion(suggestions[0]);
      }
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    setSearchQuery(suggestion.shortName);
    setShowSuggestions(false);
    Keyboard.dismiss();
    onSelectSuggestion(suggestion);
  };

  const handleClear = () => {
    setSearchQuery('');
    setShowSuggestions(false);
    onSearch('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        {/* Icon with green halo glow */}
        <View style={styles.logoHalo}>
          <View style={styles.logoInner}>
            <Image
              source={Platform.select({
                web: require('../../../assets/icon-128.png'),
                default: require('../../../assets/icon.png'),
              })}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Tight info block */}
        <Text style={styles.title}>Recycle without the wait.</Text>
        <Text style={styles.subtitle}>
          Find working Reverse Vending Machines near you in real-time.
        </Text>

        {/* Action area */}
        <View style={styles.actionArea}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onFindNearest}
            activeOpacity={0.85}
          >
            <Icon
              name="navigation"
              size={18}
              color={theme.colors.neutral[0]}
              style={styles.buttonIcon}
            />
            <Text style={styles.primaryButtonText}>Use My Current Location</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <Icon
                name="search"
                size={18}
                color={theme.colors.neutral[300]}
                style={styles.searchIcon}
              />
              <TextInput
                ref={inputRef}
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={handleTextChange}
                placeholder="Search by Eircode or address"
                placeholderTextColor={theme.colors.neutral[400]}
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="none"
                onSubmitEditing={handleSearchSubmit}
              />
              {isSearching && (
                <Icon
                  name="loader"
                  size={16}
                  color={theme.colors.neutral[400]}
                  style={styles.loadingIcon}
                />
              )}
              {searchQuery.length > 0 && !isSearching && (
                <TouchableOpacity
                  onPress={handleClear}
                  style={styles.clearButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon name="x" size={14} color={theme.colors.neutral[500]} />
                </TouchableOpacity>
              )}
            </View>

            {showSuggestions && suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <FlatList
                  data={suggestions}
                  keyExtractor={(item) => item.placeId}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.suggestionItem}
                      onPress={() => handleSelectSuggestion(item)}
                      activeOpacity={0.7}
                    >
                      <Icon
                        name="map-pin"
                        size={16}
                        color={theme.colors.neutral[400]}
                        style={styles.suggestionIcon}
                      />
                      <View style={styles.suggestionText}>
                        <Text style={styles.suggestionMain}>{item.shortName}</Text>
                        <Text style={styles.suggestionSecondary}>
                          {item.secondaryText}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  scrollEnabled={false}
                />
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const PILL = 9999;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing['3xl'],
    paddingHorizontal: theme.spacing.lg,
    minHeight: 560,
  },

  // ── Card: layered shadows for depth ──
  heroCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 32,
    paddingTop: theme.spacing['2xl'],
    paddingBottom: theme.spacing['2xl'],
    paddingHorizontal: theme.spacing['2xl'],
    maxWidth: 420,
    width: '100%',
    // @ts-ignore — web-only
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.75)',
    // Layer 1: close occlusion shadow
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 24,
    // @ts-ignore — web-only: layer 2 ambient via boxShadow
    boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 24px 60px rgba(0,0,0,0.12)',
  },

  // ── Logo: halo + glow ──
  logoHalo: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    marginBottom: theme.spacing.lg,
    // green outer glow
    shadowColor: 'rgba(16, 185, 129, 0.5)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 28,
  },
  logoInner: {
    width: 64,
    height: 64,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  logo: {
    width: 64,
    height: 64,
  },

  // ── Typography: tight info block ──
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.neutral[900],
    marginBottom: 6,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral[600],
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: theme.spacing.xs,
  },

  // ── Action area ──
  actionArea: {
    width: '100%',
    marginTop: theme.spacing.xl,
  },

  // ── Primary button: green shadow + micro-gradient ──
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[500],
    height: 52,
    paddingHorizontal: theme.spacing['2xl'],
    borderRadius: PILL,
    // green colored shadow
    shadowColor: 'rgba(16, 185, 129, 0.45)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
    // @ts-ignore — web-only: subtle top-to-bottom gradient via border
    backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.12) 0%, transparent 50%)',
  },
  buttonIcon: {
    marginRight: theme.spacing.sm,
  },
  primaryButtonText: {
    color: theme.colors.neutral[0],
    fontSize: theme.typography.fontSize.base,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // ── Divider: visible "or" ──
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.neutral[300],
  },
  dividerText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[500],
    fontWeight: '500',
    marginHorizontal: theme.spacing.md,
  },

  // ── Search: white pill, inset feel ──
  searchContainer: {
    width: '100%',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.neutral[0],
    borderRadius: PILL,
    borderWidth: 1.5,
    borderColor: theme.colors.neutral[200],
    height: 52,
    paddingHorizontal: theme.spacing.lg,
    // @ts-ignore — web-only: subtle inset shadow
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral[900],
    padding: 0,
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
  },
  loadingIcon: {
    marginLeft: theme.spacing.sm,
  },

  // ── Suggestions ──
  suggestionsContainer: {
    backgroundColor: theme.colors.neutral[0],
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    marginTop: theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[100],
  },
  suggestionIcon: {
    marginRight: theme.spacing.sm,
  },
  suggestionText: {
    flex: 1,
  },
  suggestionMain: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: '500',
    color: theme.colors.neutral[900],
  },
  suggestionSecondary: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[500],
    marginTop: 2,
  },
});
