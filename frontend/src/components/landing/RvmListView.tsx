import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import { Rvm, RvmStatus } from '../../types';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { RvmListItem } from './RvmListItem';
import { theme } from '../../theme';

interface Props {
  rvms: Rvm[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onRetry: () => void;
  onReport?: (rvmId: number, status: RvmStatus) => void;
}

export function RvmListView({ rvms, isLoading, isError, error, onRetry, onReport }: Props) {
  const renderItem: ListRenderItem<Rvm> = ({ item }) => (
    <RvmListItem
      rvm={item}
      onReport={onReport}
    />
  );

  const keyExtractor = (item: Rvm) => item.id.toString();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[600]} />
      </View>
    );
  }

  if (isError) {
    return <ErrorState message={error?.message || 'Please try again.'} onRetry={onRetry} />;
  }

  if (!rvms || rvms.length === 0) {
    return <EmptyState />;
  }

  return (
    <FlatList
      data={rvms}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 100,
  },
});
