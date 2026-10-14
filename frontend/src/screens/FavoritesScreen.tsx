import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFavorites } from '../hooks/useFavorites';
import { useFavoriteRvms } from '../hooks/useFavoriteRvms';
import { LiveDistance } from '../components/common/LiveDistance';
import { theme } from '../theme';
import { useAppTheme } from '../theme/ThemeContext';
import { Rvm } from '../types';

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: theme.colors.status.available,
  BUSY: theme.colors.status.busy,
  BROKEN: theme.colors.status.broken,
  UNKNOWN: theme.colors.status.unknown,
};

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();
  const { favorites, removeFavorite, isLoading: favoritesLoading } = useFavorites();
  const { data: favoriteRvms = [], isLoading: rvmsLoading, refetch } = useFavoriteRvms(favorites);

  const isLoading = favoritesLoading || rvmsLoading;

  // Refetch every time the tab is focused
  useFocusEffect(
    useCallback(() => {
      if (favorites.length > 0) {
        refetch();
      }
    }, [favorites, refetch])
  );

  const handleSelect = (rvm: Rvm) => {
    navigation.navigate('Map', {
      focusRvmId: rvm.id,
      focusLat: rvm.lat,
      focusLng: rvm.lng,
    });
  };

  const handleRemove = (rvmId: number) => {
    Alert.alert(
      'Remove favorite?',
      'This RVM will be removed from your favorites.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFavorite(rvmId) },
      ]
    );
  };

  const handleBrowseMap = () => {
    navigation.navigate('Map');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.neutral[50] }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.neutral[0], borderBottomColor: colors.neutral[200] }]}>
        <Text style={[styles.title, { color: colors.neutral[900] }]}>Favorites</Text>
        <Text style={[styles.subtitle, { color: colors.neutral[500] }]}>
          {favoriteRvms.length} saved location{favoriteRvms.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {favoriteRvms.length === 0 && !isLoading ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconContainer, { backgroundColor: colors.neutral[100] }]}>
            <Feather name="heart" size={48} color={colors.neutral[300]} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.neutral[800] }]}>No favorites yet</Text>
          <Text style={[styles.emptyDescription, { color: colors.neutral[500] }]}>
            Save your frequently visited RVMs for quick access. Tap the heart icon on any machine to add it here.
          </Text>
          <TouchableOpacity style={[styles.browseButton, { backgroundColor: colors.primary[500] }]} onPress={handleBrowseMap}>
            <Feather name="map" size={18} color={colors.neutral[0]} />
            <Text style={[styles.browseButtonText, { color: colors.neutral[0] }]}>Browse Map</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor={colors.primary[500]}
            />
          }
        >
          {favoriteRvms.map((rvm) => (
            <TouchableOpacity
              key={rvm.id}
              style={[styles.card, { backgroundColor: colors.neutral[0] }]}
              onPress={() => handleSelect(rvm)}
              activeOpacity={0.7}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[rvm.status] }]} />
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardName, { color: colors.neutral[900] }]} numberOfLines={1}>{rvm.name}</Text>
                <Text style={[styles.cardAddress, { color: colors.neutral[500] }]} numberOfLines={1}>{rvm.city}</Text>
                <View style={styles.cardMeta}>
                  <Text style={[styles.cardStatus, { color: colors.neutral[400] }]}>{rvm.status.toLowerCase()}</Text>
                  {rvm.lat != null && rvm.lng != null && (
                    <>
                      <View style={[styles.metaDot, { backgroundColor: colors.neutral[300] }]} />
                      <LiveDistance
                        targetLat={rvm.lat}
                        targetLng={rvm.lng}
                        format="short"
                        style={{ ...styles.cardDistance, color: colors.neutral[400] }}
                        fallback=""
                      />
                    </>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={[styles.removeButton, { backgroundColor: colors.neutral[100] }]}
                onPress={() => handleRemove(rvm.id)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Feather name="x" size={18} color={colors.neutral[400]} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing['2xl'],
    borderBottomWidth: 1,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing['4xl'],
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing['2xl'],
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  emptyDescription: {
    fontSize: theme.typography.fontSize.base,
    textAlign: 'center',
    lineHeight: 22,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing['2xl'],
    gap: theme.spacing.sm,
  },
  browseButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  cardLeft: {
    marginRight: theme.spacing.md,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  cardContent: {
    flex: 1,
  },
  cardName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardAddress: {
    fontSize: theme.typography.fontSize.sm,
    marginBottom: theme.spacing.xs,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardStatus: {
    fontSize: theme.typography.fontSize.xs,
    textTransform: 'capitalize',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: theme.spacing.sm,
  },
  cardDistance: {
    fontSize: theme.typography.fontSize.xs,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.md,
  },
});
